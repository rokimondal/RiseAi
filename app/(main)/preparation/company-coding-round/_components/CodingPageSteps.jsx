"use client"

import React, { useEffect, useState } from 'react'
import InstructionPage from './InstructionPage';
import CodingForm from './CodingForm';
import CodingPage from './CodingPage';
import { generateCodingAssesment } from '@/actions/company-coding-round';
import useFetch from '@/hooks/use-fetch';
import { toast } from 'sonner';

const CodingPageSteps = ({ data }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(data.formData);

    const { loading: generating, fn: generateAssesmentFn, data: generatedAssesment } = useFetch(generateCodingAssesment);

    useEffect(() => {
        console.log(formData);
    }, [formData])

    useEffect(() => {
        if (generatedAssesment) {
            console.log(generatedAssesment);
            setStep(3);
        }
    }, [generatedAssesment])

    const handleStartAssesment = async (values) => {
        try {
            if (!formData) {
                await generateAssesmentFn(values)
            } else {
                await generateAssesmentFn(formData);
            }
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
                    "difficulty": "Easy",
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

    switch (step) {
        case 1:
            return (
                <InstructionPage setStep={setStep} data={data} />
            )

        case 2:
            return (
                <CodingForm setStep={setStep} setFormData={setFormData} handleStartAssesment={handleStartAssesment} generatingAssesment={generating} />
            )

        case 3:
            return (
                <CodingPage assesmentData={generatedAssesment.data} />
            )
        default:
            return null;
    }
    return (
        <div>CodingPageSteps</div>
    )
}

export default CodingPageSteps