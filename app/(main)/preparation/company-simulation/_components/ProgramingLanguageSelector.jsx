"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { programmingLanguages } from "@/data/simulationPageForm";


const ProgrammingLanguageSelector = ({ handleStartAssessment, loading = false, }) => {
    const [language, setLanguage] = useState("");

    const handleSubmit = () => {
        if (!language) return;

        handleStartAssessment?.(language);
    };

    return (
        <Card className="mx-2 w-full">
            <CardHeader>
                <CardTitle>Select Programming Language</CardTitle>

                <CardDescription>
                    Choose the programming language you want to use for this coding assessment.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 w-full">
                <div className="space-y-2 w-full">
                    <Label>Programming Language</Label>

                    <Select
                        value={language}
                        onValueChange={setLanguage}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a programming language" />
                        </SelectTrigger>

                        <SelectContent>
                            {programmingLanguages.map((language) => (
                                <SelectItem
                                    key={language}
                                    value={language}
                                    className="w-full"
                                >
                                    {language}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={!language || loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Starting Assessment...
                        </>
                    ) : (
                        "Start Assessment"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
};

export default ProgrammingLanguageSelector;