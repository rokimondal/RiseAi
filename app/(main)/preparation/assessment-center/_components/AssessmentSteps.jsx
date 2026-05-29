"use client"

import React, { useEffect, useState } from 'react'
import InstructionPage from './InstructionPage';
import AssessmentForm from './AssessmentForm';
import { evaluateAssessmentCenter, generateAssessmentCenter } from '@/actions/assessment-center';
import useFetch from '@/hooks/use-fetch';
import AssessmentPage from './AssessmentPage';
import { toast } from 'sonner';
import AssessmentResult from './AssessmentResult';

const AssessmentSteps = ({ data }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(data.formData);

    const { loading: generating, fn: generateAssesmentFn, data: generatedAssesment } = useFetch(generateAssessmentCenter);

    const { loading: evaluating, fn: evaluationFn, data: evaluatedData } = useFetch(evaluateAssessmentCenter);

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
            toast.error(error.message || "Failed to design assesment");
        }
    }

    const handleSubmit = async (value) => {
        console.log(value)

        try {
            await evaluationFn(value)
        } catch (error) {
            toast.error(error.message || "Failed to evaluate assesment");
        }
    }

    useEffect(() => {
        if (!evaluatedData) return;
        console.log(evaluatedData);
        setStep(4);
    }, [evaluatedData])

    const dummyGeneratedAssesmentData = {
        success: true,
        data: {
            assessmentMetadata: {
                companyName: "tcs",
                examOrRole: "nqt",
                mode: "EXAM_BASED",
                totalDurationMinutes: 10,
                totalQuestions: 5
            },

            questions: [
                {
                    id: 1,
                    question:
                        "A sum of money doubles itself in 5 years at simple interest. In how many years will it become four times itself at the same rate?",
                    options: [
                        "10 years",
                        "15 years",
                        "20 years",
                        "25 years"
                    ],
                    questionType: "SINGLE_SELECT"
                },

                {
                    id: 2,
                    question:
                        "If 6 men can complete a piece of work in 10 days, how many men will complete the same work in 15 days?",
                    options: [
                        "4 men",
                        "5 men",
                        "3 men",
                        "8 men"
                    ],
                    questionType: "SINGLE_SELECT"
                },

                {
                    id: 3,
                    question:
                        "Identify the part of the sentence that contains an error: \"Despite of the bad weather, the flight took off on time.\"",
                    options: [
                        "Despite of",
                        "the bad weather",
                        "the flight took off",
                        "on time"
                    ],
                    questionType: "SINGLE_SELECT"
                },

                {
                    id: 4,
                    question: 'Choose the synonym of "Ubiquitous".',
                    options: [
                        "Scarce",
                        "Rare",
                        "Omnipresent",
                        "Limited"
                    ],
                    questionType: "SINGLE_SELECT"
                },

                {
                    id: 5,
                    question:
                        'In a certain code, "RAIN" is coded as "SBJO". How is "WIND" coded in that code?',
                    options: [
                        "XJOE",
                        "YJPF",
                        "XJND",
                        "YJOF"
                    ],
                    questionType: "SINGLE_SELECT"
                }
            ],

            remainingCredits: 9632,
            sessionId: "cmpoa6jne000nm6qlhg8w4v9a",
            sessionToken: "27a10324-d4fc-4380-afed-534cfb8731ce",
            userName: "ROKI MONDAL"
        }
    }

    const dummyResult = {
        "success": true,
        "data": {
            "session": {
                "id": "cmb5xv2z10001abc123",
                "userId": "user_001",
                "type": "ASSESSMENT_CENTER",
                "status": "SUBMITTED",
                "sessionToken": "bf38c1cb-c003-42ba-b718-93f891b5a124",

                "startedAt": "2026-05-28T09:00:00.000Z",
                "submittedAt": "2026-05-28T09:18:40.000Z",

                "creditsUsed": 14,

                "payload": {
                    "assessmentMetadata": {
                        "mode": "EXAM_BASED",
                        "companyName": "TCS",
                        "examOrRole": "NQT",

                        "totalQuestions": 12,
                        "totalDurationMinutes": 20,

                        "timeTaken": 1120,

                        "objectiveMarks": {
                            "obtainedMarks": 11,
                            "totalMarks": 21
                        }
                    }
                },

                "result": {
                    "id": "cmb5xvresult001",

                    "sessionId": "cmb5xv2z10001abc123",

                    "userId": "user_001",

                    "type": "ASSESSMENT_CENTER",

                    "score": 58,

                    "metadata": {
                        "overallScore": 58,

                        "technicalScore": 61,

                        "analyticalScore": 55,

                        "problemSolvingScore": 52,

                        "accuracyScore": 57,

                        "hiringRecommendation": "BORDERLINE"
                    },

                    "result": {
                        "strengths": [
                            "Good understanding of Java and OOP concepts.",
                            "Performed well in some objective aptitude questions.",
                            "Basic understanding of backend concepts."
                        ],

                        "weaknesses": [
                            "Needs improvement in analytical problem solving.",
                            "Several incorrect objective answers reduced accuracy.",
                            "Subjective answers lack detailed explanation."
                        ],

                        "questions": [

                            {
                                "questionId": 1,
                                "questionType": "SINGLE_SELECT",
                                "question": "What is 35 + 35?",
                                "options": ["60", "70", "80", "90"],
                                "expectedAnswer": "",
                                "correctAnswer": [1],
                                "userAnswer": "70",
                                "isCorrect": true,
                                "marks": 2,
                                "negativeMarks": 0.5,
                                "obtainedMarks": 2,
                                "result": "CORRECT"
                            },

                            {
                                "questionId": 2,
                                "questionType": "MULTI_SELECT",
                                "question": "Which are programming languages?",
                                "options": ["Java", "HTML", "Python", "CSS"],
                                "expectedAnswer": "",
                                "correctAnswer": [0, 2],
                                "userAnswer": ["Java", "CSS"],
                                "isCorrect": false,
                                "marks": 3,
                                "negativeMarks": 1,
                                "obtainedMarks": -1,
                                "result": "WRONG"
                            },

                            {
                                "questionId": 3,
                                "questionType": "SHORT_ANSWER",
                                "question": "Explain normalization in DBMS.",
                                "options": [],
                                "expectedAnswer": "Normalization reduces redundancy and improves data integrity.",
                                "correctAnswer": [],
                                "userAnswer": "Normalization is related to tables.",
                                "isCorrect": null,
                                "marks": 5,
                                "negativeMarks": 0,
                                "obtainedMarks": 2,
                                "result": "PARTIALLY_CORRECT"
                            },

                            {
                                "questionId": 4,
                                "questionType": "SINGLE_SELECT",
                                "question": "Which SQL clause is used to filter grouped data?",
                                "options": ["WHERE", "HAVING", "GROUP BY", "ORDER BY"],
                                "expectedAnswer": "",
                                "correctAnswer": [1],
                                "userAnswer": "WHERE",
                                "isCorrect": false,
                                "marks": 2,
                                "negativeMarks": 0.5,
                                "obtainedMarks": -0.5,
                                "result": "WRONG"
                            },

                            {
                                "questionId": 5,
                                "questionType": "SINGLE_SELECT",
                                "question": "Which data structure uses FIFO order?",
                                "options": ["Stack", "Queue", "Tree", "Graph"],
                                "expectedAnswer": "",
                                "correctAnswer": [1],
                                "userAnswer": "Queue",
                                "isCorrect": true,
                                "marks": 2,
                                "negativeMarks": 0.5,
                                "obtainedMarks": 2,
                                "result": "CORRECT"
                            },

                            {
                                "questionId": 6,
                                "questionType": "MULTI_SELECT",
                                "question": "Which are JavaScript frameworks?",
                                "options": ["React", "Angular", "MongoDB", "Vue"],
                                "expectedAnswer": "",
                                "correctAnswer": [0, 1, 3],
                                "userAnswer": ["React", "Angular"],
                                "isCorrect": false,
                                "marks": 3,
                                "negativeMarks": 1,
                                "obtainedMarks": 1,
                                "result": "PARTIALLY_CORRECT"
                            },

                            {
                                "questionId": 7,
                                "questionType": "SINGLE_SELECT",
                                "question": "Which protocol is used for secure communication?",
                                "options": ["HTTP", "HTTPS", "FTP", "SMTP"],
                                "expectedAnswer": "",
                                "correctAnswer": [1],
                                "userAnswer": "FTP",
                                "isCorrect": false,
                                "marks": 2,
                                "negativeMarks": 0.5,
                                "obtainedMarks": -0.5,
                                "result": "WRONG"
                            },

                            {
                                "questionId": 8,
                                "questionType": "SHORT_ANSWER",
                                "question": "What is indexing in DBMS?",
                                "options": [],
                                "expectedAnswer": "Indexing improves database query performance using efficient lookup structures.",
                                "correctAnswer": [],
                                "userAnswer": "Indexing helps retrieve records faster.",
                                "isCorrect": null,
                                "marks": 5,
                                "negativeMarks": 0,
                                "obtainedMarks": 4,
                                "result": "CORRECT"
                            },

                            {
                                "questionId": 9,
                                "questionType": "SINGLE_SELECT",
                                "question": "Which keyword is used to inherit a class in Java?",
                                "options": ["extends", "implements", "inherits", "super"],
                                "expectedAnswer": "",
                                "correctAnswer": [0],
                                "userAnswer": "implements",
                                "isCorrect": false,
                                "marks": 2,
                                "negativeMarks": 0.5,
                                "obtainedMarks": -0.5,
                                "result": "WRONG"
                            },

                            {
                                "questionId": 10,
                                "questionType": "MULTI_SELECT",
                                "question": "Which are NoSQL databases?",
                                "options": ["MongoDB", "MySQL", "Redis", "PostgreSQL"],
                                "expectedAnswer": "",
                                "correctAnswer": [0, 2],
                                "userAnswer": ["MongoDB", "Redis"],
                                "isCorrect": true,
                                "marks": 3,
                                "negativeMarks": 1,
                                "obtainedMarks": 3,
                                "result": "CORRECT"
                            },

                            {
                                "questionId": 11,
                                "questionType": "SHORT_ANSWER",
                                "question": "Explain polymorphism.",
                                "options": [],
                                "expectedAnswer": "Polymorphism allows one interface to represent multiple implementations.",
                                "correctAnswer": [],
                                "userAnswer": "Polymorphism means multiple forms.",
                                "isCorrect": null,
                                "marks": 5,
                                "negativeMarks": 0,
                                "obtainedMarks": 2,
                                "result": "PARTIALLY_CORRECT"
                            },

                            {
                                "questionId": 12,
                                "questionType": "LONG_ANSWER",
                                "question": "Explain REST API architecture.",
                                "options": [],
                                "expectedAnswer": "REST is a stateless architectural style using HTTP methods and resources.",
                                "correctAnswer": [],
                                "userAnswer": "I don't know.",
                                "isCorrect": null,
                                "marks": 10,
                                "negativeMarks": 2,
                                "obtainedMarks": -2,
                                "result": "WRONG"
                            },
                            {
                                "questionId": 13,
                                "questionType": "SHORT_ANSWER",
                                "question": "Explain encapsulation.",
                                "options": [],
                                "expectedAnswer": "Encapsulation binds data and methods together while restricting direct access.",
                                "correctAnswer": [],
                                "userAnswer": "No idea.",
                                "isCorrect": null,
                                "marks": 5,
                                "negativeMarks": 1,
                                "obtainedMarks": -1,
                                "result": "WRONG"
                            }
                        ]
                    },

                    "improvementTip": "Focus on improving analytical reasoning, database concepts, and detailed subjective explanations.",

                    "createdAt": "2026-05-28T09:19:10.000Z",

                    "updatedAt": "2026-05-28T09:19:10.000Z"
                },

                "createdAt": "2026-05-28T08:55:00.000Z",

                "updatedAt": "2026-05-28T09:19:10.000Z"
            },

            "updatedCredits": 86,

            "userName": "ROKI MONDAL"
        }
    }

    switch (step) {
        case 1:
            return (
                <InstructionPage setStep={setStep} data={data} />
            )

        case 2:
            return (
                <AssessmentForm setStep={setStep} setFormData={setFormData} handleStartAssesment={handleStartAssesment} generatingAssesment={generating} />
            )

        case 3:
            return (
                <AssessmentPage assessmentData={generatedAssesment.data} loading={evaluating} handleSubmit={handleSubmit} />
            )

        case 4:
            return (
                <AssessmentResult result={evaluatedData} />
            )
        default:
            return null;
    }
    return (
        <div>CodingPageSteps</div>
    )
}

export default AssessmentSteps