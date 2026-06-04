import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
})

export async function geminiCall(prompt){
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text
        .replace(/^```[a-zA-Z0-9_-]*\n?/m, "")
        .replace(/```$/m, "")
        .trim();
    try {
        return JSON.parse(cleaned);
    } catch (error) {
        console.error("Gemini returned invalid JSON");
        console.error(cleaned);

        throw new Error(
            "Failed to parse Gemini response"
        );
    }
}