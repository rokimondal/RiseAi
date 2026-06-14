# 🚀 RiseAI

An AI-powered career growth and interview preparation platform designed to help users improve resumes, generate cover letters, practice coding interviews, conduct mock interviews, complete assessment centers, and simulate real-world company hiring processes.

---

# 📌 Overview

RiseAI combines AI, real-time voice interviews, coding assessments, assessment centers, industry insights, and job tracking into a unified career development platform.

The platform enables users to:

- Generate professional resumes
- Improve existing resumes
- Generate tailored cover letters
- Practice technical interviews
- Complete coding challenges
- Participate in assessment centers
- Simulate real company hiring pipelines
- Track job applications
- Receive AI-powered feedback and recommendations

---

# 🏗 System Architecture

```text
User
 │
 ▼
Next.js Frontend
 │
 ▼
Server Actions
 │
 ├── AI Service Layer
 │      ├── Gemini
 │      ├── OpenRouter
 │      └── Vapi
 │
 ├── Business Logic Layer
 │      ├── Resume Engine
 │      ├── Cover Letter Engine
 │      ├── Assessment Engine
 │      ├── Interview Engine
 │      ├── Coding Engine
 │      └── Credit Engine
 │
 ├── Code Execution Engine
 │
 └── Prisma ORM
         │
         ▼
    PostgreSQL
```

---

# 🛠 Technology Stack

## Frontend

- Next.js App Router
- React
- Zustand
- Tiptap Editor
- Monaco Editor
- Recharts
- TailwindCSS

## Backend

- Next.js Server Actions
- Prisma ORM
- PostgreSQL

## AI Services

- Gemini
- OpenRouter
- Vapi AI
- Deepgram

## Authentication

- Clerk

## Background Processing

- Inngest

---

# ✨ Core Features

---

## 1. Resume Generator

Generates professional resumes from user-provided information.

### Workflow

User Input
→ Server Action
→ AI Generation
→ Resume Output
→ Save Resume

### Database

- User
- Resume

---

## 2. Resume Improver

Improves existing resumes using AI while protecting sensitive information.

### Workflow

Resume Content
→ Mask Personal Data
→ AI Improvement
→ Restore Data
→ Updated Resume

### Database

- Resume

---

## 3. Cover Letter Generator

Creates customized cover letters based on job descriptions and user profiles.

### Workflow

Job Details
→ Fetch User Profile
→ AI Generation
→ Save Cover Letter
→ Display Result

### Database

- User
- CoverLetter

---

## 4. Industry Insights Dashboard

Provides:

- Salary ranges
- Market outlook
- Industry growth
- Skills demand
- Career trends

### Workflow

Dashboard Request
→ Check Cache
→ AI Generate Insights
→ Store Insights
→ Display Dashboard

### Database

- User
- IndustryInsight

---

## 5. Technical Interview Simulator

Generates interview questions and evaluates responses.

### Workflow

Interview Setup
→ AI Question Generation
→ User Answers
→ Evaluation Engine
→ Result Generation

### Database

- SimulationSession
- SimulationResult

---

## 6. Live Voice Mock Interview

Uses Vapi AI and Deepgram for real-time interview experiences.

### Workflow

Interview Plan
→ Vapi Voice Session
→ Transcript Collection
→ AI Evaluation
→ Feedback Report

### Database

- SimulationSession
- SimulationResult

---

## 7. Coding Assessment

Generates coding challenges and evaluates solutions.

### Workflow

Assessment Generation
→ AI Problem Creation
→ User Coding
→ Sandbox Execution
→ AI Evaluation
→ Result Report

### Database

- SimulationSession
- SimulationResult

---

## 8. Assessment Center

Creates multi-section examinations.

### Supported Question Types

- Single Select
- Multi Select
- Short Answer
- Long Answer

### Workflow

Assessment Planning
→ AI Section Generation
→ User Submission
→ Evaluation
→ Result Generation

### Database

- SimulationSession
- SimulationResult

---

## 9. Company Hiring Simulation

Simulates complete hiring pipelines.

### Supported Rounds

- Coding Round
- Technical Round
- Assessment Round
- HR Interview

### Workflow

Simulation Planning
→ Round Execution
→ Evaluation
→ Progress Tracking
→ Final Hiring Report

### Database

- SimulationSession
- SimulationResult

---

## 10. LinkedIn Job Tracker

Tracks relevant jobs and application statuses.

### Workflow

Industry Keywords
→ LinkedIn Search
→ Job Extraction
→ Application Tracking

### Database

- AppliedJob

---

# 🤖 AI Architecture

All AI-powered features utilize a centralized AI layer.

```text
Feature
    │
    ▼
callAI()
    │
    ├── Gemini
    ├── OpenRouter
    └── Fallback Models
```

Used by:

- Resume Generator
- Resume Improver
- Cover Letter Generator
- Interview Simulator
- Assessment Center
- Coding Evaluation
- Industry Insights
- Company Simulation

---

# 💳 Credit System

RiseAI uses a credit-based consumption model.

### Credit Usage

- Content Generation
- Assessment Creation
- Interview Creation
- Evaluations
- Runtime Execution

### Workflow

Request
→ Credit Check
→ Deduct Credits
→ Execute Feature
→ Log Transaction

### Database

- User
- CreditTransaction

---

# 📊 Session Lifecycle

All preparation modules follow a common lifecycle.

```text
Session Created
        │
        ▼
     STARTED
        │
        ▼
 User Interaction
        │
        ▼
    SUBMITTED
        │
        ▼
   EVALUATION
        │
        ▼
    COMPLETED
```

### Database

- SimulationSession
- SimulationResult

---

# 🗄 Database Models

## Core Models

- User
- Resume
- CoverLetter
- IndustryInsight
- AppliedJob
- Assessment
- SimulationSession
- SimulationResult
- CreditTransaction

---

# 🔐 Authentication

Authentication is managed using Clerk.

Capabilities:

- Sign Up
- Sign In
- Session Validation
- User Synchronization

---

# 📈 Background Jobs

Inngest is used for:

- Industry Insight Refresh
- Scheduled Processing
- AI Data Updates

---

# 🎯 Mission

To provide a complete AI-powered career preparation ecosystem that helps users improve their professional profile, practice real interview scenarios, and prepare for modern hiring processes.
