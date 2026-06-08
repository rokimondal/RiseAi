"use server"

import { callAI } from "@/Ai/callAI";
import { getEvaluationInterviewPrompt, getGenerateInterviewPrompt } from "@/Ai/prompts/mockInterview";
import { MINIMUM_INTERVIEW_MINUTES, INTERVIEW_GENERATION_CREDITS, INTERVIEW_EVALUATION_CREDITS, INTERVIEW_PER_MINUTE_CREDITS } from "@/util/costs";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";


export async function generateInterviewQuestion({ companyName, jobTitle, jobDescription, interviewType, resumeContent }) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
    })

    if (!user) throw new Error("User not exist");
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
            maxInterviewMinutes
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
        const [simulationSession, updatedUser] =
            await db.$transaction(async (tx) => {

                const simulationSession =
                    await tx.simulationSession.create({
                        data: {
                            userId: user.id,
                            type: "MOCK_INTERVIEW",
                            status: "STARTED",
                            creditsUsed: INTERVIEW_GENERATION_CREDITS,
                            payload: {
                                companyName,
                                jobTitle,
                                jobDescription,
                                interviewType,
                                resumeContent,
                                interviewPlan: interviewDetails,
                            },
                            startedAt: new Date(),
                            durationSeconds:
                                interviewDetails.totalDuration * 60,
                            expiresAt: new Date(
                                Date.now() + 1000 * 60 * 60 * 24 * 30
                            ),
                        },
                    });

                const updatedUser =
                    await tx.user.update({
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
            });

        return {
            success: true,
            data: {
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

export async function evaluateInterview({ interviewConversation, sessionToken, timeTaken }) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
    })

    if (!user) throw new Error("User not exist");

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

    if (session.status === "SUBMITTED") {
        throw new Error(
            "Interview already submitted"
        );
    }
    const maxAllowedTime = session.durationSeconds;
    if (timeTaken > maxAllowedTime) {
        throw new Error(
            "Invalid interview duration"
        );
    }

    const interviewMinutes =
        Math.ceil(timeTaken / 60);

    const runtimeCredits =
        interviewMinutes *
        INTERVIEW_PER_MINUTE_CREDITS;

    const totalCredits =
        INTERVIEW_EVALUATION_CREDITS +
        runtimeCredits;

    if (user.credits < totalCredits) {

        await db.$transaction(async (tx) => {

            const updatedUser =
                await tx.user.update({
                    where: {
                        id: user.id,
                    },

                    data: {
                        credits: {
                            decrement:
                                runtimeCredits,
                        },
                    },
                });

            await tx.creditTransaction.create({
                data: {
                    userId: user.id,

                    amount: -(
                        INTERVIEW_GENERATION_CREDITS +
                        runtimeCredits
                    ),

                    balanceAfter:
                        updatedUser.credits,

                    type: "USAGE",

                    title:
                        "Mock Interview",

                    description:
                        `${interviewMinutes}-minute AI mock interview (evaluation pending due to insufficient credits).`,
                },
            });

            await tx.simulationSession.update({
                where: {
                    id: session.id,
                },

                data: {
                    status:
                        "EVALUATION_PENDING",

                    submittedAt:
                        new Date(),

                    creditsUsed: {
                        increment:
                            runtimeCredits,
                    },

                    payload: {
                        ...session.payload,

                        interviewConversation,
                        timeTaken,
                        interviewMinutes,
                    },
                },
            });

        });

        throw new Error(
            `Insufficient credits. Required ${totalCredits}`
        );
    }

    let payload = { ...session.payload, interviewConversation, interviewDuration: timeTaken };
    const resumeContent = payload.resumeContent || "";

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

    payload = { ...payload, resumeContent: maskedContent };

    try {
        const cleanedText = await callAI(getEvaluationInterviewPrompt(payload));
        let evaluation;

        try {

            const parsed = cleanedText;

            if (
                parsed.overallScore === undefined
            ) {
                throw new Error(
                    "Missing evaluation scores"
                );
            }

            evaluation = parsed;

        } catch (err) {
            console.error("Invalid JSON from AI:", cleanedText);

            throw new Error("AI returned invalid interview format");
        }

        console.log(
            "evaluation",
            evaluation
        );

        const simulationResult =
            await db.$transaction(
                async (tx) => {

                    const updatedUser =
                        await tx.user.update({
                            where: {
                                id: user.id,
                            },

                            data: {
                                credits: {
                                    decrement: totalCredits,
                                },
                            },
                        });

                    await tx.creditTransaction.create({
                        data: {
                            userId:
                                user.id,


                            amount:
                                - (
                                    INTERVIEW_GENERATION_CREDITS +
                                    INTERVIEW_EVALUATION_CREDITS +
                                    runtimeCredits
                                ),

                            balanceAfter:
                                updatedUser.credits,

                            type: "USAGE",

                            title:
                                "Mock Interview",

                            description:
                                `${interviewMinutes}-minute AI mock interview with generation and evaluation.`,
                        },
                    });

                    await tx.simulationResult.create({
                        data: {
                            sessionId:
                                session.id,

                            userId:
                                user.id,

                            type:
                                session.type,

                            score:
                                evaluation.overallScore,

                            metadata: {
                                communicationScore:
                                    evaluation.communicationScore,

                                technicalScore:
                                    evaluation.technicalScore,

                                confidenceScore:
                                    evaluation.confidenceScore,

                                problemSolvingScore:
                                    evaluation.problemSolvingScore,

                                behavioralScore:
                                    evaluation.behavioralScore,

                                hiringRecommendation:
                                    evaluation.hiringRecommendation,
                            },

                            result:
                                evaluation,

                            improvementTip:
                                evaluation.improvementTips?.join(
                                    ", "
                                ),
                        },
                    });

                    const updatedSession = await tx.simulationSession.update({
                        where: {
                            id: session.id,
                        },

                        data: {
                            status:
                                "SUBMITTED",

                            submittedAt:
                                new Date(),

                            durationSeconds:
                                timeTaken,

                            creditsUsed: {
                                increment:
                                    INTERVIEW_EVALUATION_CREDITS +
                                    runtimeCredits,
                            },

                            payload: {
                                ...session.payload,

                                interviewConversation,

                                finalEvaluation:
                                    evaluation,
                            },
                        },

                        include: {
                            result: true,
                        },
                    });

                    return {
                        session: updatedSession,
                        updatedCredits:
                            updatedUser.credits,
                    };
                }
            );

        return {
            success: true,

            data: {
                session:
                    simulationResult.session,

                updatedCredits:
                    simulationResult.updatedCredits,

                userName:
                    user.name,
            }
        };
    } catch (error) {
        console.error("Error generating interview question:", error);
        throw new Error("Failed to generate interview question");
    }
}

export async function startExistingInterviewSession({ sessionToken }) {

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

    if (
        session.status === "SUBMITTED"
    ) {
        throw new Error(
            "Completed interviews cannot be restarted"
        );
    }

    const today = new Date();

    const startedAt =
        session.startedAt
            ? new Date(session.startedAt)
            : null;

    if (
        startedAt &&
        startedAt.toDateString() ===
        today.toDateString()
    ) {
        throw new Error(
            "Interview already started today"
        );
    }

    const payload =
        session.payload || {};

    if (
        !payload.interviewPlan
    ) {
        throw new Error(
            "Interview plan not found"
        );
    }



    try {

        const updatedSession =
            await db.simulationSession.update({
                where: {
                    id: session.id,
                },

                data: {
                    sessionToken:
                        crypto.randomUUID(),

                    status:
                        "STARTED",

                    startedAt:
                        new Date(),

                    submittedAt:
                        null,

                    autoSubmitted:
                        false,

                    durationSeconds:
                        payload.interviewPlan
                            ?.totalDuration * 60,

                    payload: {
                        ...payload,
                    },
                },
            });

        return {
            success: true,

            data: {
                sessionId:
                    updatedSession.id,

                sessionToken:
                    updatedSession.sessionToken,

                remainingCredits:
                    user.credits,

                ...payload.interviewPlan,

                status:
                    "STARTED",

                userName:
                    user.name,
            }
        };

    } catch (error) {

        console.error(
            "Error starting interview:",
            error
        );

        throw new Error(
            "Failed to start interview"
        );
    }
}

export async function evaluatePendingInterview({
    sessionToken,
}) {

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

    if (
        session.status !==
        "EVALUATION_PENDING"
    ) {
        throw new Error(
            "Session is not pending evaluation"
        );
    }

    const payload =
        session.payload || {};

    if (
        !payload.interviewConversation
    ) {
        throw new Error(
            "Interview conversation not found"
        );
    }

    const interviewMinutes =
        Math.ceil(
            session.durationSeconds / 60
        );

    const pendingCredits =
        INTERVIEW_EVALUATION_CREDITS;

    if (user.credits < pendingCredits) {
        throw new Error(
            `Minimum ${pendingCredits} credits required`
        );
    }

    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const mobileRegex = /\b\+?\d{7,15}\b/g;
    const linkedinRegex = /https:\/\/(www\.)?linkedin\.com\/[^\s"'<>]+/g;
    const twitterRegex = /https:\/\/x\.com\/[^\s"'<>]+/g;

    const resumeContent = payload.resumeContent || "";
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

    function maskAll(
        content,
        matches,
        placeholder
    ) {
        matches.forEach(item => {
            content =
                content
                    .split(item)
                    .join(placeholder);
        });

        return content;
    }

    let maskedContent =
        resumeContent;

    maskedContent = maskAll(maskedContent, emails, PLACEHOLDERS.email);
    maskedContent = maskAll(maskedContent, mobiles, PLACEHOLDERS.mobile);
    maskedContent = maskAll(maskedContent, linkedins, PLACEHOLDERS.linkedin);
    maskedContent = maskAll(maskedContent, twitters, PLACEHOLDERS.twitter);

    try {
        const cleanedText = await callAI(getEvaluationInterviewPrompt(payload));

        let evaluation;
        try {
            const parsed = JSON.parse(cleanedText);

            if (
                parsed.overallScore ===
                undefined
            ) {
                throw new Error(
                    "Missing evaluation scores"
                );
            }

            evaluation = parsed;

        } catch (err) {

            console.error(
                "Invalid JSON from AI:",
                cleanedText
            );

            throw new Error(
                "AI returned invalid interview format"
            );
        }

        const simulationResult =
            await db.$transaction(
                async (tx) => {

                    const updatedUser =
                        await tx.user.update({
                            where: {
                                id: user.id,
                            },

                            data: {
                                credits: {
                                    decrement:
                                        pendingCredits,
                                },
                            },
                        });

                    await tx.creditTransaction.create({
                        data: {
                            userId:
                                user.id,

                            amount:
                                -(
                                    pendingCredits
                                ),

                            balanceAfter:
                                updatedUser.credits,

                            type:
                                "USAGE",

                            title:
                                "Mock Interview",

                            description:
                                `${interviewMinutes}-minute AI mock interview evaluation.`,
                        },
                    });

                    await tx.simulationResult.create({
                        data: {
                            sessionId:
                                session.id,

                            userId:
                                user.id,

                            type:
                                session.type,

                            score:
                                evaluation.overallScore,

                            metadata: {
                                communicationScore:
                                    evaluation.communicationScore,

                                technicalScore:
                                    evaluation.technicalScore,

                                confidenceScore:
                                    evaluation.confidenceScore,

                                problemSolvingScore:
                                    evaluation.problemSolvingScore,

                                behavioralScore:
                                    evaluation.behavioralScore,

                                hiringRecommendation:
                                    evaluation.hiringRecommendation,
                            },

                            result:
                                evaluation,

                            improvementTip:
                                evaluation.improvementTips?.join(
                                    ", "
                                ),
                        },
                    });

                    const updatedSession = await tx.simulationSession.update({
                        where: {
                            id: session.id,
                        },

                        data: {
                            status:
                                "SUBMITTED",

                            creditsUsed: {
                                increment:
                                    pendingCredits,
                            },

                            payload: {
                                ...payload,

                                pendingEvaluation:
                                    false,

                                finalEvaluation:
                                    evaluation,
                            },
                        },

                        include: {
                            result: true,
                        },
                    });

                    return {
                        session:
                            updatedSession,

                        updatedCredits:
                            updatedUser.credits,
                    };
                }
            );

        return {
            success: true,

            data: {
                session:
                    simulationResult.session,

                updatedCredits:
                    simulationResult.updatedCredits,

                userName:
                    user.name,
            }
        };

    } catch (error) {

        console.error(
            "Error evaluating pending interview:",
            error
        );

        throw new Error(
            "Failed to evaluate pending interview"
        );
    }
}