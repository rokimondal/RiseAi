"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
});

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
        const text = await callAI(prompt);
        const parsed = safeJSONParse(text);
        if (parsed) return parsed;
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
    "totalSections": number
  },
  "sectionsOverview": [
    {
      "sectionName": string,
      "sectionDescription": string,
      "totalQuestions": number,
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
    "totalSections": number
  },
  "sectionsOverview": [
    {
      "sectionName": string,
      "sectionDescription": string,
      "totalQuestions": number,
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

Rules:

1. SINGLE_SELECT
   - MUST have exactly 4 options
   - options: ["A", "B", "C", "D"]

2. MULTI_SELECT
   - MUST have 4 or 5 options

3. SHORT_ANSWER
   - MUST have options: []

4. LONG_ANSWER
   - MUST have options: []

STRICT:

- options field MUST always exist
- options must be empty array ONLY for SHORT_ANSWER and LONG_ANSWER
- options must NOT be empty for SINGLE_SELECT or MULTI_SELECT

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

✓ questionType is one of:
  SINGLE_SELECT
  MULTI_SELECT
  SHORT_ANSWER
  LONG_ANSWER

--------------------------------------------------
QUESTION TYPE RULES
--------------------------------------------------

If SINGLE_SELECT:
✓ exactly 4 options

If MULTI_SELECT:
✓ 4 or 5 options

If SHORT_ANSWER:
✓ options = []

If LONG_ANSWER:
✓ options = []

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
      "options": [string] // conditional based on type (rules above)
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

Rules:

1. SINGLE_SELECT
   - MUST have exactly 4 options
   - options: ["A", "B", "C", "D"]

2. MULTI_SELECT
   - MUST have 4 or 5 options

3. SHORT_ANSWER
   - MUST have options: []

4. LONG_ANSWER
   - MUST have options: []

STRICT:

- options field MUST always exist
- options must be empty array ONLY for SHORT_ANSWER and LONG_ANSWER
- options must NOT be empty for SINGLE_SELECT or MULTI_SELECT

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

✓ questionType is one of:
  SINGLE_SELECT
  MULTI_SELECT
  SHORT_ANSWER
  LONG_ANSWER

--------------------------------------------------
QUESTION TYPE RULES
--------------------------------------------------

If SINGLE_SELECT:
✓ exactly 4 options

If MULTI_SELECT:
✓ 4 or 5 options

If SHORT_ANSWER:
✓ options = []

If LONG_ANSWER:
✓ options = []

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
      "options": [string] // conditional based on type (rules above)
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

        if (!planner) {
            throw new Error("Planner JSON parsing failed");
        }

        const { assessmentMetadata, sectionsOverview } = planner;

        if (!sectionsOverview || sectionsOverview.length === 0) {
            throw new Error("No sections generated");
        }

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

            if (!parsedSection || !parsedSection.questions) {
                throw new Error(`Section generation failed: ${section.sectionName}`);
            }

            if (parsedSection.questions.length !== section.totalQuestions) {
                throw new Error(`Mismatch in section question count: ${section.sectionName}`);
            }

            for (const q of parsedSection.questions) {
                allQuestions.push({
                    ...q,
                    id: globalId++
                });
            }
        }

        console.log("Generated Questions:", allQuestions.length);


        if (allQuestions.length !== assessmentMetadata.totalQuestions) {
            throw new Error(
                `Final question count mismatch. Expected ${assessmentMetadata.totalQuestions}, got ${allQuestions.length}`
            );
        }

        return {
            success: true,
            data: {
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
                userName: user.name
            }
        };

    } catch (error) {
        console.error("Error generating assessment center:", error);
        throw new Error("Failed to generate assessment center");
    }
}