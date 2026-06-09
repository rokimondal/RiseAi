import { CREDIT_COST } from "./costs";

export function validateSimulationPlan(plan) {

    if (!Array.isArray(plan.rounds)) {
        throw new Error(
            "Missing rounds"
        );
    }

    if (
        plan.rounds.length < 2 ||
        plan.rounds.length > 6
    ) {
        throw new Error(
            "Invalid rounds count"
        );
    }

    for (const round of plan.rounds) {

        if (!round.roundId) {
            throw new Error(
                "Missing roundId"
            );
        }

        if (!round.roundName) {
            throw new Error(
                "Missing roundName"
            );
        }

        if (!round.roundType) {
            throw new Error(
                "Missing roundType"
            );
        }

        if (!round.purpose) {
            throw new Error(
                "Missing purpose"
            );
        }

        if (!round.metadata) {
            throw new Error(
                "Missing metadata"
            );
        }

        if (
            ![
                "CODING_ASSESSMENT",
                "MOCK_INTERVIEW",
                "ASSESSMENT_CENTER",
            ].includes(round.roundType)
        ) {
            throw new Error(
                "Invalid roundType"
            );
        }
    }

    return true;
}

export function validatePlannerResponse(planner) {

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

export function validateGeneratedSection({
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

export function calculateAssessmentCredits(questions, type = "GENERATION") {

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

export function sanitizeCodeAssessmentData(data) {
    try {
        const json = JSON.stringify(data);

        if (json === undefined) {
            throw new Error("Data is not JSON serializable");
        }

        return JSON.parse(json);
    } catch (error) {
        throw new Error("Invalid JSON data");
    }
}