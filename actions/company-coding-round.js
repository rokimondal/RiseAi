"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
})

export async function generateCodingAssesment(data) {
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

        let finalAssessment;

        try {

            const parsed = JSON.parse(cleanedText);

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

            const assessment = parsed;

            finalAssessment = {
                assessmentMetadata: {
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

            console.log(finalAssessment);

        } catch (err) {
            console.error("Invalid JSON from AI:", cleanedText);
            throw new Error("AI returned invalid assessment format");
        }

        return {
            success: true,
            data: {
                ...finalAssessment,
                userName: user.name
            }
        };
    } catch (error) {
        console.error("Error generating coding assessment:", error);
        throw new Error("Failed to generate coding assessment");
    }
}

export async function runCode({ code, input, language }) {
    try {
        if (!language) {
            throw new Error("Language is required");
        }

        const normalizedLanguage = language.toLowerCase();

        const allowedLanguages = ["java", "python", "cpp", "javascript", "c"];

        if (!allowedLanguages.includes(normalizedLanguage)) {
            throw new Error("Unsupported language");
        }

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
            throw new Error("Judge API failed");
        }

        return await response.json();

    } catch (error) {
        return {
            success: false,
            status: "ERROR",
            message: error.message,
        };
    }
}