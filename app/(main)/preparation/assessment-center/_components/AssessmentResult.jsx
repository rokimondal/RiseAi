"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Trophy, Brain, Target, AlertTriangle } from "lucide-react";

const recommendationVariant = {
    STRONG_HIRE: "default",
    HIRE: "secondary",
    Neutral: "outline",
    Reject: "destructive",
    NO_HIRE: "destructive",
};

const AssessmentResult = ({ result }) => {

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const data = result?.data || result;
    const session = data?.session;
    const metadata = session?.payload?.assessmentMetadata;
    const resultMetadata = session?.result?.metadata;
    const resultPayload = session?.result?.result;
    const questions = resultPayload?.questions || [];

    if (!session) {
        return (
            <div className="w-full flex items-center justify-center py-20">
                <div className="text-gray-500">
                    No assessment result found
                </div>
            </div>
        );
    }

    const totalTime = metadata?.totalDurationMinutes || 0;

    const currentQuestion = questions[currentQuestionIndex];

    const getResultBadgeVariant = (result) => {
        switch (result) {
            case "CORRECT":
                return "default";

            case "PARTIALLY_CORRECT":
                return "secondary";

            default:
                return "destructive";
        }
    };

    const getCorrectAnswers = (question) => {

        if (
            question.questionType ===
            "SHORT_ANSWER"
        ) {
            return question.expectedAnswer;
        }

        if (
            question.questionType ===
            "LONG_ANSWER"
        ) {
            return question.expectedAnswer;
        }

        return (
            question.correctAnswer || []
        ).map(
            (index) =>
                question.options?.[index]
        );
    };

    const correctAnswers = currentQuestion ? getCorrectAnswers(currentQuestion) : [];

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">

            {/* HEADER */}

            <Card className="border-0 shadow-none">
                <CardContent>
                    <div className="space-y-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold">
                                    Assessment Result
                                </h1>
                                <p className="text-muted-foreground">
                                    Complete performance evaluation summary
                                </p>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">

                                <Badge
                                    variant={
                                        recommendationVariant[
                                        resultMetadata?.hiringRecommendation
                                        ]
                                    }
                                    className="px-4 py-1"
                                >
                                    {
                                        resultMetadata?.hiringRecommendation === 'NO_HIRE' ? "REJECT" : resultMetadata?.hiringRecommendation
                                    }
                                </Badge>
                            </div>
                        </div>

                        {/* INFO */}

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                            <InfoCard
                                label="Company"
                                value={
                                    metadata?.companyName
                                }
                            />

                            <InfoCard
                                label="Exam / Role"
                                value={
                                    metadata?.examOrRole
                                }
                            />

                            <InfoCard
                                label="Assessment Type"
                                value={
                                    metadata?.mode == "EXAM_BASED" ? "Exam" : "Role"
                                }
                            />

                            <InfoCard
                                label="Duration"
                                value={`${totalTime} Minutes`}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SCORES */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

                <ScoreCard
                    title="Overall Score"
                    value={resultMetadata?.overallScore}
                    score={resultMetadata?.overallScore}
                />

                <ScoreCard
                    title="Technical Score"
                    value={resultMetadata?.technicalScore}
                    score={resultMetadata?.technicalScore}
                />

                <ScoreCard
                    title="Analytical Score"
                    value={resultMetadata?.analyticalScore}
                    score={
                        resultMetadata?.analyticalScore
                    }
                />

                <ScoreCard
                    title="Accuracy Score"
                    value={resultMetadata?.accuracyScore}
                    score={
                        resultMetadata?.accuracyScore
                    }
                />

            </div>

            {/* PERFORMANCE */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ListSection title={'Strengths'} items={resultPayload?.strengths} />
                <ListSection title={'Weaknesses'} items={resultPayload?.weaknesses} />
            </div>

            {/* QUESTION ANALYSIS */}

            <div className="space-y-6">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                    <div>

                        <h2 className="text-2xl font-bold">
                            Question Analysis
                        </h2>

                        <p className="text-muted-foreground">
                            Detailed review of answers and evaluation
                        </p>
                    </div>

                    <div className="flex items-center gap-3">

                        <Button
                            variant="outline"

                            disabled={
                                currentQuestionIndex === 0
                            }

                            onClick={() =>
                                setCurrentQuestionIndex(
                                    (prev) => prev - 1
                                )
                            }
                        >
                            Previous
                        </Button>

                        <div className="text-sm font-medium">

                            Question{" "}
                            {currentQuestionIndex + 1} of{" "}
                            {questions.length}

                        </div>

                        <Button
                            variant="outline"
                            disabled={
                                currentQuestionIndex ===
                                questions.length - 1
                            }

                            onClick={() =>
                                setCurrentQuestionIndex(
                                    (prev) => prev + 1
                                )
                            }
                        >
                            Next
                        </Button>
                    </div>
                </div>

                {/* NAVIGATION */}

                <div className="flex flex-wrap gap-3">

                    {
                        questions.map(
                            (question, index) => {

                                const active =
                                    currentQuestionIndex === index;

                                return (
                                    <button
                                        key={question.questionId}

                                        onClick={() =>
                                            setCurrentQuestionIndex(index)
                                        }

                                        className={`h-11 w-11 rounded-md border text-sm font-semibold transition-all ${active
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : question.result === "CORRECT"
                                                ? "border-green-500 bg-green-50 dark:bg-green-950"
                                                : question.result === "PARTIALLY_CORRECT"
                                                    ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                                                    : "border-red-500 bg-red-50 dark:bg-red-950"
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                );
                            }
                        )
                    }
                </div>

                {/* CURRENT QUESTION */}

                {
                    currentQuestion && (

                        <Card>

                            <CardHeader>

                                <div className="flex flex-col lg:flex-row lg:justify-between gap-4">

                                    <div className="space-y-3 flex-1">

                                        <div className="flex flex-wrap gap-3 items-center">

                                            <CardTitle className="leading-8">

                                                Q{currentQuestionIndex + 1}.{" "}

                                                {
                                                    currentQuestion.question
                                                }

                                            </CardTitle>

                                            <Badge
                                                variant={
                                                    getResultBadgeVariant(
                                                        currentQuestion.result
                                                    )
                                                }
                                            >
                                                {
                                                    currentQuestion.result
                                                }
                                            </Badge>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                            <span>
                                                Marks:
                                                <strong className="ml-1">
                                                    {
                                                        currentQuestion.obtainedMarks
                                                    }
                                                    /
                                                    {
                                                        currentQuestion.marks
                                                    }
                                                </strong>
                                            </span>
                                        </div>
                                    </div>

                                    <CircularProgress
                                        value={
                                            currentQuestion.obtainedMarks < 0

                                                ? -Math.round(
                                                    (
                                                        Math.abs(
                                                            currentQuestion.obtainedMarks
                                                        ) /
                                                        currentQuestion.marks
                                                    ) * 100
                                                )

                                                : Math.round(
                                                    (
                                                        currentQuestion.obtainedMarks /
                                                        currentQuestion.marks
                                                    ) * 100
                                                )
                                        }

                                        result={
                                            currentQuestion.result
                                        }
                                    />
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6">

                                {
                                    currentQuestion.options?.length > 0 && (

                                        <div className="space-y-3">

                                            <h3 className="font-semibold">
                                                Options
                                            </h3>

                                            <div className="space-y-3">

                                                {
                                                    currentQuestion.options.map(
                                                        (
                                                            option,
                                                            optionIndex
                                                        ) => {

                                                            const isCorrect =
                                                                currentQuestion.correctAnswer?.includes(
                                                                    optionIndex
                                                                );

                                                            const isSelected =
                                                                Array.isArray(
                                                                    currentQuestion.userAnswer
                                                                )
                                                                    ? currentQuestion.userAnswer.includes(
                                                                        option
                                                                    )
                                                                    : currentQuestion.userAnswer ===
                                                                    option;

                                                            return (
                                                                <div
                                                                    key={
                                                                        optionIndex
                                                                    }

                                                                    className={`border rounded-xl p-4 transition-all ${isCorrect
                                                                        ? "border-green-500 bg-green-50 dark:bg-green-950"
                                                                        : isSelected
                                                                            ? "border-red-500 bg-red-50 dark:bg-red-950"
                                                                            : "border-border"
                                                                        }`}
                                                                >

                                                                    <div className="flex justify-between gap-4">

                                                                        <p className="font-medium">
                                                                            {
                                                                                option
                                                                            }
                                                                        </p>

                                                                        <div className="flex gap-2">

                                                                            {
                                                                                isCorrect && (
                                                                                    <Badge variant="default">
                                                                                        Correct
                                                                                    </Badge>
                                                                                )
                                                                            }

                                                                            {
                                                                                isSelected && (
                                                                                    <Badge variant="secondary">
                                                                                        Your Answer
                                                                                    </Badge>
                                                                                )
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                    )
                                                }
                                            </div>
                                        </div>
                                    )
                                }


                                {(
                                    currentQuestion.questionType ===
                                    "SHORT_ANSWER" ||

                                    currentQuestion.questionType ===
                                    "LONG_ANSWER"
                                ) &&
                        

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                            <AnswerBox
                                                title="Your Answer"

                                                value={
                                                    Array.isArray(
                                                        currentQuestion.userAnswer
                                                    )
                                                        ? currentQuestion.userAnswer.join(
                                                            ", "
                                                        )
                                                        : currentQuestion.userAnswer ||
                                                        "Not Attempted"
                                                }

                                                result={currentQuestion.result}
                                            />

                                            <AnswerBox
                                                title="Expected / Correct Answer"

                                                value={
                                                    Array.isArray(
                                                        correctAnswers
                                                    )
                                                        ? correctAnswers.join(
                                                            ", "
                                                        )
                                                        : correctAnswers
                                                }

                                                result={"CORRECT"}
                                            />
                                        </div>
                                }
                            </CardContent>
                        </Card>
                    )
                }
            </div>
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

const AnswerBox = ({
    title,
    value,
    result,
}) => {

    return (
        <div
            className={`rounded-xl border p-4 space-y-2 ${result === "CORRECT"
                ? "border-green-500 bg-green-50 dark:bg-green-950"
                : result === "PARTIALLY_CORRECT"
                    ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                    : "border-red-500 bg-red-50 dark:bg-red-950"
                }`}
        >

            <p className="text-sm font-semibold text-muted-foreground">
                {title}
            </p>

            <p className="font-semibold leading-7">
                {value}
            </p>
        </div>
    );
};

const CircularProgress = ({
    value = 0,
    result,
}) => {

    const radius = 32;

    const stroke = 6;

    const normalizedRadius =
        radius - stroke * 0.5;

    const circumference =
        normalizedRadius * 2 * Math.PI;

    const isNegative =
        value < 0;

    const absoluteValue =
        Math.abs(value);

    const cappedValue =
        Math.min(absoluteValue, 100);

    const strokeDashoffset =
        circumference -
        (cappedValue / 100) * circumference;

    const getColor = () => {

        if (result === "CORRECT") {
            return "stroke-green-500";
        }

        if (
            result ===
            "PARTIALLY_CORRECT"
        ) {
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

                <circle
                    stroke="currentColor"
                    className="text-muted"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx="40"
                    cy="40"
                />

                <circle
                    stroke="currentColor"
                    className={getColor()}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    style={{
                        strokeDashoffset,

                        transform: isNegative
                            ? "rotate(180deg) scale(-1, 1)"
                            : "scale(1, 1)",

                        transformOrigin: "50% 50%",
                    }}
                    r={normalizedRadius}
                    cx="40"
                    cy="40"
                />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">

                <div className="text-center">

                    <p
                        className={`text-lg font-bold leading-none ${result === "CORRECT"
                            ? "text-green-600"
                            : result === "PARTIALLY_CORRECT"
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                    >
                        {
                            isNegative
                                ? `-${cappedValue}`
                                : cappedValue
                        }
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                        %
                    </p>
                </div>
            </div>
        </div>
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

export default AssessmentResult;