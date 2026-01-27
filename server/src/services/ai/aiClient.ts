import { GoogleGenerativeAI } from "@google/generative-ai";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const aiConfig = {
  model: process.env.AI_MODEL || "gemini-1.5-flash",
  maxTokens: Number(process.env.AI_MAX_TOKENS || 600),
};

const genAI = new GoogleGenerativeAI(requireEnv("GEMINI_API_KEY"));

export function getGeminiModel(systemInstruction: string) {
  return genAI.getGenerativeModel({
    model: aiConfig.model,
    systemInstruction,
    generationConfig: {
      maxOutputTokens: aiConfig.maxTokens,
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });
}
