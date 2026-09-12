import { getAssessments } from '@/actions/mock-test'
import React from 'react'
import StatsCard from './_components/StatsCard'
import PerformanceChart from './_components/PerformanceChart'
import QuizList from '../preparation/mock-test/_components/QuizList'
import { getAssessmentsAndSimulations } from '@/actions/performance'
import History from './_components/History'

const InterviewPage = async () => {

    const assessmentsData = await getAssessmentsAndSimulations();
    const completedAssessments = assessmentsData?.filter(
        (assessment) => assessment.action === "RESULT"
    );

    console.log(assessmentsData)
    console.log(completedAssessments)
    return (
        <div>
            <h1 className='text-3xl md:text-6xl font-bold gradient-title mb-5'>
                Performance Dashboard
            </h1>
            <div className='space-y-6'>
                <StatsCard completedAssessments={completedAssessments} />
                <PerformanceChart completedAssessments={completedAssessments} />
                <History assessmentsData={assessmentsData} />
            </div>

        </div>
    )
}

export default InterviewPage