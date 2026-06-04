"use server"

import { callAI } from "@/Ai/callAI";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function generateAIInsights(industry) {
    try {
        const cleanedText = await callAI(getGenerateIndustryPrompt(industry));

        return cleanedText;
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