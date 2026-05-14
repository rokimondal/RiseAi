"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

const InstructionPage = ({ setStep, data }) => {
    const [accepted, setAccepted] = useState(false);

    const handleNextStep = () => {
        if (data.type == "normal") {
            setStep(2);
        } else {
            setStep(3);
        }
    }
    return (
        <Card className="mx-2">
            <CardHeader>
                <CardTitle>Assessment Center – Instructions</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">

                <p className="text-muted-foreground">
                    You are about to begin a company-style assessment round designed to evaluate
                    your aptitude, technical knowledge, problem-solving, and decision-making skills.
                    Please read all instructions carefully before proceeding.
                </p>

                <p className="text-muted-foreground">
                    This assessment may include single-select MCQs, multi-select questions,
                    short answers, and descriptive responses based on the selected test pattern.
                </p>

                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>The assessment timer will start immediately after you click Continue.</li>
                    <li>Read each question carefully before selecting or submitting your answer.</li>
                    <li>Some questions may have more than one correct answer.</li>
                    <li>Once submitted, answers may not be changed in some sections.</li>
                    <li>Do not refresh, close, or leave the page during the assessment.</li>
                </ul>

                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                        id="accept"
                        checked={accepted}
                        onCheckedChange={(value) => setAccepted(Boolean(value))}
                    />

                    <label
                        htmlFor="accept"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        I confirm that I have read and understood the assessment instructions.
                    </label>
                </div>

            </CardContent>

            <CardFooter>
                <Button
                    onClick={() => handleNextStep()}
                    className="w-full"
                    disabled={!accepted}
                >
                    Continue
                </Button>
            </CardFooter>
        </Card>
    )
}

export default InstructionPage