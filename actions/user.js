"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
    })

    if (!user) throw new Error("User not exist");

    try {
        let insights = null;
        const existingInsight = await db.industryInsight.findUnique({
            where: {
                industry: data.industry,
            }
        });

        if (!existingInsight) {
            insights = await generateAIInsights(data.industry);
        }

        const result = await db.$transaction(
            async (tx) => {
                let industryInsight = await tx.industryInsight.findUnique({
                    where: { industry: data.industry },
                });

                if (!industryInsight && insights) {
                    industryInsight = await tx.industryInsight.create({
                        data: {
                            industry: data.industry,
                            ...insights,
                            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        }
                    })
                }

                const updatedUser = await tx.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        industry: data.industry,
                        bio: data.bio,
                        experience: data.experience,
                        skills: data.skills,
                    }
                });

                return { updatedUser, industryInsight };
            },
            {
                timeout: 30000,
            }
        )

        return { success: true, ...result };
    } catch (error) {
        console.error("Error updating user & industry: ", error.message);
        throw new Error("Failed to update profile");
    }
}

export async function getUserOnboardingStatus() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
    })

    if (!user) throw new Error("User not exist");
    try {
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            },
            select: {
                industry: true,
            }
        })

        return { isOnboarded: !!user?.industry };
    } catch (error) {
        console.error("Error checking onBoarding status: ", error.message);
        throw new Error("Failed to check onBoarding status");
    }
}