"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
})

const ASSESSMENT_GENERATION_CREDITS = 20;
const ASSESSMENT_EVALUATION_CREDITS = 10;

function sanitizeAssessmentData(data) {
    return JSON.parse(JSON.stringify(data));
}

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

    const roleBasedPrompt = `
You are an Enterprise Coding Exam Generator.

CRITICAL:
Return STRICTLY VALID JSON.
No markdown.
No explanations.
No hints.
No comments.
No extra text.

If JSON invalid → regenerate internally.

==================================================
INPUT (PROVIDED DYNAMICALLY)
==================================================

${JSON.stringify(inputPayload, null, 2)}

==================================================
OBJECTIVE
==================================================

Generate a STRICT coding exam.

This is a real coding assessment.
No follow-ups.
No hints.
No explanations.

==================================================
DIFFICULTY ENGINE
==================================================

Intern → 2 questions → Easy, Easy → 60 min
Fresher → 3 → Easy, Medium, Medium → 90 min
1–3 Years → 3 → Medium, Medium, Hard → 120 min
3–5 Years → 4 → Medium, Medium, Hard, Hard → 150 min
Senior → 4 → Hard, Hard, Hard, Medium → 180 min

Must strictly follow.

==================================================
LEETCODE-STYLE STRUCTURE (MANDATORY)
==================================================

For Java, Python, C++, JavaScript:

1. starterCode MUST follow LeetCode style.

2. starterCode MUST contain:
   class Solution

3. The required method MUST be defined inside class Solution.

4. In starterCode:
   {{USER_CODE}} MUST be placed strictly inside the method body.

5. systemWrapperCode MUST NOT declare or define class Solution.

6. systemWrapperCode MUST inject {{USER_CODE}} at top-level.
   In systemWrapperCode, {{USER_CODE}} represents the entire class Solution.

7. No standalone solution functions allowed outside class Solution
   (except in C language).

8. Method name must match EXACTLY in:
   - starterCode
   - systemWrapperCode

9. Wrapper must:
   - Instantiate class Solution
   - Call the exact method
   - Print result.


For C language:

1. Do NOT use class.
2. starterCode MUST define the full function.
3. In starterCode, {{USER_CODE}} must be inside function body.
4. systemWrapperCode must inject {{USER_CODE}} at top-level.
5. main() must parse input and call that function.

==================================================
STRICT WRAPPER REQUIREMENTS (ALL LANGUAGES)
==================================================

Wrapper MUST:

1. Parse entire input as STRING.
2. Support multiple test cases separated strictly by:
   ###TESTCASE###
3. Split test cases using the exact delimiter:
   ###TESTCASE###
4. Parse parameters line-by-line within each test case.
5. Continue execution even if one test case fails.
6. Print each test case output.
7. Outputs of multiple test cases MUST be separated strictly by:
   ###TESTCASE###
8. No extra characters before or after the delimiter.
9. Be directly executable in selected language.
10. Contain {{USER_CODE}}.
11. Have NO comments.
12. Have NO explanations.
13. systemWrapperCode MUST NOT declare or define class Solution (except C language).
14. systemWrapperCode MUST inject {{USER_CODE}} at top-level, outside of any class.

If wrapper violates any rule → regenerate.

==================================================
DSA CATEGORY ENGINE
==================================================

Allowed categories:
Array, String, LinkedList, Stack, Queue,
Hashing, BinarySearch, TwoPointers,
SlidingWindow, Recursion, Backtracking,
Heap, Tree, Graph, DynamicProgramming,
Greedy, BitManipulation, Trie, UnionFind

Rules:
- Avoid duplicates
- 1–3 Years+ must include Tree/Graph/DP
- Senior must include advanced structure
- Intern avoid heavy Graph/DP

==================================================
TEST CASE RULES (MANDATORY)
==================================================

Each question MUST include testCases array.

Rules:

1. Minimum testCases per question: 2
2. Maximum testCases per question: 3
3. ALL test cases must have:
   "isHidden": false
4. Hidden test cases are NOT allowed.
5. Do NOT generate more than 3 test cases.
6. Do NOT generate less than 2 test cases.
7. All test case inputs must strictly match inputFormat.
8. All test case outputs must strictly match outputFormat.
9. Each testCase contains explanation field
10. Each test case MUST include:
   "input", "output", "isHidden", "explanation"

==================================================
STRICT OUTPUT FORMAT
==================================================

{
  "assessmentMetadata": {
    "totalQuestions": number,
    "totalDurationMinutes": number
  },
  "questions": [
    {
      "id": number,
      "title": string,
      "description": string,
      "difficulty": "Easy" | "Medium" | "Hard",
      "category": string,
      "constraints": string,
      "inputFormat": Multiple test cases are supported. All test cases are provided as a single input string. Each test case is separated by: ###TESTCASE###. Within each test case: Line 1 contains the first parameter. Line 2 contains the second parameter.,
      "outputFormat": string,
      "testCases": [
        {
          "input": string,
          "output": string,
          "isHidden": boolean,
          "explanation": string
        }
      ],
      "starterCode": string,
      "systemWrapperCode": string
    }
  ],
  "validation": {
    "modeValidated": true,
    "patternValidated": true,
    "languageTemplateApplied": true,
    "userCodeMarkerPresent": true,
    "jsonValid": true
  }
}

==================================================
IMPORTANT QUESTION RULES
==================================================

Each question MUST include ALL fields listed above.

Use ONLY the field name "category".
Do NOT use "topic" or any alternative key.

"id" must be numeric (1, 2, 3...).

"difficulty" must be exactly one of:
Easy, Medium, Hard.

Both "starterCode" and "systemWrapperCode" MUST contain:
{{USER_CODE}}

No extra fields allowed except those defined in STRICT OUTPUT FORMAT.

==================================================
SELF VALIDATION
==================================================

Before returning:

✓ Question count correct
✓ Difficulty distribution correct
✓ Language-specific template correct
✓ class Solution present (except C)
✓ Required method defined inside class Solution
✓ starterCode contains full class Solution
✓ systemWrapperCode does NOT declare class Solution
✓ starterCode contains class Solution with {{USER_CODE}} inside method body
✓ systemWrapperCode injects {{USER_CODE}} at top-level
✓ systemWrapperCode does NOT declare class Solution
✓ Method name consistent between starterCode and systemWrapperCode
✓ Each question has 2–3 testCases only
✓ All testCases have "isHidden": false
✓ Wrapper contains {{USER_CODE}}
✓ Valid JSON
✓ No extra fields

If any fails → regenerate.
`;

    const examBasedPrompt = `
You are an Enterprise AI Company Exam Generator.

CRITICAL:
Return STRICTLY VALID JSON.
No markdown.
No explanations.
No hints.
No comments.
No extra text.

If JSON invalid → regenerate internally.

==================================================
INPUT (PROVIDED DYNAMICALLY)
==================================================

${JSON.stringify({
        companyName,
        examName,
        programmingLanguage
    }, null, 2)}

==================================================
OBJECTIVE
==================================================

Generate a REAL company-level coding exam.

This is NOT role-based hiring.
This follows a structured company exam pattern.

No follow-ups.
No hints.
No explanations.

==================================================
COMPANY EXAM ENGINE
==================================================

Determine exam pattern based on:

Company Name: ${companyName}
Exam Name: ${examName}

Rules:

==================================================
COMPANY EXAM ENGINE (CODING-FOCUSED STRUCTURED)
==================================================

Determine exam pattern strictly based on companyName and examName.

--------------------------------------------------

If companyName = "TCS" AND examName includes "NQT":

Pattern (TCS iON NQT – Advanced Coding Section):

- Coding Questions: 2
- Difficulty: Medium, Hard
- Duration: 90 minutes
- Focus Areas:
    Array
    String
    Sorting
    Searching
    Basic Algorithms
- Avoid:
    Heavy Graph
    Advanced DynamicProgramming
    Complex Tree

--------------------------------------------------

If companyName = "Deloitte" AND examName includes "NLA" OR "National Level Assessment":

Pattern (Deloitte NLA – Coding Round):

- Coding Questions: 2
- Difficulty: Medium, Medium
- Duration: 90 minutes
- Focus Areas:
    Array
    String
    Hashing
    Sorting
    Searching
    Basic Recursion
- Avoid:
    Heavy Graph
    Complex DynamicProgramming
    Advanced Tree problems

--------------------------------------------------

If companyName = "Infosys" AND examName includes "InfyTQ":

Pattern (Infosys InfyTQ Certification Exam):

- Coding Questions: 2
- Difficulty: Easy, Medium
- Duration: 90 minutes
- Focus Areas:
    Array
    String
    Basic Data Structures
    Basic Problem Solving
- Avoid:
    Advanced DynamicProgramming
    Complex Graph

--------------------------------------------------

If companyName = "Infosys" AND examName includes "HackWithInfy" OR "SP" OR "DSE":

Pattern (HackWithInfy / Specialist Programmer / DSE Coding Round):

- Coding Questions: 3
- Difficulty: Easy, Medium, Hard
- Duration: 180 minutes
- Must include:
    • 1 Data Structure problem
    • 1 Greedy / Algorithmic problem
    • 1 Advanced problem (DynamicProgramming / Complex Logic)

--------------------------------------------------

If companyName = "Wipro" AND examName includes "Elite" OR "NTH" OR "Coding":

Pattern (Wipro Elite NTH Coding):

- Coding Questions: 2
- Difficulty: Easy, Medium
- Duration: 60 minutes
- Focus Areas:
    Array
    String
    Basic Problem Solving

--------------------------------------------------

If companyName = "Amazon" AND examName includes "Online" OR "Coding":

Pattern (Amazon Online Coding Round):

- Coding Questions: 3
- Difficulty: Easy, Medium, Hard
- Duration: 180 minutes
- Must include:
    • 1 Data Structures problem
    • 1 SlidingWindow / Hashing / Greedy problem
    • 1 Advanced problem (DynamicProgramming / Graph)

--------------------------------------------------

If companyName in:
"Accenture", "Capgemini", "Cognizant", "HCL", "IBM"
AND examName includes "Coding":

Pattern (Service-Based Company Coding Test):

- Coding Questions: 2
- Difficulty: Easy, Medium
- Duration: 60–90 minutes
- Focus Areas:
    Array
    String
    Sorting
    Searching
    Basic Data Structures
- Avoid:
    Heavy DynamicProgramming
    Advanced Graph

--------------------------------------------------

If company unknown OR examName unrecognized:

Default Pattern:

- Coding Questions: 3
- Difficulty: Easy, Medium, Medium
- Duration: 90 minutes
- Focus Areas:
    Array
    String
    Hashing
    Recursion
    Basic DynamicProgramming

==================================================
LEETCODE-STYLE STRUCTURE (MANDATORY)
==================================================

For Java, Python, C++, JavaScript:

1. starterCode MUST follow LeetCode style.

2. starterCode MUST contain:
   class Solution

3. The required method MUST be defined inside class Solution.

4. In starterCode:
   {{USER_CODE}} MUST be placed strictly inside the method body.

5. systemWrapperCode MUST NOT declare or define class Solution.

6. systemWrapperCode MUST inject {{USER_CODE}} at top-level.
   In systemWrapperCode, {{USER_CODE}} represents the entire class Solution.

7. No standalone solution functions allowed outside class Solution
   (except in C language).

8. Method name must match EXACTLY in:
   - starterCode
   - systemWrapperCode

9. Wrapper must:
   - Instantiate class Solution
   - Call the exact method
   - Print result.


For C language:

1. Do NOT use class.
2. starterCode MUST define the full function.
3. In starterCode, {{USER_CODE}} must be inside function body.
4. systemWrapperCode must inject {{USER_CODE}} at top-level.
5. main() must parse input and call that function.

==================================================
STRICT WRAPPER REQUIREMENTS (ALL LANGUAGES)
==================================================

Wrapper MUST:

1. Parse entire input as STRING.
2. Support multiple test cases separated strictly by:
   ###TESTCASE###
3. Split test cases using the exact delimiter:
   ###TESTCASE###
4. Parse parameters line-by-line within each test case.
5. Continue execution even if one test case fails.
6. Print each test case output.
7. Outputs of multiple test cases MUST be separated strictly by:
   ###TESTCASE###
8. No extra characters before or after the delimiter.
9. Be directly executable in selected language.
10. Contain {{USER_CODE}}.
11. Have NO comments.
12. Have NO explanations.
13. systemWrapperCode MUST NOT declare or define class Solution (except C language).
14. systemWrapperCode MUST inject {{USER_CODE}} at top-level, outside of any class.

If wrapper violates any rule → regenerate.

==================================================
ALLOWED CATEGORIES
==================================================

Array, String, Hashing, Recursion,
BinarySearch, TwoPointers,
SlidingWindow, Stack, Queue,
Basic Math

Avoid heavy DP or advanced Graph unless specified.

==================================================
TEST CASE RULES (MANDATORY)
==================================================

Each question MUST include testCases array.

Rules:

1. Minimum testCases per question: 2
2. Maximum testCases per question: 3
3. ALL test cases must have:
   "isHidden": false
4. Hidden test cases are NOT allowed.
5. Do NOT generate more than 3 test cases.
6. Do NOT generate less than 2 test cases.
7. All test case inputs must strictly match inputFormat.
8. All test case outputs must strictly match outputFormat.
9. Each testCase contains explanation field
10. Each test case MUST include:
   "input", "output", "isHidden", "explanation"

==================================================
STRICT OUTPUT FORMAT
==================================================

{
  "assessmentMetadata": {
    "totalQuestions": number,
    "totalDurationMinutes": number
  },
  "questions": [
    {
      "id": number,
      "title": string,
      "description": string,
      "difficulty": "Easy" | "Medium" | "Hard",
      "category": string,
      "constraints": string,
      "inputFormat": Multiple test cases are supported. All test cases are provided as a single input string. Each test case is separated by: ###TESTCASE###. Within each test case: Line 1 contains the first parameter. Line 2 contains the second parameter.,
      "outputFormat": string,
      "testCases": [
        {
          "input": string,
          "output": string,
          "isHidden": boolean,
          "explanation": string
        }
      ],
      "starterCode": string,
      "systemWrapperCode": string
    }
  ],
  "validation": {
    "modeValidated": true,
    "patternValidated": true,
    "languageTemplateApplied": true,
    "userCodeMarkerPresent": true,
    "jsonValid": true
  }
}

==================================================
IMPORTANT QUESTION RULES
==================================================

Each question MUST include ALL fields listed above.

Use ONLY the field name "category".
Do NOT use "topic" or any alternative key.

"id" must be numeric (1, 2, 3...).

"difficulty" must be exactly one of:
Easy, Medium, Hard.

Both "starterCode" and "systemWrapperCode" MUST contain:
{{USER_CODE}}

No extra fields allowed except those defined in STRICT OUTPUT FORMAT.

==================================================
SELF VALIDATION
==================================================

Before returning:

✓ Question count correct
✓ Difficulty distribution correct
✓ Language-specific template correct
✓ class Solution present (except C)
✓ Required method defined inside class Solution
✓ starterCode contains full class Solution
✓ systemWrapperCode does NOT declare class Solution
✓ starterCode contains class Solution with {{USER_CODE}} inside method body
✓ systemWrapperCode injects {{USER_CODE}} at top-level
✓ systemWrapperCode does NOT declare class Solution
✓ Method name consistent between starterCode and systemWrapperCode
✓ Each question has 2–3 testCases only
✓ All testCases have "isHidden": false
✓ Wrapper contains {{USER_CODE}}
✓ Valid JSON
✓ No extra fields

If any fails → regenerate.
`;
    try {
        // console.log("prompt: ", prompt);
        let result;
        if (assessmentMode === "ROLE_BASED") {
            result = await model.generateContent(roleBasedPrompt);
        } else {
            result = await model.generateContent(examBasedPrompt);
        }
        const response = result.response;
        let text = response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").replace(/```/g, "").trim();

        let parsed;
        try {

            parsed = JSON.parse(cleanedText);

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
            console.error("Invalid JSON from AI:", cleanedText);
            throw new Error("AI returned invalid assessment format");
        }

        const finalAssessment = {
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
        };

        const [session, updatedUser] =
            await db.$transaction([
                db.simulationSession.create({
                    data: {
                        userId: user.id,
                        type: "CODING_ROUND",
                        status: "STARTED",
                        sessionToken: crypto.randomUUID(),
                        creditsUsed: ASSESSMENT_GENERATION_CREDITS, payload: sanitizeAssessmentData(finalAssessment),
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


        return {
            success: true,
            data: {
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

export async function EvaluateCodingAssessment({ codes, sessionToken, timeTaken }) {
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

    const prompt = `
You are an elite senior software engineer and coding interviewer evaluating a REAL coding assessment submission.

You MUST evaluate the candidate ONLY based on:
- The coding questions
- The submitted solutions
- Runtime behavior
- Test case results
- Code quality
- Algorithmic quality
- Problem-solving demonstrated in the code

━━━━━━━━━━━━━━━━━━
FULL ASSESSMENT PAYLOAD
━━━━━━━━━━━━━━━━━━

${JSON.stringify(AssessmentData, null, 2)}

━━━━━━━━━━━━━━━━━━
EVALUATION OBJECTIVE
━━━━━━━━━━━━━━━━━━

Evaluate the candidate realistically like a real FAANG/company hiring panel.

Assessment may contain:
- Multiple coding questions
- Multiple languages
- Passed/failed test cases
- Compilation errors
- Partial solutions

Your evaluation MUST reflect:
- Actual correctness
- Algorithm quality
- Time complexity awareness
- Edge case handling
- Clean coding practices
- Problem-solving ability

━━━━━━━━━━━━━━━━━━
STRICT EVALUATION RULES
━━━━━━━━━━━━━━━━━━

1. Evaluate ONLY what is ACTUALLY present.

2. NEVER assume:
- hidden knowledge
- unsubmitted logic
- intended solutions
- unstated optimizations

3. Penalize for compilation/runtime/test failures ONLY IF the issue appears to originate from the candidate solution itself.

IMPORTANT:
Do NOT heavily penalize the candidate if failures may be caused by:
- system wrapper issues
- input parsing bugs
- malformed wrapper logic
- incorrect system-generated templates
- execution environment problems
- inconsistent testcase formatting
- wrapper compilation failures unrelated to user logic

If the submitted solution logic appears correct but execution failed due to probable wrapper/system issues:
- mention uncertainty
- reduce penalty severity
- avoid harsh negative feedback
- avoid assuming lack of technical ability

Differentiate carefully between:
- candidate logic errors
- platform/wrapper/execution errors
- failed test cases
- brute force where optimization expected
- incomplete implementations
- empty methods
- syntax issues
- poor edge-case handling
- hardcoded outputs
- copied boilerplate without logic

4. Reward:
- passing all test cases
- optimal algorithms
- good naming
- readable code
- clean logic
- edge-case handling
- efficient data structures
- concise implementations

5. IMPORTANT REALISM RULES

If:
- many test cases fail
- compilation errors exist
- solutions are incomplete
- only easy questions solved
- brute force used for hard questions

Then:
- overall score should usually stay below 70
- recommendation should NOT be "Strong Hire"

6. Strong scores REQUIRE:
- high pass rate
- efficient solutions
- clean implementations
- consistency across questions

7. If candidate solved only partial assessment:
- clearly mention it
- reduce technical/problem-solving scores

8. If code quality is poor:
- lower communication/professionalism indicators

9. DO NOT hallucinate:
- optimizations not present
- edge-case handling not implemented
- advanced knowledge not demonstrated

10. If the candidate solution appears algorithmically correct but execution failed,
carefully inspect whether the issue may originate from:
- wrapper code
- testcase parser
- execution engine
- generated templates

In such situations:
- reduce penalty severity
- mention uncertainty
- avoid assuming low technical skill
- set possibleSystemIssue = true when appropriate

━━━━━━━━━━━━━━━━━━
QUESTION-WISE ANALYSIS RULES
━━━━━━━━━━━━━━━━━━

For EACH question evaluate:

- correctness
- whether failures originated from candidate logic or probable wrapper/system issues
- passed test cases
- failed test cases
- algorithm quality
- edge-case handling
- code readability
- efficiency

━━━━━━━━━━━━━━━━━━
SCORING SCALE
━━━━━━━━━━━━━━━━━━

0-30   = Very Poor
31-50  = Weak
51-70  = Average
71-85  = Strong
86-100 = Exceptional

Most realistic candidates should fall between 45-75.

━━━━━━━━━━━━━━━━━━
RETURN STRICTLY VALID JSON
━━━━━━━━━━━━━━━━━━

{
  "overallScore": 0,

  "technicalScore": 0,

  "problemSolvingScore": 0,

  "codeQualityScore": 0,

  "algorithmScore": 0,

  "debuggingScore": 0,

  "questionAnalysis": [
    {
      "questionId": 0,

      "title": "string",

      "difficulty": "Easy | Medium | Hard",

      "passedTestCases": 0,

      "totalTestCases": 0,

      "score": 0,

      "status":
        "Solved | Partially Solved | Failed | Compilation Error",

      "strengths": [
        "string"
      ],

      "weaknesses": [
        "string"
      ],

      "feedback": "string"
    }
  ],

  "overallStrengths": [
    "string"
  ],

  "overallWeaknesses": [
    "string"
  ],

  "improvementTips": [
    "string"
  ],

  "finalFeedback": "string",

  "hiringRecommendation":
    "Strong Hire | Hire | Neutral | Reject"
}

━━━━━━━━━━━━━━━━━━
STRICT OUTPUT RULES
━━━━━━━━━━━━━━━━━━

- Return ONLY raw JSON
- No markdown
- No code blocks
- No explanations
- No extra text
- All scores must be integers
- All scores must be between 0-100
- questionAnalysis MUST include every question
- Feedback must be realistic and evidence-based
- Do NOT invent passed test cases
- Do NOT invent optimizations
- Do NOT invent hidden logic

━━━━━━━━━━━━━━━━━━
SELF VALIDATION
━━━━━━━━━━━━━━━━━━

Before returning:

✓ Valid JSON
✓ Every question analyzed
✓ Scores realistic
✓ No hallucinated optimizations
✓ Recommendation consistent with scores
✓ Failed questions penalized properly
✓ Compilation/runtime errors reflected
✓ No markdown
✓ No extra text

If invalid → regenerate internally.
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

export async function StartExistingCodingTestSession(sessionToken) {

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

export async function EvaluatePendingCodingAssessment({ sessionToken }) {
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

    const prompt = `
You are an elite senior software engineer and coding interviewer evaluating a REAL coding assessment submission.

You MUST evaluate the candidate ONLY based on:
- The coding questions
- The submitted solutions
- Runtime behavior
- Test case results
- Code quality
- Algorithmic quality
- Problem-solving demonstrated in the code

━━━━━━━━━━━━━━━━━━
FULL ASSESSMENT PAYLOAD
━━━━━━━━━━━━━━━━━━

${JSON.stringify(AssessmentData, null, 2)}

━━━━━━━━━━━━━━━━━━
EVALUATION OBJECTIVE
━━━━━━━━━━━━━━━━━━

Evaluate the candidate realistically like a real FAANG/company hiring panel.

Assessment may contain:
- Multiple coding questions
- Multiple languages
- Passed/failed test cases
- Compilation errors
- Partial solutions

Your evaluation MUST reflect:
- Actual correctness
- Algorithm quality
- Time complexity awareness
- Edge case handling
- Clean coding practices
- Problem-solving ability

━━━━━━━━━━━━━━━━━━
STRICT EVALUATION RULES
━━━━━━━━━━━━━━━━━━

1. Evaluate ONLY what is ACTUALLY present.

2. NEVER assume:
- hidden knowledge
- unsubmitted logic
- intended solutions
- unstated optimizations

3. Penalize for compilation/runtime/test failures ONLY IF the issue appears to originate from the candidate solution itself.

IMPORTANT:
Do NOT heavily penalize the candidate if failures may be caused by:
- system wrapper issues
- input parsing bugs
- malformed wrapper logic
- incorrect system-generated templates
- execution environment problems
- inconsistent testcase formatting
- wrapper compilation failures unrelated to user logic

If the submitted solution logic appears correct but execution failed due to probable wrapper/system issues:
- mention uncertainty
- reduce penalty severity
- avoid harsh negative feedback
- avoid assuming lack of technical ability

Differentiate carefully between:
- candidate logic errors
- platform/wrapper/execution errors
- failed test cases
- brute force where optimization expected
- incomplete implementations
- empty methods
- syntax issues
- poor edge-case handling
- hardcoded outputs
- copied boilerplate without logic

4. Reward:
- passing all test cases
- optimal algorithms
- good naming
- readable code
- clean logic
- edge-case handling
- efficient data structures
- concise implementations

5. IMPORTANT REALISM RULES

If:
- many test cases fail
- compilation errors exist
- solutions are incomplete
- only easy questions solved
- brute force used for hard questions

Then:
- overall score should usually stay below 70
- recommendation should NOT be "Strong Hire"

6. Strong scores REQUIRE:
- high pass rate
- efficient solutions
- clean implementations
- consistency across questions

7. If candidate solved only partial assessment:
- clearly mention it
- reduce technical/problem-solving scores

8. If code quality is poor:
- lower communication/professionalism indicators

9. DO NOT hallucinate:
- optimizations not present
- edge-case handling not implemented
- advanced knowledge not demonstrated

10. If the candidate solution appears algorithmically correct but execution failed,
carefully inspect whether the issue may originate from:
- wrapper code
- testcase parser
- execution engine
- generated templates

In such situations:
- reduce penalty severity
- mention uncertainty
- avoid assuming low technical skill
- set possibleSystemIssue = true when appropriate

━━━━━━━━━━━━━━━━━━
QUESTION-WISE ANALYSIS RULES
━━━━━━━━━━━━━━━━━━

For EACH question evaluate:

- correctness
- whether failures originated from candidate logic or probable wrapper/system issues
- passed test cases
- failed test cases
- algorithm quality
- edge-case handling
- code readability
- efficiency

━━━━━━━━━━━━━━━━━━
SCORING SCALE
━━━━━━━━━━━━━━━━━━

0-30   = Very Poor
31-50  = Weak
51-70  = Average
71-85  = Strong
86-100 = Exceptional

Most realistic candidates should fall between 45-75.

━━━━━━━━━━━━━━━━━━
RETURN STRICTLY VALID JSON
━━━━━━━━━━━━━━━━━━

{
  "overallScore": 0,

  "technicalScore": 0,

  "problemSolvingScore": 0,

  "codeQualityScore": 0,

  "algorithmScore": 0,

  "debuggingScore": 0,

  "questionAnalysis": [
    {
      "questionId": 0,

      "title": "string",

      "difficulty": "Easy | Medium | Hard",

      "passedTestCases": 0,

      "totalTestCases": 0,

      "score": 0,

      "status":
        "Solved | Partially Solved | Failed | Compilation Error",

      "strengths": [
        "string"
      ],

      "weaknesses": [
        "string"
      ],

      "feedback": "string"
    }
  ],

  "overallStrengths": [
    "string"
  ],

  "overallWeaknesses": [
    "string"
  ],

  "improvementTips": [
    "string"
  ],

  "finalFeedback": "string",

  "hiringRecommendation":
    "Strong Hire | Hire | Neutral | Reject"
}

━━━━━━━━━━━━━━━━━━
STRICT OUTPUT RULES
━━━━━━━━━━━━━━━━━━

- Return ONLY raw JSON
- No markdown
- No code blocks
- No explanations
- No extra text
- All scores must be integers
- All scores must be between 0-100
- questionAnalysis MUST include every question
- Feedback must be realistic and evidence-based
- Do NOT invent passed test cases
- Do NOT invent optimizations
- Do NOT invent hidden logic

━━━━━━━━━━━━━━━━━━
SELF VALIDATION
━━━━━━━━━━━━━━━━━━

Before returning:

✓ Valid JSON
✓ Every question analyzed
✓ Scores realistic
✓ No hallucinated optimizations
✓ Recommendation consistent with scores
✓ Failed questions penalized properly
✓ Compilation/runtime errors reflected
✓ No markdown
✓ No extra text

If invalid → regenerate internally.
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

async function executeCode({ code, input, language}) {
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