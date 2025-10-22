"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
})

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


    const prompt = `
You are an expert career assistant specializing in professional writing.

Generate a highly personalized and compelling **cover letter** for a **${data.jobTitle}** position at **${data.companyName}**.

### Candidate Information:
- Industry: ${user.industry || "Not specified"}
- Years of Experience: ${user.experience || "Not specified"}
- Key Skills: ${user.skills?.join(", ") || "Not specified"}
- Professional Background: ${user.bio || "Not specified"}

### Job Description:
${data.jobDescription || "No description provided."}

### Instructions:
1. Write in a **professional yet enthusiastic tone** that reflects genuine interest in the role.
2. Highlight the candidate’s **most relevant skills, achievements, and experience** that align with the company’s needs.
3. Mention the company name **naturally throughout** to make the letter feel personalized.
4. Keep it **concise and impactful** (between **250–400 words**).
5. Use **proper business letter formatting**, starting with the candidate’s details, date, company info, greeting, body, and closing.
6. Avoid generic phrases—make it sound authentic and tailored to the given information.
7. End with a **strong, confident closing paragraph** inviting further discussion.

### Output Format:
Provide the final cover letter **in plain text format**, without markdown symbols or code fences.
`;



    try {
        const result = await model.generateContent(prompt)
        const content = result.response.text().trim();
        const coverLetter = await db.coverLetter.create({
            data: {
                content,
                jobDescription: data.jobDescription,
                companyName: data.companyName,
                jobTitle: data.jobTitle,
                status: "completed",
                userId: user.id,
            }
        })

        console.log("Schema", coverLetter);
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