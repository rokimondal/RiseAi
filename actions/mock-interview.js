"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
})

export async function generateInterviewQuestion({ companyName, jobTitle, jobDescription, interviewType, resumeContent }) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
        include: {
            industryInsight: true,
        },
    })

    if (!user) throw new Error("User not exist");

    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const mobileRegex = /\b\+?\d{7,15}\b/g;
    const linkedinRegex = /https:\/\/(www\.)?linkedin\.com\/[^\s"'<>]+/g;
    const twitterRegex = /https:\/\/x\.com\/[^\s"'<>]+/g;

    const emails = resumeContent.match(emailRegex) || [];
    const mobiles = resumeContent.match(mobileRegex) || [];
    const linkedins = resumeContent.match(linkedinRegex) || [];
    const twitters = resumeContent.match(twitterRegex) || [];

    const PLACEHOLDERS = {
        email: "__MASK_EMAIL__UNIQUE123__",
        mobile: "__MASK_MOBILE__UNIQUE123__",
        linkedin: "__MASK_LINKEDIN__UNIQUE123__",
        twitter: "__MASK_TWITTER__UNIQUE123__",
    };

    function maskAll(content, matches, placeholder) {
        matches.forEach(item => {
            content = content.split(item).join(placeholder);
        });
        return content;
    }
    let maskedContent = resumeContent;
    maskedContent = maskAll(maskedContent, emails, PLACEHOLDERS.email);
    maskedContent = maskAll(maskedContent, mobiles, PLACEHOLDERS.mobile);
    maskedContent = maskAll(maskedContent, linkedins, PLACEHOLDERS.linkedin);
    maskedContent = maskAll(maskedContent, twitters, PLACEHOLDERS.twitter);

    const prompt = `
You are conducting a real professional interview via LIVE AUDIO CALL.

This is a spoken conversation, not a written test.

Your questions must sound exactly like a real, experienced interviewer speaking to a candidate.

INPUTS:

Company Name: ${companyName}

Job Title: ${jobTitle}

Interview Type: ${interviewType}

Job Description:
${jobDescription}

Candidate Resume:
${maskedContent}


PRIMARY OBJECTIVE:

Design a realistic, structured interview plan suitable for a live voice interview.


CRITICAL SPEECH RULES (VERY IMPORTANT):

Questions MUST sound natural when spoken aloud.

GOOD examples:

• "Can you walk me through your experience with Node.js?"
• "How did you handle that situation?"
• "What challenges did you face in that project?"

BAD examples (DO NOT generate):

• "Explain Node.js."
• "Define polymorphism."
• "Describe the architecture of distributed systems in detail."

Questions must feel conversational, professional, and realistic.


QUESTION LENGTH RULE:

Each question must be:

• Clear
• Concise
• Easy to speak
• Easy to understand

Maximum question length: 20 words preferred, 30 words absolute maximum.


INTERVIEW DESIGN PROCESS:

Analyze carefully:

• Job Title
• Job Description
• Resume
• Skills
• Experience level


DETERMINE INTERVIEW DURATION:

Minimum: 15 minutes  
Maximum: 60 minutes  

Guidelines:

Junior → 15–30 minutes  
Mid → 30–45 minutes  
Senior → 45–60 minutes  


QUESTION COUNT GUIDELINES:

15 min → 4–6 questions  
20 min → 5–8 questions  
30 min → 7–10 questions  
45 min → 10–14 questions  
60 min → 12–18 questions  


INTERVIEW FLOW ORDER:

1. Introduction / background
2. Resume-based questions
3. Experience questions
4. Technical / role-specific questions
5. Problem solving questions
6. Behavioral questions
7. Closing question


FOLLOW-UP QUESTIONS:

Include follow-ups when useful.

Follow-ups must also sound conversational.

Example:

Question:
"Can you explain a project you worked on?"

Follow-ups:
• "What was your role?"
• "What challenges did you face?"


PERSONALIZATION REQUIREMENT:

Questions must be personalized based on:

• Resume
• Job description
• Role
• Experience level


OUTPUT FORMAT:

Return ONLY valid JSON.

{
  "interviewPlan": {
    "jobTitle": "${jobTitle}",
    "interviewType": "${interviewType}",
    "totalDuration": number,
    "questions": [
      {
        "question": "string",
        "type": "Introduction | Technical | Behavioral | Experience | Problem Solving | Leadership",
        "difficulty": "Easy | Medium | Hard",
        "expectedAnswerTimeMinutes": number,
        "followUps": ["string"]
      }
    ]
  }
}


STRICT OUTPUT RULES:

• Output ONLY JSON
• No explanations
• No markdown
• No extra text
• totalDuration must be realistic
• Questions must match duration
• Questions must sound natural in spoken conversation


FINAL GOAL:

Create a realistic interview plan that sounds like it was designed by a highly experienced professional interviewer for a live voice interview.
`;


    try {
        // console.log("prompt: ", prompt);
        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").replace(/```/g, "").trim();
        let interviewDetails;
        try {

            // console.log("prompt", prompt);
            const parsed = JSON.parse(cleanedText);
            if (!parsed.interviewPlan) {
                throw new Error("Missing interviewPlan in AI response");
            }

            interviewDetails = parsed.interviewPlan;

        } catch (err) {
            console.error("Invalid JSON from AI:", cleanedText);

            throw new Error("AI returned invalid interview format");
        }

        console.log("interviewDetails", interviewDetails);

        return { success: true, data: { ...interviewDetails, userName: user.name } };
    } catch (error) {
        console.error("Error generating interview question:", error);
        throw new Error("Failed to generate interview question");
    }
}