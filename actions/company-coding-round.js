"use server"

import { callAI } from "@/Ai/callAI";
import { getEvaluationCodingAssessmentPrompt, getGenerateExamBasedCodingAssessmentPrompt, getGenerateRoleBasedCodingAssessmentPrompt } from "@/Ai/prompts/companyCoding";
import { ASSESSMENT_EVALUATION_CREDITS, ASSESSMENT_GENERATION_CREDITS } from "@/util/costs";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { sanitizeCodeAssessmentData } from "@/util/helperfunctions";


export async function generateCodingAssessment(data) {
    //

    console.log(data);
    const {
        assessmentMode,
        companyName,
        role,
        experienceLevel,
        programmingLanguage,
        hiringType,
        examName
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

    if (user.credits < ASSESSMENT_GENERATION_CREDITS) {
        throw new Error("Insuffiient Credits");
    }

    const inputPayload =
        assessmentMode === "ROLE_BASED"
            ? { companyName, role, experienceLevel, programmingLanguage, hiringType }
            : { companyName, examName, programmingLanguage };
    try {
        let result;
        if (assessmentMode === "ROLE_BASED") {
            result = await callAI(getGenerateRoleBasedCodingAssessmentPrompt(inputPayload));
        } else {
            result = await callAI(getGenerateExamBasedCodingAssessmentPrompt(inputPayload));
        }

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

        const finalAssessment = sanitizeCodeAssessmentData({
            assessmentMetadata: {
                assessmentMode: data.assessmentMode,
                mode: assessmentMode,
                companyName,
                examOrRole:
                    assessmentMode === "ROLE_BASED" ? role : examName,
                totalQuestions: parsed.assessmentMetadata.totalQuestions,
                totalDurationMinutes:
                    parsed.assessmentMetadata.totalDurationMinutes,
                programmingLanguage,
            },
            questions: parsed.questions,
        });

        console.log(finalAssessment);

        const [session, updatedUser] =
            await db.$transaction([
                db.simulationSession.create({
                    data: {
                        userId: user.id,
                        type: "CODING_ROUND",
                        status: "STARTED",
                        sessionToken: crypto.randomUUID(),
                        creditsUsed: ASSESSMENT_GENERATION_CREDITS, payload: finalAssessment,
                        startedAt: new Date(),
                        durationSeconds: finalAssessment.assessmentMetadata.totalDurationMinutes * 60,
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
                                ASSESSMENT_GENERATION_CREDITS,
                        },
                    },
                })
            ])

            console.log(JSON.stringify(session));

        return {
            success: true,
            data: {
                sessionId: session.id,
                sessionToken: session.sessionToken,
                remainingCredits: updatedUser.credits,
                ...session.payload,
                userName: user.name
            }
        };
    } catch (error) {
        console.error("Error generating coding assessment:", error);
        throw new Error("Failed to generate coding assessment");
    }
}

export async function runCode({ code, input, language, sessionToken, questionId }) {
    try {
        if (!language) {
            throw new Error("Language is required");
        }

        const normalizedLanguage = language.toLowerCase();

        const allowedLanguages = ["java", "python", "cpp", "javascript", "c", "typescript", "go", "rust", "ruby", "php"];

        if (!allowedLanguages.includes(normalizedLanguage)) {
            throw new Error("Unsupported language");
        }

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

        const assessmentEndTime = new Date(session.startedAt).getTime() + (session.durationSeconds * 1000) + (60 * 1000);

        if (Date.now() > assessmentEndTime) {
            throw new Error("Assessment already ended");
        }

        if (session.status === "SUBMITTED") {
            throw new Error(
                "Assessment already submitted"
            );
        }

        const result = await executeCode({ code, input, language });
        return {
            questionId,
            ...result
        };

    } catch (error) {
        console.error("Error runing code:", error);
        throw new Error("Failed to run the code");
    }
}

