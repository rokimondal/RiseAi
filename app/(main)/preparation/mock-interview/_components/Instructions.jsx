"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Camera, CheckCircle, Loader2, Mic, RotateCcw, Volume2, Wifi } from 'lucide-react'
import React, { useEffect, useState } from 'react'

const Instructions = ({ handleStartInterview, startingInterview }) => {
  const [cameraStatus, setCameraStatus] = useState("checking");
  const [speakerStatus, setSpeakerStatus] = useState("checking");
  const [micStatus, setMicStatus] = useState("checking");
  const [networkStatus, setNetworStatus] = useState("checking");
  const [allready, setAllReady] = useState(false);


  const cameraCheck = async () => {
    setCameraStatus("checking")
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStatus("ready");
    } catch {
      setCameraStatus("error");
    }
  }

  const speakerCheck = () => {
    setSpeakerStatus("checking");
    const audio = new Audio();
    if (audio.canPlayType("audio/mpeg")) {
      setSpeakerStatus("ready");
    } else {
      setSpeakerStatus("error");
    }
  }

  const micCheck = async () => {
    setMicStatus("checking");
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStatus("ready");
    } catch {
      setMicStatus("error");
    }
  }

  const networkCheck = async () => {
    setNetworStatus("checking");
    if (navigator.onLine) {
      setNetworStatus("ready");
    } else {
      setNetworStatus("error");
    }
  }

  useEffect(() => {
    cameraCheck();
    speakerCheck();
    micCheck();
    networkCheck();
  }, [])

  useEffect(() => {
    if (cameraStatus == "ready" && micStatus == "ready" && speakerStatus == "ready" && networkStatus == "ready") {
      setAllReady(true);
    } else {
      setAllReady(false);
    }
  }, [cameraStatus, micStatus, speakerStatus, networkStatus]);

  const generating = false;

  return (
    <Card className="mx-2">
      <CardHeader>
        <CardTitle>Interview Instructions & System Check</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">

        <p className="text-muted-foreground">
          Please review the instructions and ensure your system is ready before starting the interview.
        </p>

        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li>Ensure your microphone is working properly</li>
          <li>Make sure your speaker or headphones are connected</li>
          <li>Use a stable internet connection</li>
          <li>Answer questions clearly and confidently</li>
          <li>Interview will be conducted by AI voice assistant</li>
        </ul>
        <StatusItem
          icon={Mic}
          title="Microphone"
          status={micStatus}
          onRecheck={micCheck}
        />
        <StatusItem
          icon={Volume2}
          title="Speaker"
          status={speakerStatus}
          onRecheck={speakerCheck}
        />
        <StatusItem
          icon={Camera}
          title="Camera"
          status={cameraStatus}
          onRecheck={cameraCheck}
        />
        <StatusItem
          icon={Wifi}
          title="Internet Connection"
          status={networkStatus}
          onRecheck={networkCheck}
        />

      </CardContent>

      <CardFooter>
        <Button
          onClick={handleStartInterview}
          className="w-full"
          disabled={!allready || startingInterview}
        >
          {startingInterview ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            "Start Interview"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

const StatusItem = ({ icon: Icon, title, status, onRecheck }) => (
  <div className="flex items-center gap-3 rounded-lg p-1 ">

    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-muted-foreground" />
      <span className="text-sm font-medium">{title}</span>
    </div>

    {status === "checking" && (
      <span className="text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      </span>
    )}

    {status === "ready" && (
      <span className="flex items-center gap-1 text-green-600 text-sm">
        <CheckCircle className="w-4 h-4" />
      </span>
    )}

    {status === "error" && (
      <div className="flex items-center gap-1">

        <span className="flex items-center gap-1 text-red-600 text-sm">
          Failed
        </span>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRecheck}
          className="h-6 w-6 hover:cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>

      </div>
    )}


  </div>
);

export default Instructions