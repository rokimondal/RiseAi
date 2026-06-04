"use server"

import { callAI } from "@/Ai/callAI";
import { getGenerateQuizPrompt } from "@/Ai/prompts/mockTest";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function generateQuiz() {
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
        const quiz = await callAI(getGenerateQuizPrompt(user));

        return quiz.questions;
    } catch (error) {
        console.error("Error generating quiz questions:", error.message);
        throw new Error("Failed to generate quiz questions");
    }
}

export async function saveQuizResult(questions, answeres, score) {
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

    const questionResults = questions.map((q, index) => ({
        question: q.question,
        answere: q.correctAnswer,
        userAnswere: answeres[index],
        isCorrect: q.correctAnswer == answeres[index],
        explanation: q.explanation,
    }));

    const wrongAnswers = questionResults.filter(q => !q.isCorrect);

    let improvementTip = null;

    if (wrongAnswers.length > 0) {
        const wrongQuestionsText = wrongAnswers
            .map(
                (q) =>
                    `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
            )
            .join("\n\n");

        const improvementPrompt = `
      The user got the following ${user.industry} technical interview questions wrong:
      
      ${wrongQuestionsText}

      Based on these mistakes, provide a concise, specific improvement tip.
      Focus on the knowledge gaps revealed by these wrong answers.
      Keep the response under 2 sentences and make it encouraging.
      Don't explicitly mention the mistakes, instead focus on what to learn/practice.
    `;

        try {
            const tipResult = await model.generateContent(improvementPrompt)
            improvementTip = tipResult.response.text().trim();
        } catch (error) {
            console.error("Error generating improvement tip:", error.message);
        }
    }

    try {
        const assessment = await db.assessment.create({
            data: {
                userId: user.id,
                quizScore: score,
                questions: questionResults,
                category: "Technical",
                improvementTip,
            }
        });

        return assessment;
    } catch (error) {
        console.error("Error saving quiz result:", error);
        throw new Error("Failed to save quiz result");
    }
}

export async function getAssessments() {
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

    if (!user) throw new Error("User not exist")

    try {
        const assessments = await db.assessment.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                createdAt: "desc",
            }
        })

        return assessments;
    } catch (error) {
        console.error("Error fetching assessments:", error);
        throw new Error("Failed to fetch assessments");
    }
}