export async function evaluateCodingAssessment({ codes, sessionToken, timeTaken }) {
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

    const QuestionWithSolution = await generateQuestionWithSolution({
        questions: session.payload.questions,
        codes,
        language: session.payload.assessmentMetadata.programmingLanguage,
    });

    if (user.credits < ASSESSMENT_EVALUATION_CREDITS) {

        await db.simulationSession.update({
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
                        ASSESSMENT_EVALUATION_CREDITS,
                },

                payload: {
                    assessmentMetadata: { ...session.payload.assessmentMetadata, timeTaken },
                    QuestionWithSolution
                },
            },
        })

        throw new Error(
            `Insufficient credits. Required ${ASSESSMENT_EVALUATION_CREDITS}`
        );
    }

    let AssessmentData = {
        assessmentMetadata: { ...session.payload.assessmentMetadata, timeTaken },
        QuestionWithSolution
    };


    try {
        const cleanedText = await callAI(getEvaluationCodingAssessmentPrompt(AssessmentData));
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
                                    decrement: ASSESSMENT_EVALUATION_CREDITS,
                                },
                            },
                        });

                    await tx.creditTransaction.create({
                        data: {
                            userId:
                                user.id,


                            amount:
                                - (
                                    ASSESSMENT_GENERATION_CREDITS + ASSESSMENT_EVALUATION_CREDITS
                                ),

                            balanceAfter:
                                updatedUser.credits,

                            type: "USAGE",

                            title:
                                "Coding Assessment",

                            description: `${metadata.companyName} ${metadata.examOrRole} coding assessment generation and evaluation.`,
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
                                technicalScore:
                                    evaluation.technicalScore,

                                problemSolvingScore:
                                    evaluation.problemSolvingScore,

                                codeQualityScore:
                                    evaluation.codeQualityScore,

                                algorithmScore:
                                    evaluation.algorithmScore,

                                debuggingScore:
                                    evaluation.debuggingScore,

                                hiringRecommendation:
                                    evaluation.hiringRecommendation,
                            },

                            result:
                                evaluation,

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
                                    ASSESSMENT_EVALUATION_CREDITS,
                            },

                            payload: AssessmentData,
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
        console.error("Error evaluating coding assessment:", error);
        throw new Error("Failed to evaluate coding assessment");
    }
}

export async function startExistingCodingTestSession({ sessionToken }) {

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

        return {
            success: true,

            data: {
                sessionId:
                    updatedSession.id,

                sessionToken:
                    updatedSession.sessionToken,

                ...payload,

                userName:
                    user.name,
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

export async function evaluatePendingCodingAssessment({ sessionToken }) {
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

    if (session.status !== "EVALUATION_PENDING") {
        throw new Error(
            "Session is not pending evaluation"
        );
    }


    if (user.credits < ASSESSMENT_EVALUATION_CREDITS) {

        throw new Error(
            `Insufficient credits. Required ${ASSESSMENT_EVALUATION_CREDITS}`
        );
    }

    let AssessmentData = {
        ...session.payload
    };


    try {
        const cleanedText = await callAI(getEvaluationCodingAssessmentPrompt(AssessmentData));
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
                                    decrement: ASSESSMENT_EVALUATION_CREDITS,
                                },
                            },
                        });

                    await tx.creditTransaction.create({
                        data: {
                            userId:
                                user.id,


                            amount:
                                - (
                                    ASSESSMENT_GENERATION_CREDITS + ASSESSMENT_EVALUATION_CREDITS
                                ),

                            balanceAfter:
                                updatedUser.credits,

                            type: "USAGE",

                            title:
                                "Coding Assessment",

                            description: `${metadata.companyName} ${metadata.examOrRole} coding assessment generation and evaluation.`,
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
                                technicalScore:
                                    evaluation.technicalScore,

                                problemSolvingScore:
                                    evaluation.problemSolvingScore,

                                codeQualityScore:
                                    evaluation.codeQualityScore,

                                algorithmScore:
                                    evaluation.algorithmScore,

                                debuggingScore:
                                    evaluation.debuggingScore,

                                hiringRecommendation:
                                    evaluation.hiringRecommendation,
                            },

                            result:
                                evaluation,

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
                                    ASSESSMENT_EVALUATION_CREDITS,
                            },

                            payload: AssessmentData,
                        },

                        include: {
                            result: true,
                        },
                    });

                    console.log({
                        session: updatedSession,
                        updatedCredits:
                            updatedUser.credits,
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
        console.error("Error evaluating coding assessment:", error);
        throw new Error("Failed to coding assessment");
    }
}

