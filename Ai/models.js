import { geminiCall } from "./providers/gemini";

export const models = [
    {
        name: "gemini-flash",
        call: geminiCall,
    },
];