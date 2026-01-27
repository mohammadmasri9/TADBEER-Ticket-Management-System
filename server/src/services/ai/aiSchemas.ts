import { z } from "zod";

export const TicketPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);
export const TicketCategorySchema = z.enum([
  "Technical",
  "Security",
  "Feature",
  "Account",
  "Bug",
]);

export const SuggestTicketSchema = z.object({
  priority: TicketPrioritySchema,
  category: TicketCategorySchema,
  shortSummary: z.string().min(5).max(240),
  steps: z.array(z.string().min(3).max(200)).min(1).max(10),
  clarifyingQuestion: z.string().min(5).max(200).optional(),
});

export type SuggestTicketResult = z.infer<typeof SuggestTicketSchema>;

export const AssistTicketSchema = z.object({
  reply: z.string().min(5).max(600),
  steps: z.array(z.string().min(3).max(200)).min(1).max(12),
  clarifyingQuestion: z.string().min(5).max(200).optional(),
});

export type AssistTicketResult = z.infer<typeof AssistTicketSchema>;
