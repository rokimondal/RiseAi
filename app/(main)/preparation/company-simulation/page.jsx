import React from 'react'
import CompanySmulationSteps from './_components/CompanySmulationSteps';
import { getUserOnboardingStatus } from '@/actions/user';
import BackButton from '../../../../components/BackButton';

const Page = async () => {
    const { isOnboarded } = await getUserOnboardingStatus();

    if (!isOnboarded) {
        redirect("/onboarding");
    }


    return (
        <div className='container mx-auto space-y-4 py-6'>
            <div className='flex flex-col space-y-2 mx-2'>
                <BackButton />
                <div>
                    <h1 className='text-6xl gradient-title font-bold'>Company Hiring Simulation</h1>
                    <p className='text-muted-foreground'>
                        Experience real-world hiring processes inspired by actual company recruitment workflows.
                    </p>
                </div>
            </div>

            <CompanySmulationSteps />
        </div>
    )
}

export default Page