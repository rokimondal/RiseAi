"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import QuizResult from '../../preparation/mock-test/_components/QuizResult';
import { format } from 'date-fns';
import { getSessionResultDetails } from '@/actions/sessions';
import useFetch from '@/hooks/use-fetch';
import InterviewResult from '../../preparation/mock-interview/_components/InterviewResult';
import CodingResult from '../../preparation/company-coding-round/_components/CodingResult';
import AssessmentResult from '../../preparation/assessment-center/_components/AssessmentResult';
import { BarLoader } from 'react-spinners';
import { toast } from 'sonner';

const History = ({ assessmentsData }) => {

    const router = useRouter();
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const { loading: fetchingResult, fn: fetchResultFn, data: fetchedResult } = useFetch(getSessionResultDetails);

    const handleFetchSimulationResult = async (assessment) => {
        console.log(assessment)
        setSelectedQuiz(assessment);
        setIsOpen(true);

        if (assessment.type == "COMPANY_SIMULATION") {
            return;
        }

        if (assessment.source === "SIMULATION") {
            // await fetchResultFn({ sessionId: assessment?.sessionId });
            await fetchResultFn({
                sessionId: assessment?.id,
                // sessionToken: null
            });
        }
    }

    const handleTakeTest = async (assessment) => {
        switch (assessment.type) {
            case "ASSESSMENT_CENTER":
                router.push(`/preparation/assessment-center/${assessment.id}`);
                break;

            case "CODING_ROUND":
                router.push(`/preparation/company-coding-round/${assessment.id}`);
                break;

            case "MOCK_INTERVIEW":
                router.push(`/preparation/mock-interview/${assessment.id}`);
                break;

            case "COMPANY_SIMULATION":
                router.push(`/preparation/company-simulation/${assessment.id}`);
                break;

            default:
                // console.error("Unknown assessment type:", assessment.type);
                toast.error("Unknown assessment type")
        }
    }

    useEffect(() => {
        console.log(fetchedResult)
    }, [fetchedResult])

    console.log(assessmentsData)
    return (
        <div>
            <>
                <Card>
                    <CardHeader>
                        <div className='flex items-center justify-between'>
                            <div className=''>
                                <CardTitle className="text-md">Recent History</CardTitle>
                                <CardDescription className="text-sm">Review your past quizzes and simulations</CardDescription>
                            </div>
                            <Button onClick={() => router.push("/preparation")}>
                                Start New Test
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            {assessmentsData.map((assessment, index) => (

                                (assessment.source === "ASSESSMENT") ? (
                                    <Card
                                        key={index}
                                        className="hover:bg-muted/50 transition-colors"
                                    >
                                        <CardHeader>
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <CardTitle className="gradient-title text-2xl">{assessment.title}</CardTitle>
                                                    <CardDescription className="flex flex-col md:flex-row md:gap-2 justify-between w-full">
                                                        <div>Score: {assessment.score.toFixed(1)}%</div>
                                                        <div className='text-muted-foreground'>{format(new Date(assessment.createdAt), "MMMM dd, yyyy HH:mm")}</div>

                                                    </CardDescription>
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    className="cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedQuiz({
                                                            ...assessment,
                                                            quizScore: assessment.score,
                                                        })
                                                        setIsOpen(true)
                                                    }
                                                    }
                                                >
                                                    View Result
                                                    {/* <Trophy className="mr h-4 w-4" /> */}
                                                </Button>

                                            </div>
                                        </CardHeader>
                                        {/* {assessment.improvementTip && <CardContent>
                                            <p className='text-sm text-muted-foreground'>{assessment.improvementTip}</p>
                                        </CardContent>} */}
                                    </Card>
                                ) : (<Card
                                    key={index}
                                    className="hover:bg-muted/50 transition-colors"
                                >
                                    <CardHeader>
                                        <div className="flex items-center justify-between gap-4">

                                            {/* Left */}
                                            <div>
                                                <CardTitle className="gradient-title text-2xl">
                                                    {assessment.title}
                                                </CardTitle>

                                                <CardDescription className="flex flex-col md:flex-row md:gap-6">
                                                    {assessment.action === "RESULT" &&
                                                        assessment.type !== "COMPANY_SIMULATION" && (
                                                            <div>
                                                                Score: {assessment.score?.toFixed(1)}%
                                                            </div>
                                                        )}

                                                    <div className="text-muted-foreground">
                                                        {format(
                                                            new Date(assessment.createdAt),
                                                            "MMMM dd, yyyy HH:mm"
                                                        )}
                                                    </div>
                                                </CardDescription>
                                            </div>

                                            {/* Right */}
                                            {assessment.action === "RESULT" && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleFetchSimulationResult(assessment)
                                                    }
                                                >
                                                    View Result
                                                </Button>
                                            )}

                                            {assessment.action === "TAKE_TEST" && (
                                                <Button
                                                    onClick={() => handleTakeTest(assessment)}
                                                >
                                                    Take Test
                                                </Button>
                                            )}

                                            {assessment.action === "EVALUATE" && (
                                                <Button variant="outline">
                                                    Evaluation Pending
                                                </Button>
                                            )}

                                            {assessment.action === "ATTEMPTED_TODAY" && (
                                                <Button variant="secondary" disabled>
                                                    Attempted Today
                                                </Button>
                                            )}

                                            {assessment.action === "EXPIRED" && (
                                                <Button
                                                    variant="ghost"
                                                    disabled
                                                // className="text-red-500"
                                                >
                                                    Expired
                                                </Button>
                                            )}

                                        </div>
                                    </CardHeader>
                                </Card>)
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={isOpen} onOpenChange={() => {
                    setIsOpen(false)

                    setSelectedQuiz(null)
                }}>
                    <DialogContent className=" max-w-6xl sm:max-w-lg md:max-w-3xl lg:max-w-5xl max-h-[90vh] overflow-y-auto w-[95vw] h-[85vh]">
                        <DialogHeader>
                            <DialogTitle>
                                {selectedQuiz?.title}
                            </DialogTitle>
                            {fetchingResult && (
                                <div className="py-2">
                                    <BarLoader width={"100%"} color="gray" />
                                </div>
                            )}
                        </DialogHeader>
                        <div className='h-full overflow-y-auto'>
                            {(!fetchingResult &&
                                selectedQuiz?.source === "ASSESSMENT" &&
                                selectedQuiz?.type === "ASSESSMENT") && (
                                    <QuizResult
                                        result={selectedQuiz}
                                        onStartNew={() => router.push("/preparation/mock-test")}
                                    />
                                )}

                            {!fetchingResult &&
                                selectedQuiz?.source === "SIMULATION" &&
                                selectedQuiz?.type === "COMPANY_SIMULATION" && (
                                    <div className="text-center py-10">
                                        {selectedQuiz?.simulationResult === "PASSED" && (
                                            <>
                                                <h2 className="text-2xl font-bold">🎉 Congratulations!</h2>
                                                <p className="mt-2 text-muted-foreground">
                                                    You have successfully passed the company hiring simulation.
                                                </p>
                                            </>
                                        )}

                                        {selectedQuiz?.simulationResult === "FAILED" && (
                                            <>
                                                <h2 className="text-2xl font-bold">Failed</h2>
                                                <p className="mt-2 text-muted-foreground">
                                                    Unfortunately, you did not pass the company hiring simulation.
                                                </p>
                                            </>
                                        )}
                                    </div>
                                )}

                            {!fetchingResult &&
                                selectedQuiz?.source === "SIMULATION" &&
                                fetchedResult?.success && (
                                    <>
                                        {selectedQuiz.type === "MOCK_INTERVIEW" && (
                                            <InterviewResult
                                                result={fetchedResult}
                                            />
                                        )}

                                        {selectedQuiz.type === "CODING_ROUND" && (
                                            <CodingResult
                                                assessmentResult={fetchedResult}
                                            />
                                        )}

                                        {selectedQuiz.type === "ASSESSMENT_CENTER" && (
                                            <AssessmentResult
                                                result={fetchedResult}
                                            />
                                        )}
                                    </>
                                )}

                            {!fetchingResult &&
                                selectedQuiz?.source === "SIMULATION" &&
                                selectedQuiz?.type !== "COMPANY_SIMULATION" &&
                                !fetchedResult?.success && (
                                    <div className="text-center py-10">
                                        Result not found
                                    </div>
                                )}
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        </div>
    )
}

export default History