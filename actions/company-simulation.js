"use server"

import { callAI } from "@/Ai/callAI";
import { getGenerateSimulationPlanPrompt } from "@/Ai/prompts/companySimulation";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { MINIMUM_GENERATION_CREDITS, ASSESSMENT_GENERATION_CREDITS, INTERVIEW_EVALUATION_CREDITS, INTERVIEW_GENERATION_CREDITS, INTERVIEW_PER_MINUTE_CREDITS, MINIMUM_INTERVIEW_MINUTES, SIMULATION_GENERATION_CREDITS, SIMULATION_EVALUATION_CREDITS } from "@/util/costs";
import { getRolePlannerPrompt, getRoleSectionGenerator } from "@/Ai/prompts/assessmentCenter";
import { calculateAssessmentCredits, sanitizeCodeAssessmentData, validateGeneratedSection, validatePlannerResponse, validateSimulationPlan } from "@/util/helperfunctions";
import { evaluateAssessmentCenter, evaluatePendingAssessmentCenter } from "./assessment-center";
import { evaluateCodingAssessment, evaluatePendingCodingAssessment } from "./company-coding-round";
import { evaluateInterview, evaluatePendingInterview } from "./mock-interview";
import { success } from "zod";
import { getGenerateRoleBasedCodingAssessmentPrompt } from "@/Ai/prompts/companyCoding";
import { getGenerateInterviewPrompt } from "@/Ai/prompts/mockInterview";


export async function generateSimulationPlan({ companyName, jobTitle, jobDescription, resumeContent, experienceLevel, hiringType }) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
    })

    if (!user) throw new Error("User not exist");

    if (user.credits < SIMULATION_GENERATION_CREDITS) {
        throw new Error(
            `Minimum ${SIMULATION_GENERATION_CREDITS} credits required to start hiring simulation`
        );
    }

    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const mobileRegex = /\b\+?\d{7,15}\b/g;
    const linkedinRegex = /https:\/\/(www\.)?linkedin\.com\/[^\s"'<>]+/g;
    const twitterRegex = /https:\/\/x\.com\/[^\s"'<>]+/g;

    const emails = resumeContent.match(emailRegex) || [];
    const mobiles = resumeContent.match(mobileRegex) || [];
    const linkedins = resumeContent.match(linkedinRegex) || [];
    const twitters = resumeContent.match(twitterRegex) || [];

    const PLACEHOLDERS = {
        email: "__MASK_EMAIL__UNIQUE123__",
        mobile: "__MASK_MOBILE__UNIQUE123__",
        linkedin: "__MASK_LINKEDIN__UNIQUE123__",
        twitter: "__MASK_TWITTER__UNIQUE123__",
    };

    function maskAll(content, matches, placeholder) {
        matches.forEach(item => {
            content = content.split(item).join(placeholder);
        });
        return content;
    }
    let maskedContent = resumeContent;
    maskedContent = maskAll(maskedContent, emails, PLACEHOLDERS.email);
    maskedContent = maskAll(maskedContent, mobiles, PLACEHOLDERS.mobile);
    maskedContent = maskAll(maskedContent, linkedins, PLACEHOLDERS.linkedin);
    maskedContent = maskAll(maskedContent, twitters, PLACEHOLDERS.twitter);

    const payload = {
        companyName,
        jobTitle,
        jobDescription,
        resumeContent: maskedContent,
    }



    try {
        const cleanedText = await callAI(getGenerateSimulationPlanPrompt(payload));
        let simulationDetails;
        try {

            // console.log("prompt", prompt);
            const parsed = cleanedText;

            validateSimulationPlan(
                parsed
            );

            parsed.rounds = parsed.rounds.map(
                (round, index) => ({
                    ...round,

                    sessionId: null,

                    status:
                        index === 0
                            ? "PENDING"
                            : "LOCKED",
                })
            );

            simulationDetails = parsed;

        } catch (err) {
            console.error("Invalid JSON from AI:", cleanedText);

            throw new Error("AI returned invalid Hiring Plan format");
        }

        // console.log("simulationDetails", simulationDetails);

        const [simulationSession, updatedUser] =
            await db.$transaction([
                db.simulationSession.create({
                    data: {
                        userId: user.id,
                        type: "COMPANY_SIMULATION",
                        status: "STARTED",
                        creditsUsed: SIMULATION_GENERATION_CREDITS,
                        payload: {
                            simulationMetadata: {
                                companyName,
                                role: jobTitle,
                                experienceLevel,
                                hiringType,
                                resumeContent,
                                jobDescription,
                                currentRoundIndex: 0,
                                totalRounds: simulationDetails.rounds.length,
                                overallStatus: "IN_PROGRESS",
                            },
                            rounds: simulationDetails.rounds,
                        },
                        startedAt: new Date(),
                        expiresAt: new Date(
                            Date.now() + 1000 * 60 * 60 * 24 * 30
                        ),
                    },
                }),

                db.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        credits: {
                            decrement: SIMULATION_GENERATION_CREDITS,
                        },
                    },
                }),
            ]);


        const finalResponse = {
            success: true,
            data: {
                remainingCredits: updatedUser.credits,
                session: simulationSession,
                userName: user.name
            }
        }
        console.log(JSON.stringify(finalResponse));

        return finalResponse;
    } catch (error) {
        console.error("Error generating interview question:", error);
        throw new Error("Failed to generate interview question");
    }
}

