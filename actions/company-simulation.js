"use server"

import { callAI } from "@/Ai/callAI";
import { getGenerateSimulationPlan, getGenerateSimulationPlanPrompt } from "@/Ai/prompts/companySimulation";
import { db } from "@/lib/prisma";
import { auth, Session } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
})

const SIMULATION_GENERATION_CREDITS = 5;
const SIMULATION_EVALUATION_CREDITS = 10;

export async function generateSimulationPlan({ companyName, jobTitle, jobDescription, resumeContent, experienceLevel, hiringType }) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
    })

    if (!user) throw new Error("User not exist");

    if (user.credits < SIMULATION_GENERATION_CREDITS) {
        throw new Error(
            `Minimum ${SIMULATION_GENERATION_CREDITS} credits required to start hiring simulation`
        );
    }

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

    const payload = {
        companyName,
        jobTitle,
        jobDescription,
        resumeContent: maskedContent,
    }



    try {
        const cleanedText = await callAI(getGenerateSimulationPlanPrompt(payload));
        let simulationDetails;
        try {

            // console.log("prompt", prompt);
            const parsed = cleanedText;

            validateSimulationPlan(
                parsed
            );

            parsed.rounds = parsed.rounds.map(
                (round, index) => ({
                    ...round,

                    sessionId: null,

                    status:
                        index === 0
                            ? "PENDING"
                            : "LOCKED",
                })
            );

            simulationDetails = parsed;

        } catch (err) {
            console.error("Invalid JSON from AI:", cleanedText);

            throw new Error("AI returned invalid Hiring Plan format");
        }

        // console.log("simulationDetails", simulationDetails);

        let simulationSession;
        try {

            simulationSession = await db.simulationSession.create({
                data: {
                    userId: user.id,
                    type: "COMPANY_SIMULATION",
                    status: "STARTED",
                    creditsUsed: SIMULATION_GENERATION_CREDITS,
                    payload: {
                        simulationMetadata: {
                            companyName,
                            role: jobTitle,
                            experienceLevel,
                            hiringType,
                            resumeContent,
                            currentRoundIndex: 0,
                            totalRounds: simulationDetails.rounds.length,
                            overallStatus: "IN_PROGRESS",
                        },

                        rounds: simulationDetails.rounds,
                    },

                    startedAt: new Date(),

                    expiresAt: new Date(
                        Date.now() + 1000 * 60 * 60 * 24 * 30
                    ),
                },
            });
        } catch (error) {
            console.error("Simulation session creation error:", error);

            throw new Error("Failed to create simulation session");
        }

        const updatedUser =
            await db.user.update({
                where: {
                    id: user.id,
                },

                data: {
                    credits: {
                        decrement:
                            SIMULATION_GENERATION_CREDITS,
                    },
                },
            });

        const finalResponse = {
            success: true,
            data: {
                remainingCredits: updatedUser.credits,
                session: simulationSession,
                userName: user.name
            }
        }
        console.log(JSON.stringify(finalResponse));

        return finalResponse;
    } catch (error) {
        console.error("Error generating interview question:", error);
        throw new Error("Failed to generate interview question");
    }
}

export async function startExistingSimulationPlan({ sessionToken }) {

    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
    });

    if (!user) {
        throw new Error("User not exist");
    }

    const session =
        await db.simulationSession.findUnique({
            where: {
                sessionToken,
            },
        });

    if (!session) {
        throw new Error("Session not found");
    }

    if (session.userId !== user.id) {
        throw new Error("Unauthorized");
    }

    return {
        success: true,
        data: {
            remainingCredits: user.credits,
            session,
            userName: user.name
        }
    };
}


function validateSimulationPlan(plan) {

    if (!Array.isArray(plan.rounds)) {
        throw new Error(
            "Missing rounds"
        );
    }

    if (
        plan.rounds.length < 2 ||
        plan.rounds.length > 6
    ) {
        throw new Error(
            "Invalid rounds count"
        );
    }

    for (const round of plan.rounds) {

        if (!round.roundId) {
            throw new Error(
                "Missing roundId"
            );
        }

        if (!round.roundName) {
            throw new Error(
                "Missing roundName"
            );
        }

        if (!round.roundType) {
            throw new Error(
                "Missing roundType"
            );
        }

        if (!round.purpose) {
            throw new Error(
                "Missing purpose"
            );
        }

        if (!round.metadata) {
            throw new Error(
                "Missing metadata"
            );
        }

        if (
            ![
                "CODING_ASSESSMENT",
                "MOCK_INTERVIEW",
                "ASSESSMENT_CENTER",
            ].includes(round.roundType)
        ) {
            throw new Error(
                "Invalid roundType"
            );
        }
    }

    return true;
}