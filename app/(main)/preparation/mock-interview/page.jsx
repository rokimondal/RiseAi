import React from 'react'
import { getUserOnboardingStatus } from '@/actions/user'
import BackButton from '../_components/BackButton'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Steps from './_components/Steps';

const MockInterviewPage = async () => {
    const { isOnboarded } = await getUserOnboardingStatus();

    if (!isOnboarded) {
        redirect("/onboarding");
    }


    return (
        <div className='container mx-auto space-y-4 py-6'>
            <div className='flex flex-col space-y-2 mx-2'>
                <BackButton />
                <div>
                    <h1 className='text-6xl gradient-title font-bold'>Mock Interview</h1>
                    <p className='text-muted-foreground'>
                        Experience real interview simulations with an intelligent AI interviewer.
                    </p>
                </div>
            </div>

            {/* <Quiz /> */}
            <Steps/>
        </div>
    )
}

export default MockInterviewPage