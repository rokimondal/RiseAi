"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
})

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

    const prompt = `You are an AI that improves resume HTML content compatible with Tiptap editor.
Use inline CSS only; do not use external CSS files or classes.
Do not include or expose any real email, mobile, LinkedIn, or Twitter; use placeholders instead.

Here is the resume content to improve:
${maskedContent}

Requirements:
1. Fix formatting, styling, readability, and layout issues.
2. Keep all HTML compatible with Tiptap editor.
3. Preserve all sections.
4. Return only valid JSON with a single property "html" containing the improved HTML code.
`;

    try {
        console.log("prompt: ", prompt);
        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text();
        const cleanedText = text.replace(/```(?:json|html)?\n?/g, "").replace(/```/g, "").trim();
        let improvedContent;
        try {

            // console.log("prompt", prompt);
            const parsed = JSON.parse(cleanedText);
            improvedContent = parsed.html || "";

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

    const prompt = `You are an AI that generates resume content as HTML compatible with Tiptap editor. 
Use **inline CSS only** for styling; do not use external CSS files or classes. 
Make the resume visually appealing, colorful, and professional according to the design instruction: ${designInstruction}.

Input data:
${JSON.stringify(maskedUserData, null, 2)}

Requirements:
1. Generate valid **HTML** that Tiptap editor can render.
2. Use **inline CSS** for all styling (fonts, colors, spacing, borders, etc.).
3. Include all sections: Contact Info, Summary, Skills, Education, Experience, Projects (if available).
4. Make the layout readable and professional, with subtle colors and proper spacing.
5. Include headings for each section.
6. For dates, show them as "Start – End" (if end date is empty, show "Start – Present").
7. Ensure no scripts or external references; only HTML + inline CSS.

Output:
Return only the HTML code that can be inserted into Tiptap editor.

  `;

    try {
        const result = await model.generateContent(prompt)
        const response = result.response;
        let generatedContent = response.text();
        generatedContent = generatedContent
            .replace(/```(?:json|html)?\n?/g, "")
            .replace(/```/g, "")
            .trim();
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