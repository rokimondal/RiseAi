"use client"

import { evaluationRound, simulationInterviewGenerator } from '@/actions/company-simulation';
import { startExistingInterviewSession } from '@/actions/mock-interview';
import { getSessionDetails } from '@/actions/sessions';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/use-fetch';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { BarLoader } from 'react-spinners';
import IntroductionPage from '../../mock-interview/_components/IntroductionPage';
import Instructions from '../../mock-interview/_components/Instructions';
import Interview from '../../mock-interview/_components/Interview';
import InterviewResult from '../../mock-interview/_components/InterviewResult';
import { toast } from 'sonner';

const SimulationInterviewSteps = ({ roundData, metaData, handleBackToMainPage }) => {

    const [step, setStep] = useState(1);
    const [assessmentData, setAssessmentData] = useState(null);

    const { loading: fetchingSession, fn: getSessionFn, data: sessionData } = useFetch(getSessionDetails);
    const { loading: fetchingAssessment, fn: getAssessmentFn, data: fetchedAssessmentData } = useFetch(startExistingInterviewSession);
    const { loading: generatingAssessment, fn: generateAssessmentFn, data: generatedAssessmentData } = useFetch(simulationInterviewGenerator);
    const { loading: evaluating, fn: evaluationFn, data: evaluatedData } = useFetch(evaluationRound);

    const router = useRouter();

    useEffect(() => {
        const fetchSession = async () => {
            if (roundData.sessionId) {
                await getSessionFn({ sessionId: roundData.sessionId });
            }
        };

        fetchSession();
    }, [roundData.sessionId]);

    useEffect(() => {
        if (fetchedAssessmentData || generatedAssessmentData) {
            const data = fetchedAssessmentData || generatedAssessmentData;

            setAssessmentData(data);
            console.log(data);
            setStep(3);
        }
    }, [fetchedAssessmentData, generatedAssessmentData])

    useEffect(() => {
        if (!evaluatedData) return;
        console.log(evaluatedData);
        setStep(4);
    }, [evaluatedData])



    const session = sessionData?.data?.session;

    const handleStartAssessment = async () => {
        try {
            // Existing assessment session
            console.log(roundData)
            if (roundData.sessionId) {
                console.log("getSession")
                await getAssessmentFn({
                    sessionToken: session.sessionToken,
                });
            }
            // Generate new assessment
            else {
                console.log("generatetSession")
                await generateAssessmentFn({
                    parentSessionId: metaData.parentSessionId,
                    roundId: roundData.roundId,
                    companyName: metaData.companyName,
                    jobTitle: metaData.role,
                    jobDescription: metaData.jobDescription,
                    interviewType: roundData.metadata.interviewType,
                    resumeContent: metaData.resumeContent,
                    followups: roundData.metadata.followups,
                    topics: roundData.metadata.topics,
                });
            }
        } catch (error) {
            console.error("Failed to start interview:", error);
            toast.error(error.message || "Failed to start interview");
        }
    };

    const handleEvaluateAssessment = async (value) => {
        console.log("inside evaluation fn", assessmentData.data)

        try {
            const payload = {
                parentSessionId: metaData.parentSessionId,
                roundId: roundData.roundId,
                roundSessionToken: assessmentData.data.sessionToken,
                timeTaken: value.timeTaken,
                answeres: value.conversation
            }
            console.log("payload----", payload);
            setStep(4);
            await evaluationFn(payload);
        } catch (error) {
            toast.error(error.message || "Failed to evaluate assesment");
        }
    }

    const handlePendingEvaluation = async () => {
        try {
            await evaluationFn({
                parentSessionId: metaData.parentSessionId,
                roundId: roundData.roundId,
                roundSessionToken: session.sessionToken,
            });
        } catch (error) {
            toast.error(error.message || "Failed to evaluate assessment");
        }
    };

    // const sessionStatus = sessionData?.data?.session?.status;  // STARTED  SUBMITTED  EVALUATION_PENDING  EXPIRED
    // console.log(sessionStatus);

    if (fetchingSession) {
        return <BarLoader className='mt-4' width={"100%"} color='gray' />
    }



    if (!fetchingSession && session) {

        const showEvaluationButton = ["EVALUATION_PENDING", "SUBMITTED", "FAILED",].includes(session.status);

        if (showEvaluationButton) {
            return (
                <div className="w-full min-h-[300px] flex flex-col items-center justify-center gap-4 text-center p-6">
                    <p className="text-lg font-medium">
                        Assessment submitted successfully
                    </p>

                    <p className="text-sm text-muted-foreground">
                        Evaluate your assessment to view the result and continue the simulation.
                    </p>

                    <Button onClick={handlePendingEvaluation}>
                        Evaluate Interview
                    </Button>
                </div>
            );
        }

        const startedAt = new Date(session.startedAt);
        const today = new Date();

        const alreadyStartedToday =
            startedAt.toDateString() === today.toDateString();

        if (alreadyStartedToday) {
            return (
                <div className="w-full min-h-[300px] flex flex-col items-center justify-center gap-4 text-center  p-6">
                    <p className="text-lg font-medium text-muted-foreground">
                        Assessment already started today
                    </p>

                    <Button onClick={() => router.back()}>
                        Back
                    </Button>
                </div>
            );
        }
    }





    switch (step) {
        case 1:
            return (
                <IntroductionPage setStep={setStep} />
            )

        case 2:
            return (
                <Instructions handleStartInterview={handleStartAssessment} startingInterview={fetchingAssessment || generatingAssessment} />
            )

        case 3:
            return (
                <Interview generatedInterviewData={assessmentData.data} handleEndInterview={handleEvaluateAssessment} />
            )

        case 4:
            return (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            onClick={handleBackToMainPage}
                        >
                            Back To Main Simulation Page
                        </Button>
                    </div>
                    <InterviewResult result={evaluatedData} evaluating={evaluating} />
                </div>
            );
        default:
            return null;
    }

    return (
        <div>{JSON.stringify(sessionData)}Assessment{JSON.stringify(roundData, null, 2)}</div>
    )
}

export default SimulationInterviewSteps