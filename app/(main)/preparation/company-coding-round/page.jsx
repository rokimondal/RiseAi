import React from 'react'
import { getUserOnboardingStatus } from '@/actions/user'
import BackButton from '../_components/BackButton'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CodingPageSteps from './_components/CodingPageSteps';

const CompanyCodingPage = async () => {
    const { isOnboarded } = await getUserOnboardingStatus();

    if (!isOnboarded) {
        redirect("/onboarding");
    }

    const data ={
        type: "normal", // normal | hiringSimulation
        resumeData: null,
        formData:null,
    }

    return (
        <div className='container mx-auto space-y-4 py-6'>
            <div className='flex flex-col space-y-2 mx-2'>
                <BackButton />
                <div>
                    <h1 className='text-6xl gradient-title font-bold'>Company Coding Test</h1>
                    <p className='text-muted-foreground'>
                        Experience real-world coding rounds inspired by actual hiring processes.
                    </p>
                </div>
            </div>

            {/* <Quiz /> */}
            <CodingPageSteps data={data}/>
        </div>
    )
}

export default CompanyCodingPage