export async function startExistingSimulationPlan({ sessionToken }) {
    console.log("sessionToken : ", sessionToken)
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
    });

    if (!user) {
        throw new Error("User not exist");
    }

    const session =
        await db.simulationSession.findUnique({
            where: {
                sessionToken,
            },
        });

    if (!session) {
        throw new Error("Session not found");
    }

    if (session.userId !== user.id) {
        throw new Error("Unauthorized");
    }

    return {
        success: true,
        data: {
            remainingCredits: user.credits,
            session,
            userName: user.name
        }
    };
}

export async function simulationAssessmentCenterGenerator(data) {
    // console.log(JSON.stringify(data));
    console.log("JSON.stringify(data)");

    const {
        parentSessionId,
        roundId,
        companyName,
        role,
        experienceLevel,
        hiringType,
        followups,
        topics
    } = data;

    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId
        },
        include: {
            industryInsight: true
        }
    });

    if (!user) {
        throw new Error("User not exist");
    }

    const parentSession =
        await db.simulationSession.findUnique({
            where: {
                id: parentSessionId,
            },
        });

    if (!parentSession) {
        throw new Error("Parent session not found");
    }

    if (parentSession.userId !== user.id) {
        throw new Error("Unauthorized");
    }

    if (parentSession.status === "SUBMITTED") {
        throw new Error("Simulation already submitted");
    }

    const round = parentSession.payload.rounds.find(
        (r) => r.roundId === roundId
    );

    if (!round) {
        throw new Error("Round not found");
    }
    console.log(round.sessionId);

    if (round.sessionId) {
        throw new Error("Round already generated");
    }

    if (user.credits < MINIMUM_GENERATION_CREDITS) {
        throw new Error("Insuffiient Credits");
    }

    const inputPayload = {
        companyName,
        role,
        experienceLevel,
        hiringType,
        followups,
        topics
    }

    try {
        const planner = await callAI(getRolePlannerPrompt(inputPayload));

        console.log("Planner Output:", planner);

        validatePlannerResponse(planner)
        const { assessmentMetadata, sectionsOverview } = planner;


        let allQuestions = [];
        let globalId = 1;

        for (const section of sectionsOverview) {
            const sectionPayload = {
                // ROLE CONTEXT ONLY
                companyName,
                role,
                experienceLevel,
                hiringType,

                // SECTION DATA
                sectionName: section.sectionName,
                sectionDescription: section.sectionDescription,
                sectionTotalQuestions: section.totalQuestions,
            }

            const parsedSection = await callAI(getRoleSectionGenerator(sectionPayload));

            validateGeneratedSection({
                parsedSection,
                section,
            });

            for (const q of parsedSection.questions) {
                const scoringRule =
                    section.scoringRules?.[q.questionType];

                if (!scoringRule) {
                    throw new Error(
                        `Missing scoring rule for ${q.questionType} in section ${section.sectionName}`
                    );
                }

                allQuestions.push({
                    ...q,

                    id: globalId++,

                    marks: scoringRule.marks,

                    negativeMarks:
                        scoringRule.negativeMarks
                });
            }
        }

        console.log("Generated Questions:", allQuestions.length);


        if (allQuestions.length !== assessmentMetadata.totalQuestions) {
            throw new Error(
                `Final question count mismatch. Expected ${assessmentMetadata.totalQuestions}, got ${allQuestions.length}`
            );
        }


        const sanitizedQuestions = allQuestions.map((q) => ({
            id: q.id,
            questionType: q.questionType,
            question: q.question,
            options: q.options
        }));

        const finalResult = {
            assessmentMetadata: {
                mode: "ROLE_BASED",
                companyName: companyName,
                examOrRole: role,
                totalQuestions: assessmentMetadata.totalQuestions,
                totalDurationMinutes:
                    assessmentMetadata.totalDurationMinutes
            },
            questions: allQuestions,
        }

        const usedCredits = calculateAssessmentCredits(sanitizedQuestions, "GENERATION");

        const [session, updatedUser] = await db.$transaction(
            async (tx) => {
                const session = await tx.simulationSession.create({
                    data: {
                        userId: user.id,
                        type: "ASSESSMENT_CENTER",
                        status: "STARTED",
                        sessionToken: crypto.randomUUID(),
                        creditsUsed: usedCredits,
                        payload: finalResult,
                        startedAt: new Date(),
                        parentSessionId,
                        durationSeconds:
                            finalResult.assessmentMetadata.totalDurationMinutes * 60,
                        expiresAt: new Date(
                            Date.now() + 1000 * 60 * 60 * 24 * 30
                        ),
                    },
                });

                const updatedRounds = parentSession.payload.rounds.map((round) =>
                    round.roundId === roundId
                        ? {
                            ...round,
                            sessionId: session.id,
                        }
                        : round
                );

                await tx.simulationSession.update({
                    where: {
                        id: parentSessionId,
                    },
                    data: {
                        payload: {
                            ...parentSession.payload,
                            rounds: updatedRounds,
                        },
                        linkedSessionIds: {
                            push: session.id,
                        },
                    },
                });

                const updatedUser = await tx.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        credits: {
                            decrement: usedCredits,
                        },
                    },
                });

                return [session, updatedUser];
            },
            {
                maxWait: 30000,
                timeout: 60000,
            }
        );

        return {
            success: true,
            data: {
                parentSessionId,
                sessionId: session.id,
                sessionToken: session.sessionToken,
                remainingCredits: updatedUser.credits,
                ...finalResult,
                questions: sanitizedQuestions,
                userName: user.name
            }
        };

    } catch (error) {
        console.error("Error generating assessment center:", error);
        throw new Error("Failed to generate assessment center");
    }
}

