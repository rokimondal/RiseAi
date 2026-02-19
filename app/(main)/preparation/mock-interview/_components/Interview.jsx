"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

const Interview = ({ generatedInterviewData }) => {
  const videoRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(generatedInterviewData.totalDuration * 60);

  useEffect(() => {
    setMounted(true);
  }, [])

  useEffect(() => {
    if (!mounted) return;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        toast.error(error.message || "Failed to access camera");
      }
    }

    startCamera();
  }, [mounted]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleEndCall();
          return 0;
        }

        return prev - 1;
      })
    }, 1000)

    return () => clearInterval(interval);
  }, [mounted])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  const handleEndCall = () => {
    console.log("Call end")
  }

  return (
    <Card className="mx-2">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="m">
              {generatedInterviewData.jobTitle}
            </CardTitle>
            <CardDescription>
              {generatedInterviewData.interviewType} • {generatedInterviewData.totalDuration} Minutes
            </CardDescription>
          </div>

          <div className="text-right">
            <p className={`text-lg font-semibold ${timeLeft < 60 ? "text-red-500" : "text-green-500"}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row justify-between gap-6 items-center">

        <Card className="w-full md:w-1/2 h-56 md:h-96 flex items-center justify-center">

          <div className="relative flex items-center justify-center">

            {/* Animated outer ring */}
            <div className="absolute w-32 h-32 rounded-full bg-green-500/20 animate-ping"></div>

            {/* Animated middle ring */}
            <div className="absolute w-24 h-24 rounded-full border-4 border-green-500 animate-pulse bg-background"></div>

            {/* Avatar container */}
            <div className="relative rounded-full p-3 bg-background z-10">

              <img
                src="/icon.png"
                alt="AI"
                className="w-16 h-16 object-contain"
              />

            </div>

          </div>

        </Card>


        <Card className="w-full md:w-1/2 h-56 md:h-96 p-0 overflow-hidden">
          <div className='w-full h-full relative'>
            {mounted && <video
              ref={videoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover "
            />}
          </div>
        </Card>

      </CardContent>

      <CardFooter>
        <Button
          variant="destructive"
          onClick={handleEndCall}
          className="mx-auto "
        >
          End Call
        </Button>
      </CardFooter>
    </Card>
  )
}

export default Interview