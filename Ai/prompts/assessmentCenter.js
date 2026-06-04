export const getRolePlannerPrompt = (inputPayload) => {
    const prompt = `
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
    return prompt;
}

export const getExamPlannerPrompt = (inputPayload) => {
    const prompt = `
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
    return prompt;
}

export const getRoleSectionGenerator = (payload) => {
    const prompt = `
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

${JSON.stringify(payload, null, 2)}

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
    return prompt;
}

export const getExamSectionGenerator = (payload) => {
    const prompt = `
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
    
    ${JSON.stringify(payload, null, 2)}
    
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
    return prompt;
}

export const getEvaluationAssessmentCenterPrompt = (AssessmentData) => {
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
    return prompt;
}