export async function simulationCodingGenerator(data) {
    //

    console.log(data);
    const {
        parentSessionId,
        roundId,
        companyName,
        role,
        experienceLevel,
        programmingLanguage,
        hiringType,
        followups,
        topics
    } = data;


    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
        include: {
            industryInsight: true,
        },
    })

    if (!user) throw new Error("User not exist");

    const parentSession =
        await db.simulationSession.findUnique({
            where: {
                id: parentSessionId,
            },
        });

    if (!parentSession) {
        throw new Error("Parent session not found");
    }

    if (parentSession.userId !== user.id) {
        throw new Error("Unauthorized");
    }

    if (parentSession.status === "SUBMITTED") {
        throw new Error("Simulation already submitted");
    }

    const round = parentSession.payload.rounds.find(
        (r) => r.roundId === roundId
    );

    if (!round) {
        throw new Error("Round not found");
    }

    if (round.sessionId) {
        throw new Error("Round already generated");
    }

    if (user.credits < ASSESSMENT_GENERATION_CREDITS) {
        throw new Error("Insuffiient Credits");
    }

    const inputPayload = {
        companyName, role, experienceLevel, programmingLanguage, hiringType, followups, topics
    };
    try {
        const result = await callAI(getGenerateRoleBasedCodingAssessmentPrompt(inputPayload));

        let parsed;
        try {

            parsed = result;

            if (!parsed.assessmentMetadata) {
                throw new Error("Missing assessmentMetadata");
            }

            if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
                throw new Error("Questions must be a non-empty array");
            }

            for (const question of parsed.questions) {
                if (
                    !question.title ||
                    !question.description ||
                    !question.difficulty ||
                    !question.category ||
                    !question.starterCode ||
                    !question.systemWrapperCode
                ) {
                    throw new Error("Malformed question detected");
                }
            }

        } catch (err) {
            console.error("Invalid JSON from AI:", result);
            throw new Error("AI returned invalid assessment format");
        }

        console.log(parsed);
        const finalAssessment = sanitizeCodeAssessmentData({
            assessmentMetadata: {
                assessmentMode: 'ROLE_BASED',
                mode: 'ROLE_BASED',
                companyName,
                examOrRole: role,
                totalQuestions: parsed.assessmentMetadata.totalQuestions,
                totalDurationMinutes:
                    parsed.assessmentMetadata.totalDurationMinutes,
                programmingLanguage,
            },
            questions: parsed.questions,
        });
        console.log(finalAssessment)
        console.log(parsed.assessmentMetadata)
        console.log(parsed.assessmentMetadata.totalDurationMinutes)

        const [session, updatedUser] = await db.$transaction(
            async (tx) => {
                const session = await tx.simulationSession.create({
                    data: {
                        userId: user.id,
                        type: "CODING_ROUND",
                        status: "STARTED",
                        sessionToken: crypto.randomUUID(),
                        creditsUsed: ASSESSMENT_GENERATION_CREDITS,
                        payload: JSON.parse(JSON.stringify(finalAssessment)),
                        startedAt: new Date(),
                        parentSessionId,
                        durationSeconds:
                            finalAssessment.assessmentMetadata.totalDurationMinutes * 60,
                        expiresAt: new Date(
                            Date.now() + 1000 * 60 * 60 * 24 * 30
                        ),
                    },
                });

                const updatedRounds = parentSession.payload.rounds.map((round) =>
                    round.roundId === roundId
                        ? {
                            ...round,
                            sessionId: session.id,
                        }
                        : round
                );

                await tx.simulationSession.update({
                    where: {
                        id: parentSessionId,
                    },
                    data: {
                        payload: {
                            ...parentSession.payload,
                            rounds: updatedRounds,
                        },
                        linkedSessionIds: {
                            push: session.id,
                        },
                    },
                });

                const updatedUser = await tx.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        credits: {
                            decrement: ASSESSMENT_GENERATION_CREDITS,
                        },
                    },
                });

                return [session, updatedUser];
            }
        );


        return {
            success: true,
            data: {
                parentSessionId,
                sessionId: session.id,
                sessionToken: session.sessionToken,
                remainingCredits: updatedUser.credits,
                ...finalAssessment,
                userName: user.name
            }
        };
    } catch (error) {
        console.error("Error generating coding assessment:", error);
        throw new Error("Failed to generate coding assessment");
    }
}