async function generateQuestionWithSolution({ questions, codes, language }) {

    const QuestionWithSolution = [];

    for (const question of questions) {
        const submittedCode =
            codes.find(
                (c) => c.questionId === question.id
            );

        if (!submittedCode) {

            QuestionWithSolution.push({
                questionId: question.id,
                title: question.title,
                difficulty: question.difficulty,
                category: question.category,

                submitted: false,

                passedTestCases: 0,

                totalTestCases:
                    question.testCases.length,

                successRate: 0,

                testCases:
                    question.testCases.map((tc) => ({
                        input: tc.input,
                        expectedOutput: tc.output,
                        actualOutput: null,
                        passed: false,
                    })),

                code: "",

                executionStatus:
                    "NOT_SUBMITTED",
            });

            continue;
        }

        const fullCode =
            question.systemWrapperCode.replace(
                "{{USER_CODE}}",
                submittedCode.code
            );

        const fullInput =
            question.testCases
                .map((tc) => {

                    const rawInput =
                        String(tc.input || "").trim();

                    if (
                        rawInput.startsWith('\"') &&
                        rawInput.endsWith('\"')
                    ) {
                        return rawInput.slice(1, -1);
                    }

                    return rawInput;

                })
                .join("\n###TESTCASE###\n");

        const executionResult =
            await executeCode({
                code: fullCode,
                input: fullInput,
                language,
            });

        if (!executionResult.success) {

            QuestionWithSolution.push({
                questionId: question.id,
                title: question.title,
                difficulty: question.difficulty,
                category: question.category,
                submitted: true,
                passedTestCases: 0,
                totalTestCases: question.testCases.length,
                successRate: 0,
                code: submittedCode.code,
                executionStatus: executionResult.status || "ERROR",
                compileError: executionResult.compileError || null,
                runtimeError: executionResult.runtimeError || null,
                testCases:
                    question.testCases.map((tc) => ({
                        input: tc.input,
                        expectedOutput: tc.output,
                        actualOutput: null,
                        passed: false,
                    })),
            });

            continue;
        }

        const rawOutput = executionResult.output || "";

        const outputs = rawOutput.split("###TESTCASE###").map((o) => o.trim());

        let passedCount = 0;

        const formattedTestCases =
            question.testCases.map((tc, index) => {
                const actualOutput = outputs[index]?.trim() || "";
                const expectedOutput = String(tc.output || "").trim();
                const passed = actualOutput === expectedOutput;
                if (passed) {
                    passedCount++;
                }

                return {
                    input: tc.input,
                    expectedOutput,
                    actualOutput,
                    passed,
                };
            });

        QuestionWithSolution.push({
            questionId: question.id,
            title: question.title,
            difficulty: question.difficulty,
            category: question.category,
            submitted: true,
            passedTestCases: passedCount,
            totalTestCases: question.testCases.length,
            successRate:
                Math.round(
                    (
                        passedCount /
                        question.testCases.length
                    ) * 100
                ),
            executionStatus: "EXECUTED",
            code: submittedCode.code,
            testCases: formattedTestCases,
        });
    }

    return QuestionWithSolution;
}

async function executeCode({ code, input, language }) {
    try {

        const normalizedLanguage =
            language.toLowerCase();

        const response = await fetch(
            `${process.env.CODE_EXECUTION_ENGINE}/run/${normalizedLanguage}`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    code,
                    input,
                }),

                cache: "no-store",
            }
        );

        if (!response.ok) {
            throw new Error(
                "Failed to execute code"
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error executing code:", error);
        throw new Error("Failed to execute code");
    }
}