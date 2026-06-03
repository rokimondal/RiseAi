"use client"

import React, { useEffect, useState } from 'react'
import InstructionPage from './InstructionPage';
import useFetch from '@/hooks/use-fetch';
import { toast } from 'sonner';
import SimulationForm from './SimulationForm';
import IntroductionPage from './Introduction';
import ResumeSelector from '../../mock-interview/_components/ResumeSelector';

const CompanySmulationSteps = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [resumeContent, setResumeContent] = useState("");

  const { loading: planing, fn: generateSimulationPlan, data: generatedPlan } = useFetch();

  useEffect(() => {
    console.log(formData);
    console.log(resumeContent);
  }, [formData, resumeContent])

  const setAfterResumePage = () => {
    setStep(4);
  }

  // useEffect(() => {
  //   if (generatedAssesment) {
  //     console.log(generatedAssesment);
  //     setStep(3);
  //   }
  // }, [generatedAssesment])

  // useEffect(() => {
  //   if (assessmentResult) {
  //     console.log(assessmentResult);
  //     setStep(4);
  //   }
  // }, [assessmentResult])

  const handlePlaningSimulation = async (values) => {
    try {
      // if (!formData) {
      //   await generateAssesmentFn(values)
      // } else {
      //   await generateAssesmentFn(formData);
      // }
    } catch (error) {
      toast.error(error.message || "Failed to Design Coding Assesment");
    }
  }


  const dummyGeneratedAssesmentData = {
    "success": true,
    "data": {
      "userName": "ROKI MONDAL",
      "assessmentMetadata": {
        "companyName": "TCS",
        "examOrRole": "software engineer",
        "mode": "ROLE_BASED",
        "programmingLanguage": "Python",
        "totalDurationMinutes": 90,
        "totalQuestions": 3
      },
      "questions": [
        {
          "id": 1,
          "title": "Find the Missing Number",
          "category": "Array",
          "difficulty": "medium",
          "description": "Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array. Your solution should aim for O(n) time complexity and O(1) extra space if possible.",
          "constraints": "1 <= n <= 1000\n0 <= nums[i] <= n\nAll the numbers of `nums` are unique.",
          "inputFormat": "Multiple test cases are supported. All test cases are provided as a single input string. Each test case is separated by: ###TESTCASE###. Within each test case: Line 1 contains the first parameter.",
          "outputFormat": "An integer representing the missing number.",
          "starterCode": "class Solution:\n    def missingNumber(self, nums: list[int]) -> int:\n        {{USER_CODE}}\n",
          "systemWrapperCode": "import sys\n\n{{USER_CODE}}\n\ndef main():\n    input_lines = sys.stdin.read().strip().split('###TESTCASE###')\n    results = []\n\n    for line in input_lines:\n        if not line.strip():\n            continue\n        try:\n            test_case_lines = [l.strip() for l in line.strip().split('\\n') if l.strip()]\n            nums = list(map(int, test_case_lines[0].split()))\n            solution = Solution()\n            result = solution.missingNumber(nums)\n            results.append(str(result))\n        except Exception as e:\n            results.append(f\"Error: {e}\")\n    sys.stdout.write('###TESTCASE###'.join(results))\n\nif __name__ == '__main__':\n    main()\n",
          "testCases": [
            {
              "input": "3 0 1",
              "output": "2",
              "explanation": "n = 3, nums = [3,0,1]. The range is [0,3]. 2 is the missing number.",
              "isHidden": false
            },
            {
              "input": "0 1",
              "output": "2",
              "explanation": "n = 2, nums = [0,1]. The range is [0,2]. 2 is the missing number.",
              "isHidden": false
            },
            {
              "input": "9 6 4 2 3 5 7 0 1",
              "output": "8",
              "explanation": "n = 9, nums = [9,6,4,2,3,5,7,0,1]. The range is [0,9]. 8 is the missing number.",
              "isHidden": false
            }
          ]
        },
        {
          "id": 2,
          "title": "First Unique Character in a String",
          "category": "Hashing, String",
          "difficulty": "Medium",
          "description": "Given a string `s`, find the first non-repeating character in it and return its index. If it does not exist, return -1.",
          "constraints": "1 <= s.length <= 10^5\ns consists of only lowercase English letters.",
          "inputFormat": "Multiple test cases separated by ###TESTCASE###.",
          "outputFormat": "An integer representing the index of the first unique character, or -1 if none exists.",
          "starterCode": "class Solution:\n    def firstUniqChar(self, s: str) -> int:\n        {{USER_CODE}}\n",
          "systemWrapperCode": "import sys\n\n{{USER_CODE}}\n\ndef main():\n    input_lines = sys.stdin.read().strip().split('###TESTCASE###')\n    results = []\n    for line in input_lines:\n        if not line.strip():\n            continue\n        try:\n            test_case_lines = [l.strip() for l in line.strip().split('\\n') if l.strip()]\n            s = test_case_lines[0]\n            solution = Solution()\n            result = solution.firstUniqChar(s)\n            results.append(str(result))\n        except Exception as e:\n            results.append(f\"Error: {e}\")\n    sys.stdout.write('###TESTCASE###'.join(results))\n\nif __name__ == '__main__':\n    main()\n",
          "testCases": [
            {
              "input": "leetcode",
              "output": "0",
              "explanation": "The character 'l' is the first unique character.",
              "isHidden": false
            },
            {
              "input": "loveleetcode",
              "output": "2",
              "explanation": "The character 'v' is the first unique character.",
              "isHidden": false
            },
            {
              "input": "aabb",
              "output": "-1",
              "explanation": "All characters repeat, so there is no unique character.",
              "isHidden": false
            }
          ]
        },
        {
          "id": 3,
          "title": "Container With Most Water",
          "category": "Two Pointers, Array",
          "difficulty": "Medium",
          "description": "Given an integer array `height`, find two lines that together with the x-axis form a container such that the container contains the most water.",
          "constraints": "2 <= n <= 10^5\n0 <= height[i] <= 10^4",
          "inputFormat": "Multiple test cases separated by ###TESTCASE###.",
          "outputFormat": "An integer representing the maximum amount of water.",
          "starterCode": "class Solution:\n    def maxArea(self, height: list[int]) -> int:\n        {{USER_CODE}}\n",
          "systemWrapperCode": "import sys\n\n{{USER_CODE}}\n\ndef main():\n    input_lines = sys.stdin.read().strip().split('###TESTCASE###')\n    results = []\n    for line in input_lines:\n        if not line.strip():\n            continue\n        try:\n            test_case_lines = [l.strip() for l in line.strip().split('\\n') if l.strip()]\n            height = list(map(int, test_case_lines[0].split()))\n            solution = Solution()\n            result = solution.maxArea(height)\n            results.append(str(result))\n        except Exception as e:\n            results.append(f\"Error: {e}\")\n    sys.stdout.write('###TESTCASE###'.join(results))\n\nif __name__ == '__main__':\n    main()\n",
          "testCases": [
            {
              "input": "1 8 6 2 5 4 8 3 7",
              "output": "49",
              "explanation": "Max area is 49.",
              "isHidden": false
            },
            {
              "input": "1 1",
              "output": "1",
              "explanation": "Max area is 1.",
              "isHidden": false
            },
            {
              "input": "4 3 2 1 4",
              "output": "16",
              "explanation": "Max area is 16.",
              "isHidden": false
            }
          ]
        }
      ]
    }
  }

  const dummyResult = {
    "success": true,
    "data": {
      "session": {
        "id": "cmpka6dse000rm625gffbn35q",
        "sessionToken": "f6e48d1d-f940-468d-a06f-5eac95585a75",
        "userId": "ebf66850-69b1-4e55-b900-8421631941a3",
        "type": "CODING_ROUND",
        "status": "SUBMITTED",
        "payload": {
          "assessmentMetadata": {
            "mode": "ROLE_BASED",
            "examOrRole": "data entry",
            "companyName": "NovaTech",
            "assessmentMode": "ROLE_BASED",
            "totalQuestions": 2,
            "programmingLanguage": "C",
            "totalDurationMinutes": 60
          },
          "QuestionWithSolution": [
            {
              "questionId": 1,
              "title": "Sum of Array Elements",
              "category": "Array",
              "difficulty": "Medium",
              "submitted": true,
              "executionStatus": "EXECUTED",
              "passedTestCases": 2,
              "totalTestCases": 2,
              "successRate": 100,
              "code": "int sumArray(int* arr, int n) {\n\n int sum = 0;\n\n for (int i = 0; i < n; i++) {\n sum += arr[i];\n }\n\n return sum;\n}",
              "testCases": [
                {
                  "input": "3\n1 2 3",
                  "expectedOutput": "6",
                  "actualOutput": "6",
                  "passed": true
                },
                {
                  "input": "5\n10 -5 0 20 -15",
                  "expectedOutput": "10",
                  "actualOutput": "10",
                  "passed": true
                }
              ]
            },
            {
              "questionId": 2,
              "title": "Count Vowels in a String",
              "category": "String",
              "difficulty": "Medium",
              "submitted": true,
              "executionStatus": "EXECUTED",
              "passedTestCases": 2,
              "totalTestCases": 3,
              "successRate": 67,
              "code": "int countVowels(const char* s) {\n\n int count = 0;\n\n while (*s) {\n\n if (*s == 'a' || *s == 'e' || *s == 'i' ||\n *s == 'o' || *s == 'u') {\n count++;\n }\n\n s++;\n }\n\n return count;\n}",
              "testCases": [
                {
                  "input": "hello",
                  "expectedOutput": "2",
                  "actualOutput": "2",
                  "passed": true
                },
                {
                  "input": "programming",
                  "expectedOutput": "4",
                  "actualOutput": "3",
                  "passed": false
                },
                {
                  "input": "rhythm",
                  "expectedOutput": "0",
                  "actualOutput": "0",
                  "passed": true
                }
              ]
            }
          ]
        },
        "startedAt": "2026-05-24T21:19:45.699Z",
        "submittedAt": "2026-05-24T21:23:37.150Z",
        "expiresAt": "2026-06-23T21:19:45.699Z",
        "durationSeconds": 3600,
        "autoSubmitted": false,
        "creditsUsed": 30,
        "createdAt": "2026-05-24T21:19:45.722Z",
        "updatedAt": "2026-05-24T21:23:37.156Z",
        "result": {
          "id": "cmpkabbma000vm625r54s75l4",
          "sessionId": "cmpka6dse000rm625gffbn35q",
          "userId": "ebf66850-69b1-4e55-b900-8421631941a3",
          "type": "CODING_ROUND",
          "score": 85,
          "metadata": {
            "algorithmScore": 90,
            "debuggingScore": 80,
            "technicalScore": 85,
            "codeQualityScore": 90,
            "problemSolvingScore": 85,
            "hiringRecommendation": "Hire"
          },
          "result": {
            "overallScore": 85,
            "technicalScore": 85,
            "problemSolvingScore": 85,
            "codeQualityScore": 90,
            "algorithmScore": 90,
            "debuggingScore": 80,
            "hiringRecommendation": "Hire",
            "finalFeedback": "The candidate has a solid foundation in C programming and delivered efficient, well-structured solutions for both easy-level problems. The 'Sum of Array Elements' question was solved flawlessly. For 'Count Vowels in a String', while the approach was efficient and correct for lowercase vowels, the omission of uppercase vowel handling led to a partial failure. Given the 'data entry' role and the difficulty of the questions, this is a strong performance demonstrating good technical aptitude and problem-solving skills, with a clear area for minor improvement in robustness for string problems.",
            "overallStrengths": [
              "Strong grasp of C fundamentals, including array iteration and pointer arithmetic for string traversal.",
              "Provided optimal time and space complexity solutions for both problems.",
              "Code is clean, readable, and follows good coding practices.",
              "Demonstrates clear problem-solving ability for basic tasks.",
              "Handles basic edge cases effectively (e.g., empty array, empty string, string with no vowels)."
            ],
            "overallWeaknesses": [
              "Missed a common aspect of the 'Count Vowels' problem: handling case-insensitivity (i.e., counting both lowercase and uppercase vowels). This suggests a slight oversight in fully understanding common problem interpretations or an assumption about input constraints."
            ],
            "improvementTips": [
              "For string manipulation problems, always consider common variations like case-insensitivity, especially when not explicitly stated in the problem description. A robust solution would convert characters to a consistent case (e.g., using `tolower()`) or check for both cases.",
              "Before submitting, perform a quick mental check or write down a few more varied test cases (e.g., strings with uppercase vowels, mixed case strings) to ensure full coverage."
            ],
            "questionAnalysis": [
              {
                "questionId": 1,
                "title": "Sum of Array Elements",
                "difficulty": "Easy",
                "score": 100,
                "status": "Solved",
                "passedTestCases": 2,
                "totalTestCases": 2,
                "strengths": [
                  "Correct and robust implementation for summing array elements.",
                  "Optimal time complexity (O(n)) and space complexity (O(1)).",
                  "Handles edge cases like an empty array (n=0) gracefully by returning 0.",
                  "Clean, readable, and idiomatic C code."
                ],
                "weaknesses": [],
                "feedback": "The solution is perfectly correct, efficient, and demonstrates strong fundamental understanding of array iteration and basic arithmetic in C."
              },
              {
                "questionId": 2,
                "title": "Count Vowels in a String",
                "difficulty": "Easy",
                "score": 75,
                "status": "Partially Solved",
                "passedTestCases": 2,
                "totalTestCases": 3,
                "strengths": [
                  "Uses an efficient pointer-based approach to traverse the string.",
                  "Optimal time complexity (O(L), where L is string length) and space complexity (O(1)).",
                  "Correctly handles empty strings and strings with no lowercase vowels.",
                  "Code is clean and readable."
                ],
                "weaknesses": [
                  "The solution only counts lowercase vowels ('a', 'e', 'i', 'o', 'u'). It does not account for uppercase vowels (e.g., 'A', 'E', 'I', 'O', 'U'), which is a common requirement for this type of problem.",
                  "One test case failed due to this case-sensitivity limitation. Specifically, for the input 'programming', the candidate's code correctly counts 3 lowercase vowels ('o', 'a', 'i'), but the expected output was '4'. While the expectation of '4' for 'programming' (all lowercase) is unusual, the general omission of uppercase vowel handling is a clear area for improvement."
                ],
                "feedback": "The candidate provided a largely correct and efficient solution for counting lowercase vowels. However, the solution lacks robustness by not handling uppercase vowels, which is a common interpretation of the problem statement. The specific failure on 'programming' (expecting 4, actual 3) highlights this limitation, although the discrepancy in the expected count for an all-lowercase input is also noted."
              }
            ]
          },
          "improvementTip": "For string manipulation problems, always consider common variations like case-insensitivity, especially when not explicitly stated in the problem description. A robust solution would convert characters to a consistent case (e.g., using `tolower()`) or check for both cases., Before submitting, perform a quick mental check or write down a few more varied test cases (e.g., strings with uppercase vowels, mixed case strings) to ensure full coverage.",
          "createdAt": "2026-05-24T21:23:36.466Z",
          "updatedAt": "2026-05-24T21:23:36.466Z"
        }
      },
      "updatedCredits": 9676,
      "userName": "ROKI MONDAL"
    }
  }

  switch (step) {
    case 1:
      return (
        <IntroductionPage setStep={setStep} />
      )

    case 2:
      return (
        <SimulationForm setStep={setStep} setFormData={setFormData} />
      )

    case 3:
      return (
        <ResumeSelector setResumeContent={setResumeContent} setAfterResumePage={setAfterResumePage} />
      )
    case 4:
      return (
        <InstructionPage/>
      )
    // default:
    //   return null;
  }
  return (
    <div>CodingPageSteps</div>
  )
}

export default CompanySmulationSteps;