export async function simulationInterviewGenerator({ parentSessionId, roundId, companyName, jobTitle, jobDescription, interviewType, resumeContent, followups, topics }) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
    })

    if (!user) throw new Error("User not exist");
    const parentSession =
        await db.simulationSession.findUnique({
            where: {
                id: parentSessionId,
            },
        });

    if (!parentSession) {
        throw new Error("Parent session not found");
    }

    if (parentSession.userId !== user.id) {
        throw new Error("Unauthorized");
    }

    if (parentSession.status === "SUBMITTED") {
        throw new Error("Simulation already submitted");
    }

    const round = parentSession.payload.rounds.find(
        (r) => r.roundId === roundId
    );

    if (!round) {
        throw new Error("Round not found");
    }

    if (round.sessionId) {
        throw new Error("Round already generated");
    }
    const MINIMUM_REQUIRED_CREDITS =
        INTERVIEW_GENERATION_CREDITS +
        INTERVIEW_EVALUATION_CREDITS +
        (
            INTERVIEW_PER_MINUTE_CREDITS *
            MINIMUM_INTERVIEW_MINUTES
        );

    if (user.credits < MINIMUM_REQUIRED_CREDITS) {
        throw new Error(
            `Minimum ${MINIMUM_REQUIRED_CREDITS} credits required to start interview`
        );
    }

    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const mobileRegex = /\b\+?\d{7,15}\b/g;
    const linkedinRegex = /https:\/\/(www\.)?linkedin\.com\/[^\s"'<>]+/g;
    const twitterRegex = /https:\/\/x\.com\/[^\s"'<>]+/g;

    const emails = resumeContent.match(emailRegex) || [];
    const mobiles = resumeContent.match(mobileRegex) || [];
    const linkedins = resumeContent.match(linkedinRegex) || [];
    const twitters = resumeContent.match(twitterRegex) || [];

    const PLACEHOLDERS = {
        email: "__MASK_EMAIL__UNIQUE123__",
        mobile: "__MASK_MOBILE__UNIQUE123__",
        linkedin: "__MASK_LINKEDIN__UNIQUE123__",
        twitter: "__MASK_TWITTER__UNIQUE123__",
    };

    function maskAll(content, matches, placeholder) {
        matches.forEach(item => {
            content = content.split(item).join(placeholder);
        });
        return content;
    }
    let maskedContent = resumeContent;
    maskedContent = maskAll(maskedContent, emails, PLACEHOLDERS.email);
    maskedContent = maskAll(maskedContent, mobiles, PLACEHOLDERS.mobile);
    maskedContent = maskAll(maskedContent, linkedins, PLACEHOLDERS.linkedin);
    maskedContent = maskAll(maskedContent, twitters, PLACEHOLDERS.twitter);

    const availableRuntimeCredits =
        user.credits -
        INTERVIEW_GENERATION_CREDITS -
        INTERVIEW_EVALUATION_CREDITS;

    const maxInterviewMinutes =
        Math.floor(
            availableRuntimeCredits /
            INTERVIEW_PER_MINUTE_CREDITS
        );

    try {
        const cleanedText = await callAI(getGenerateInterviewPrompt({
            companyName,
            jobTitle,
            interviewType,
            jobDescription,
            maskedContent,
            maxInterviewMinutes,
            followups,
            topics
        }))

        let interviewDetails;
        try {

            // console.log("prompt", prompt);
            const parsed = cleanedText;
            if (!parsed.interviewPlan) {
                throw new Error("Missing interviewPlan in AI response");
            }

            interviewDetails = parsed.interviewPlan;

        } catch (err) {
            console.error("Invalid JSON from AI:", cleanedText);

            throw new Error("AI returned invalid interview format");
        }
        if (
            interviewDetails.totalDuration >
            maxInterviewMinutes
        ) {
            interviewDetails.totalDuration =
                maxInterviewMinutes;
        }

        console.log("interviewDetails", interviewDetails);
        const [simulationSession, updatedUser] = await db.$transaction(
            async (tx) => {
                const simulationSession =
                    await tx.simulationSession.create({
                        data: {
                            userId: user.id,
                            type: "MOCK_INTERVIEW",
                            status: "STARTED",
                            sessionToken: crypto.randomUUID(),
                            creditsUsed: INTERVIEW_GENERATION_CREDITS,
                            payload: {
                                companyName,
                                jobTitle,
                                jobDescription,
                                interviewType,
                                resumeContent,
                                interviewPlan: interviewDetails,
                            },
                            parentSessionId,
                            startedAt: new Date(),
                            durationSeconds:
                                interviewDetails.totalDuration * 60,
                            expiresAt: new Date(
                                Date.now() + 1000 * 60 * 60 * 24 * 30
                            ),
                        },
                    });

                const updatedRounds =
                    parentSession.payload.rounds.map((round) =>
                        round.roundId === roundId
                            ? {
                                ...round,
                                sessionId: simulationSession.id,
                            }
                            : round
                    );

                await tx.simulationSession.update({
                    where: {
                        id: parentSessionId,
                    },
                    data: {
                        payload: {
                            ...parentSession.payload,
                            rounds: updatedRounds,
                        },
                        linkedSessionIds: {
                            push: simulationSession.id,
                        },
                    },
                });

                const updatedUser = await tx.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        credits: {
                            decrement:
                                INTERVIEW_GENERATION_CREDITS,
                        },
                    },
                });

                return [simulationSession, updatedUser];
            }
        );

        return {
            success: true,
            data: {
                parentSessionId,
                remainingCredits: updatedUser.credits,
                sessionId: simulationSession.id,
                sessionToken: simulationSession.sessionToken,
                ...interviewDetails,
                userName: user.name
            }
        };
    } catch (error) {
        console.error("Error generating interview question:", error);
        throw new Error("Failed to generate interview question");
    }
}

