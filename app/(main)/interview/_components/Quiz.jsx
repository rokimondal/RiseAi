"use client"

import { generateQuiz, saveQuizResult } from '@/actions/interview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import useFetch from '@/hooks/use-fetch';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { BarLoader } from 'react-spinners';
import { toast } from 'sonner';
import QuizResult from './QuizResult';


const Quiz = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [showExplanation, setShowExplanation] = useState(false);


    const { data: quizData, loading: generatingQuiz, fn: generateQuizFn } = useFetch(generateQuiz);
    const { data: resultData, loading: savingResult, fn: saveQuizResultFn, setData: setResultData } = useFetch(saveQuizResult);


    useEffect(() => {
        if (quizData) {
            setAnswers(new Array(quizData.length).fill(null));
        }
    }, [quizData]);

    const handleAnswere = (answer) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = answer;
        setAnswers(newAnswers);
    }

    const calculateScore = () => {
        let correct = 0;
        answers.forEach((ans, index) => {
            if (ans.trim() == quizData[index].correctAnswer.trim()) {
                correct++;
            }
        })
        return ((correct * 100) / quizData.length);
    }
    const finishQuiz = async () => {
        const score = calculateScore();
        try {
            await saveQuizResultFn(quizData, answers, score);
            toast.success("Quiz completed!")
        } catch (error) {
            toast.error(error.message || "Failed to save quiz results")
        }
    }

    const handleNextQuestion = () => {
        if (currentQuestion < quizData.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setShowExplanation(false);
        } else {
            finishQuiz();
        }
    }

    const startNewQuiz = () => {
        setCurrentQuestion(0);
        setAnswers([]);
        setShowExplanation(false);
        generateQuizFn();
        setResultData(null)
    }

    if (resultData) {
        return (
            <div className='mx-2'>
                <QuizResult result={resultData} onStartNew={startNewQuiz} />
            </div>
        )
    }

    if (generatingQuiz) {
        return <BarLoader className='mt-4' width={"100%"} color='gray' />
    }

    if (!quizData) {
        return (
            <Card className="mx-2">
                <CardHeader>
                    <CardTitle>Ready to test your knowledge?</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This quiz contains 10 questions specific to your industry and
                        skills. Take your time and choose the best answer for each question.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button onClick={generateQuizFn} className="w-full">
                        Start Quiz
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    const question = quizData[currentQuestion];

    return (
        <Card className="mx-2">
            <CardHeader>
                <CardTitle className="text-muted-foreground">
                    Question {currentQuestion + 1} of {quizData.length}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <p className="text-lg font-medium">{question.question}</p>

                <RadioGroup
                    className="space-y-2"
                    onValueChange={handleAnswere}
                    value={answers[currentQuestion]}
                >
                    {question.options.map((option, index) => (
                        <div className="flex items-center space-x-2" key={index}>
                            <RadioGroupItem
                                value={option}
                                id={`option-${index}`}
                                disabled={showExplanation} />
                            <Label htmlFor={`option-${index}`}>{option}</Label>
                        </div>
                    ))}
                </RadioGroup>

                {showExplanation && (
                    <div className='mt-4 p-4 bg-muted rounded-lg'>
                        <p className='font-medium'>Explanation: </p>
                        <p className='text-muted-foreground'>{question.explanation}</p>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                {!showExplanation && (
                    <Button
                        onClick={() => setShowExplanation(true)}
                        variant="outline"
                        disabled={!answers[currentQuestion]}
                    >
                        Show Explanation
                    </Button>
                )}

                <Button
                    onClick={handleNextQuestion}
                    className="ml-auto flex text-center"
                    disabled={!answers[currentQuestion] || savingResult}
                >
                    {savingResult ? <Loader2 className='h-4 w-4 animate-spin' /> : currentQuestion < quizData.length - 1 ? "Next Question" : "Finish Quiz"}
                </Button>
            </CardFooter>
        </Card>
    )
}

export default Quiz