export const getGenerateRoleBasedCodingAssessmentPrompt = (payload)=>{
    const prompt = `
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

${JSON.stringify(payload, null, 2)}

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
    return prompt;
}

export const getGenerateExamBasedCodingAssessmentPrompt = (payload)=>{
    const prompt = `
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
    
    ${JSON.stringify(payload, null, 2)}
    
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
    return prompt;
}

export const getEvaluationCodingAssessmentPrompt = (AssessmentData)=>{
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
return prompt;
}