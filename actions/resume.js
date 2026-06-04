"use server"

import { callAI } from "@/Ai/callAI";
import { getGenerateResumePrompt, getImproveResumePrompt } from "@/Ai/prompts/resume";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function saveResume(content) {
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
        const resume = await db.resume.upsert({
            where: {
                userId: user.id,
            },
            update: {
                content,
            },
            create: {
                userId: user.id,
                content,
            }
        })

        return { success: true, data: resume };
    } catch (error) {
        console.error("Error saving resume:", error);
        throw new Error("Failed to save resume");
    }
}

export async function getResume() {
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
        return await db.resume.findUnique({
            where: {
                userId: user.id
            }
        })
    } catch (error) {
        console.error("Error get resume: ", error.message);
        throw new Error("Failed to get resume");
    }
}

export async function improveRESUME({ editorContent }) {
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

    const emails = editorContent.match(emailRegex) || [];
    const mobiles = editorContent.match(mobileRegex) || [];
    const linkedins = editorContent.match(linkedinRegex) || [];
    const twitters = editorContent.match(twitterRegex) || [];

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
    let maskedContent = editorContent;
    maskedContent = maskAll(maskedContent, emails, PLACEHOLDERS.email);
    maskedContent = maskAll(maskedContent, mobiles, PLACEHOLDERS.mobile);
    maskedContent = maskAll(maskedContent, linkedins, PLACEHOLDERS.linkedin);
    maskedContent = maskAll(maskedContent, twitters, PLACEHOLDERS.twitter);

    try {
        const response = await callAI(
            getImproveResumePrompt(maskedContent)
        );
        console.log(response);
        let improvedContent;
        try {
            const parsed = response;

            improvedContent = parsed.html || parsed.content || "";
        } catch (err) {
            console.warn("Failed to parse AI response as JSON, fallback to raw content.");
            improvedContent = cleanedText;
        }
        improvedContent = improvedContent.trim();

        // console.log("improved content", improvedContent);
        function unmaskAll(content, matches, placeholder, defaultValue) {
            if (matches.length > 0) {
                matches.forEach(item => {
                    content = content.split(placeholder).join(item);
                });
            } else {
                content = content.split(placeholder).join(defaultValue);
            }
            return content;
        }

        improvedContent = unmaskAll(improvedContent, emails, PLACEHOLDERS.email, "email");
        improvedContent = unmaskAll(improvedContent, mobiles, PLACEHOLDERS.mobile, "mobile");
        improvedContent = unmaskAll(improvedContent, linkedins, PLACEHOLDERS.linkedin, "linkedin");
        improvedContent = unmaskAll(improvedContent, twitters, PLACEHOLDERS.twitter, "twitter");


        // console.log("after unmask", improvedContent);

        return { success: true, data: improvedContent };
    } catch (error) {
        console.error("Error improving resume content:", error);
        throw new Error("Failed to improve resume content");
    }
}

export async function generateRESUME({ designInstruction, userData }) {
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

    const originalContact = { ...userData.contactInfo };

    const PLACEHOLDERS = {
        email: "__MASK_EMAIL__UNIQUE123__",
        mobile: "__MASK_MOBILE__UNIQUE123__",
        linkedin: "__MASK_LINKEDIN__UNIQUE123__",
        twitter: "__MASK_TWITTER__UNIQUE123__",
    };

    let maskedContactInfo = {};
    maskedContactInfo = {
        name: user.name || userData.contactInfo.name || "Anonymous User",
    };
    if (userData.contactInfo.email) maskedContactInfo.email = PLACEHOLDERS.email;
    if (userData.contactInfo.mobile) maskedContactInfo.mobile = PLACEHOLDERS.mobile;
    if (userData.contactInfo.linkedin) maskedContactInfo.linkedin = PLACEHOLDERS.linkedin;
    if (userData.contactInfo.twitter) maskedContactInfo.twitter = PLACEHOLDERS.twitter;
    const maskedUserData = { ...userData, contactInfo: maskedContactInfo };

    try {
        let generatedContent = await callAI(
            getGenerateResumePrompt(
                designInstruction,
                maskedUserData
            )
        );

        generatedContent = generatedContent?.trim().html || "";

        const replaceIfMasked = (placeholder, value) => {
            if (generatedContent.includes(placeholder)) {
                generatedContent = generatedContent.split(placeholder).join(value);
            }
        };

        if (originalContact.email) replaceIfMasked(PLACEHOLDERS.email, originalContact.email);
        if (originalContact.mobile) replaceIfMasked(PLACEHOLDERS.mobile, originalContact.mobile);
        if (originalContact.linkedin) replaceIfMasked(PLACEHOLDERS.linkedin, originalContact.linkedin);
        if (originalContact.twitter) replaceIfMasked(PLACEHOLDERS.twitter, originalContact.twitter);
        return { success: true, data: generatedContent };
    } catch (error) {
        console.error("Error generating content:", error);
        throw new Error("Failed to generate content");
    }
}