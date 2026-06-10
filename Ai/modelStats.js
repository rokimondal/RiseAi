const globalForStats = globalThis;

export const modelStats =
    globalForStats.modelStats ||
    (globalForStats.modelStats = {});

export function getModelStats(modelName) {
    if (!modelStats[modelName]) {
        modelStats[modelName] = {
            success: 0,
            failed: 0,
            avgLatency: 0,
            totalLatency: 0,
            requests: 0,
            disabledUntil: null,
        };
    }

    return modelStats[modelName];
}