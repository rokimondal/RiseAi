import { getUserOnboardingStatus } from '@/actions/user';
import React from 'react'
import BackButton from '../_components/BackButton';
import AssessmentSteps from './_components/AssessmentSteps';

const page = async () => {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const data = {
    type: "normal", // normal | hiringSimulation
    resumeData: null,
    formData: null,
  }

  return (
    <div className='container mx-auto space-y-4 py-6'>
      <div className='flex flex-col space-y-2 mx-2'>
        <BackButton />

        <div>
          <h1 className='text-6xl gradient-title font-bold'>
            Assessment Center
          </h1>

          <p className='text-muted-foreground'>
            Experience company-style assessments with aptitude, MCQs, and written rounds.
          </p>
        </div>
      </div>

      {/* <AssessmentCenter /> */}
      <AssessmentSteps data={data} />
    </div>
  )
}

export default page