"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import SingleSelect from './SingleSelect'
import MultiSelect from './MultiSelect'
import ShortAnswere from './ShortAnswere'
import LongAnswere from './LongAnswere'

const AssessmentPage = ({ assessmentData, handleSubmit, loading }) => {
  // console.log(assessmentData)
  const totalDuration = assessmentData.assessmentMetadata.totalDurationMinutes;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const intervalRef = useRef(null)
  const [timeLeft, setTimeLeft] = useState(totalDuration * 60)

  const [questionWithAnswere, setQuestionWithAnswere] = useState(assessmentData.questions.map((q) => ({
    ...q,
    answer:
      q.questionType === "MULTI_SELECT"
        ? []
        : ""
  })));

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [])

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`
  }

  const handleSingleSelectChange = (v) => {
    setQuestionWithAnswere((prev) => {
      const updated = [...prev];

      updated[currentQuestionIndex] = {
        ...updated[currentQuestionIndex],
        answer: v
      };

      return updated;
    });
  }

  const handleMultiSelectChange = (v) => {
    setQuestionWithAnswere((prev) => {
      const updated = [...prev];

      updated[currentQuestionIndex] = {
        ...updated[currentQuestionIndex],
        answer: v
      };

      return updated;
    });
  }

  const handleShortAnswereChange = (v) => {
    setQuestionWithAnswere((prev) => {
      const updated = [...prev];

      updated[currentQuestionIndex] = {
        ...updated[currentQuestionIndex],
        answer: v
      };

      return updated;
    });
  }

  const handleLongAnswereChange = (v) => {
    setQuestionWithAnswere((prev) => {
      const updated = [...prev];

      updated[currentQuestionIndex] = {
        ...updated[currentQuestionIndex],
        answer: v
      };

      return updated;
    });
  }

  const handleFinalSubmit = () => {
    const timeTaken = (totalDuration * 60) - timeLeft;
    handleSubmit({
      userAnswers: questionWithAnswere,
      sessionToken: assessmentData.sessionToken,
      timeTaken
    })
    console.log(questionWithAnswere);
  }

  const currQuestion = assessmentData.questions[currentQuestionIndex];

  return (
    <div className='fixed inset-0 z-100 bg-muted flex flex-col m-0 '>
      <div className="h-16 border-b flex items-center justify-between px-6 bg-muted/40 backdrop-blur">

        <div className="flex flex-col items-start">
          <h1 className="font-semibold text-xl">
            {assessmentData?.assessmentMetadata?.companyName}
          </h1>
          <span className="text-muted-foreground text-sm">
            {assessmentData?.assessmentMetadata?.examOrRole}
          </span>
        </div>

        <div className="px-3 py-1 rounded-full bg-muted text-md font-medium">
          {currentQuestionIndex + 1} <span className='text-muted-foreground'> / {assessmentData.questions.length}</span>
        </div>

        <div className="flex items-center gap-4 ">
          <p
            className={`text-lg font-semibold w-20 ${timeLeft < 300 ? "text-red-500" : "text-green-500"
              }`}
          >
            {formatTime(timeLeft)}
          </p>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => handleFinalSubmit()}
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit"}
            
          </Button>
        </div>
      </div>

      <div className='my-2 mx-4'>
        {currQuestion.questionType === "SINGLE_SELECT" && <SingleSelect index={currentQuestionIndex} question={currQuestion} handleChange={handleSingleSelectChange} value={questionWithAnswere[currentQuestionIndex].answer} />}
        {currQuestion.questionType === "MULTI_SELECT" && <MultiSelect index={currentQuestionIndex} question={currQuestion} handleChange={handleMultiSelectChange} value={questionWithAnswere[currentQuestionIndex].answer} />}
        {currQuestion.questionType === "SHORT_ANSWER" && <ShortAnswere index={currentQuestionIndex} question={currQuestion} handleChange={handleShortAnswereChange} value={questionWithAnswere[currentQuestionIndex].answer} />}
        {currQuestion.questionType === "LONG_ANSWER" && <LongAnswere index={currentQuestionIndex} question={currQuestion} handleChange={handleLongAnswereChange} value={questionWithAnswere[currentQuestionIndex].answer} />}
        {/* {JSON.stringify(currQuestion)} */}
      </div>

      <div className=' mx-4  mt-2 flex items-center justify-between'>
        <div>
          <Button
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
            className={`text-center ${currentQuestionIndex == 0 && "hidden"}`}
          >
            Previous Question
          </Button>
        </div>

        <div>
          <Button
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            className={`text-center ${currentQuestionIndex == assessmentData.questions.length - 1 && "hidden"}`}
          >
            Next Question
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AssessmentPage;