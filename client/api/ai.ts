// client/api/ai.ts
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL?.trim() || "http://localhost:5000/api";

const aiApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

aiApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory = "Technical" | "Security" | "Feature" | "Account" | "Bug";

export interface SuggestTicketAIResponse {
  priority: TicketPriority;
  category: TicketCategory;
  shortSummary: string;
  steps: string[];
  clarifyingQuestion?: string;
}

export interface AssistTicketAIResponse {
  reply: string;
  steps: string[];
  clarifyingQuestion?: string;
}

export async function suggestTicketAI(params: {
  title: string;
  description: string;
}): Promise<SuggestTicketAIResponse> {
  const res = await aiApi.post("/ai/tickets/suggest", params);
  return res.data.data as SuggestTicketAIResponse;
}

// ✅ FIX: backend should be /ai/tickets/:ticketId/assist
export async function assistTicketAI(params: {
  ticketId: string;
  question: string;
}): Promise<AssistTicketAIResponse> {
  const res = await aiApi.post(`/ai/tickets/${params.ticketId}/assist`, { question: params.question });
  return res.data.data as AssistTicketAIResponse;
}
