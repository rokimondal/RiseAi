import OpenAI from "openai";

const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

export async function openRouterCall(
    prompt,
    model = "nex-agi/nex-n2-pro:free"
) {
    const completion = await client.chat.completions.create({
        model,
        messages: [
            {
                role: "system",
                content: "Respond only with valid JSON.",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
    });

    console.log("----------------------------",completion)

    const text = completion.choices[0]?.message?.content ?? "";

    const cleaned = text
        .replace(/^```[a-zA-Z0-9_-]*\n?/m, "")
        .replace(/```$/m, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch (error) {
        console.error(cleaned);
        throw new Error("Failed to parse OpenRouter response");
    }
}