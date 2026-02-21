"use client"

import { generateInterviewQuestion } from '@/actions/mock-interview';
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

const Steps = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(null);
    const [resumeContent, setResumeContent] = useState("");
    const [startingInterview, setStartingInterview] = useState(false);

    const { loading: generating, fn: generateInterviewQuestionFn, data: generatedInterviewQuestion } = useFetch(generateInterviewQuestion);

    useEffect(() => {
        console.log("formdata: ", formData);
        console.log("resumeContent: ", resumeContent);
    }, [formData, resumeContent]);

    const dumyGeneratedInterviewQuestion = {
        "interviewType": "Technical",
        "jobTitle": "Software Developer Engineer I",
        "totalDuration": 1.1,
        "questions": [
            {
                "id": "q1",
                "question": "Tell me about yourself and your background in software development.",
                "type": "Introduction",
                "difficulty": "Easy",
                "expectedAnswerTimeMinutes": 2,
                "skillsTested": ["Communication", "Self-awareness"],
                "followUps": []
            },
            {
                "id": "q2",
                "question": "Explain how JWT authentication works in a MERN stack application.",
                "type": "Technical",
                "difficulty": "Medium",
                "expectedAnswerTimeMinutes": 5,
                "skillsTested": ["Authentication", "Backend", "Security"],
                "followUps": [
                    "How do you handle token expiration?",
                    "What are the security risks of JWT?"
                ]
            }
        ]
    }

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
    // }

    useEffect(() => {
        if (generatedInterviewQuestion) {
            setStep(5);
        }
    }, [generatedInterviewQuestion])

    const handleStartInterview = async () => {
        setStartingInterview(true);
        try {
            await generateInterviewQuestionFn({ ...formData, resumeContent });
        } catch (error) {
            toast.error(error.message || "Failed to generate interview Question");
        }
    }

    const handleEndInterview = async (data) => {
        console.log(data);
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
                <ResumeSelector setResumeContent={setResumeContent} setStep={setStep} />
            )

        case 4:
            return (
                <Instructions handleStartInterview={handleStartInterview} startingInterview={startingInterview} />
            )

        case 5:
            return (
                <Interview generatedInterviewData={generatedInterviewQuestion.data} handleEndInterview={handleEndInterview} />
                // <Interviewer />
            )

        case 6:
            return (
                <InterviewResult />
            )

        default:
            return null;
    }

    return (
        <div>Step</div>
    )
}

export default Steps