export async function evaluationRound({ parentSessionId, roundId, roundSessionToken, timeTaken, answeres }) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
    });

    if (!user) {
        throw new Error("User not exist");
    }

    const session = await db.simulationSession.findFirst({
        where: {
            id: parentSessionId,
        },
    });

    if (!session) {
        throw new Error("Session not found");
    }

    if (session.userId !== user.id) {
        throw new Error("Unauthorized");
    }

    console.log(session);
    const round = session.payload.rounds.find(
        (r) => r.roundId === roundId
    );

    if (!round) {
        throw new Error("Invalid round");
    }

    const childSession = await db.simulationSession.findUnique({
        where: {
            sessionToken: roundSessionToken,
        },
        include: {
            result: true,
        },
    });

    if (!childSession) {
        throw new Error("Round session not found");
    }

    if (childSession.userId !== user.id) {
        throw new Error("Unauthorized");
    }

    if (childSession.id !== round.sessionId) {
        throw new Error("Unauthorized");
    }

    if (childSession.status === "EXPIRED") {

        const updatedRounds = session.payload.rounds.map((r) =>
            r.roundId === roundId
                ? {
                    ...r,
                    status: "FAILED",
                }
                : r
        );

        await db.simulationSession.update({
            where: {
                id: session.id,
            },
            data: {
                payload: {
                    ...session.payload,
                    rounds: updatedRounds,
                    simulationMetadata: {
                        ...session.payload.simulationMetadata,
                        overallStatus: "FAILED",
                    },
                },
            },
        });

        return {
            success: false,
            data: {
                message: "Session already expired"
            }
        };
    }

    let sessionResult = null;
    let evaluationResponse = null;
    try {

        if (childSession.status === "SUBMITTED") {

            if (!childSession.result) {
                throw new Error("Result not found");
            }

            sessionResult = childSession.result;
        }

        if (childSession.status === "EVALUATION_PENDING") {

            switch (childSession.type) {
                case "ASSESSMENT_CENTER":
                    evaluationResponse =
                        await evaluatePendingAssessmentCenter({ sessionToken: roundSessionToken });
                    break;

                case "CODING_ROUND":
                    evaluationResponse =
                        await evaluatePendingCodingAssessment({ sessionToken: roundSessionToken });
                    break;

                case "MOCK_INTERVIEW":
                    evaluationResponse =
                        await evaluatePendingInterview({ sessionToken: roundSessionToken });
                    break;
                default:
                    throw new Error("Unsupported session type");
            }
        }


        if (childSession.status === "STARTED") {

            switch (childSession.type) {
                case "ASSESSMENT_CENTER":
                    evaluationResponse =
                        await evaluateAssessmentCenter({
                            userAnswers: answeres,
                            sessionToken: roundSessionToken,
                            timeTaken
                        });
                    break;

                case "CODING_ROUND":
                    evaluationResponse =
                        await evaluateCodingAssessment({
                            codes: answeres,
                            sessionToken: roundSessionToken,
                            timeTaken
                        });
                    break;

                case "MOCK_INTERVIEW":
                    evaluationResponse =
                        await evaluateInterview({
                            interviewConversation: answeres,
                            sessionToken: roundSessionToken,
                            timeTaken
                        });
                    break;
                default:
                    throw new Error("Unsupported session type");
            }
        }

    } catch (error) {
        console.error(error);
        throw new Error(
            error?.message || "Failed to evaluate round"
        );
    }

    if (childSession.status !== "SUBMITTED") {

        if (!evaluationResponse?.data?.session?.result) {
            throw new Error("Evaluation result missing");
        }

        sessionResult = evaluationResponse.data.session.result;
    }
    if (
        !sessionResult ||
        typeof sessionResult.score !== "number"
    ) {
        throw new Error("Invalid session result");
    }

    const score = sessionResult.score;

    const passed = score >= round.passingScore;

    const currentRoundIndex =
        session.payload.rounds.findIndex(
            (r) => r.roundId === roundId
        );

    const updatedRounds =
        session.payload.rounds.map((r) =>
            r.roundId === roundId
                ? {
                    ...r,
                    status: passed ? "PASSED" : "FAILED",
                    score,
                }
                : r
        );

    const simulationMetadata = {
        ...session.payload.simulationMetadata,
    };

    if (passed) {

        const nextRoundIndex =
            currentRoundIndex + 1;

        if (nextRoundIndex < updatedRounds.length) {

            updatedRounds[nextRoundIndex] = {
                ...updatedRounds[nextRoundIndex],
                status: "PENDING",
            };

            simulationMetadata.currentRoundIndex =
                nextRoundIndex;

        } else {

            simulationMetadata.overallStatus =
                "COMPLETED";
        }

    } else {

        simulationMetadata.overallStatus =
            "FAILED";
    }

    await db.simulationSession.update({
        where: {
            id: session.id,
        },
        data: {
            payload: {
                ...session.payload,
                rounds: updatedRounds,
                simulationMetadata,
            },
        },
    });

    const latestUser = await db.user.findUnique({
        where: {
            id: user.id,
        },
    });

    const latestChildSession =
        await db.simulationSession.findUnique({
            where: {
                id: childSession.id,
            },
            include: {
                result: true,
            },
        });

    const finalResponse = {
        success: true,
        data: {
            session: latestChildSession,
            updatedCredits: latestUser.credits,
        },
        userName: latestUser?.name,
    };

    console.log(JSON.stringify(finalResponse));

    return finalResponse;
}