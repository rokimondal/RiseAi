"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    Lock,
    PlayCircle,
    Building2,
    Briefcase,
    XCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BarLoader } from "react-spinners";

const getRoundTypeLabel = (type) => {
    switch (type) {
        case "MOCK_INTERVIEW":
            return "Mock Interview";

        case "CODING_ASSESSMENT":
            return "Coding Round";

        case "ASSESSMENT_CENTER":
            return "Assessment Round";

        default:
            return type;
    }
};

const MainSimulationPage = ({ planData, setCurrRoundData, loading }) => {

    console.log(planData);

    if (loading) {
        return <BarLoader className='mt-4' width={"100%"} color='gray' />
    }

    if (!loading && !planData) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <Card className="shadow-none border-none">
                    <CardContent className="p-6 text-center">
                        <h2 className="text-lg font-semibold">No Data Found</h2>
                        <p className="text-sm text-muted-foreground mt-2">
                            Unable to load the simulation plan.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }


    const simulation = planData?.session?.payload;

    const metadata = simulation?.simulationMetadata;

    const rounds = simulation?.rounds || [];

    const completedRounds = rounds.filter(
        (r) => r.status === "PASSED"
    ).length;

    const currentRound = rounds.find(
        (r) =>
            r.status === "PENDING" ||
            r.status === "IN_PROGRESS"
    );

    const progress =
        metadata?.totalRounds > 0
            ? Math.round(
                (completedRounds / metadata.totalRounds) * 100
            )
            : 0;

    const expiresAt = new Date(planData.session.expiresAt);

    const daysLeft = Math.max(
        0,
        Math.ceil(
            (expiresAt.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
    );

    const handleStartRound = async () => {
        setCurrRoundData(currentRound);
    }

    return (
        <div className="max-w-5xl mx-auto px-3 py-4 md:px-6 md:py-6 space-y-4 md:space-y-6">

            {/* Hero */}

            <Card>
                <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">
                                {metadata.companyName}
                            </h1>

                            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                                <Briefcase className="w-4 h-4" />
                                <span>{metadata.role}</span>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-4">
                                <Badge>
                                    {metadata.experienceLevel}
                                </Badge>

                                <Badge variant="secondary">
                                    {metadata.hiringType}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-3">

                            <div className="rounded-lg p-3 text-center">
                                <p className="text-xs text-muted-foreground">
                                    Time Remaining
                                </p>

                                <p className="text-lg font-bold">
                                    {daysLeft}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    Days
                                </p>
                            </div>

                            <div className="rounded-lg p-3 text-center">
                                <p className="text-xs text-muted-foreground">
                                    Rounds
                                </p>

                                <p className="text-lg font-bold">
                                    {metadata.totalRounds}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    Total
                                </p>
                            </div>

                            <div className="rounded-lg p-3 text-center">
                                <p className="text-xs text-muted-foreground">
                                    Progress
                                </p>

                                <p className="text-lg font-bold">
                                    {progress}%
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    Complete
                                </p>
                            </div>

                        </div>

                    </div>

                    <Progress value={progress} className="mt-2" />
                </CardContent>
            </Card>

            {/* Current Round */}

            {currentRound && (
                <Card className="border-primary shadow-md">

                    <CardContent className="p-4 md:p-6">

                        <Badge className="mb-3">
                            Active Round
                        </Badge>

                        <h2 className="text-lg font-semibold">
                            {currentRound.roundName}
                        </h2>

                        <p className="text-sm text-muted-foreground mt-2">
                            {currentRound.purpose}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-4">
                            <Badge>
                                {getRoundTypeLabel(currentRound.roundType)}
                            </Badge>

                            <Badge variant="secondary">
                                {currentRound.difficulty}
                            </Badge>

                            <Badge variant="outline">
                                Pass: {currentRound.passingScore}%
                            </Badge>
                        </div>

                        <Button
                            onClick={handleStartRound}
                            className="w-full sm:w-auto mt-5"
                        >
                            Start Round
                        </Button>

                    </CardContent>

                </Card>
            )}

            {/* Timeline */}

            <Card>

                <CardContent className="p-4 md:p-6">

                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">
                            Hiring Process
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            Track your progress through each hiring stage
                        </p>
                    </div>

                    <div className="relative">

                        {/* Desktop Timeline Line */}

                        <div className="space-y-5">

                            {rounds.map((round, index) => {

                                const isPassed =
                                    round.status === "PASSED";

                                const isCurrent =
                                    round.status === "PENDING" ||
                                    round.status === "IN_PROGRESS";

                                const isLocked =
                                    round.status === "LOCKED";

                                const isFailed = round.status === "FAILED";

                                return (
                                    <div
                                        key={round.roundId}
                                        className="relative flex gap-4"
                                    >

                                        {/* Timeline Icon */}

                                        <div className="relative shrink-0">

                                            {isPassed && (
                                                <div className="relative z-10 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                </div>
                                            )}

                                            {isCurrent && (
                                                <div className="relative z-10 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <PlayCircle className="h-5 w-5 text-blue-600" />
                                                </div>
                                            )}

                                            {isLocked && (
                                                <div className="relative z-10 h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                    <Lock className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                            )}

                                            {isFailed && (
                                                <div className="relative z-10 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                                    <XCircle className="h-5 w-5 text-red-600" />
                                                </div>
                                            )}

                                            {index !== rounds.length - 1 && (
                                                <div className="absolute left-1/2 top-10 -translate-x-1/2 h-[calc(100%+20px)] w-[2px] bg-border" />
                                            )}

                                        </div>

                                        {/* Round Card */}

                                        <Card
                                            className={`flex-1 ${isCurrent
                                                ? "border-primary shadow-sm"
                                                : ""
                                                }`}
                                        >
                                            <CardContent className="p-4">

                                                <div className="flex flex-col gap-3">

                                                    <div>
                                                        <h3 className="font-semibold">
                                                            {round.roundName}
                                                        </h3>

                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {round.purpose}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">

                                                        <Badge variant="secondary">
                                                            {getRoundTypeLabel(round.roundType)}
                                                        </Badge>

                                                        <Badge>
                                                            {round.difficulty}
                                                        </Badge>

                                                        <Badge variant="outline">
                                                            Pass: {round.passingScore}%
                                                        </Badge>

                                                    </div>

                                                </div>

                                            </CardContent>
                                        </Card>

                                    </div>
                                );
                            })}

                        </div>

                    </div>

                </CardContent>

            </Card>

        </div>
    );
};

export default MainSimulationPage;