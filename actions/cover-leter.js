"use server"

import { callAI } from "@/Ai/callAI";
import { getCoverLetterGenerationPrompt } from "@/Ai/prompts/coverLetter";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";


export async function generateCoverLetter(data) {
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
        const content = await callAI(getCoverLetterGenerationPrompt(user, data));
        console.log(content);
        const coverLetter = await db.coverLetter.create({
            data: {
                content: content.coverLetter,
                jobDescription: data.jobDescription,
                companyName: data.companyName,
                jobTitle: data.jobTitle,
                status: "completed",
                userId: user.id,
            }
        })

        console.log("Schema", coverLetter);
        console.log(coverLetter);
        return coverLetter;
    } catch (error) {
        console.log(error);
        console.error("Error generating Cover Letter:", error.message);
        throw new Error("Cover Letter generation failed");
    }
}

export async function getCoverLetters() {
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
        return await db.coverLetter.findMany({
            where: {
                userId: user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        })

    } catch (error) {
        console.error("Error fetching Cover Letters:", error.message);
        throw new Error("Cover Letters fetching failed");
    }
}

export async function getCoverLetter(id) {
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
        return await db.coverLetter.findUnique({
            where: {
                id,
                userId: user.id
            },
        })

    } catch (error) {
        console.error("Error fetching Cover Letter:", error.message);
        throw new Error("Cover Letter fetching failed");
    }
}

export async function updateCoverLetter(id, newContent) {
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
        return await db.coverLetter.update({
            where: {
                id,
            },
            data: {
                content: newContent,
            },
        })

    } catch (error) {
        console.error("Error deletionCover Letter:", error.message);
        throw new Error("Cover Letter deletion failed");
    }
}

export async function deleteCoverLetter(id) {
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
        return await db.coverLetter.delete({
            where: {
                id
            },
        })

    } catch (error) {
        console.error("Error deletionCover Letter:", error.message);
        throw new Error("Cover Letter deletion failed");
    }
}