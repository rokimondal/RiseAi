import { getAssessments } from '@/actions/interview'
import React from 'react'
import StatsCard from './_components/StatsCard'
import PerformanceChart from './_components/PerformanceChart'
import QuizList from './_components/QuizList'
import { getUserOnboardingStatus } from '@/actions/user'

const InterviewPage = async () => {

    const assessments = await getAssessments()
    return (
        <div>
            <h1 className='text-3xl md:text-6xl font-bold gradient-title mb-5'>
                Interview Preparation
            </h1>
            <div className='space-y-6'>
                <StatsCard assessments={assessments} />
                <PerformanceChart assessments={assessments} />
                <QuizList assessments={assessments} />
            </div>

        </div>
    )
}

export default InterviewPage