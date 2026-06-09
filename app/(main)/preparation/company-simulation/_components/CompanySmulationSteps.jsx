"use client"

import React, { useEffect, useState } from 'react'
import InstructionPage from './InstructionPage';
import useFetch from '@/hooks/use-fetch';
import { toast } from 'sonner';
import SimulationForm from './SimulationForm';
import IntroductionPage from './Introduction';
import ResumeSelector from '../../mock-interview/_components/ResumeSelector';
import { generateSimulationPlan, startExistingSimulationPlan } from '@/actions/company-simulation';
import MainSimulationPage from './MainSimulationPage';
import SimulationAssessmentSteps from './SimulationAssessmentSteps';
import SimulationCodingSteps from './SimulationCodingSteps';
import SimulationInterviewSteps from './SimulationInterviewSteps';


const CompanySmulationSteps = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [resumeContent, setResumeContent] = useState("");

  const { loading: planing, fn: generateSimulationPlanFn, data: generatedPlan } = useFetch(generateSimulationPlan);
  const { fn: fetchingSimulationFn, data: fetchedSimulationData } = useFetch(startExistingSimulationPlan);
  const [isFetching, setIsFetching] = useState(false);

  const [currRoundData, setCurrRoundData] = useState(null);
  const [planData, setPlanData] = useState(null);

  useEffect(() => {
    if (!currRoundData) return;
    console.log(currRoundData);
    setStep(6);
  }, [currRoundData]);

  useEffect(() => {
    console.log(generatedPlan);
    console.log(fetchedSimulationData);

    const data = fetchedSimulationData ?? generatedPlan;

    if (data) {
      setIsFetching(false);
      setPlanData(data);
      setStep(5);
    }
  }, [generatedPlan, fetchedSimulationData]);

  useEffect(() => {
    const call = async () => {
      await fetchingSimulationFn({ sessionToken: "cmq4oxgk2000zm6sc8nrb8js0" });
    }
    call();
  }, [])

  const setAfterResumePage = () => {
    setStep(4);
  }

  const handlePlaningSimulation = async () => {
    try {
      console.log(formData, resumeContent);
      await generateSimulationPlanFn({ ...formData, resumeContent });
    } catch (error) {
      toast.error(error.message || "Failed to Design Coding Assesment");
    }
  }

  const handleBackToMainPage = async () => {
    try {
      console.log(planData.data.session.sessionToken);
      setIsFetching(true);
      await fetchingSimulationFn({ sessionToken: planData.data.session.sessionToken });
    } catch (error) {
      setIsFetching(false);
      toast.error(error.message || "Failed to simulation data");
    }

  }


  const dummyGeneratedPlan = {
    success: true,
    data: {
      remainingCredits: 9546,

      session: {
        id: "cmq4m8vd4000sm6scviea42e5",
        sessionToken: "cmq4m8vd4000tm6scxb6652zy",
        userId: "ebf66850-69b1-4e55-b900-8421631941a3",

        type: "COMPANY_SIMULATION",
        status: "STARTED",

        payload: {
          rounds: [
            {
              roundId: 1,
              roundName: "Initial Data Entry Assessment",
              roundType: "ASSESSMENT_CENTER",

              status: "PENDING",
              difficulty: "Easy",
              passingScore: 60,

              purpose:
                "Evaluate fundamental computer literacy, data accuracy, attention to detail, and basic aptitude as described in the job description.",

              sessionId: "cmq4ma0u4000vm6scrsr62mle",

              metadata: {
                topics: [
                  "Basic Computer Usage",
                  "Data Accuracy Principles",
                  "MS Office Basics (Excel, Word)",
                  "Typing Speed and Accuracy",
                ],

                followups: [
                  "Common Data Entry Errors and Prevention",
                  "Data Verification Methods",
                  "Basic Internet Navigation for Research",
                ],
              },
            },

            {
              roundId: 2,
              roundName: "Functional & Behavioral Interview",
              roundType: "MOCK_INTERVIEW",

              status: "LOCKED",
              difficulty: "Medium",
              passingScore: 65,

              purpose:
                "Assess candidate's motivation, work ethic, reliability, communication skills, and ability to follow instructions for a repetitive task-oriented role.",

              sessionId: null,

              metadata: {
                interviewType: "Behavioral",

                topics: [
                  "Motivation for Data Entry Role",
                  "Attention to Detail (Past Examples)",
                  "Following Instructions and Procedures",
                  "Time Management and Prioritization",
                ],

                followups: [
                  "Handling Repetitive Tasks",
                  "Contribution to Team Environment",
                  "Adaptability to New Systems",
                  "Career Aspirations (to understand fit for this role)",
                ],
              },
            },
          ],

          simulationMetadata: {
            companyName: "infosys",
            role: "data entry",

            hiringType: "Lateral",
            experienceLevel: "Fresher",

            totalRounds: 2,
            currentRoundIndex: 0,

            overallStatus: "IN_PROGRESS",

            jobDescription:
              "they ask 10 mcq in the assessment",

            resumeContent: "...very long resume content...",
          },
        },

        startedAt: "2026-06-04T11:28:38.626Z",
        submittedAt: null,
        expiresAt: "2026-07-04T11:28:38.626Z",

        durationSeconds: null,
        autoSubmitted: false,

        creditsUsed: 5,

        createdAt: "2026-06-04T11:28:38.631Z",
        updatedAt: "2026-06-04T11:28:38.631Z",

        linkedSessionIds: [],
      },

      userName: "ROKI MONDAL",
    },
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
        <MainSimulationPage
          planData={planData.data}
          // planData={null}
          setCurrRoundData={setCurrRoundData}
          loading={isFetching}
        />
      )

    case 6:
      return (
        currRoundData.roundType === "ASSESSMENT_CENTER" ?
          <SimulationAssessmentSteps
            roundData={currRoundData}
            metaData={{
              parentSessionId: planData.data.session.id,
              companyName: planData.data.session.payload.simulationMetadata.companyName,
              role: planData.data.session.payload.simulationMetadata.role,
              experienceLevel: planData.data.session.payload.simulationMetadata.experienceLevel,
              hiringType: planData.data.session.payload.simulationMetadata.hiringType,
            }}
            handleBackToMainPage={handleBackToMainPage}
          />
          :
          currRoundData.roundType === "CODING_ASSESSMENT"
            ?
            <SimulationCodingSteps
              roundData={currRoundData}
              metaData={{
                parentSessionId: planData.data.session.id,
                companyName: planData.data.session.payload.simulationMetadata.companyName,
                role: planData.data.session.payload.simulationMetadata.role,
                experienceLevel: planData.data.session.payload.simulationMetadata.experienceLevel,
                hiringType: planData.data.session.payload.simulationMetadata.hiringType,
              }}
              handleBackToMainPage={handleBackToMainPage}
            />
            :
            <SimulationInterviewSteps
              roundData={currRoundData}
              metaData={{
                parentSessionId: planData.data.session.id,
                companyName: planData.data.session.payload.simulationMetadata.companyName,
                role: planData.data.session.payload.simulationMetadata.role,
                jobDescription: planData.data.session.payload.simulationMetadata.jobDescription,
                resumeContent: planData.data.session.payload.simulationMetadata.resumeContent,
              }}
              handleBackToMainPage={handleBackToMainPage}
            />
      )
    // default:
    //   return null;
  }
  return (
    <div>CodingPageSteps</div>
  )
}

export default CompanySmulationSteps;