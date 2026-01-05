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
  createdBy?: any;
  assignee?: any;
  dueDate?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentDTO {
  _id: string;
  ticketId: string;
  userId: any; // populated {name,email,role} or string
  content: string;
  attachments?: Array<{
    filename: string;
    url: string;
    mimetype?: string;
    size?: number;
    uploadedAt?: string;
  }>;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketDetailsResponse {
  ticket: TicketDTO;
  comments: CommentDTO[];
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;
  status?: TicketStatus;
  assignee?: string;
  dueDate?: string;
  tags?: string[];
}

export async function getTickets(params?: Record<string, any>) {
  const res = await api.get("/api/tickets", { params });
  return res.data;
}

export async function getTicketById(id: string): Promise<TicketDetailsResponse> {
  const res = await api.get(`/api/tickets/${id}`);
  return res.data;
}

export async function updateTicketStatus(id: string, status: TicketStatus) {
  const res = await api.patch(`/api/tickets/${id}/status`, { status });
  return res.data;
}

export async function createTicket(payload: CreateTicketPayload): Promise<TicketDTO> {
  const res = await api.post<TicketDTO>("/api/tickets", payload);
  return res.data;
}

export async function addTicketComment(id: string, text: string) {
  const res = await api.post(`/api/tickets/${id}/comments`, { text });
  return res.data as { comment: CommentDTO };
}
