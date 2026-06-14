# 🚀 RiseAI

### AI-Powered Career Growth & Interview Preparation Platform

🌐 Live Demo:[**https://rise-ai-umber.vercel.app/**](https://rise-ai-umber.vercel.app/)

An AI-powered career growth and interview preparation platform designed to help users improve resumes, generate cover letters, practice coding interviews, conduct mock interviews, complete assessment centers, and simulate real-world company hiring processes.

---

# 📌 Overview

RiseAI combines AI, real-time voice interviews, coding assessments, assessment centers, industry insights, and job tracking into a unified career development platform.

### Key Capabilities

* 📄 Resume Builder
* 📝 Cover Letter Generator
* 🎤 Mock Interview Simulator
* 💻 Coding Assessment Platform
* 📚 Assessment Center
* 🏢 Company Hiring Simulation
* 📈 Industry Insights Dashboard
* 💼 Job Tracker
* 💳 Credit Management System

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

* Next.js App Router
* React
* Zustand
* Tiptap Editor
* Monaco Editor
* Recharts
* Tailwind CSS

## Backend

* Next.js Server Actions
* Prisma ORM
* PostgreSQL

## AI Services

* Gemini
* OpenRouter
* Vapi AI
* Deepgram

## Authentication

* Clerk

## Background Processing

* Inngest

---

# ✨ Core Features

## 📄 Resume Builder

A unified resume management system that allows users to generate, improve, edit, and save resumes using AI.

### Features

* AI Resume Generation
* AI Resume Improvement
* Resume Editing
* ATS Optimization
* Resume Storage

### Workflow

```text
User Information
      │
      ▼
generateRESUME
      │
      ▼
AI Generation
      │
      ▼
Resume Editor
      │
      ▼
Save Resume
```

### Database

* User
* Resume

---

## 📝 Cover Letter Generator

Generate personalized cover letters using job descriptions and user profile information.

### Workflow

```text
Job Details
      │
      ▼
Fetch User Profile
      │
      ▼
AI Generation
      │
      ▼
Save Cover Letter
      │
      ▼
Display Result
```

### Database

* User
* CoverLetter

---

## 📈 Industry Insights Dashboard

Provides:

* Salary Insights
* Industry Trends
* Growth Predictions
* Skills Demand Analysis
* Career Recommendations

### Workflow

```text
Dashboard Request
      │
      ▼
Check Cache
      │
      ▼
Generate AI Insights
      │
      ▼
Store Insights
      │
      ▼
Dashboard Analytics
```

### Database

* User
* IndustryInsight

---

## 🎤 Mock Interview Simulator

Generate AI-powered interview sessions and evaluate responses.

### Workflow

```text
Interview Setup
      │
      ▼
AI Question Generation
      │
      ▼
Interview Session
      │
      ▼
Evaluation
      │
      ▼
Feedback Report
```

### Database

* SimulationSession
* SimulationResult

---

## 🎙 Live Voice Interview

Real-time voice interviews powered by Vapi AI and Deepgram.

### Workflow

```text
Interview Plan
      │
      ▼
Voice Session
      │
      ▼
Transcript Collection
      │
      ▼
AI Evaluation
      │
      ▼
Feedback Report
```

### Database

* SimulationSession
* SimulationResult

---

## 💻 Coding Assessment Platform

Practice coding challenges and company-specific coding rounds.

### Workflow

```text
Generate Assessment
       │
       ▼
Coding Challenge
       │
       ▼
Run Code
       │
       ▼
Code Execution Engine
       │
       ▼
Submit Solution
       │
       ▼
Evaluation
       │
       ▼
Feedback Report
```

### Database

* SimulationSession
* SimulationResult

---

## 📚 Assessment Center

Multi-section examination system with AI-generated content and evaluation.

### Supported Questions

* Single Select
* Multi Select
* Short Answer
* Long Answer

### Workflow

```text
Assessment Planning
        │
        ▼
Section Generation
        │
        ▼
Assessment Session
        │
        ▼
Evaluation
        │
        ▼
Result Generation
```

### Database

* SimulationSession
* SimulationResult

---

## 🏢 Company Hiring Simulation

Simulates real-world company recruitment pipelines.

### Supported Rounds

* Coding Round
* Technical Interview
* Assessment Round
* HR Interview

### Workflow

```text
Simulation Planning
       │
       ▼
Round Execution
       │
       ▼
Evaluation
       │
       ▼
Progress Tracking
       │
       ▼
Final Hiring Report
```

### Database

* SimulationSession
* SimulationResult

---

## 💼 Job Tracker

Discover and track job opportunities.

### Workflow

```text
Industry Keywords
        │
        ▼
Job Search
        │
        ▼
Job Extraction
        │
        ▼
Application Tracking
```

### Database

* AppliedJob

---

# 🤖 AI Architecture

All AI-powered modules communicate through a centralized AI orchestration layer.

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

Used By:

* Resume Builder
* Cover Letter Generator
* Industry Insights
* Mock Interview
* Voice Interview
* Coding Assessment
* Assessment Center
* Company Simulation

---

# 💳 Credit System

RiseAI uses a credit-based usage model.

### Credit Usage

* Content Generation
* Assessment Generation
* Interview Generation
* Evaluations
* Runtime Execution

### Workflow

```text
Request
   │
   ▼
Credit Check
   │
   ▼
Deduct Credits
   │
   ▼
Execute Feature
   │
   ▼
Log Transaction
```

### Database

* User
* CreditTransaction

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

* SimulationSession
* SimulationResult

---

# 🗄 Database Models

### Core Models

* User
* Resume
* CoverLetter
* IndustryInsight
* AppliedJob
* Assessment
* SimulationSession
* SimulationResult
* CreditTransaction

---

# 🔐 Authentication

Authentication is powered by Clerk.

### Features

* Sign Up
* Sign In
* Session Management
* User Synchronization
* Protected Routes

---

# 📈 Background Jobs

Powered by Inngest.

### Responsibilities

* Industry Insight Refresh
* Scheduled Processing
* AI Data Updates
* Background Tasks

---

# 🎯 Mission

To provide a complete AI-powered career preparation ecosystem that helps users improve their professional profile, practice real interview scenarios, and prepare for modern hiring processes.
