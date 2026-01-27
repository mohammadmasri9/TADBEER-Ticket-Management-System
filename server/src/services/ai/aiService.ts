import { z } from "zod";
import { getGeminiModel } from "./aiClient";
import { SYSTEM_PROMPT_TICKET_ASSIST, SYSTEM_PROMPT_TICKET_SUGGEST } from "./aiPrompts";
import {
  SuggestTicketSchema,
  AssistTicketSchema,
  SuggestTicketResult,
  AssistTicketResult,
} from "./aiSchemas";

function parseJson(text: string) {
  // Gemini with responseMimeType should return JSON, but keep this safe.
  try {
    return JSON.parse(text);
  } catch {
    // Try extract first {...}
    const s = text.indexOf("{");
    const e = text.lastIndexOf("}");
    if (s >= 0 && e > s) {
      try { return JSON.parse(text.slice(s, e + 1)); } catch {}
    }
    return null;
  }
}

function fallbackSuggest(reason?: string): SuggestTicketResult {
  return {
    priority: "medium",
    category: "Technical",
    shortSummary: reason ? `AI fallback: ${reason}` : "AI unavailable, default triage applied.",
    steps: [
      "Share exact error message (or screenshot).",
      "Confirm when the issue started and what changed.",
      "Try reproducing the issue and list steps.",
    ],
    clarifyingQuestion: "What exact error do you see, and who is affected (one user or many)?",
  };
}

function fallbackAssist(): AssistTicketResult {
  return {
    reply: "AI is currently unavailable. I can still help—share the exact error and what you tried.",
    steps: [
      "Provide steps to reproduce the issue.",
      "Attach a screenshot or error code.",
      "Test on another device/network if possible.",
    ],
    clarifyingQuestion: "What’s the exact error message and does it happen for all users?",
  };
}

export async function suggestTicketAI(input: { title: string; description: string; }): Promise<SuggestTicketResult> {
  const title = (input.title || "").trim();
  const description = (input.description || "").trim();
  if (!title && !description) return fallbackSuggest("Empty input");

  try {
    const model = getGeminiModel(SYSTEM_PROMPT_TICKET_SUGGEST);

    const userPayload = {
      title,
      description,
      // Optional: give hints to help classification
      allowedPriorities: ["low", "medium", "high", "urgent"],
      allowedCategories: ["Technical", "Security", "Feature", "Account", "Bug"],
    };

    const resp = await model.generateContent([{ text: JSON.stringify(userPayload) }]);
    const text = resp.response.text();

    const json = parseJson(text);
    const parsed = SuggestTicketSchema.safeParse(json);

    if (!parsed.success) {
      // log why for debugging (server console)
      console.error("Suggest validation failed:", parsed.error?.issues);
      console.error("Gemini raw text:", text);
      return fallbackSuggest("Invalid JSON from model");
    }

    return parsed.data;
  } catch (err: any) {
    console.error("Gemini suggest error:", err?.message || err);
    return fallbackSuggest(err?.message || "Gemini error");
  }
}

export async function assistTicketAI(input: { ticketContext: any; question: string; }): Promise<AssistTicketResult> {
  const question = (input.question || "").trim();
  if (!question) return fallbackAssist();

  try {
    const model = getGeminiModel(SYSTEM_PROMPT_TICKET_ASSIST);

    const userPayload = {
      ticket: input.ticketContext,
      question,
    };

    const resp = await model.generateContent([{ text: JSON.stringify(userPayload) }]);
    const text = resp.response.text();

    const json = parseJson(text);
    const parsed = AssistTicketSchema.safeParse(json);

    if (!parsed.success) {
      console.error("Assist validation failed:", parsed.error?.issues);
      console.error("Gemini raw text:", text);
      return fallbackAssist();
    }

    return parsed.data;
  } catch (err: any) {
    console.error("Gemini assist error:", err?.message || err);
    return fallbackAssist();
  }
}
