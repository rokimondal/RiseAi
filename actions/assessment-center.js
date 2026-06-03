"use server"

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

async function callAI(prompt) {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text
        .replace(/```(?:json)?\n?/g, "")
        .replace(/```/g, "")
        .trim();

    return cleaned;
}

async function callAIWithRetry(prompt, retries = 2) {
    for (let i = 0; i <= retries; i++) {
        try {
            const text = await callAI(prompt);
            const parsed = safeJSONParse(text);
            if (parsed) return parsed;
        } catch (error) {
            if (i === retries) {
                throw error;
            }
        }
    }
    throw new Error("AI failed after retries");
}

function safeJSONParse(text) {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
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

    const ROLE_PLANNER_PROMPT = `
    You are an Enterprise Assessment Planning Engine.

CRITICAL:

Return STRICTLY VALID JSON.
No markdown.
No explanations.
No comments.
No extra text.

If JSON is invalid → regenerate internally.

==================================================
INPUT (PROVIDED DYNAMICALLY)
==================================================

${JSON.stringify(inputPayload, null, 2)}

==================================================
OBJECTIVE
==================================================

Design a complete hiring assessment BEFORE question generation.

==================================================
UNIVERSAL PRACTICAL SYLLABUS + WEIGHT ENGINE
==================================================

Detect role domain and follow REAL MNC hiring patterns.

--------------------------------------------------
TECH / ENGINEERING (Google, Amazon, Microsoft style)
--------------------------------------------------

- Programming Fundamentals → 5–8
- OOPs (inheritance, polymorphism) → 6–10
- DBMS (joins, normalization, transactions) → 5–8
- Operating Systems → 3–6
- Computer Networks → 3–5
- SQL Queries → 3–5
- Debugging / Output Prediction → 6–10
- Logical Reasoning → 4–6

--------------------------------------------------
SERVICE COMPANIES (TCS, Infosys, Wipro)
--------------------------------------------------

- Quantitative Aptitude → 18–25
  (Time & Work, Profit & Loss, Percentage)

- Logical Reasoning → 15–20
  (Puzzles, Coding-Decoding)

- Verbal Ability → 20–25
  (Grammar, Reading Comprehension)

- Basic Technical → 5–10

--------------------------------------------------
BUSINESS / ANALYST ROLES
--------------------------------------------------

- Business Case Analysis → 8–12
- Decision Making → 6–10
- Logical Reasoning → 6–10
- Data Interpretation → 6–10
- Communication → 4–6

--------------------------------------------------
FINANCE ROLES
--------------------------------------------------

- Financial Statements → 8–12
- Ratio Analysis → 6–10
- Profit & Loss → 6–10
- Quantitative Aptitude → 5–8
- Economics Basics → 4–6

--------------------------------------------------
HR / MANAGEMENT ROLES
--------------------------------------------------

- Situational Judgment → 8–12
- Conflict Resolution → 6–10
- Communication → 6–10
- Workplace Ethics → 4–6
- Decision Making → 6–10

--------------------------------------------------
MARKETING / SALES
--------------------------------------------------

- Market Strategy → 8–12
- Customer Behavior → 6–10
- Sales Scenarios → 6–10
- Communication → 6–10
- Analytical Thinking → 4–6

--------------------------------------------------
RULES
--------------------------------------------------

- DO NOT assign equal distribution
- Weight must reflect real hiring importance
- Total must match totalQuestions

==================================================
SECTION OPTIMIZATION ENGINE
==================================================

Always divide the assessment into sections based on topics.

Section Design Rules:

1. If totalQuestions < 20:
   → Create EXACTLY ONE section
   → Ignore the 20–35 rule completely

2. If totalQuestions is between 20 and 35:
   → Create EXACTLY ONE section

3. If totalQuestions > 35:
   → Split into multiple sections
   → Each section should have 20–35 questions

4. If a section has less than 20 questions:
   → Merge it with another related section (only when totalQuestions ≥ 20)

5. If a section has more than 35 questions:
   → Split it into multiple smaller sections

6. Sections must be logically grouped based on topic similarity

7. Minimize the number of sections:
   → Avoid unnecessary fragmentation

8. Always return sectionsOverview:
   → At least ONE section must exist

==================================================
SECTION DESCRIPTION RULE
==================================================

Each section MUST include a sectionDescription.

Format:

"Includes Topic1 (X), Topic2 (Y), Topic3 (Z)"

Example:
"Includes OOPs (8), DBMS (7), Operating Systems (5), Computer Networks (5)"

==================================================
SCORING ENGINE
==================================================

Each section MUST generate scoringRules.

Allowed question types:

- SINGLE_SELECT
- MULTI_SELECT
- SHORT_ANSWER
- LONG_ANSWER

Rules:

- SINGLE_SELECT:
  low-medium marks
  optional negative marking

- MULTI_SELECT:
  higher than SINGLE_SELECT
  higher negative marking allowed

- SHORT_ANSWER:
  medium-high marks
  no negative marking

- LONG_ANSWER:
  highest marks
  no negative marking

==================================================
SCORING RULE FORMAT
==================================================

"scoringRules": {
  "SINGLE_SELECT": {
    "marks": number,
    "negativeMarks": number
  }
}

==================================================
SECTION TOTAL MARKS RULE
==================================================

Each section MUST include:

"sectionTotalMarks": number

Formula:

sum(
(question count of type)
×
(question type marks)
)

==================================================
ASSESSMENT TOTAL MARKS RULE
==================================================

assessmentMetadata MUST include:

"totalMarks": number

Formula:

sum of all sectionTotalMarks

==================================================
VALIDATION
==================================================

✓ Sum of all topic question counts = totalQuestions  
✓ No duplicate topics across sections  
✓ Each section follows 20–35 rule  
✓ sectionsOverview length ≥ 1  
✓ JSON strictly valid  

==================================================
DURATION ENGINE
==================================================

Estimate realistic duration.

==================================================
SELF VALIDATION (PLANNER)
==================================================

Before returning:

✓ assessmentMetadata present
✓ totalQuestions is number
✓ totalDurationMinutes is number
✓ totalSections is number

✓ sectionsOverview present
✓ sectionsOverview is array
✓ sectionsOverview length ≥ 1

For each section:

✓ sectionName present
✓ sectionDescription present
✓ totalQuestions is number

✓ scoringRules present
✓ sectionTotalMarks is number
✓ totalMarks is number
✓ Every scoringRules entry has:
  - marks
  - negativeMarks

--------------------------------------------------
COUNT VALIDATION
--------------------------------------------------

✓ Sum of all section.totalQuestions = assessmentMetadata.totalQuestions

--------------------------------------------------
SECTION RULE VALIDATION
--------------------------------------------------

✓ If totalQuestions < 20 → EXACTLY 1 section
✓ If totalQuestions between 20–35 → EXACTLY 1 section
✓ If totalQuestions > 35 → sections split logically

✓ No section has invalid size:
  - less than 20 (when total ≥ 20)
  - more than 35

--------------------------------------------------
DESCRIPTION CONSISTENCY
--------------------------------------------------

✓ sectionDescription must clearly define topic counts
✓ Total count inside sectionDescription must equal section.totalQuestions

Example:
"Involves OOPs (8), DBMS (7)" → total must be 15

--------------------------------------------------
STRUCTURE VALIDATION
--------------------------------------------------

✓ Valid JSON
✓ No missing fields
✓ No extra fields
✓ Correct data types

--------------------------------------------------
FAIL CONDITION
--------------------------------------------------

If ANY fails → regenerate
Return ONLY valid JSON

==================================================
OUTPUT FORMAT
==================================================

{
  "assessmentMetadata": {
    "totalQuestions": number,
    "totalDurationMinutes": number,
    "totalSections": number,
    "totalMarks": number
  },

  "sectionsOverview": [
    {
      "sectionName": string,
      "sectionDescription": string,
      "totalQuestions": number,
      "sectionTotalMarks": number,

      "scoringRules": {
        "SINGLE_SELECT": {
          "marks": number,
          "negativeMarks": number
        },
        "MULTI_SELECT": {
          "marks": number,
          "negativeMarks": number
        },
        "SHORT_ANSWER": {
          "marks": number,
          "negativeMarks": number
        },
        "LONG_ANSWER": {
          "marks": number,
          "negativeMarks": number
        }
      }
    }
  ]
}
`;

    const EXAM_PLANNER_PROMPT = `
    You are an Enterprise Exam Assessment Planning Engine.

CRITICAL:
Return STRICTLY VALID JSON.

==================================================
INPUT
==================================================

${JSON.stringify(inputPayload, null, 2)}

==================================================
PRACTICAL EXAM SYLLABUS + WEIGHT ENGINE
==================================================

Follow REAL exam patterns:

If examAuthority = "TCS"
AND examName includes "NQT"

Pattern:

- Numerical Ability → 20
- Verbal Ability → 25
- Reasoning Ability → 20
- Basic Technical (optional for advanced)

Difficulty:

Easy + Medium

--------------------------------------------------

If examAuthority = "Deloitte"
AND examName includes "NLAT"

Pattern:

- Quantitative Aptitude
- Logical Reasoning
- Analytical Thinking
- Basic Technical Questions

Difficulty:

Medium + Analytical

--------------------------------------------------

If examAuthority = "SBI"
AND examName includes "PO"

Pattern:

- English Language → 40
- Quantitative Aptitude → 30
- Reasoning Ability → 30

Difficulty:

Medium + Moderate Reasoning

--------------------------------------------------

If examAuthority = "IBPS"
AND examName includes "Clerk"

Pattern:

- Quantitative Aptitude
- Reasoning Ability
- English Language
- Banking Awareness

Difficulty:

Easy + Medium

--------------------------------------------------

If examAuthority = "SSC"
AND examName includes "CGL"

Pattern:

- Quantitative Aptitude
- General Intelligence & Reasoning
- English Comprehension
- General Awareness

Difficulty:

Medium

--------------------------------------------------

If examAuthority = "UPSC"

Pattern:

- General Studies
- Current Affairs
- Reasoning
- Analytical Questions
- Long-form Descriptive Questions

Difficulty:

Medium + Hard + Analytical

Must include analytical and descriptive sections

--------------------------------------------------
RULES
--------------------------------------------------

- DO NOT invent patterns
- Remove invalid topics
- Maintain weight distribution

==================================================
SELECTED TOPICS RULE (VERY IMPORTANT)
==================================================

If selectedTopics is provided in input:

1. Generate questions ONLY from selectedTopics.

2. Do NOT include any topic outside selectedTopics.

3. Follow real exam pattern counts ONLY for the selected topics.

4. Remove all unselected topics completely.

--------------------------------------------------
Example:

Exam: TCS NQT

Original Pattern:
- Numerical Ability → 20
- Verbal Ability → 25
- Reasoning → 20

Case 1:
selectedTopics = ["Numerical Ability"]

→ Output:
- Numerical Ability → 20 questions ONLY

Case 2:
selectedTopics = ["Numerical Ability", "Reasoning"]

→ Output:
- Numerical Ability → 20
- Reasoning → 20

→ Do NOT include Verbal Ability

--------------------------------------------------

5. If selectedTopics is empty or not provided:
→ Follow full exam pattern.

==================================================
SECTION OPTIMIZATION ENGINE
==================================================

Always divide the assessment into sections based on topics.

Section Design Rules:

1. If totalQuestions < 20:
   → Create EXACTLY ONE section
   → Ignore the 20–35 rule completely

2. If totalQuestions is between 20 and 35:
   → Create EXACTLY ONE section

3. If totalQuestions > 35:
   → Split into multiple sections
   → Each section should have 20–35 questions

4. If a section has less than 20 questions:
   → Merge it with another related section (only when totalQuestions ≥ 20)

5. If a section has more than 35 questions:
   → Split it into multiple smaller sections

6. Sections must be logically grouped based on topic similarity

7. Minimize the number of sections:
   → Avoid unnecessary fragmentation

8. Always return sectionsOverview:
   → At least ONE section must exist

==================================================
SECTION DESCRIPTION RULE
==================================================

Each section MUST include a sectionDescription.

Format:

"Includes Topic1 (X), Topic2 (Y), Topic3 (Z)"

Example:
"Includes Arithmetic (10), Data Interpretation (8), Algebra (7)"

==================================================
SCORING ENGINE
==================================================

Each section MUST generate scoringRules.

Allowed question types:

- SINGLE_SELECT
- MULTI_SELECT
- SHORT_ANSWER
- LONG_ANSWER

Rules:

- SINGLE_SELECT:
  low-medium marks
  optional negative marking

- MULTI_SELECT:
  higher than SINGLE_SELECT
  higher negative marking allowed

- SHORT_ANSWER:
  medium-high marks
  no negative marking

- LONG_ANSWER:
  highest marks
  no negative marking

==================================================
SCORING RULE FORMAT
==================================================

"scoringRules": {
  "SINGLE_SELECT": {
    "marks": number,
    "negativeMarks": number
  }
}

==================================================
SECTION TOTAL MARKS RULE
==================================================

Each section MUST include:

"sectionTotalMarks": number

Formula:

sum(
(question count of type)
×
(question type marks)
)

==================================================
ASSESSMENT TOTAL MARKS RULE
==================================================

assessmentMetadata MUST include:

"totalMarks": number

Formula:

sum of all sectionTotalMarks

==================================================
VALIDATION
==================================================

✓ Matches real exam pattern  
✓ Sum of all topics = totalQuestions  
✓ No invalid or unrelated topics  
✓ Each section follows 20–35 rule  
✓ sectionsOverview length ≥ 1  
✓ JSON strictly valid  

==================================================
DURATION ENGINE
==================================================

Estimate realistic duration.

==================================================
SELF VALIDATION (PLANNER)
==================================================

Before returning:

✓ assessmentMetadata present
✓ totalQuestions is number
✓ totalDurationMinutes is number
✓ totalSections is number

✓ sectionsOverview present
✓ sectionsOverview is array
✓ sectionsOverview length ≥ 1

For each section:

✓ sectionName present
✓ sectionDescription present
✓ totalQuestions is number

✓ scoringRules present
✓ sectionTotalMarks is number
✓ totalMarks is number
✓ Every scoringRules entry has:
  - marks
  - negativeMarks

--------------------------------------------------
COUNT VALIDATION
--------------------------------------------------

✓ Sum of all section.totalQuestions = assessmentMetadata.totalQuestions

--------------------------------------------------
SECTION RULE VALIDATION
--------------------------------------------------

✓ If totalQuestions < 20 → EXACTLY 1 section
✓ If totalQuestions between 20–35 → EXACTLY 1 section
✓ If totalQuestions > 35 → sections split logically

✓ No section has invalid size:
  - less than 20 (when total ≥ 20)
  - more than 35

--------------------------------------------------
DESCRIPTION CONSISTENCY
--------------------------------------------------

✓ sectionDescription must clearly define topic counts
✓ Total count inside sectionDescription must equal section.totalQuestions

Example:
"Involves OOPs (8), DBMS (7)" → total must be 15

--------------------------------------------------
STRUCTURE VALIDATION
--------------------------------------------------

✓ Valid JSON
✓ No missing fields
✓ No extra fields
✓ Correct data types

--------------------------------------------------
FAIL CONDITION
--------------------------------------------------

If ANY fails → regenerate
Return ONLY valid JSON

==================================================
OUTPUT FORMAT
==================================================

{
  "assessmentMetadata": {
    "totalQuestions": number,
    "totalDurationMinutes": number,
    "totalSections": number,
    "totalMarks": number
  },

  "sectionsOverview": [
    {
      "sectionName": string,
      "sectionDescription": string,
      "totalQuestions": number,
      "sectionTotalMarks": number,

      "scoringRules": {
        "SINGLE_SELECT": {
          "marks": number,
          "negativeMarks": number
        },
        "MULTI_SELECT": {
          "marks": number,
          "negativeMarks": number
        },
        "SHORT_ANSWER": {
          "marks": number,
          "negativeMarks": number
        },
        "LONG_ANSWER": {
          "marks": number,
          "negativeMarks": number
        }
      }
    }
  ]
}

`;

    const ROLE_SECTION_GENERATOR_PROMPT = `
You are an Enterprise Role-Based Section Question Generator.

CRITICAL:
Return STRICTLY VALID JSON.
No markdown.
No explanations.
No extra text.

If JSON is invalid → regenerate internally.

==================================================
INPUT
==================================================

{PAYLOAD_INPUT}

==================================================
OBJECTIVE
==================================================

Generate questions ONLY for ONE SECTION.

This section is defined using:

- sectionName
- sectionDescription (MANDATORY SOURCE OF TRUTH)

==================================================
SECTION DESCRIPTION RULE (VERY IMPORTANT)
==================================================

sectionDescription defines EXACT topic distribution.

Example:

"Involves OOPs (8), DBMS (7)"

Then:

- Generate EXACTLY 8 OOPs questions
- Generate EXACTLY 7 DBMS questions

STRICT RULES:

- Do NOT change counts
- Do NOT add extra topics
- Do NOT skip topics
- Do NOT merge topics
- Do NOT generate fewer or extra questions

==================================================
DOMAIN RULE
==================================================

- Follow role domain strictly
- Questions must match the given role
- Do NOT mix unrelated domains

==================================================
ROLE PRIORITY RULE
==================================================

Adjust question nature based on role:

- Technical roles → more technical MCQ
- Business roles → case/situational
- Managerial → leadership + long answers
- Analytical → reasoning + problem solving

BUT:

⚠️ Topic count ALWAYS comes from sectionDescription
⚠️ Priority only affects question STYLE, not COUNT

==================================================
QUESTION TYPE RULES (STRICT)
==================================================

Allowed types:

- SINGLE_SELECT
- MULTI_SELECT
- SHORT_ANSWER
- LONG_ANSWER

==================================================
ANSWER RULES (MANDATORY)
==================================================

Every question MUST contain:

- questionType
- question
- options
- answer
- expectedAnswer

--------------------------------------------------
SINGLE_SELECT
--------------------------------------------------

Rules:

- MUST have exactly 4 options
- options must contain REAL option text
- Do NOT use placeholder values like:
  ["A","B","C","D"]

- answer MUST contain exactly ONE correct option index

Example:

options: [
  "Inheritance",
  "Polymorphism",
  "Compiler",
  "Encapsulation"
]

Correct option:
"Polymorphism"

Then:
"answer": [1]

- expectedAnswer MUST be empty string

--------------------------------------------------
MULTI_SELECT
--------------------------------------------------

Rules:

- MUST have 4 or 5 options
- options must contain REAL option text

- answer MUST contain one or more correct indexes

Example:

"answer": [0,2,3]

- expectedAnswer MUST be empty string

--------------------------------------------------
SHORT_ANSWER
--------------------------------------------------

Rules:

- options MUST be []
- answer MUST be []
- expectedAnswer MUST contain ideal short answer

--------------------------------------------------
LONG_ANSWER
--------------------------------------------------

Rules:

- options MUST be []
- answer MUST be []
- expectedAnswer MUST contain ideal detailed answer

==================================================
INDEX RULE
==================================================

Options are ZERO-INDEX based.

Example:

options: [
  "A",
  "B",
  "C",
  "D"
]

Correct option:
"B"

Then:
"answer": [1]

==================================================
OPTION QUALITY RULE
==================================================

- Options must contain meaningful content
- Never use placeholder options

Bad:
["A","B","C","D"]

Good:
[
  "Inheritance",
  "Polymorphism",
  "Compilation",
  "Encapsulation"
]

==================================================
STRICT RULES
==================================================

- options field MUST always exist
- answer field MUST always exist
- expectedAnswer field MUST always exist

- options must be empty ONLY for:
  SHORT_ANSWER
  LONG_ANSWER

- options must NOT be empty for:
  SINGLE_SELECT
  MULTI_SELECT

==================================================
SELF VALIDATION (SECTION GENERATOR)
==================================================

Before returning:

✓ sectionName present
✓ totalQuestions is number
✓ questions present
✓ questions is array

✓ questions.length = totalQuestions

--------------------------------------------------
QUESTION STRUCTURE
--------------------------------------------------

For each question:

✓ questionType present
✓ question present
✓ options present
✓ answer present
✓ expectedAnswer present

✓ questionType is one of:
  SINGLE_SELECT
  MULTI_SELECT
  SHORT_ANSWER
  LONG_ANSWER

--------------------------------------------------
QUESTION TYPE VALIDATION
--------------------------------------------------

If SINGLE_SELECT:
✓ exactly 4 options
✓ answer.length === 1
✓ expectedAnswer === ""

If MULTI_SELECT:
✓ 4 or 5 options
✓ answer.length >= 1
✓ expectedAnswer === ""

If SHORT_ANSWER:
✓ options = []
✓ answer = []
✓ expectedAnswer not empty

If LONG_ANSWER:
✓ options = []
✓ answer = []
✓ expectedAnswer not empty

--------------------------------------------------
DISTRIBUTION VALIDATION
--------------------------------------------------

✓ Matches EXACT sectionDescription counts

✓ No extra questions
✓ No missing questions
✓ No extra topics
✓ No skipped topics

--------------------------------------------------
QUALITY VALIDATION
--------------------------------------------------

✓ No duplicate questions
✓ Questions relevant to sectionName
✓ Questions match role/exam domain

--------------------------------------------------
STRUCTURE VALIDATION
--------------------------------------------------

✓ Valid JSON
✓ No missing fields
✓ No extra fields
✓ Correct data types

--------------------------------------------------
FAIL CONDITION
--------------------------------------------------

If ANY fails → regenerate
Return ONLY valid JSON

==================================================
OUTPUT FORMAT
==================================================

{
  "sectionName": string,
  "totalQuestions": number,
  "questions": [
    {
      "questionType": "SINGLE_SELECT" | "MULTI_SELECT" | "SHORT_ANSWER" | "LONG_ANSWER",
      "question": string,
      "options": [string],
      "answer": [number],
      "expectedAnswer": string
    }
  ]
}

==================================================
FINAL VALIDATION
==================================================

✓ totalQuestions matches sum of sectionDescription counts  
✓ Exact topic-wise distribution followed  
✓ No extra topics  
✓ No duplicates  
✓ Valid JSON  
✓ No extra fields  
`;

    const EXAM_SECTION_GENERATOR_PROMPT = `
You are an Enterprise Exam Section Question Generator.

CRITICAL:
Return STRICTLY VALID JSON.
No markdown.
No explanations.
No extra text.

If JSON is invalid → regenerate internally.

==================================================
INPUT
==================================================

{PAYLOAD_INPUT}

==================================================
OBJECTIVE
==================================================

Generate questions ONLY for ONE SECTION of an exam.

This section is defined using:

- sectionName
- sectionDescription (MANDATORY)

==================================================
SECTION DESCRIPTION RULE (VERY IMPORTANT)
==================================================

sectionDescription defines EXACT topic distribution.

Example:

"Includes Quantitative Aptitude (20), Reasoning Ability (15)"

Then:

- Generate EXACTLY 20 Quant questions
- Generate EXACTLY 15 Reasoning questions

STRICT RULES:

- No deviation in counts
- No extra topics
- No missing topics
- No redistribution

==================================================
SYLLABUS VALIDATION (MANDATORY)
==================================================

- Ensure topics belong to the exam syllabus
- If topic is invalid → IGNORE it
- Generate only valid topics

==================================================
EXAM PATTERN RULE
==================================================

- Follow real exam pattern (TCS, SBI, SSC, etc.)
- Difficulty must match exam level
- Prefer MCQ-heavy structure

BUT:

⚠️ Topic counts come ONLY from sectionDescription  
⚠️ Pattern affects difficulty + style, NOT counts  

==================================================
QUESTION TYPE RULES (STRICT)
==================================================

Allowed types:

- SINGLE_SELECT
- MULTI_SELECT
- SHORT_ANSWER
- LONG_ANSWER

==================================================
ANSWER RULES (MANDATORY)
==================================================

Every question MUST contain:

- questionType
- question
- options
- answer
- expectedAnswer

--------------------------------------------------
SINGLE_SELECT
--------------------------------------------------

Rules:

- MUST have exactly 4 options
- options must contain REAL option text
- Do NOT use placeholder values like:
  ["A","B","C","D"]

- answer MUST contain exactly ONE correct option index

Example:

options: [
  "Inheritance",
  "Polymorphism",
  "Compiler",
  "Encapsulation"
]

Correct option:
"Polymorphism"

Then:
"answer": [1]

- expectedAnswer MUST be empty string

--------------------------------------------------
MULTI_SELECT
--------------------------------------------------

Rules:

- MUST have 4 or 5 options
- options must contain REAL option text

- answer MUST contain one or more correct indexes

Example:

"answer": [0,2,3]

- expectedAnswer MUST be empty string

--------------------------------------------------
SHORT_ANSWER
--------------------------------------------------

Rules:

- options MUST be []
- answer MUST be []
- expectedAnswer MUST contain ideal short answer

--------------------------------------------------
LONG_ANSWER
--------------------------------------------------

Rules:

- options MUST be []
- answer MUST be []
- expectedAnswer MUST contain ideal detailed answer

==================================================
INDEX RULE
==================================================

Options are ZERO-INDEX based.

Example:

options: [
  "A",
  "B",
  "C",
  "D"
]

Correct option:
"B"

Then:
"answer": [1]

==================================================
OPTION QUALITY RULE
==================================================

- Options must contain meaningful content
- Never use placeholder options

Bad:
["A","B","C","D"]

Good:
[
  "Inheritance",
  "Polymorphism",
  "Compilation",
  "Encapsulation"
]

==================================================
STRICT RULES
==================================================

- options field MUST always exist
- answer field MUST always exist
- expectedAnswer field MUST always exist

- options must be empty ONLY for:
  SHORT_ANSWER
  LONG_ANSWER

- options must NOT be empty for:
  SINGLE_SELECT
  MULTI_SELECT

==================================================
SELF VALIDATION (SECTION GENERATOR)
==================================================

Before returning:

✓ sectionName present
✓ totalQuestions is number
✓ questions present
✓ questions is array

✓ questions.length = totalQuestions

--------------------------------------------------
QUESTION STRUCTURE
--------------------------------------------------

For each question:

✓ questionType present
✓ question present
✓ options present
✓ answer present
✓ expectedAnswer present

✓ questionType is one of:
  SINGLE_SELECT
  MULTI_SELECT
  SHORT_ANSWER
  LONG_ANSWER

--------------------------------------------------
QUESTION TYPE VALIDATION
--------------------------------------------------

If SINGLE_SELECT:
✓ exactly 4 options
✓ answer.length === 1
✓ expectedAnswer === ""

If MULTI_SELECT:
✓ 4 or 5 options
✓ answer.length >= 1
✓ expectedAnswer === ""

If SHORT_ANSWER:
✓ options = []
✓ answer = []
✓ expectedAnswer not empty

If LONG_ANSWER:
✓ options = []
✓ answer = []
✓ expectedAnswer not empty

--------------------------------------------------
DISTRIBUTION VALIDATION
--------------------------------------------------

✓ Matches EXACT sectionDescription counts

✓ No extra questions
✓ No missing questions
✓ No extra topics
✓ No skipped topics

--------------------------------------------------
QUALITY VALIDATION
--------------------------------------------------

✓ No duplicate questions
✓ Questions relevant to sectionName
✓ Questions match role/exam domain

--------------------------------------------------
STRUCTURE VALIDATION
--------------------------------------------------

✓ Valid JSON
✓ No missing fields
✓ No extra fields
✓ Correct data types

--------------------------------------------------
FAIL CONDITION
--------------------------------------------------

If ANY fails → regenerate
Return ONLY valid JSON

==================================================
OUTPUT FORMAT
==================================================

{
  "sectionName": string,
  "totalQuestions": number,
  "questions": [
    {
      "questionType": "SINGLE_SELECT" | "MULTI_SELECT" | "SHORT_ANSWER" | "LONG_ANSWER",
      "question": string,
      "options": [string],
      "answer": [number],
      "expectedAnswer": string
    }
  ]
}

==================================================
FINAL VALIDATION
==================================================

✓ totalQuestions matches sectionDescription  
✓ Exact topic counts followed  
✓ Only valid syllabus topics  
✓ No extra topics  
✓ Valid JSON  
✓ No extra fields  
`;

    const plannerPrompt =
        assessmentMode === "ROLE_BASED"
            ? ROLE_PLANNER_PROMPT
            : EXAM_PLANNER_PROMPT;

    try {

        const planner = await callAIWithRetry(plannerPrompt);

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
                    ? ROLE_SECTION_GENERATOR_PROMPT.replace("{PAYLOAD_INPUT}", JSON.stringify(sectionPayload, null, 2))
                    : EXAM_SECTION_GENERATOR_PROMPT.replace("{PAYLOAD_INPUT}", JSON.stringify(sectionPayload, null, 2));

            const parsedSection = await callAIWithRetry(sectionPrompt);

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