"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger, DialogHeader } from '@/components/ui/dialog'
import Vapi from '@vapi-ai/web'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

const Interview = ({ generatedInterviewData, handleEndInterview }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const vapiRef = useRef(null);
  const intervalRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(generatedInterviewData.totalDuration * 60);
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [conversation, setConversation] = useState([]);


  useEffect(() => {
    setMounted(true);
  }, [])



  useEffect(() => {
    if (!mounted) return;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraReady(true);
        setMicReady(true);

        // detect camera off
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.onended = () => {
            toast.error("Camera turned off. Interview ended.");
            handleEndCall();
            setCameraReady(false);
          };
        }

        // detect mic off
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.onended = () => {
            toast.error("Microphone turned off. Interview ended.");
            handleEndCall();
            setMicReady(false);
          };
        }
      } catch (error) {
        setCameraReady(false);
        setMicReady(false);
        toast.error("Camera and Microphone access required");
      }
    }

    startCamera();
  }, [mounted]);



  useEffect(() => {
    // 1. UNCOMMENT THIS LINE: Wait for hardware locks to settle
    if (!mounted || !cameraReady || !micReady) return;

    if (vapiRef.current) return;

    const startCall = async () => {
      try {
        setLoading(true)
        const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY)

        vapi.on("call-start", () => {
          console.log("Call connected:")

          setConnected(true)
          setLoading(false)
          toast.success("Interview started")
        })

        vapi.on("call-end", () => {
          console.log("Call ended");
          handleEndCall();
          setConnected(false)
        })

        vapi.on("error", (error) => {
          console.error("Vapi error:", error)
        })

        vapi.on("message", (message) => {
          if (
            message.type === "transcript" &&
            message.transcriptType === "final"
          ) {
            setConversation(prev => {
              const updated = [
                ...prev,
                {
                  role: message.role,
                  content: message.transcript,
                  timestamp: Date.now(),
                },
              ];

              console.log("Updated conversation:", updated); // ✅ correct trace

              return updated;
            });
          }
        });

        vapiRef.current = vapi

        const options = assistantOptions(generatedInterviewData)

        // 2. Add a tiny delay to ensure React has fully rendered the video element
        await vapi.start(options)

      } catch (error) {
        console.error("Failed to start:", error)
        toast.error("Failed to start interview")
        setLoading(false)
      }
    }
    startCall();
  }, [mounted, cameraReady, micReady]); // Dependencies matter here!



  useEffect(() => {
    if (!connected) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          handleEndCall();
          return 0;
        }

        return prev - 1;
      })
    }, 1000)

    return () => clearInterval(intervalRef.current);
  }, [connected])



  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }



  const handleEndCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
    if (intervalRef.current) {
      console.log(intervalRef.current);
      clearInterval(intervalRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setConnected(false);
    setCameraReady(false);
    setMicReady(false);
    console.log("Call end");
    handleEndInterview(conversation);

  }

  console.log(generatedInterviewData);

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
      <CardContent >
        <div className="flex flex-col md:flex-row justify-between gap-6 items-center">
          <Card className="w-full md:w-1/2 h-56 md:h-96 flex items-center justify-center">

            <div className="relative flex items-center justify-center">

              {/* Animated outer ring */}
              <div className={`absolute w-32 h-32 rounded-full ${connected ? "bg-green-500/20 animate-ping" : "bg-transparent"}`}></div>

              {/* Animated middle ring */}
              <div className={`absolute w-24 h-24 rounded-full bg-background ${connected ? "border-4 border-green-500 animate-pulse" : "border-2"}`}></div>

              {/* Avatar */}
              <div className="relative rounded-full p-3 bg-background z-10">
                <img
                  src="/icon.png"
                  alt="AI"
                  className="w-16 h-16 object-contain"
                />
              </div>

            </div>

            {/* Loading dots */}
            {loading && (
              <div className="flex space-x-2 justify-center items-center">
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
              </div>
            )}

          </Card>


          <Card className="w-full md:w-1/2 h-56 md:h-96 p-0 overflow-hidden">
            <div className='w-full h-full relative'>
              {mounted && <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover "
              />}
            </div>
          </Card>
        </div >
        {(!loading && (!cameraReady || !micReady)) && (
          <p className="text-red-500 text-sm text-center">
            Camera and Microphone access required to start interview
          </p>
        )}
      </CardContent >

      <CardFooter >

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              className="mx-auto "
              disabled={!connected}
            >
              End Call
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>End Interview?</DialogTitle>
              <DialogDescription>
                Are you sure you want to end the interview? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="destructive" onClick={handleEndCall}>End Interviews</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </CardFooter>
    </Card >
  )
}

const assistantOptions = (data) => {
  const userName = data.userName || "Candidate";

  // Format questions with follow-ups
  const questionsText = data.questions
    .map((q, i) => {
      const followUps = q.followUps?.length
        ? `\nFollow-up questions:\n${q.followUps
          .map((f) => `- ${f}`)
          .join("\n")}`
        : "";

      return `${i + 1}. ${q.question}${followUps}`;
    })
    .join("\n\n");

  return {
    name: "Interview Assistant",

    // First message spoken by assistant
    firstMessage: `Welcome ${userName}. I will be conducting your interview today. Let's begin.`,

    // AI model configuration
    model: {
      provider: "openai",
      model: "gpt-4o-mini",

      messages: [
        {
          role: "system",
          content: `
You are a highly professional technical interviewer conducting a live voice interview.

PERSONALITY AND VOICE STYLE:

• Calm, confident, and professional
• Neutral Indian English accent and tone
• Speak clearly using short and natural spoken sentences
• Sound like a real human interviewer

CRITICAL INTERVIEW RULES:

• Ask ONLY the questions provided in the QUESTIONS section
• Ask EXACTLY ONE question at a time
• NEVER generate new questions
• NEVER modify or rephrase questions
• NEVER explain anything
• NEVER provide feedback or evaluation
• NEVER answer the questions yourself
• NEVER interrupt the candidate
• ALWAYS wait until the candidate finishes speaking

AFTER EACH ANSWER:

Respond with EXACTLY ONE acknowledgement from this list:

"Understood."
"Noted."
"Alright."
"Thank you."

Then ask the next question.

Do NOT combine acknowledgement and question in same sentence.

INTERVIEW COMPLETION RULE:

After ALL questions are completed, say EXACTLY this sentence:

"Thank you ${userName}. This concludes the interview. Ending the call now."

After saying this sentence:

• DO NOT say anything else
• DO NOT generate any additional words
• The interview must end immediately

INTERVIEW DETAILS:

Candidate Name: ${userName}
Position: ${data.jobTitle || "Software Developer"}
Interview Type: ${data.interviewType || "Technical"}

QUESTIONS (ask in exact order):

${questionsText}

You must strictly follow all rules.
          `.trim(),
        },
      ],
    },

    // Voice configuration
    voice: {
      provider: "openai",
      voiceId: "alloy", // good neutral Indian-compatible voice
    },

    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "en-IN",
    },

    // SAFE end call phrases (assistant-only phrases)
    endCallPhrases: [
      "End the call now.",
      "End the interview now",
      "End the call.",
      "End the interview",
      "End call.",
      "End interview",
      "End",
    ],

    // Maximum duration of interview in seconds
    maxDurationSeconds: Math.round((data.totalDuration || 30) * 60),
  };
};



export default Interview;