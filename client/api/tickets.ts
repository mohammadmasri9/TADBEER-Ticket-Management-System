// client/api/tickets.ts
import api from "./api";

export type TicketStatus = "open" | "in-progress" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory = "Technical" | "Security" | "Feature" | "Account" | "Bug";

export interface TicketDTO {
  _id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;

  // backend may return populated objects or ids
  createdBy?: any;
  assignee?: any;

  dueDate?: string;
  tags?: string[];

  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;
  status?: TicketStatus;

  // ✅ IMPORTANT: backend expects Mongo UserId (ObjectId) if provided
  assignee?: string;

  // ✅ send ISO string (or omit)
  dueDate?: string;

  tags?: string[];
}

export async function getTickets(params?: Record<string, any>) {
  const res = await api.get("/api/tickets", { params });
  return res.data;
}

export async function getTicketById(id: string) {
  const res = await api.get(`/api/tickets/${id}`);
  return res.data; // { ticket, comments }
}

export async function updateTicketStatus(id: string, status: TicketStatus) {
  const res = await api.patch(`/api/tickets/${id}/status`, { status });
  return res.data;
}

// ✅ NEW: POST /api/tickets
export async function createTicket(payload: CreateTicketPayload): Promise<TicketDTO> {
  const res = await api.post<TicketDTO>("/api/tickets", payload);
  return res.data;
}
