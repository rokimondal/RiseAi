"use server"

import { callAI } from "@/Ai/callAI";
import { getEvaluationAssessmentCenterPrompt, getExamPlannerPrompt, getExamSectionGenerator, getRolePlannerPrompt, getRoleSectionGenerator } from "@/Ai/prompts/assessmentCenter";
import { CREDIT_COST, EVALUATION_CALL_CREDITS, MINIMUM_GENERATION_CREDITS } from "@/util/costs";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { calculateAssessmentCredits, validateGeneratedSection, validatePlannerResponse } from "@/util/helperfunctions";






export async function generateAssessmentCenter(data) {
    console.log(data);

    const {
        assessmentMode,
        companyName,
        role,
        experienceLevel,
        hiringType,
        roundType,
        examAuthority,
        examName,
        selectedTopics
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

    if (user.credits < MINIMUM_GENERATION_CREDITS) {
        throw new Error("Insuffiient Credits");
    }

    const inputPayload =
        assessmentMode === "ROLE_BASED"
            ? {
                companyName,
                role,
                experienceLevel,
                hiringType,
                roundType
            }
            : {
                examAuthority,
                examName,
                selectedTopics
            };

    const plannerPrompt =
        assessmentMode === "ROLE_BASED"
            ? getRolePlannerPrompt(inputPayload)
            : getExamPlannerPrompt(inputPayload);

    try {

        const planner = await callAI(plannerPrompt);

        console.log("Planner Output:", planner);

        validatePlannerResponse(planner)
        const { assessmentMetadata, sectionsOverview } = planner;


        let allQuestions = [];
        let globalId = 1;

        for (const section of sectionsOverview) {
            const sectionPayload =
                assessmentMode === "ROLE_BASED"
                    ? {
                        mode: "ROLE_BASED",

                        // ROLE CONTEXT ONLY
                        companyName,
                        role,
                        experienceLevel,
                        hiringType,
                        roundType,

                        // SECTION DATA
                        sectionName: section.sectionName,
                        sectionDescription: section.sectionDescription,
                        sectionTotalQuestions: section.totalQuestions,
                    }
                    : {
                        mode: "EXAM_BASED",

                        // EXAM CONTEXT ONLY
                        examAuthority,
                        examName,
                        selectedTopics,

                        // SECTION DATA
                        sectionName: section.sectionName,
                        sectionDescription: section.sectionDescription,
                        sectionTotalQuestions: section.totalQuestions,
                    };
            const sectionPrompt =
                assessmentMode === "ROLE_BASED"
                    ? getRoleSectionGenerator(sectionPayload)
                    : getExamSectionGenerator(sectionPayload);

            const parsedSection = await callAI(sectionPrompt);

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
                mode: assessmentMode,
                companyName:
                    assessmentMode === "ROLE_BASED"
                        ? companyName
                        : examAuthority,
                examOrRole:
                    assessmentMode === "ROLE_BASED"
                        ? role
                        : examName,
                totalQuestions: assessmentMetadata.totalQuestions,
                totalDurationMinutes:
                    assessmentMetadata.totalDurationMinutes
            },
            questions: allQuestions,
        }

        const usedCredits = calculateAssessmentCredits(sanitizedQuestions, "GENERATION");

        const [session, updatedUser] =
            await db.$transaction([
                db.simulationSession.create({
                    data: {
                        userId: user.id,
                        type: "ASSESSMENT_CENTER",
                        status: "STARTED",
                        sessionToken: crypto.randomUUID(),
                        creditsUsed: usedCredits,
                        payload: finalResult,
                        startedAt: new Date(),
                        durationSeconds: finalResult.assessmentMetadata.totalDurationMinutes * 60,
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
                            decrement:
                                usedCredits,
                        },
                    },
                })
            ]);


        return {
            success: true,
            data: {
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

export async function StartExistingAssessmentSession({sessionToken}) {

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

    console.log(sessionToken)

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
            "Completed Assessment cannot be restarted"
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
            "Assessment already started today"
        );
    }

    const payload =
        session.payload || {};

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

                    payload: {
                        ...payload,
                    },
                },
            });

        const sanitizedQuestions = payload.questions.map((q) => ({
            id: q.id,
            questionType: q.questionType,
            question: q.question,
            options: q.options
        }));

        return {
            success: true,
            data: {
                sessionId: session.id,
                sessionToken: updatedSession.sessionToken,
                remainingCredits: user.credits,
                ...updatedSession.payload,
                questions: sanitizedQuestions,
                userName: user.name
            }
        };

    } catch (error) {

        console.error(
            "Error starting Assessment:",
            error
        );

        throw new Error(
            "Failed to start Assessment"
        );
    }

}

