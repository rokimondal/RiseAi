"use server"

import { callAI } from "@/Ai/callAI";
import { getEvaluationAssessmentCenterPrompt, getExamPlannerPrompt, getExamSectionGenerator, getRolePlannerPrompt, getRoleSectionGenerator } from "@/Ai/prompts/assessmentCenter";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
});


const CREDIT_COST = {
    GENERATION: {
        SINGLE_SELECT: 0.10,
        MULTI_SELECT: 0.15,
        SHORT_ANSWER: 0.30,
        LONG_ANSWER: 0.75,
    },

    EVALUATION: {
        SHORT_ANSWER: 0.25,
        LONG_ANSWER: 0.75,
    },
};

const MINIMUM_GENERATION_CREDITS = 10;
const EVALUATION_CALL_CREDITS = 2;

function calculateAssessmentCredits(questions, type = "GENERATION") {

    const pricing =
        CREDIT_COST[type] || {};

    const total =
        questions.reduce((sum, q) => {

            return (
                sum +
                (
                    pricing[
                    q.questionType
                    ] || 0
                )
            );

        }, 0);

    return Math.max(
        1,
        Math.ceil(total)
    );
}

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

        validatePlannerResponse(planner);


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

export async function StartExistingAssessmentSession(sessionToken) {

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

    // throw new Error("failed");

    const prompt = `
You are an Enterprise Assessment Evaluation Engine.

CRITICAL:
Return STRICTLY VALID JSON.

NO markdown.
NO explanations.
NO comments.
NO extra text.

If JSON is invalid → regenerate internally.

==================================================
INPUT
==================================================

${JSON.stringify(AssessmentData, null, 2)}

==================================================
OBJECTIVE
==================================================

Evaluate ONLY subjective questions:

- SHORT_ANSWER
- LONG_ANSWER

Objective questions are ALREADY evaluated by system.

DO NOT recalculate:
- objective scores
- obtainedMarks
- correctness

Objective questions are provided ONLY for:

- overall analysis
- strengths analysis
- weaknesses analysis
- recommendation analysis
- skill analysis

==================================================
SUBJECTIVE QUESTION EVALUATION RULE
==================================================

Evaluate ONLY:

- SHORT_ANSWER
- LONG_ANSWER

Each subjective question contains:

- marks
- expectedAnswer
- userAnswer

==================================================
SUBJECTIVE SCORING RULE
==================================================

Rules:

1. obtainedMarks MUST NOT exceed marks

2. Completely incorrect answer:
   → negative score

3. Partially correct answer:
   → medium positive score

4. Strong answer:
   → high positive score

5. NEVER always give full marks

6. If userAnswer is empty:
   → obtainedMarks MUST be negative
   → result MUST be "WRONG"

7. Evaluate:
   - conceptual clarity
   - correctness
   - analytical depth
   - completeness
   - practical understanding

==================================================
SUBJECTIVE NEGATIVE MARKING RULE
==================================================

Subjective questions ALSO support negative marking.

Each subjective question contains:

- marks
- negativeMarks

Rules:

1. CORRECT
   → obtainedMarks should be high positive

2. PARTIALLY_CORRECT
   → obtainedMarks should be medium positive

3. WRONG
   → obtainedMarks MUST be negative

4. For WRONG answers:
   → use question.negativeMarks

Example:

{
  "questionId": 12,
  "marks": 10,
  "negativeMarks": 2
}

Wrong evaluation:

{
  "questionId": 12,
  "obtainedMarks": -2,
  "result": "WRONG"
}

5. NEVER return 0 for completely wrong answer
   if negativeMarks exists.

6. obtainedMarks MUST NEVER exceed marks.

7. result values MUST remain ONLY:

- CORRECT
- PARTIALLY_CORRECT
- WRONG

==================================================
OBJECTIVE QUESTION RULE
==================================================

Objective questions already contain:

- question
- isCorrect

DO NOT modify them.

Objective obtained marks are already calculated separately inside:

assessmentMetadata.objectiveMarks

==================================================
ASSESSMENT ANALYSIS ENGINE
==================================================

Analyze FULL assessment performance using:

- objective question accuracy
- subjective answer quality
- topic consistency
- analytical ability
- conceptual understanding
- problem solving ability

==================================================
SCORE ENGINE
==================================================

Generate ONLY assessment-related scores.

DO NOT generate:
- communicationScore
- personalityScore
- speakingScore

because this is NOT an interview.

==================================================
REQUIRED SCORES
==================================================

Generate:

1. overallScore
2. technicalScore
3. analyticalScore
4. problemSolvingScore
5. accuracyScore

--------------------------------------------------
technicalScore
--------------------------------------------------

Based on:
- technical correctness
- domain knowledge
- conceptual understanding

--------------------------------------------------
analyticalScore
--------------------------------------------------

Based on:
- reasoning
- logical thinking
- analytical depth
- decision making

--------------------------------------------------
problemSolvingScore
--------------------------------------------------

Based on:
- solution approach
- debugging ability
- scenario handling
- practical thinking

--------------------------------------------------
accuracyScore
--------------------------------------------------

Based on:
- correct objective answers
- precision
- consistency
- negative marking impact

==================================================
OBJECTIVE MARKS RULE
==================================================

assessmentMetadata.objectiveMarks contains
ONLY SINGLE_SELECT and MULTI_SELECT scores.

Structure:

{
  obtainedMarks,
  totalMarks
}

These values are already calculated by system.

DO NOT recalculate them.
DO NOT modify them.

Use them ONLY for:

- overall analysis
- strengths analysis
- weaknesses analysis
- technical analysis
- accuracy analysis

==================================================
OVERALL SCORE RULE
==================================================

overallScore MUST be calculated using:

1. assessmentMetadata.objectiveMarks.obtainedMarks

PLUS

2. sum of subjectiveEvaluations.obtainedMarks

--------------------------------------------------

Total maximum marks:

1. assessmentMetadata.objectiveMarks.totalMarks

PLUS

2. total subjective question marks

--------------------------------------------------

Formula:

(
objective obtained marks
+
subjective obtained marks
)
/
(
objective total marks
+
subjective total marks
)
× 100

Return rounded integer.

==================================================
STRENGTH RULE
==================================================

Strengths MUST reflect:

- strong concepts
- technical strengths
- analytical strengths
- consistent performance
- strong topics

==================================================
WEAKNESS RULE
==================================================

Weaknesses MUST reflect:

- conceptual gaps
- weak topics
- poor analytical depth
- incorrect patterns
- incomplete understanding

==================================================
IMPROVEMENT TIP RULE
==================================================

Provide practical actionable improvements.

Bad:
"Practice more"

Good:
"Improve SQL joins and normalization concepts"

==================================================
HIRING RECOMMENDATION RULE
==================================================

Allowed values ONLY:

- STRONG_HIRE
- HIRE
- BORDERLINE
- Reject

==================================================
TIME ANALYSIS RULE
==================================================

Use:
assessmentMetadata.timeTaken

Analyze:
- efficiency
- completion speed
- time management

==================================================
SUBJECTIVE EVALUATION RULE
==================================================

Return subjectiveEvaluations ONLY for:

- SHORT_ANSWER
- LONG_ANSWER

DO NOT include:
- strengths
- weaknesses
- feedback

inside per-question evaluation.

==================================================
SUBJECTIVE RESULT RULE
==================================================

Each subjective evaluation MUST include:

"result"

Allowed values ONLY:

- CORRECT
- PARTIALLY_CORRECT
- WRONG

Rules:

1. CORRECT
   → answer is mostly accurate,
   conceptually strong,
   and obtainedMarks is high

2. PARTIALLY_CORRECT
   → answer contains partial understanding,
   incomplete explanation,
   or medium obtainedMarks

3. WRONG
   → answer is mostly incorrect,
   irrelevant,
   empty,
   vague,
   or conceptually incorrect

   AND:

   obtainedMarks MUST be NEGATIVE
   using question.negativeMarks

   
==================================================
SELF VALIDATION
==================================================

Before returning:

✓ Valid JSON

✓ overallScore exists
✓ technicalScore exists
✓ analyticalScore exists
✓ problemSolvingScore exists
✓ accuracyScore exists

✓ strengths exists
✓ weaknesses exists
✓ improvementTips exists
✓ hiringRecommendation exists

✓ subjectiveEvaluations exists

For every subjective evaluation:

✓ questionId exists
✓ obtainedMarks exists
✓ result exists

✓ obtainedMarks <= question.marks

==================================================
OUTPUT FORMAT
==================================================

{
  "overallScore": number,

  "technicalScore": number,

  "analyticalScore": number,

  "accuracyScore": number,

  "hiringRecommendation":
    "Strong Hire | Hire | Neutral | Reject",

  "strengths": [
    string
  ],

  "weaknesses": [
    string
  ],

  "improvementTips": [
    string
  ],

  "subjectiveEvaluations": [
  {
    "questionId": number,

    "obtainedMarks": number,

    "result":
      "CORRECT" |
      "PARTIALLY_CORRECT" |
      "WRONG"
  }
]
}
`;


    try {
        // console.log("prompt: ", prompt);
        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").replace(/```/g, "").trim();
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

function validatePlannerResponse(planner) {

    if (
        !planner ||
        typeof planner !== "object"
    ) {
        throw new Error(
            "Invalid planner response"
        );
    }

    const {
        assessmentMetadata,
        sectionsOverview,
    } = planner;

    /*
    ==========================================
    BASIC METADATA VALIDATION
    ==========================================
    */

    if (
        !assessmentMetadata ||
        typeof assessmentMetadata !== "object"
    ) {
        throw new Error(
            "Invalid assessmentMetadata"
        );
    }

    if (
        typeof assessmentMetadata.totalQuestions !== "number" ||
        assessmentMetadata.totalQuestions <= 0
    ) {
        throw new Error(
            "Invalid totalQuestions"
        );
    }

    if (
        typeof assessmentMetadata.totalDurationMinutes !== "number" ||
        assessmentMetadata.totalDurationMinutes <= 0
    ) {
        throw new Error(
            "Invalid totalDurationMinutes"
        );
    }

    /*
    ==========================================
    SECTION VALIDATION
    ==========================================
    */

    if (
        !Array.isArray(sectionsOverview)
    ) {
        throw new Error(
            "sectionsOverview must be array"
        );
    }

    if (
        sectionsOverview.length === 0
    ) {
        throw new Error(
            "No sections generated"
        );
    }

    /*
    ==========================================
    AUTO FIX TOTAL SECTIONS
    ==========================================
    */

    assessmentMetadata.totalSections =
        sectionsOverview.length;

    let calculatedQuestions = 0;

    for (const section of sectionsOverview) {

        if (
            !section ||
            typeof section !== "object"
        ) {
            continue;
        }

        /*
        ==========================================
        AUTO FIX SECTION NAME
        ==========================================
        */

        if (
            !section.sectionName ||
            typeof section.sectionName !== "string"
        ) {
            section.sectionName =
                "General Section";
        }

        /*
        ==========================================
        AUTO FIX DESCRIPTION
        ==========================================
        */

        if (
            !section.sectionDescription ||
            typeof section.sectionDescription !== "string"
        ) {
            section.sectionDescription =
                section.sectionName;
        }

        /*
        ==========================================
        AUTO FIX TOTAL QUESTIONS
        ==========================================
        */

        if (
            typeof section.totalQuestions !== "number" ||
            section.totalQuestions <= 0
        ) {
            section.totalQuestions = 10;
        }

        calculatedQuestions +=
            section.totalQuestions;

        /*
        ==========================================
        AUTO FIX SCORING RULES
        ==========================================
        */

        if (
            !section.scoringRules ||
            typeof section.scoringRules !== "object"
        ) {
            section.scoringRules = {};
        }

        const defaultRules = {
            SINGLE_SELECT: {
                marks: 1,
                negativeMarks: 0.25,
            },

            MULTI_SELECT: {
                marks: 2,
                negativeMarks: 0.5,
            },

            SHORT_ANSWER: {
                marks: 3,
                negativeMarks: 0,
            },

            LONG_ANSWER: {
                marks: 5,
                negativeMarks: 0,
            },
        };

        for (const type of Object.keys(defaultRules)) {

            if (
                !section.scoringRules[type]
            ) {
                section.scoringRules[type] =
                    defaultRules[type];
            }

            const rule =
                section.scoringRules[type];

            if (
                typeof rule.marks !== "number" ||
                rule.marks <= 0
            ) {
                rule.marks =
                    defaultRules[type].marks;
            }

            if (
                typeof rule.negativeMarks !== "number" ||
                rule.negativeMarks < 0
            ) {
                rule.negativeMarks =
                    defaultRules[type].negativeMarks;
            }
        }

        /*
        ==========================================
        AUTO FIX SECTION TOTAL MARKS
        ==========================================
        */

        if (
            typeof section.sectionTotalMarks !== "number" ||
            section.sectionTotalMarks <= 0
        ) {
            section.sectionTotalMarks =
                section.totalQuestions;
        }
    }

    /*
    ==========================================
    AUTO FIX TOTAL QUESTIONS
    ==========================================
    */

    assessmentMetadata.totalQuestions =
        calculatedQuestions;

    /*
    ==========================================
    AUTO FIX TOTAL MARKS
    ==========================================
    */

    if (
        typeof assessmentMetadata.totalMarks !== "number" ||
        assessmentMetadata.totalMarks <= 0
    ) {

        assessmentMetadata.totalMarks =
            sectionsOverview.reduce(
                (sum, section) =>
                    sum +
                    (
                        section.sectionTotalMarks || 0
                    ),
                0
            );
    }

    return true;
}

function validateGeneratedSection({
    parsedSection,
    section,
}) {

    if (
        !parsedSection ||
        typeof parsedSection !== "object"
    ) {
        throw new Error(
            `Invalid generated section for ${section.sectionName}`
        );
    }

    if (
        !parsedSection.sectionName ||
        typeof parsedSection.sectionName !== "string"
    ) {
        throw new Error(
            "Invalid generated sectionName"
        );
    }

    if (
        parsedSection.sectionName !==
        section.sectionName
    ) {
        throw new Error(
            `Section name mismatch for ${section.sectionName}`
        );
    }

    if (
        typeof parsedSection.totalQuestions !== "number" ||
        Number.isNaN(parsedSection.totalQuestions) ||
        !Number.isFinite(parsedSection.totalQuestions) ||
        parsedSection.totalQuestions <= 0
    ) {
        throw new Error(
            `Invalid totalQuestions in ${section.sectionName}`
        );
    }

    if (
        !Array.isArray(parsedSection.questions)
    ) {
        throw new Error(
            `Questions must be array in ${section.sectionName}`
        );
    }

    if (
        parsedSection.questions.length === 0
    ) {
        throw new Error(
            `No questions generated in ${section.sectionName}`
        );
    }

    if (
        parsedSection.questions.length !==
        section.totalQuestions
    ) {
        throw new Error(
            `Question count mismatch in ${section.sectionName}`
        );
    }

    if (
        parsedSection.totalQuestions !==
        section.totalQuestions
    ) {
        throw new Error(
            `Invalid totalQuestions in generated section ${section.sectionName}`
        );
    }

    const validQuestionTypes = [
        "SINGLE_SELECT",
        "MULTI_SELECT",
        "SHORT_ANSWER",
        "LONG_ANSWER",
    ];

    for (const q of parsedSection.questions) {

        if (
            !q ||
            typeof q !== "object"
        ) {
            throw new Error(
                `Invalid question object in ${section.sectionName}`
            );
        }

        if (
            !q.questionType ||
            !validQuestionTypes.includes(
                q.questionType
            )
        ) {
            throw new Error(
                `Invalid questionType in ${section.sectionName}`
            );
        }

        if (
            !q.question ||
            typeof q.question !== "string" ||
            !q.question.trim()
        ) {
            throw new Error(
                `Invalid question text in ${section.sectionName}`
            );
        }

        if (
            !Array.isArray(q.options)
        ) {
            throw new Error(
                `Options must be array in ${section.sectionName}`
            );
        }

        if (
            !Array.isArray(q.answer)
        ) {
            throw new Error(
                `Answer must be array in ${section.sectionName}`
            );
        }

        if (
            typeof q.expectedAnswer !== "string"
        ) {
            throw new Error(
                `Invalid expectedAnswer in ${section.sectionName}`
            );
        }

        /*
        ==========================================
        SINGLE_SELECT VALIDATION
        ==========================================
        */

        if (
            q.questionType === "SINGLE_SELECT"
        ) {

            if (
                q.options.length !== 4
            ) {
                throw new Error(
                    "SINGLE_SELECT must have exactly 4 options"
                );
            }

            if (
                q.answer.length !== 1
            ) {
                throw new Error(
                    "SINGLE_SELECT must have exactly 1 answer"
                );
            }

            if (
                typeof q.answer[0] !== "number" ||
                Number.isNaN(q.answer[0]) ||
                !Number.isFinite(q.answer[0]) ||
                q.answer[0] < 0 ||
                q.answer[0] >= q.options.length
            ) {
                throw new Error(
                    "Invalid SINGLE_SELECT answer index"
                );
            }

            if (
                q.expectedAnswer !== ""
            ) {
                throw new Error(
                    "SINGLE_SELECT expectedAnswer must be empty"
                );
            }
        }

        /*
        ==========================================
        MULTI_SELECT VALIDATION
        ==========================================
        */

        if (
            q.questionType === "MULTI_SELECT"
        ) {

            if (
                q.options.length < 4 ||
                q.options.length > 5
            ) {
                throw new Error(
                    "MULTI_SELECT must have 4 or 5 options"
                );
            }

            if (
                q.answer.length < 1
            ) {
                throw new Error(
                    "MULTI_SELECT must have answers"
                );
            }

            for (const ans of q.answer) {

                if (
                    typeof ans !== "number" ||
                    Number.isNaN(ans) ||
                    !Number.isFinite(ans) ||
                    ans < 0 ||
                    ans >= q.options.length
                ) {
                    throw new Error(
                        "Invalid MULTI_SELECT answer index"
                    );
                }
            }

            if (
                q.expectedAnswer !== ""
            ) {
                throw new Error(
                    "MULTI_SELECT expectedAnswer must be empty"
                );
            }
        }

        /*
        ==========================================
        SUBJECTIVE QUESTION VALIDATION
        ==========================================
        */

        if (
            q.questionType === "SHORT_ANSWER" ||
            q.questionType === "LONG_ANSWER"
        ) {

            if (
                q.options.length !== 0
            ) {
                throw new Error(
                    `${q.questionType} cannot have options`
                );
            }

            if (
                q.answer.length !== 0
            ) {
                throw new Error(
                    `${q.questionType} cannot have answer indexes`
                );
            }

            if (
                !q.expectedAnswer.trim()
            ) {
                throw new Error(
                    `${q.questionType} expectedAnswer missing`
                );
            }
        }

        /*
        ==========================================
        OPTION QUALITY VALIDATION
        ==========================================
        */

        for (const option of q.options) {

            if (
                typeof option !== "string" ||
                !option.trim()
            ) {
                throw new Error(
                    `Invalid option in ${section.sectionName}`
                );
            }
        }
    }

    return true;
}