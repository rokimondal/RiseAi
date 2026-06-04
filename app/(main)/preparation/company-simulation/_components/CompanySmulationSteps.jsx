"use client"

import React, { useEffect, useState } from 'react'
import InstructionPage from './InstructionPage';
import useFetch from '@/hooks/use-fetch';
import { toast } from 'sonner';
import SimulationForm from './SimulationForm';
import IntroductionPage from './Introduction';
import ResumeSelector from '../../mock-interview/_components/ResumeSelector';
import { generateSimulationPlan } from '@/actions/company-simulation';
import MainSimulationPage from './MainSimulationPage';


const CompanySmulationSteps = () => {
  const [step, setStep] = useState(5);
  const [formData, setFormData] = useState({});
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [resumeContent, setResumeContent] = useState("");

  const { loading: planing, fn: generateSimulationPlanFn, data: generatedPlan } = useFetch(generateSimulationPlan);

  // useEffect(() => {
  //   console.log(formData);
  //   console.log(resumeContent);
  // }, [formData, resumeContent])

  useEffect(() => {
    console.log(generatedPlan);
    if (generatedPlan) {
      setStep(5)
    }
  }, [generatedPlan])

  const setAfterResumePage = () => {
    setStep(4);
  }

  // useEffect(() => {
  //   if (generatedAssesment) {
  //     console.log(generatedAssesment);
  //     setStep(3);
  //   }
  // }, [generatedAssesment])

  // useEffect(() => {
  //   if (assessmentResult) {
  //     console.log(assessmentResult);
  //     setStep(4);
  //   }
  // }, [assessmentResult])

  const handlePlaningSimulation = async () => {
    try {
      console.log(formData, resumeContent);
      await generateSimulationPlanFn({ ...formData, resumeContent });
    } catch (error) {
      toast.error(error.message || "Failed to Design Coding Assesment");
    }
  }


  const dummyGeneratedPlan = {
    success: true,
    data: {
      remainingCredits: 9546,
      session: {
        id: "cmpzewkj1000sm6gh5nm24t7w",
        sessionToken: "cmpzewkj1000tm6gh0o04bh2g",
        userId: "ebf66850-69b1-4e55-b900-8421631941a3",
        type: "COMPANY_SIMULATION",
        status: "STARTED",
        payload: {
          rounds: [
            {
              status: "PENDING",
              purpose:
                "Evaluate analytical thinking, communication skills, teamwork, and decision-making abilities through structured business scenarios.",
              roundId: 1,
              metadata: {
                topics: [
                  "Case Study Analysis",
                  "Logical Reasoning",
                  "Business Problem Solving",
                  "Presentation Skills",
                  "Team Collaboration"
                ],
                followups: [
                  "Decision Justification",
                  "Stakeholder Communication",
                  "Risk Assessment",
                  "Prioritization Strategy"
                ]
              },
              roundName: "Assessment Center Evaluation",
              roundType: "ASSESSMENT_CENTER",
              sessionId: null,
              difficulty: "Medium",
              passingScore: 65
            },
            {
              status: "LOCKED",
              purpose:
                "Evaluate coding ability, data structures, algorithms, and problem-solving under timed conditions.",
              roundId: 2,
              metadata: {
                topics: [
                  "Arrays",
                  "Strings",
                  "Trees",
                  "Graphs",
                  "Dynamic Programming",
                  "Greedy Algorithms"
                ],
                followups: [
                  "Time Complexity Analysis",
                  "Space Optimization",
                  "Edge Case Handling",
                  "Algorithm Design Patterns"
                ]
              },
              roundName: "Online Coding Assessment",
              roundType: "CODING_ASSESSMENT",
              sessionId: null,
              difficulty: "Hard",
              passingScore: 75
            },
            {
              status: "LOCKED",
              purpose:
                "Validate coding solutions and assess deep understanding of data structures and algorithms.",
              roundId: 3,
              metadata: {
                interviewType: "Technical",
                topics: [
                  "Advanced Data Structures",
                  "Recursion",
                  "Backtracking",
                  "Hashing",
                  "Bit Manipulation"
                ],
                followups: [
                  "Code Optimization",
                  "Debugging Methodologies",
                  "Test Case Design",
                  "Alternative Solution Approaches"
                ]
              },
              roundName: "Technical Interview - DSA Deep Dive",
              roundType: "MOCK_INTERVIEW",
              sessionId: null,
              difficulty: "Hard",
              passingScore: 70
            },
            {
              status: "LOCKED",
              purpose:
                "Assess core computer science fundamentals and evaluate project experience mentioned in the resume.",
              roundId: 4,
              metadata: {
                interviewType: "Technical",
                topics: [
                  "DBMS",
                  "Operating Systems",
                  "Computer Networks",
                  "OOP Concepts",
                  "REST API Design"
                ],
                followups: [
                  "Next.js Architecture",
                  "Node.js Backend Design",
                  "MongoDB Optimization",
                  "Authentication & Authorization",
                  "AI Integration in Rise AI"
                ]
              },
              roundName: "Technical Interview - Core CS & Projects",
              roundType: "MOCK_INTERVIEW",
              sessionId: null,
              difficulty: "Medium",
              passingScore: 65
            },
            {
              status: "LOCKED",
              purpose:
                "Evaluate system design skills, scalability knowledge, and architecture decision-making.",
              roundId: 5,
              metadata: {
                interviewType: "System Design",
                topics: [
                  "Microservices",
                  "Distributed Systems",
                  "Caching",
                  "Load Balancing",
                  "Message Queues",
                  "Cloud Architecture"
                ],
                followups: [
                  "Real-time Chat System Design",
                  "Database Scaling",
                  "Sharding & Replication",
                  "Event-Driven Architecture",
                  "AI Inference at Scale"
                ]
              },
              roundName: "System Design Interview",
              roundType: "MOCK_INTERVIEW",
              sessionId: null,
              difficulty: "Hard",
              passingScore: 72
            },
            {
              status: "LOCKED",
              purpose:
                "Assess communication skills, leadership potential, culture fit, and motivation for the role.",
              roundId: 6,
              metadata: {
                interviewType: "HR",
                topics: [
                  "Career Goals",
                  "Teamwork",
                  "Leadership",
                  "Adaptability",
                  "Conflict Resolution"
                ],
                followups: [
                  "Handling Feedback",
                  "Time Management",
                  "Work Under Pressure",
                  "Long-Term Career Vision",
                  "Why This Company"
                ]
              },
              roundName: "HR & Behavioral Interview",
              roundType: "MOCK_INTERVIEW",
              sessionId: null,
              difficulty: "Medium",
              passingScore: 60
            }
          ],
          simulationMetadata: {
            role: "Software Engineer",
            hiringType: "Off-Campus",
            companyName: "TechNova Solutions",
            totalRounds: 6,
            overallStatus: "IN_PROGRESS",
            experienceLevel: "Intern",
            currentRoundIndex: 0
          }
        },
        startedAt: "2026-06-04T11:28:38.626Z",
        submittedAt: null,
        expiresAt: "2026-07-04T11:28:38.626Z",
        durationSeconds: null,
        autoSubmitted: false,
        creditsUsed: 5,
        createdAt: "2026-06-04T11:28:38.631Z",
        updatedAt: "2026-06-04T11:28:38.631Z",
        linkedSessionIds: []
      },
      userName: "ROKI MONDAL"
    }
  };

  switch (step) {
    case 1:
      return (
        <IntroductionPage setStep={setStep} />
      )

    case 2:
      return (
        <SimulationForm setStep={setStep} setFormData={setFormData} />
      )

    case 3:
      return (
        <ResumeSelector setResumeContent={setResumeContent} setAfterResumePage={setAfterResumePage} />
      )
    case 4:
      return (
        <InstructionPage handleStartSimulation={handlePlaningSimulation}
          startingSimulation={planing} />
      )

    case 5:
      return (
        <MainSimulationPage planData={dummyGeneratedPlan.data} />
      )
    // default:
    //   return null;
  }
  return (
    <div>CodingPageSteps</div>
  )
}

export default CompanySmulationSteps;