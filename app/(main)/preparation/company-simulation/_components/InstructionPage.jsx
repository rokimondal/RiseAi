"use client"

import React from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Briefcase,
    ClipboardCheck,
    CheckCircle,
    Loader2,
    Trophy,
    Users,
} from "lucide-react";

const Instructions = ({
    handleStartSimulation,
    startingSimulation,
}) => {
    return (
        <Card className="mx-2">
            <CardHeader>
                <CardTitle>
                    Hiring Simulation Instructions
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    Please review the instructions before beginning your
                    company hiring simulation.
                </p>

                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>
                        Complete rounds in the order they are presented.
                    </li>

                    <li>
                        Some rounds may require meeting a minimum passing score
                        before progressing.
                    </li>

                    <li>
                        Coding assessments, interviews, and assessments may
                        have different evaluation criteria.
                    </li>

                    <li>
                        Responses should be completed independently for the
                        most accurate evaluation.
                    </li>

                    <li>
                        Your final result will be based on performance across
                        all completed rounds.
                    </li>
                </ul>

                <SimulationItem
                    icon={Briefcase}
                    title="Hiring Pipeline"
                    description="Multiple AI-generated hiring rounds"
                />

                <SimulationItem
                    icon={ClipboardCheck}
                    title="Assessment & Interviews"
                    description="Role-specific evaluations and challenges"
                />

                <SimulationItem
                    icon={Users}
                    title="AI Evaluation"
                    description="Performance analysis across all rounds"
                />

                <SimulationItem
                    icon={Trophy}
                    title="Final Recommendation"
                    description="Detailed hiring outcome and feedback"
                />
            </CardContent>

            <CardFooter>
                <Button
                    onClick={handleStartSimulation}
                    className="w-full"
                    disabled={startingSimulation}
                >
                    {startingSimulation ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Starting...
                        </>
                    ) : (
                        "Start Simulation"
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
};

const SimulationItem = ({
    icon: Icon,
    title,
    description,
}) => (
    <div className="flex items-center gap-3 rounded-lg p-1">
        <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-muted-foreground" />
            <div>
                <p className="text-sm font-medium">
                    {title}
                </p>
                <p className="text-xs text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>

        <div className="ml-auto">
            <CheckCircle className="w-4 h-4 text-green-600" />
        </div>
    </div>
);

export default Instructions;