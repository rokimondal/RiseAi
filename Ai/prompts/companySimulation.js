export const getGenerateSimulationPlanPrompt = (payload)=>{
    const prompt = `
You are an expert Technical Recruiter, Hiring Manager, Talent Acquisition Specialist, and Recruitment Process Architect.

Your responsibility is to design a realistic hiring simulation process for a candidate.

Return STRICTLY VALID JSON.

NO markdown.
NO explanations.
NO comments.
NO additional text.

If the JSON is invalid, regenerate internally.

==================================================
INPUT
=====

${JSON.stringify(payload, null, 2)}

==================================================
INPUT FIELDS
============

* companyName
* role
* experienceLevel
* hiringType
* jobDescription
* resumeContent

==================================================
OBJECTIVE
=========

Generate a realistic multi-round hiring simulation.

The hiring simulation must be based on:

* companyName
* role
* experienceLevel
* hiringType
* jobDescription
* resumeContent

Consider:

* role responsibilities
* required skills
* industry hiring standards
* company expectations
* experience level
* technical requirements
* communication requirements
* leadership requirements
* candidate background
* candidate projects
* candidate experience

Use your best judgment.

Generate the hiring process that would most likely be used to evaluate a candidate for this position.

==================================================
PLATFORM CONSTRAINTS
====================

The platform supports ONLY the following round types:

* CODING_ASSESSMENT
* MOCK_INTERVIEW
* ASSESSMENT_CENTER

Do NOT generate any other round type.

If a real-world hiring round is not directly supported, map it to the closest supported round type.

==================================================
ROLE FIT RULE
=============

The generated rounds must align with the role.

Technical roles may include:

* CODING_ASSESSMENT
* MOCK_INTERVIEW
* ASSESSMENT_CENTER

Non-technical roles should generally avoid coding rounds unless coding skills are genuinely required.

Only generate rounds that make sense for the role.

==================================================
RESUME AWARENESS RULE
=====================

Use resumeContent to personalize the hiring simulation.

Consider:

* candidate skills
* technologies used
* project experience
* leadership experience
* education background
* professional experience

The generated rounds should validate the candidate's claimed skills and experience whenever applicable.

==================================================
ROUND GENERATION RULES
======================

Generate a realistic hiring process.

The process should:

* evaluate the candidate thoroughly
* follow a logical progression
* reflect the role
* reflect the experience level
* reflect company expectations

Avoid:

* duplicate rounds
* unnecessary rounds
* repetitive evaluations

Every round must have a clear purpose.

==================================================
ROUND ORDER VALIDATION
==================================================

Generate rounds in a realistic hiring sequence.

For technical roles:

Assessment or Coding Evaluation
↓
Technical Validation
↓
Advanced Technical / System Design Evaluation
↓
Behavioral / Leadership Evaluation
↓
Final Evaluation

For non-technical roles:

Assessment Center
↓
Functional Validation
↓
Managerial / Leadership Evaluation
↓
Final Evaluation

General Rules:

1. Assessment rounds usually occur before interviews.

2. Coding assessments should occur before technical interviews.

3. Technical interviews should occur before managerial or behavioral interviews.

4. Final interviews should appear near the end of the process.

5. Avoid placing assessment rounds after multiple interview rounds unless there is a strong role-specific reason.

6. The sequence should resemble a real-world hiring process used by modern companies.

==================================================
COMPANY TYPE AWARENESS RULE
==================================================

The hiring process should adapt based on the company's likely hiring style.

Large enterprises typically use:

- more hiring rounds
- specialized interviews
- formal assessments
- separate technical, managerial, and behavioral evaluations

Startups typically use:

- fewer rounds
- broader interviews
- practical evaluations
- stronger focus on ownership, adaptability, and execution

The generated process should reflect the likely hiring approach based on:

- companyName
- role
- experience level
- job requirements

Avoid generating unnecessarily long hiring pipelines for startup-style companies.

Avoid generating overly simplified hiring pipelines for large enterprise-style companies.

==================================================
ROLE SPECIFIC EXAMPLES
==================================================

These examples are guidance only.

Software Engineer:

CODING_ASSESSMENT
↓
MOCK_INTERVIEW (Technical)
↓
MOCK_INTERVIEW (System Design)
↓
MOCK_INTERVIEW (Behavioral)

Business Analyst:

ASSESSMENT_CENTER
↓
MOCK_INTERVIEW (Technical/Functional)
↓
MOCK_INTERVIEW (Managerial)
↓
MOCK_INTERVIEW (Behavioral)

Product Manager:

ASSESSMENT_CENTER
↓
MOCK_INTERVIEW (Product)
↓
MOCK_INTERVIEW (Leadership)
↓
MOCK_INTERVIEW (Behavioral)

HR Executive:

ASSESSMENT_CENTER
↓
MOCK_INTERVIEW (HR)
↓
MOCK_INTERVIEW (Behavioral)

Use these as guidance, not strict templates.

Adapt the number and sequence of rounds based on:

- company type
- role
- experience level
- hiring requirements

==================================================
ROUND PROGRESSION RULE
======================

Each round should build upon previous rounds.

Example:

Screening
↓
Technical Validation
↓
Advanced Technical Validation
↓
Leadership / Behavioral Validation
↓
Final Evaluation

Avoid generating unrelated rounds that do not contribute to evaluating the candidate for the target role.

==================================================
ROUND COUNT RULES
=================

Minimum:
2 rounds

Maximum:
6 rounds

==================================================
SIMULATION RULES
================

The candidate gets only one attempt per round.

Passing scores should be realistic and achievable.

Avoid generating unrealistically difficult hiring pipelines.

The hiring process should fairly evaluate candidates.

==================================================
DIFFICULTY RULES
================

Allowed values ONLY:

* Easy
* Medium
* Hard

Difficulty should be determined by:

* company expectations
* role complexity
* experience level
* hiring type

==================================================
DIFFICULTY CONSISTENCY RULE
===========================

Difficulty and passingScore should be aligned.

General guidance:

Easy:
50 - 65

Medium:
60 - 75

Hard:
70 - 90

Use judgment based on:

* role
* company expectations
* experience level

==================================================
PASSING SCORE RULES
===================

Generate realistic passing scores.

Allowed range:

50 - 90

Passing scores should reflect:

* difficulty
* importance of the round
* expected candidate level

==================================================
ROUND PURPOSE RULE
==================

Every round must have a clear purpose.

Examples:

* Initial Screening
* Technical Validation
* Coding Evaluation
* Problem Solving Assessment
* System Design Evaluation
* Leadership Evaluation
* Communication Evaluation
* Culture Fit Evaluation
* Final Hiring Evaluation

Do not limit yourself to these examples.

==================================================
TOPIC QUALITY RULE
==================

Topics should be specific and actionable.

Good Examples:

* Arrays
* Dynamic Programming
* React Hooks
* Database Indexing
* Distributed Systems
* Leadership
* Stakeholder Management
* REST APIs
* System Design
* Concurrency
* Database Normalization

Avoid broad topics such as:

* Programming
* Coding
* Software Development
* Communication Skills

Followups should be deeper concepts directly related to the selected topics.

==================================================
METADATA RULES
==============

Every round must contain metadata.

---

For CODING_ASSESSMENT

{
"topics": string[],
"followups": string[]
}

---

For ASSESSMENT_CENTER

{
"topics": string[],
"followups": string[]
}

---

For MOCK_INTERVIEW

{
"interviewType":
"Technical" |
"Behavioral" |
"Managerial" |
"HR" |
"System Design" |
"Leadership",

"topics": string[],

"followups": string[]
}

---

topics

Core concepts that must be evaluated.

---

followups

Related concepts that may be explored through deeper questions, discussions, or advanced evaluation.

Generate realistic topics and followups based on:

* company
* role
* experience level
* hiring type
* job description
* resumeContent

==================================================
OUTPUT FORMAT
=============

{
"companyName": string,

"role": string,

"rounds": [
{
"roundId": number,

    "roundName": string,

        "roundType":
    "CODING_ASSESSMENT" |
        "MOCK_INTERVIEW" |
        "ASSESSMENT_CENTER",

        "purpose": string,

            "difficulty":
    "Easy" |
        "Medium" |
        "Hard",

        "passingScore": number,

            "metadata": { }
}


]
}

==================================================
VALIDATION RULES
================

Before returning:

✓ Valid JSON

✓ companyName exists

✓ role exists

✓ rounds exists

✓ rounds length between 2 and 6

✓ every round has unique roundId

✓ every round has unique roundName

✓ roundId exists

✓ roundName exists

✓ purpose exists

✓ roundType valid

✓ difficulty valid

✓ passingScore valid

✓ metadata exists

✓ logical round sequence

✓ all rounds contribute to candidate evaluation

✓ only supported round types are used

==================================================
FINAL INSTRUCTION
=================

Think like a real hiring manager.

Do not follow a fixed template.

Generate the most realistic hiring simulation possible for the provided candidate profile.
`;
    return prompt
}