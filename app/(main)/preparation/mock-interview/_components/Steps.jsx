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

const Steps = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(null);

    const { loading: generating, fn: generateInterviewQuestionFn, data: generatedInterviewQuestion } = useFetch(generateInterviewQuestion);



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
        console.log("updated form data: ", formData)
    }, [formData])



    if (step == 1) {
        return (
            <IntroductionPage setStep={setStep} />
        )
    }

    if (step == 2) {
        return (
            <InterviewForm setStep={setStep} setFormData={setFormData} />
        )
    }

    if (step == 3) {
        return (<>skeudfhb</>);
    }

    return (
        <div>Steps</div>
    )
}

export default Steps