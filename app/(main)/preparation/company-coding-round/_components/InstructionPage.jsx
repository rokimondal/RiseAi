import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import React, { useState } from 'react'

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
                <CardTitle>Company Coding Round – Instructions</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">

                <p className="text-muted-foreground">
                    You are about to begin a company-specific coding test designed to
                    simulate a real hiring evaluation.Please read the instructions carefully before proceeding.
                </p>

                <p className="text-muted-foreground">
                    Read each problem carefully, write your solution in the editor, and test your code using the
                    provided examples before submitting.
                </p>

                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>The test timer will start once you proceed.</li>
                    <li>You may run your solution using the provided sample test cases.</li>
                    <li>Final scoring is based on correctness, logic, and efficiency.</li>
                    <li>Refreshing or leaving the page may result in test termination.</li>
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
                        I confirm that I have read and understood the coding test instructions.
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