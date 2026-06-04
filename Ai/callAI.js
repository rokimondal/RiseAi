import { models } from "./models";

let currentIndex = 0;

export async function callAI(prompt, retries = 2) {
    const totalModels = models.length;

    const startIndex = currentIndex;
    currentIndex = (currentIndex + 1) % totalModels;

    for (let i = 0; i < totalModels; i++) {
        const model = models[(startIndex + i) % totalModels];
        for (let attempt = 1; attempt <= retries + 1; attempt++) {
            try {
                console.log(`Using ${model.name} (attempt ${attempt})`);
                return await model.call(prompt);
            } catch (error) {
                console.error(`${model.name} failed`, error);
            }
        }
    }

    throw new Error(
        "All AI models failed"
    );
}