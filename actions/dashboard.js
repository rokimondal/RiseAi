"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
})


export async function generateAIInsights(industry) {
    const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "HIGH" | "MEDIUM" | "LOW",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGETIVE",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }

          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
          skills write as less word as posible.
        `;


    try {
        const result = await model.generateContent(prompt)
        const response = result.response;
        const text = response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Error generating AI insights:", error.message);
        throw new Error("AI generation failed");
    }
}

export async function getIndustryInsights() {
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

    try {
        if (!user.industryInsight) {
            const insights = await generateAIInsights(user.industry);

            const industryInsight = await db.industryInsight.create({
                data: {
                    industry: user.industry,
                    ...insights,
                    nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                }
            });

            return industryInsight;
        }

        return user.industryInsight;

    } catch (error) {
        console.error("Error get industry insights: ", error.message);
        throw new Error("Failed to get industry insights");
    }
}