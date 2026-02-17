"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
})

export async function generateInterviewQuestion({ jobTitle, jobDescription, interviewType, resumeContent }) {
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
You are a highly experienced professional interviewer conducting a real-time AUDIO CALL interview.

This interview will happen via voice call, so questions must sound natural, conversational, and human-like — not robotic or written like an exam.

Your task is to design a complete interview plan.

INPUTS:

Job Title: ${jobTitle}

Interview Type: ${interviewType}

Job Description: ${jobDescription}

Candidate Resume: ${maskedContent}


YOUR RESPONSIBILITIES:

1. Carefully analyze:
   - Job Title
   - Job Description
   - Candidate Resume
   - Required skills
   - Responsibilities
   - Experience level (Junior, Mid, Senior)

2. Based on the analysis, decide an appropriate interview duration.

IMPORTANT RULES FOR DURATION:
- Minimum duration: 15 minutes
- Maximum duration: 60 minutes
- Duration must be realistic for the role and experience level
- Junior roles → shorter interviews
- Senior roles → longer interviews
- Complex roles → longer interviews

3. Based on the selected duration, generate the appropriate number of questions.

Duration → Question guideline:

- 15 min → 4–6 questions
- 20 min → 5–8 questions
- 30 min → 7–10 questions
- 45 min → 10–14 questions
- 60 min → 12–18 questions

4. This interview happens via AUDIO CALL, so questions must:

- Sound natural and conversational
- Be easy to speak and understand
- Be realistic like real interviewers ask
- Avoid overly long or robotic questions

5. Ensure proper interview flow:

Order:

- Introduction / warmup
- Resume-based questions
- Experience questions
- Technical / problem solving questions
- Role-specific questions
- Behavioral / leadership questions (if applicable)
- Closing question

6. Questions must be personalized based on:

- Resume
- Job Description
- Interview Type
- Job Title

7. Include follow-up questions where appropriate.

OUTPUT FORMAT:

Return ONLY valid JSON.

{
  "interviewPlan": {
    "jobTitle": "{{jobTitle}}",
    "interviewType": "{{interviewType}}",
    "totalDuration": number, 
    "questions": [
      {
        "question": "string",
        "type": "Introduction | Technical | Behavioral | Experience | Problem Solving | Leadership",
        "difficulty": "Easy | Medium | Hard",
        "expectedAnswerTimeMinutes": number,
        "followUps": ["string", "string"]
      }
    ]
  }
}

IMPORTANT OUTPUT RULES:

- totalDuration must be <= 60 minutes
- totalDuration must be realistic
- Questions must match duration
- Questions must be conversational (audio call friendly)
- Do NOT include explanations
- Do NOT include anything outside JSON
- Return ONLY JSON

GOAL:

Create a realistic, professional, and fully structured AI interview plan suitable for a real-time voice interview.
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

        return { success: true, data: interviewDetails };
    } catch (error) {
        console.error("Error generating interview question:", error);
        throw new Error("Failed to generate interview question");
    }
}