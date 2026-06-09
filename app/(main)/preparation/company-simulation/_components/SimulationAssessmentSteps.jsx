"use client"

import { StartExistingAssessmentSession } from '@/actions/assessment-center';
import { evaluationRound, simulationAssessmentCenterGenerator } from '@/actions/company-simulation';
import { getSessionDetails } from '@/actions/sessions';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/use-fetch';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { BarLoader } from 'react-spinners';
import AssessmentPage from '../../assessment-center/_components/AssessmentPage';
import InstructionPage from '../../assessment-center/_components/InstructionPage';
import AssessmentResult from '../../assessment-center/_components/AssessmentResult';
import { toast } from 'sonner';

const SimulationAssessmentSteps = ({ roundData, metaData, handleBackToMainPage }) => {

    const [step, setStep] = useState(1);
    const [assessmentData, setAssessmentData] = useState(null);

    const { loading: fetchingSession, fn: getSessionFn, data: sessionData } = useFetch(getSessionDetails);
    const { loading: fetchingAssessment, fn: getAssessmentFn, data: fetchedAssessmentData } = useFetch(StartExistingAssessmentSession);
    const { loading: generatingAssessment, fn: generateAssessmentFn, data: generatedAssessmentData } = useFetch(simulationAssessmentCenterGenerator);
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
            setStep(2);
        }
    }, [fetchedAssessmentData, generatedAssessmentData])

    useEffect(() => {
        if (!evaluatedData) return;
        console.log(evaluatedData);
        setStep(3);
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
                    role: metaData.role,
                    experienceLevel: metaData.experienceLevel,
                    hiringType: metaData.hiringType,
                    followups: roundData.metadata.followups,
                    topics: roundData.metadata.topics,
                });
            }
        } catch (error) {
            console.error("Failed to start assessment:", error);
            toast.error(error.message || "Failed to start assessmentt");
        }
    };

    const handleEvaluateAssessment = async (value) => {
        console.log(value)

        try {
            const payload = {
                parentSessionId: metaData.parentSessionId,
                roundId: roundData.roundId,
                roundSessionToken: value.sessionToken,
                timeTaken: value.timeTaken,
                answeres: value.userAnswers
            }
            console.log(payload);
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
                        Evaluate Assessment
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
                <InstructionPage setStep={setStep} type={"hiring"} handleStartAssesment={handleStartAssessment} generatingAssesment={fetchingAssessment || generatingAssessment} />
            )

        case 2:
            return (
                <AssessmentPage assessmentData={assessmentData.data} loading={evaluating} handleSubmit={handleEvaluateAssessment} />
            )

        case 3:
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

                    <AssessmentResult result={evaluatedData} />
                </div>
            );
        default:
            return null;
    }

    return (
        <div>{JSON.stringify(sessionData)}Assessment{JSON.stringify(roundData, null, 2)}</div>
    )
}

export default SimulationAssessmentSteps