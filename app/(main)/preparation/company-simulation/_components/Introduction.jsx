"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Briefcase,
    Brain,
    ClipboardCheck,
    TrendingUp,
    Trophy,
    Users,
} from "lucide-react";

const IntroductionPage = ({ setStep }) => {
    const handleNextStep = () => {
        setStep(2);
    };

    return (
        <Card className="mx-2">
            <CardHeader className="space-y-3">
                <CardTitle className="text-2xl">
                    Company Hiring Simulation
                </CardTitle>

                <CardDescription className="text-base">
                    Experience a realistic hiring journey tailored to your target
                    company, role, and experience level.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <p className="text-muted-foreground">
                        This simulation recreates real-world recruitment processes
                        used by companies for technical and non-technical roles.
                    </p>

                    <p className="text-muted-foreground">
                        Based on the information you provide, RiseAI will generate
                        a personalized hiring pipeline that may include coding
                        assessments, technical interviews, managerial interviews,
                        HR discussions, and other evaluation rounds.
                    </p>

                    <p className="text-muted-foreground">
                        Each simulation is uniquely generated to help you
                        understand hiring expectations, identify skill gaps, and
                        prepare for actual recruitment processes.
                    </p>
                </div>

                <div className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-4">
                        What You'll Experience
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-start gap-3">
                            <Briefcase className="h-5 w-5 mt-0.5 text-primary" />
                            <div>
                                <p className="font-medium">
                                    Company-Specific Hiring Pipelines
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Hiring processes tailored to your selected role.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <ClipboardCheck className="h-5 w-5 mt-0.5 text-primary" />
                            <div>
                                <p className="font-medium">
                                    Multiple Evaluation Rounds
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Coding, assessments, interviews, and more.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Brain className="h-5 w-5 mt-0.5 text-primary" />
                            <div>
                                <p className="font-medium">
                                    AI-Powered Evaluation
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Detailed analysis of your performance.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Users className="h-5 w-5 mt-0.5 text-primary" />
                            <div>
                                <p className="font-medium">
                                    Realistic Interview Experience
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Practice with industry-style questions.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <TrendingUp className="h-5 w-5 mt-0.5 text-primary" />
                            <div>
                                <p className="font-medium">
                                    Improvement Insights
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Discover strengths and areas to improve.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Trophy className="h-5 w-5 mt-0.5 text-primary" />
                            <div>
                                <p className="font-medium">
                                    Final Hiring Recommendation
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Receive a complete hiring outcome analysis.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">
                        Your simulation will be generated dynamically based on
                        your selected company, role, experience level, and hiring
                        type, making every experience unique and relevant.
                    </p>
                </div>
            </CardContent>

            <CardFooter>
                <Button
                    onClick={handleNextStep}
                    className="w-full"
                >
                    Get Started
                </Button>
            </CardFooter>
        </Card>
    );
};

export default IntroductionPage;