import { geminiCall } from "./providers/gemini";
import { openRouterCall } from "./providers/openRouter";

export const models = [
    {
        name: "gemini-flash",
        call: geminiCall,
    },
    {
        name: "nex-n2-pro",
        call: (prompt) =>
            openRouterCall(prompt, "nex-agi/nex-n2-pro:free"),
    },
    {
        name: "owl-alpha",
        call: (prompt) =>
            openRouterCall(prompt, "openrouter/owl-alpha"),
    },
    {
        name: "openai/gpt",
        call: (prompt) =>
            openRouterCall(prompt, "openai/gpt-oss-120b:free"),
    },
    {
        name: "moonshotai/kimi",
        call: (prompt) =>
            openRouterCall(prompt, "moonshotai/kimi-k2.6:free"),
    },
    {
        name: "poolside/laguna",
        call: (prompt) =>
            openRouterCall(prompt, "poolside/laguna-m.1:free"),
    },
    {
        name: "poolside/laguna",
        call: (prompt) =>
            openRouterCall(prompt, "poolside/laguna-xs.2:free"),
    },
    {
        name: "nvidia/nemotron",
        call: (prompt) =>
            openRouterCall(prompt, "nvidia/nemotron-3-super-120b-a12b:free"),
    },
    {
        name: "google/gemma",
        call: (prompt) =>
            openRouterCall(prompt, "google/gemma-4-31b-it:free"),
    },
    {
        name: "liquid/lfm",
        call: (prompt) =>
            openRouterCall(prompt, "liquid/lfm-2.5-1.2b-thinking:free"),
    },

];