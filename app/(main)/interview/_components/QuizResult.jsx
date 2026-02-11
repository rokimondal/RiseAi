import { CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';
import React from 'react'
import QuestionAnswereCard from './QuestionAnswereCard';
import { Button } from '@/components/ui/button';

const QuizResult = ({ result, hideStartNew = false, onStartNew }) => {

    if (!result) return null;
    console.log(result);
    return (
        <div className='mx-auto'>
            <h1 className='flex items-center gap-2 text-3xl gradient-title'>
                <Trophy className='h-6 w-6 text-yellow-500' />
                Quiz Results
            </h1>
            
            <CardContent className="space-y-6">
                <div className="text-center space-y-2">
                    <h3 className='text-2xl font-bold'>{result.quizScore.toFixed(1)}%</h3>
                    <Progress className="w-full" value={result.quizScore} />
                </div>

                {result.improvementTip && (
                    <div className='bg-muted p-4 rounded-lg'>
                        <p className='font-medium'>Improvement Tip: </p>
                        <p className='text-muted-foreground'>{result.improvementTip}</p>
                    </div>
                )}

                <div className='space-y-4 mt-2'>
                    <h3 className='font-medium'>Question Review</h3>
                    {result.questions.map((q, index) => (
                        <QuestionAnswereCard key={index} q={q} />
                    ))}
                </div>

                {!hideStartNew && (
                    <CardFooter>
                        <Button onClick={onStartNew} className="w-full">
                            Start New Quiz
                        </Button>
                    </CardFooter>
                )}
            </CardContent>
        </div>
    )
}

export default QuizResult