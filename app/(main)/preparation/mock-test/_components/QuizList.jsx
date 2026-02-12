"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { format } from 'date-fns/format'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import QuizResult from './QuizResult'

const QuizList = ({ assessments }) => {

    const router = useRouter();
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    return (
        <>
            <Card>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <div className=''>
                            <CardTitle className="text-md">Recent Quizzes</CardTitle>
                            <CardDescription className="text-sm">Review your past quiz performance</CardDescription>
                        </div>
                        <Button onClick={() => router.push("/preparation/mock-test")}>
                            Start New Quiz
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        {assessments.map((assessment, index) => (
                            <Card
                                key={index}
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => setSelectedQuiz(assessment)}
                            >
                                <CardHeader>
                                    <CardTitle className="gradient-title text-2xl">Quiz {index + 1}</CardTitle>
                                    <CardDescription className="flex justify-between w-full">
                                        <div>Score: {assessment.quizScore.toFixed(1)}%</div>
                                        <div>{format(new Date(assessment.createdAt), "MMMM dd, yyyy HH:mm")}</div>
                                    </CardDescription>
                                </CardHeader>
                                {assessment.improvementTip && <CardContent>
                                    <p className='text-sm text-muted-foreground'>{assessment.improvementTip}</p>
                                </CardContent>}
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
                <DialogContent className="w-full max-w-6xl sm:max-w-lg md:max-w-3xl lg:max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle></DialogTitle>
                        <DialogDescription asChild>
                            {
                                <QuizResult
                                    result={selectedQuiz}
                                    onStartNew={() => router.push("/interview/mock")}
                                    hideStartNew
                                />
                            }
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default QuizList