"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Check, Copy } from "lucide-react";


const recommendationVariant = {
    "Strong Hire": "default",
    "Hire": "secondary",
    "Neutral": "outline",
    "Reject": "destructive",
};

const CodingResult = ({ assessmentResult }) => {
    console.log("assessmentResult:", assessmentResult);

    if (!assessmentResult.success) {
        <Card className="border-none shadow-none" >
            <p>{result.data.message}</p>
        </Card>
    }

    const data = assessmentResult.data;

    if (!data) {
        return (
            <div className="w-full flex items-center justify-center py-20">
                <div className="text-gray-500">
                    No coding assessment result found
                </div>
            </div>
        );
    }

    const session = data?.session;

    const evaluation =
        session?.result?.result;

    const metadata =
        session?.payload?.assessmentMetadata;

    const questionSolutions =
        session?.payload?.QuestionWithSolution || [];

    const totalSeconds =
        session?.durationSeconds || 0;

    const minutes =
        Math.floor(totalSeconds / 60);

    const seconds =
        totalSeconds % 60;

    const formattedDuration =
        `${minutes}m ${seconds}s`;

    function formatDuration(totalSeconds) {

        const hours =
            Math.floor(totalSeconds / 3600);

        const minutes =
            Math.floor((totalSeconds % 3600) / 60);

        const seconds =
            totalSeconds % 60;

        const parts = [];

        if (hours > 0) {
            parts.push(`${hours}h`);
        }

        if (minutes > 0) {
            parts.push(`${minutes}m`);
        }

        if (seconds > 0 || parts.length === 0) {
            parts.push(`${seconds}s`);
        }

        return parts.join(" ");
    }
    const [copied, setCopied] = useState(false);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">

            {/* HEADER */}
            <Card className="border-0 shadow-none">
                <CardContent>
                    <div className="space-y-5">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Coding Assessment Result
                                </h1>

                                <p className="text-muted-foreground">
                                    AI-powered coding evaluation summary
                                </p>
                            </div>

                            <Badge
                                variant={
                                    recommendationVariant[
                                    evaluation?.hiringRecommendation
                                    ] || "outline"
                                }
                                className="w-fit px-4 py-1 text-sm"
                            >
                                {evaluation?.hiringRecommendation}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                            <InfoCard
                                label="Company"
                                value={
                                    metadata?.companyName
                                }
                            />

                            <InfoCard
                                label="Role / Exam"
                                value={
                                    metadata?.examOrRole
                                }
                            />

                            <InfoCard
                                label="Language"
                                value={
                                    metadata?.programmingLanguage
                                }
                            />

                            <InfoCard
                                label="Duration"
                                value={
                                    `${formatDuration(metadata?.timeTaken)} / ${formatDuration(session?.durationSeconds || 0)}`
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SCORES */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                <ScoreCard
                    title="Overall Score"
                    score={evaluation?.overallScore}
                />

                <ScoreCard
                    title="Technical"
                    score={evaluation?.technicalScore}
                />

                <ScoreCard
                    title="Problem Solving"
                    score={evaluation?.problemSolvingScore}
                />

                <ScoreCard
                    title="Code Quality"
                    score={evaluation?.codeQualityScore}
                />

                <ScoreCard
                    title="Algorithm"
                    score={evaluation?.algorithmScore}
                />

                <ScoreCard
                    title="Debugging"
                    score={evaluation?.debuggingScore}
                />
            </div>

            {/* QUESTION ANALYSIS */}

            <div className="space-y-6">

                <div>

                    <h2 className="text-2xl font-bold">
                        Question Analysis
                    </h2>

                    <p className="text-muted-foreground mt-1">
                        Detailed breakdown of each coding question
                    </p>
                </div>

                {
                    evaluation?.questionAnalysis?.map(
                        (question, index) => {

                            const submittedQuestion =
                                questionSolutions.find(
                                    (q) =>
                                        q.questionId ===
                                        question.questionId
                                );

                            return (
                                <Card
                                    key={index}
                                    className="border-0 shadow-sm"
                                >

                                    <CardHeader>
                                        <div className="flex flex-row items-center justify-between gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <CardTitle>
                                                        {question?.title}
                                                    </CardTitle>
                                                    <span
                                                        className={`text-xs px-2 py-1 rounded-full font-medium ${question?.difficulty === "Easy"
                                                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                                            : question?.difficulty === "Medium"
                                                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                                                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                                            }`}
                                                    >
                                                        {question?.difficulty}
                                                    </span>
                                                    <Badge variant="outline">
                                                        {question?.status}
                                                    </Badge>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">

                                                    {/* <span>
                                                        Score:
                                                        {" "}
                                                        <strong>
                                                            {question?.score}/100
                                                        </strong>
                                                    </span> */}

                                                    <span>
                                                        Passed:
                                                        {" "}
                                                        <strong>
                                                            {
                                                                question?.passedTestCases
                                                            }
                                                            /
                                                            {
                                                                question?.totalTestCases
                                                            }
                                                        </strong>
                                                    </span>

                                                    <span>
                                                        Success Rate:
                                                        {" "}
                                                        <strong>
                                                            {
                                                                submittedQuestion?.successRate
                                                            }
                                                            %
                                                        </strong>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-center ">

                                                <CircularProgress
                                                    value={question?.score}
                                                />
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-6">

                                        {/* TEST CASES */}

                                        <div className="space-y-4">

                                            <h3 className="font-semibold text-lg">
                                                Test Case Results
                                            </h3>

                                            <div className="space-y-3">

                                                {
                                                    submittedQuestion?.testCases?.map(
                                                        (testcase, testcaseIndex) => (
                                                            <div
                                                                key={testcaseIndex}
                                                                className="rounded-xl border p-4 space-y-3"
                                                            >

                                                                <div className="flex items-center justify-between">

                                                                    <p className="font-medium">
                                                                        Test Case
                                                                        {" "}
                                                                        {testcaseIndex + 1}
                                                                    </p>

                                                                    <Badge
                                                                        variant={
                                                                            testcase?.passed
                                                                                ? "default"
                                                                                : "destructive"
                                                                        }
                                                                    >
                                                                        {
                                                                            testcase?.passed
                                                                                ? "Passed"
                                                                                : "Failed"
                                                                        }
                                                                    </Badge>
                                                                </div>

                                                                <Separator />

                                                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

                                                                    <ResultBox
                                                                        title="Input"
                                                                        value={
                                                                            testcase?.input
                                                                        }
                                                                    />

                                                                    <ResultBox
                                                                        title="Expected Output"
                                                                        value={
                                                                            testcase?.expectedOutput
                                                                        }
                                                                    />

                                                                    <ResultBox
                                                                        title="Actual Output"
                                                                        value={
                                                                            testcase?.actualOutput
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        )
                                                    )
                                                }
                                            </div>
                                        </div>

                                        {/* STRENGTHS & WEAKNESSES */}

                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                                            <ListSection
                                                title="Strengths"
                                                items={
                                                    question?.strengths
                                                }
                                            />

                                            <ListSection
                                                title="Weaknesses"
                                                items={
                                                    question?.weaknesses
                                                }
                                            />
                                        </div>

                                        {/* FEEDBACK */}

                                        <div className="space-y-2">

                                            <h3 className="font-semibold text-lg">
                                                Feedback
                                            </h3>

                                            <p className="text-muted-foreground leading-7">
                                                {question?.feedback}
                                            </p>
                                        </div>

                                        {/* CODE */}

                                        <div className="space-y-3">
                                            <h3 className="font-semibold text-lg">
                                                Submitted Code
                                            </h3>
                                            <div className="relative">

                                                <button
                                                    onClick={async () => {

                                                        await navigator.clipboard.writeText(
                                                            submittedQuestion?.code || ""
                                                        );

                                                        setCopied(true);

                                                        setTimeout(() => {
                                                            setCopied(false);
                                                        }, 2000);
                                                    }}
                                                    className=" absolute top-3 right-3 z-10 p-2 hover:bg-muted transition rounded-md hover:cursor-pointer"
                                                >

                                                    {
                                                        copied ? (
                                                            <Check className="h-4 w-4 " />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )
                                                    }
                                                </button>

                                                <pre className="overflow-x-auto rounded-xl bg-muted p-4 text-sm">

                                                    <code>
                                                        {submittedQuestion?.code}
                                                    </code>
                                                </pre>
                                            </div>
                                        </div>

                                    </CardContent>
                                </Card>
                            );
                        }
                    )
                }
            </div>

            {/* OVERALL FEEDBACK */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                <ListSection
                    title="Overall Strengths"
                    items={
                        evaluation?.overallStrengths
                    }
                />

                <ListSection
                    title="Overall Weaknesses"
                    items={
                        evaluation?.overallWeaknesses
                    }
                />
            </div>

            <ListSection
                title="Improvement Tips"
                items={
                    evaluation?.improvementTips
                }
            />

            <Card className="border-0 shadow-sm">

                <CardHeader>
                    <CardTitle>
                        Final Feedback
                    </CardTitle>
                </CardHeader>

                <CardContent>

                    <p className="text-sm leading-7 text-muted-foreground">
                        {evaluation?.finalFeedback}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

const ScoreCard = ({
    title,
    score,
}) => {

    const safeScore = score || 0;

    return (
        <Card className="border-0 shadow-sm bg-card/60">

            <CardContent className="p-6 space-y-2">

                <div className="flex items-center justify-between">

                    <p className="text-sm font-medium text-muted-foreground">
                        {title}
                    </p>

                    <div className="text-xs font-medium text-muted-foreground">
                        /100
                    </div>
                </div>

                <div className="space-y-3">

                    <h2 className="text-3xl font-bold tracking-tight">
                        {safeScore}
                    </h2>

                    <Progress
                        value={safeScore}
                        className="h-2"
                    />
                </div>
            </CardContent>
        </Card>
    );
};

const ListSection = ({
    title,
    items = [],
}) => {

    return (
        <Card>

            <CardHeader>
                <CardTitle>
                    {title}
                </CardTitle>
            </CardHeader>

            <CardContent>

                {
                    items?.length > 0 ? (
                        <div className="space-y-4">

                            {
                                items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="mt-2.5 h-2 w-2 rounded-full bg-primary shrink-0" />

                                        <p className="text-muted-foreground leading-7">
                                            {item}
                                        </p>
                                    </div>
                                ))
                            }
                        </div>
                    ) : (
                        <p className="text-muted-foreground">
                            No data available
                        </p>
                    )
                }
            </CardContent>
        </Card>
    );
};

const InfoCard = ({
    label,
    value,
}) => {

    return (
        <Card className="p-0 border-0 shadow-none">

            <CardContent>

                <div className="space-y-1">

                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                        {label}
                    </p>

                    <p className="text-lg font-semibold leading-relaxed">
                        {value || "-"}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

const ResultBox = ({
    title,
    value,
}) => {

    return (
        <div className="space-y-2">

            <p className="text-sm font-semibold text-muted-foreground">
                {title}
            </p>

            <pre className="rounded-lg bg-muted p-3 overflow-x-auto text-sm">
                <code>
                    {value}
                </code>
            </pre>
        </div>
    );
};

const CircularProgress = ({
    value = 0,
}) => {

    const radius = 32;

    const stroke = 6;

    const normalizedRadius =
        radius - stroke * 0.5;

    const circumference =
        normalizedRadius * 2 * Math.PI;

    const strokeDashoffset =
        circumference -
        (value / 100) * circumference;

    const getColor = () => {

        if (value >= 75) {
            return "stroke-green-500";
        }

        if (value >= 50) {
            return "stroke-yellow-500";
        }

        return "stroke-red-500";
    };

    return (
        <div className="relative h-20 w-20">

            <svg
                height="100%"
                width="100%"
                viewBox="0 0 80 80"
                className="-rotate-90"
            >

                {/* Background */}

                <circle
                    stroke="currentColor"
                    className="text-muted"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx="40"
                    cy="40"
                />

                {/* Progress */}

                <circle
                    stroke="currentColor"
                    className={getColor()}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    style={{
                        strokeDashoffset,
                    }}
                    r={normalizedRadius}
                    cx="40"
                    cy="40"
                />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">

                <div className="text-center">

                    <p className="text-lg font-bold leading-none">
                        {value}
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                        /100
                    </p>
                </div>
            </div>
        </div>
    );
};


export default CodingResult;