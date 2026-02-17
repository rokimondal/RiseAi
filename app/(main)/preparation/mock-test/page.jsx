import React from 'react'
import { getUserOnboardingStatus } from '@/actions/user'
import Quiz from './_components/Quiz'
import BackButton from '../_components/BackButton'

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
          <h1 className='text-6xl gradient-title font-bold'>Mock Test</h1>
          <p className='text-muted-foreground'>
            Test your knowledge with industry-specific questions
          </p>
        </div>
      </div>

      <Quiz />
    </div>
  )
}

export default MockInterviewPage