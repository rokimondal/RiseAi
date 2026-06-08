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

  // useEffect(() => {
  //   const call = async () => {
  //     console.log("hi")
  //     await fetchingSimulationFn({ sessionToken: "cmq4oxgk2000zm6sc8nrb8js0" });
  //   }
  //   call();
  // }, [])

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
        payload: { "rounds": [{ "status": "PENDING", "purpose": "Evaluate fundamental computer literacy, data accuracy, attention to detail, and basic aptitude as described in the job description.", "roundId": 1, "metadata": { "topics": ["Basic Computer Usage", "Data Accuracy Principles", "MS Office Basics (Excel, Word)", "Typing Speed and Accuracy"], "followups": ["Common Data Entry Errors and Prevention", "Data Verification Methods", "Basic Internet Navigation for Research"] }, "roundName": "Initial Data Entry Assessment", "roundType": "ASSESSMENT_CENTER", "sessionId": "cmq4ma0u4000vm6scrsr62mle", "difficulty": "Easy", "passingScore": 60 }, { "status": "LOCKED", "purpose": "Assess candidate's motivation, work ethic, reliability, communication skills, and ability to follow instructions for a repetitive task-oriented role.", "roundId": 2, "metadata": { "topics": ["Motivation for Data Entry Role", "Attention to Detail (Past Examples)", "Following Instructions and Procedures", "Time Management and Prioritization"], "followups": ["Handling Repetitive Tasks", "Contribution to Team Environment", "Adaptability to New Systems", "Career Aspirations (to understand fit for this role)"], "interviewType": "Behavioral" }, "roundName": "Functional & Behavioral Interview", "roundType": "MOCK_INTERVIEW", "sessionId": null, "difficulty": "Medium", "passingScore": 65 }], "simulationMetadata": { "role": "data entry", "hiringType": "Lateral", "companyName": "infosys", "totalRounds": 2, "overallStatus": "IN_PROGRESS", "resumeContent": "ROKI   MONDAL  BTECH,   COMPUTER   SCIENCE   rokimondal974833 @gmail.com  Newtown,   Kolkata,   India   (+91)   9748334500  @rokimondal   / RokiMondal26   / roki-mondal  SKILLS     Programming   Language:   Java,   JavaScript,   SQL,   HTML   &   CSS     L ibraries/Frameworks:   Node.js,   Express.js,   React.js,   Next.js,   Tailwind,   Mongoose,   Clerk,   ShadCN   UI     Development   Tools:   VS   Code,   GitHub,   Postman     Operating   System:   Windows,   macOS     Core   Concepts:   Data   Structure   &   Algorithm,   DBMS,   OOP   concepts,   Computer   Networks,   RESTful   APIs,   Authentication   &  Authorization,   AI   Integration     Soft   Skills:   Quick   Learner,   Adaptability,   Team   Collaboration  EDUCATION     B.Tech   in   Computer   Science   and   Engineering   |   Dr.   Sudhir   Chandra   Sur   Institute   of   Technology   &   Sports   Complex  CGPA:   8.   |   Expected   Graduation:   2026     XII   ( WBCHSE )   |   Bhagowanpur   High   School   (H.S.)  8 6 . 6 %   |   2022     X   ( WB B SE )   |   Bhagowanpur   High   School   (H.S.)  61 . 7 %   |   202 0  PROJECTS     Rise   Ai   (FullStack   Project)   |   Next.js,   React,   Tailwind   CSS,   Prisma,   NeonDB,   Clerk,   Inngest,   Gemini   API     Built   an   AI-powered   career   coach   platform   with   weekly   industry   insights,   skill   recommendations,   and   salary   trends  visualizations.     Implemented   AI-driven   mock   test   generation   with   role-based   personalization,   performance   visualizations   and   detailed  reports.     Built   an   intelligent   resume   editor   with   AI-based   resume   generation,   improvement   and   cover   letter   creation   using   gemini  API  [ Demo ]   [ Source   code ]     Language   Learning   Platform   (Full-Stack   Project)   |   React.js,   Node.js,   Express.js,   MongoDB,   TanStack   Query,  Tailwind   CSS,   Zustand,   JWT,   Nodemailer,   Axios,   Stream,   C loudinary     Buil t   a   platform   enabling   learners   to   connect   via   chat   and   video   calls   using   Stream.     Developed   a   secure   authentication   system   with   email   verification,   password   or   code   based   login,   password   reset,   and  automatic   cleanup   of   unused   verification   codes.     Implemented   user   profile   management,   including   profile   updates,   profile   photo   uploads   and   automatic   removal   of   unused  images.  [ Demo ]   [ Source   code ]     Online   Bookstore   (FullStack   Project)   |   Node.js,   Express,   Mongodb,   React,   Firebase     Developed   a   full-stack   online   bookstore   supporting   user   registration,   book   listings   and   order   management.     Added   role-based   access   control   for   users   and   admins,   enabling   admin-level   book   and   order   management  [ Demo ]   [ Frontend ]   [ Backend ]  ACHIEVEMENTS  Winner   -   Internal   College   Hackathon   for   proposing   a   unique   and   innovative   solution  Solved   250+   problems   on   LeetCode ,   earning   100+   day   consistency   badges .  INTERESTS  Exploring   new   technologies,   creative   work   in   cinematography,   video   editing,   VFX,   3D   animation .", "jobDescription": "they ask 10 mcq in the assessment", "experienceLevel": "Fresher", "currentRoundIndex": 0 } },
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
                experienceLevel: planData.data.session.payload.simulationMetadata.experienceLevel,
                hiringType: planData.data.session.payload.simulationMetadata.hiringType,
                jobDescription: planData.data.session.payload.simulationMetadata.jobDescription,
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