export async function evaluateAssessmentCenter({ userAnswers, sessionToken, timeTaken }) {
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
            "Assessment already submitted"
        );
    }

    const QuestionWithSolution = await mergeQuestionAnswers({
        savedQuestionAnswers: session.payload.questions,
        userAnswers
    });

    const TotalCredits = calculateAssessmentCredits(QuestionWithSolution, "EVALUATION") + EVALUATION_CALL_CREDITS;

    if (user.credits < TotalCredits) {

        await db.simulationSession.update({
            where: {
                id: session.id,
            },

            data: {
                status:
                    "EVALUATION_PENDING",

                submittedAt:
                    new Date(),

                payload: {
                    assessmentMetadata: { ...session.payload.assessmentMetadata, timeTaken },
                    QuestionWithSolution
                },
            },
        })

        throw new Error(
            `Insufficient credits. Required ${TotalCredits}`
        );
    }

    const objectiveMarks = calculateObjectiveMarks(QuestionWithSolution);

    let AssessmentData = {
        assessmentMetadata: { ...session.payload.assessmentMetadata, timeTaken, objectiveMarks },
        QuestionWithSolution: buildEvaluationPayload(QuestionWithSolution)
    };

    console.log(AssessmentData);


    try {
        // console.log("prompt: ", prompt);
        const cleanedText = await callAI(getEvaluationAssessmentCenterPrompt(AssessmentData));
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

        const metadata = AssessmentData.assessmentMetadata;

        const FinalQuestions =
            buildFinalResultQuestions({
                QuestionWithSolution,
                subjectiveEvaluations:
                    evaluation.subjectiveEvaluations,
            });

        const FinalMetadata = {
            overallScore:
                evaluation.overallScore,

            technicalScore:
                evaluation.technicalScore,

            analyticalScore:
                evaluation.analyticalScore,

            accuracyScore:
                evaluation.accuracyScore,

            hiringRecommendation:
                evaluation.hiringRecommendation,
        };

        const FinalResultPayload = {
            strengths:
                evaluation.strengths || [],

            weaknesses:
                evaluation.weaknesses || [],

            questions:
                FinalQuestions,
        };

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
                                    decrement: TotalCredits,
                                },
                            },
                        });

                    await tx.creditTransaction.create({
                        data: {
                            userId:
                                user.id,


                            amount:
                                - (
                                    session.creditsUsed + TotalCredits
                                ),

                            balanceAfter:
                                updatedUser.credits,

                            type: "USAGE",

                            title:
                                "Assessment Center",

                            description: `${metadata.companyName} ${metadata.examOrRole} assessment evaluation`,
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

                            metadata: FinalMetadata,

                            result: FinalResultPayload,

                            improvementTip:
                                evaluation.improvementTips?.slice(0, 3)?.join(", "),
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

                            creditsUsed: {
                                increment:
                                    TotalCredits,
                            },

                            payload: {
                                assessmentMetadata: {
                                    ...session.payload.assessmentMetadata,

                                    timeTaken,

                                    objectiveMarks:
                                        metadata.objectiveMarks,
                                },
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
                },
                {
                    timeout: 15000,
                }
            );

        const finalResponse = {
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

        console.log(JSON.stringify(finalResponse));

        return finalResponse;
    } catch (error) {
        console.error("Error evaluating coding assessment:", error);
        throw new Error("Failed to evaluate coding assessment");
    }
}

export async function evaluatePendingAssessmentCenter({ sessionToken }) {
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
            "Assessment already submitted"
        );
    }


    const QuestionWithSolution = session.payload.QuestionWithSolution;

    const TotalCredits = calculateAssessmentCredits(QuestionWithSolution, "EVALUATION") + EVALUATION_CALL_CREDITS;

    if (user.credits < TotalCredits) {
        throw new Error(
            `Insufficient credits. Required ${TotalCredits}`
        );
    }


    const objectiveMarks = calculateObjectiveMarks(QuestionWithSolution);

    let AssessmentData = {
        assessmentMetadata: { ...session.payload.assessmentMetadata, objectiveMarks },
        QuestionWithSolution: buildEvaluationPayload(QuestionWithSolution)
    };



    console.log(AssessmentData);


    try {
        const cleanedText = await callAI(getEvaluationAssessmentCenterPrompt(AssessmentData));
        let evaluation;

        try {

            const parsed = JSON.parse(cleanedText);

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

        const metadata = AssessmentData.assessmentMetadata;

        const FinalQuestions =
            buildFinalResultQuestions({
                QuestionWithSolution,
                subjectiveEvaluations:
                    evaluation.subjectiveEvaluations,
            });

        const FinalMetadata = {
            overallScore:
                evaluation.overallScore,

            technicalScore:
                evaluation.technicalScore,

            analyticalScore:
                evaluation.analyticalScore,

            accuracyScore:
                evaluation.accuracyScore,

            hiringRecommendation:
                evaluation.hiringRecommendation,
        };

        const FinalResultPayload = {
            strengths:
                evaluation.strengths || [],

            weaknesses:
                evaluation.weaknesses || [],

            questions:
                FinalQuestions,
        };

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
                                    decrement: TotalCredits,
                                },
                            },
                        });

                    await tx.creditTransaction.create({
                        data: {
                            userId:
                                user.id,


                            amount:
                                - (
                                    session.creditsUsed + TotalCredits
                                ),

                            balanceAfter:
                                updatedUser.credits,

                            type: "USAGE",

                            title:
                                "Assessment Center",

                            description: `${metadata.companyName} ${metadata.examOrRole} assessment evaluation`,
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

                            metadata: FinalMetadata,

                            result: FinalResultPayload,

                            improvementTip:
                                evaluation.improvementTips?.slice(0, 3)?.join(", "),
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

                            creditsUsed: {
                                increment:
                                    TotalCredits,
                            },

                            payload: {
                                assessmentMetadata: {
                                    ...session.payload.assessmentMetadata,

                                    timeTaken,

                                    objectiveMarks:
                                        metadata.objectiveMarks,
                                },
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
                },
                {
                    timeout: 15000,
                }
            );

        const finalResponse = {
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

        console.log(JSON.stringify(finalResponse));

        return finalResponse;
    } catch (error) {
        console.error("Error evaluating coding assessment:", error);
        throw new Error("Failed to evaluate coding assessment");
    }
}

function arraysEqual(a, b) {

    const normalizedA =
        a.map(Number).sort((x, y) => x - y);

    const normalizedB =
        b.map(Number).sort((x, y) => x - y);

    if (normalizedA.length !== normalizedB.length) {
        return false;
    }

    return normalizedA.every(
        (val, index) => val === normalizedB[index]
    );
}

function mergeQuestionAnswers({ userAnswers, savedQuestionAnswers }) {

    // console.log(userAnswers);
    // console.log(savedQuestionAnswers);

    const userAnswerMap = new Map(
        userAnswers.map((q) => [q.id, q.answer])
    );

    return savedQuestionAnswers.map((question) => {

        const userAnswer = userAnswerMap.get(question.id);

        let isCorrect = null;

        if (question.questionType === "SINGLE_SELECT") {

            isCorrect = question.options[question.answer[0]] === userAnswer;
        }

        if (question.questionType === "MULTI_SELECT") {

            // frontend sends option values
            // convert them to option indexes

            const normalizedUserAnswer =
                Array.isArray(userAnswer)
                    ? userAnswer.map((ans) =>
                        question.options.findIndex(
                            (option) => option === ans
                        )
                    )
                    : [];

            isCorrect = arraysEqual(
                question.answer,
                normalizedUserAnswer
            );
        }

        return {
            questionId: question.id,
            questionType: question.questionType,
            question: question.question,
            options: question.options || [],
            expectedAnswer: question.expectedAnswer || "",
            correctAnswer: question.answer || [],
            userAnswer: userAnswer ?? (question.questionType === "MULTI_SELECT" ? [] : ""),
            isCorrect,
            marks: question.marks || 0,
            negativeMarks: question.negativeMarks || 0,
        };
    });
}

function calculateObjectiveMarks(QuestionWithSolution) {

    let obtainedMarks = 0;

    let totalMarks = 0;

    for (const q of QuestionWithSolution) {

        if (
            q.questionType !== "SINGLE_SELECT" &&
            q.questionType !== "MULTI_SELECT"
        ) {
            continue;
        }

        totalMarks += q.marks;

        if (q.isCorrect) {
            obtainedMarks += q.marks;
        } else {
            obtainedMarks -= q.negativeMarks;
        }
    }

    return {
        obtainedMarks,
        totalMarks,
    };
}

function buildEvaluationPayload(QuestionWithSolution) {

    return QuestionWithSolution.map((q) => {

        if (
            q.questionType === "SINGLE_SELECT" ||
            q.questionType === "MULTI_SELECT"
        ) {

            return {
                questionId: q.questionId,

                questionType: q.questionType,

                question: q.question,

                isCorrect: q.isCorrect,
            };
        }

        return q;
    });
}

function buildFinalResultQuestions({
    QuestionWithSolution,
    subjectiveEvaluations,
}) {

    const evaluationMap =
        new Map(
            subjectiveEvaluations.map((q) => [
                q.questionId,
                q,
            ])
        );

    return QuestionWithSolution.map((q) => {

        if (
            q.questionType === "SHORT_ANSWER" ||
            q.questionType === "LONG_ANSWER"
        ) {

            const evaluation =
                evaluationMap.get(q.questionId);

            return {
                ...q,

                obtainedMarks:
                    evaluation?.obtainedMarks || 0,

                result:
                    evaluation?.result || "WRONG",
            };
        }

        return {
            ...q,

            obtainedMarks:
                q.isCorrect
                    ? q.marks
                    : -q.negativeMarks,

            result:
                q.isCorrect
                    ? "CORRECT"
                    : "WRONG",
        };
    });
}