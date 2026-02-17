import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

const IntroductionPage = ({ setStep }) => {
  return (
      <Card className="mx-2">
          <CardHeader>
              <CardTitle>AI Mock Interview</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">

              <p className="text-muted-foreground">
                  Practice with an AI interviewer that generates questions tailored to your target role, company,
                  and job description.
              </p>

              <p className="text-muted-foreground">
                  You can select or upload a resume to personalize the interview with questions based on your
                  skills, projects, and experience. Uploaded resumes are used only for this session.
              </p>

              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>Role and company-specific questions</li>
                  <li>Resume-based personalized interview</li>
                  <li>Real-time AI voice interaction</li>
                  <li>Performance feedback and insights</li>
              </ul>

          </CardContent>

          <CardFooter>
              <Button
                  onClick={() => setStep(2)}
                  className="w-full"
              >
                  Continue
              </Button>
          </CardFooter>
      </Card>
  )
}

export default IntroductionPage