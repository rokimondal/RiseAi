"use client"

import { evaluateAssessmentCenter, StartExistingAssessmentSession } from "@/actions/assessment-center";
import { getSessionDetails, getSessionResultDetails } from "@/actions/sessions";
import useFetch from "@/hooks/use-fetch";
import { useEffect, useState } from "react";
import InstructionPage from "./InstructionPage";
import AssessmentPage from "./AssessmentPage";
import AssessmentResult from "./AssessmentResult";
import { BarLoader } from "react-spinners";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


export default function ReTakeAssessment({ id }) {

    const router = useRouter();

    const [step, setStep] = useState(1);
    const [assessmentData, setAssessmentData] = useState(null);
    const { fn: getSessionFn, data: sessionData } = useFetch(getSessionResultDetails);
    const { loading: fetchingAssessment, fn: getAssessmentFn, data: fetchedAssessmentData } = useFetch(StartExistingAssessmentSession);
    const { loading: evaluating, fn: evaluationFn, data: evaluatedData } = useFetch(evaluateAssessmentCenter);

    const [fetchingSession, setFetchingSession] = useState(true)
    useEffect(() => {
        const fetchSession = async () => {
            await getSessionFn({ sessionId: id });
        };

        fetchSession();
    }, []);

    useEffect(() => {
        if (sessionData) {
            if (sessionData?.data?.session?.result != null) {
                setStep(3)
            }
            console.log(sessionData)
            setFetchingSession(false);
        }
    }, [sessionData])

    useEffect(() => {
        if (fetchedAssessmentData) {
            const data = fetchedAssessmentData;

            setAssessmentData(data);
            console.log(data);
            setStep(2);
        }
    }, [fetchedAssessmentData])

    useEffect(() => {
        if (!evaluatedData) return;
        console.log(evaluatedData);
        setStep(3);
    }, [evaluatedData])

    const session = sessionData?.data?.session;

    const handleStartAssessment = async () => {
        try {
            console.log(session)
            console.log("getSession")
            await getAssessmentFn({
                sessionToken: session.sessionToken,
            });

        } catch (error) {
            console.error("Failed to start assessment:", error);
            toast.error(error.message || "Failed to start assessmentt");
        }
    };

    const handleEvaluateAssessment = async (value) => {
        console.log(value)

        try {
            await evaluationFn(value);
        } catch (error) {
            toast.error(error.message || "Failed to evaluate assesment");
        }
    }

    if (fetchingSession) {
        return <BarLoader className='mt-4' width={"100%"} color='gray' />
    }

    const startedAt = new Date(session.startedAt);
    const today = new Date();

    const alreadyStartedToday =
        startedAt.toDateString() === today.toDateString();
    if (alreadyStartedToday && session.status == "STARTED") {
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

    switch (step) {
        case 1:
            return (
                <InstructionPage setStep={setStep} type={"hiring"} handleStartAssesment={handleStartAssessment} generatingAssesment={fetchingAssessment} />
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
                            onClick={() => router.back()}
                        >
                            Back
                        </Button>
                    </div>

                    <AssessmentResult result={evaluatedData || sessionData} />
                </div>
            );
        default:
            return null;
    }

    return (
        <div>{id}</div>
    )
}