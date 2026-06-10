import { models } from "./models";
import { getModelStats } from "./modelStats";

let currentIndex = 0;

export async function callAI(prompt, retries = 1) {
    const totalModels = models.length;

    const startIndex = currentIndex;
    currentIndex = (currentIndex + 1) % totalModels;

    for (let i = 0; i < totalModels; i++) {

        const model = models[(startIndex + i) % totalModels];
        const stats = getModelStats(model.name);

        if (stats.disabledUntil && stats.disabledUntil > Date.now()) {
            console.log(
                `${model.name} skipped (cooldown active)`
            );
            continue;
        }


        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                console.log(
                    `Using ${model.name} (attempt ${attempt})`
                );

                const startTime = Date.now();

                const result = await model.call(prompt);

                const latency = Date.now() - startTime;

                stats.success++;
                stats.requests++;
                stats.totalLatency += latency;
                stats.avgLatency = stats.totalLatency / stats.requests;

                return result;
            } catch (error) {
                console.error(`${model.name} failed`, error);

                stats.failed++;
                stats.requests++;

                const errorText = JSON.stringify(error).toLowerCase();

                const isRateLimited = errorText.includes("429") || errorText.includes("quota") || errorText.includes("rate limit") || errorText.includes("resource_exhausted");

                if (isRateLimited) {
                    stats.disabledUntil = Date.now() + 15 * 60 * 1000;
                    console.log(`${model.name} disabled for 15 minutes`);
                    break;
                }
                console.error(`${model.name} failed`, error);
            }
        }
    }

    throw new Error(
        "All AI models failed"
    );
}