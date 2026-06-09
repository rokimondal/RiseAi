"use client"

import { evaluateInterview, generateInterviewQuestion } from '@/actions/mock-interview';
import { interviewSchema } from '@/app/lib/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { interviewTypes } from '@/data/interviewTypes';
import useFetch from '@/hooks/use-fetch';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import IntroductionPage from './IntroductionPage';
import InterviewForm from './InterviewForm';
import ResumeSelector from './ResumeSelector';
import Instructions from './Instructions';
import { toast } from 'sonner';
import InterviewResult from './InterviewResult';
import Interview from './Interview';

const InterviewPageSteps = ({ data }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(null);
    const [resumeContent, setResumeContent] = useState("");

    const { loading: generating, fn: generateInterviewQuestionFn, data: generatedInterviewQuestion } = useFetch(generateInterviewQuestion);
    const { loading: evaluating, fn: evaluateFn, data: result } = useFetch(evaluateInterview);

    const setAfterResumePage = () => {
        setStep(4);
    }

    // useEffect(() => {
    //     console.log("formdata: ", formData);
    //     console.log("resumeContent: ", resumeContent);
    // }, [formData, resumeContent]);

    const dumyGeneratedInterviewQuestion = {
        //     "interviewType": "Technical",
        //     "jobTitle": "Software Developer Engineer I",
        //     "totalDuration": 1.1,
        //     "questions": [
        //         {
        //             "id": "q1",
        //             "question": "Tell me about yourself and your background in software development.",
        //             "type": "Introduction",
        //             "difficulty": "Easy",
        //             "expectedAnswerTimeMinutes": 2,
        //             "skillsTested": ["Communication", "Self-awareness"],
        //             "followUps": []
        //         },
        //         {
        //             "id": "q2",
        //             "question": "Explain how JWT authentication works in a MERN stack application.",
        //             "type": "Technical",
        //             "difficulty": "Medium",
        //             "expectedAnswerTimeMinutes": 5,
        //             "skillsTested": ["Authentication", "Backend", "Security"],
        //             "followUps": [
        //                 "How do you handle token expiration?",
        //                 "What are the security risks of JWT?"
        //             ]
        //         }
        //     ]
        // }

        // useEffect(() => {
        //     if (generatedInterviewQuestion) {
        //     }
        // }, [generatedInterviewQuestion])

        // const onSubmit = async (data) => {
        //     try {
        //         await generateInterviewQuestionFn(data);
        //     } catch (error) {
        //         toast.error(error.message || "Failed to generate cover letter");
        //     }
    }

    const dummyResult = {
        "success": true,
        "data": {
            "session": {
                "id": "cmpi3hkk70003m6erm8dly6ym",
                "sessionToken": "cmpi3hkk70003m6erm8dly6ym",
                "userId": "user_123456",
                "type": "MOCK_INTERVIEW",
                "status": "SUBMITTED",
                "payload": {
                    "companyName": "Google",
                    "jobTitle": "Frontend Developer",
                    "interviewType": "Technical Interview",
                    "finalEvaluation": {
                        "overallScore": 52,
                        "communicationScore": 58,
                        "technicalScore": 49,
                        "problemSolvingScore": 50,
                        "behavioralScore": 55,
                        "confidenceScore": 53,
                        "strengths": [
                            "Explained project experience clearly."
                        ],
                        "weaknesses": [
                            "Technical answers lacked depth."
                        ],
                        "improvementTips": [
                            "Practice more technical mock interviews."
                        ],
                        "finalFeedback": "Candidate showed average interview performance with limited technical depth.",
                        "hiringRecommendation": "Neutral"
                    }
                },
                "durationSeconds": 47,
                "creditsUsed": 22,
                "submittedAt": "2026-05-23T18:30:00.000Z",
                "createdAt": "2026-05-23T18:20:00.000Z",
                "updatedAt": "2026-05-23T18:30:00.000Z",

                "result": {
                    "id": "cmpi3jc0a0007m6ero3s60io2",
                    "sessionId": "cmpi3hkk70003m6erm8dly6ym",
                    "userId": "user_123456",
                    "type": "MOCK_INTERVIEW",
                    "score": 52,
                    "metadata": {
                        "communicationScore": 58,
                        "technicalScore": 49,
                        "confidenceScore": 53,
                        "problemSolvingScore": 50,
                        "behavioralScore": 55,
                        "hiringRecommendation": "Neutral"
                    },
                    "result": {
                        "overallScore": 52,
                        "communicationScore": 58,
                        "technicalScore": 49,
                        "problemSolvingScore": 50,
                        "behavioralScore": 55,
                        "confidenceScore": 53,
                        "strengths": [
                            "Explained project experience clearly."
                        ],
                        "weaknesses": [
                            "Technical answers lacked depth."
                        ],
                        "improvementTips": [
                            "Practice more technical mock interviews."
                        ],
                        "finalFeedback": "Candidate showed average interview performance with limited technical depth.",
                        "hiringRecommendation": "Reject"
                    },
                    "improvementTip": "Practice more technical mock interviews.",
                    "createdAt": "2026-05-23T18:30:00.000Z",
                    "updatedAt": "2026-05-23T18:30:00.000Z"
                }
            },

            "updatedCredits": 9978,

            "userName": "ROKI MONDAL"
        }
    }

    useEffect(() => {
        console.log(result);
    }, [result]);

    useEffect(() => {
        if (generatedInterviewQuestion) {
            setStep(5);
        }
    }, [generatedInterviewQuestion])

    const handleStartInterview = async () => {
        try {
            await generateInterviewQuestionFn({ ...formData, resumeContent });
        } catch (error) {
            toast.error(error.message || "Failed to generate interview Question");
        }
    }

    const handleEndInterview = async (data) => {
        console.log(data);
        setStep(6);
        try {
            await evaluateFn({ ...data, sessionToken: generatedInterviewQuestion.data.sessionToken });
        } catch (error) {
            toast.error(error.message || "Failed to evaluate interview");
        }
    }

    switch (step) {
        case 1:
            return (
                <IntroductionPage setStep={setStep} />
            )

        case 2:
            return (
                <InterviewForm setStep={setStep} setFormData={setFormData} />
            )

        case 3:
            return (
                <ResumeSelector setResumeContent={setResumeContent} setAfterResumePage={setAfterResumePage} />
            )

        case 4:
            return (
                <Instructions handleStartInterview={handleStartInterview} startingInterview={generating} />
            )

        case 5:
            return (
                <Interview generatedInterviewData={generatedInterviewQuestion.data} handleEndInterview={handleEndInterview} />
                // <Interviewer />
            )

        case 6:
            return (
                <InterviewResult result={result} evaluating={evaluating} />
            )

        default:
            return null;
    }

    return (
        <div>Step</div>
    )
}

export default InterviewPageSteps