// client/api/tickets.ts
import api from "./api";

export type TicketStatus = "open" | "in-progress" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory = "Technical" | "Security" | "Feature" | "Account" | "Bug";

export type WatcherPermission = "read" | "write";

export interface TicketWatcherDTO {
  userId: any; // populated user or id (varies by backend)
  permission: WatcherPermission;
  addedBy?: any;
  addedAt?: string;
}

export interface TicketDTO {
  _id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;

  createdBy?: any;     // could be ObjectId OR populated user
  assignee?: any;      // could be ObjectId OR populated user

  departmentId?: any;
  watchers?: TicketWatcherDTO[];

  dueDate?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentDTO {
  _id: string;
  ticketId: string;
  userId: any;
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
  departmentId: string;

  priority?: TicketPriority;
  status?: TicketStatus;

  assignee?: string; // on create: ONLY department manager id if provided
  dueDate?: string;
  tags?: string[];
}

export type UpdateTicketPayload = Partial<CreateTicketPayload>;

/**
 * ✅ Always normalize to TicketDTO[]
 * Supports:
 * - res.data = TicketDTO[]
 * - res.data = { tickets: TicketDTO[], ... }
 * - res.data = { data: TicketDTO[] }
 */
export async function getTickets(params?: Record<string, any>) {
  const res = await api.get("/api/tickets", { params });

  const d: any = res.data;

  if (Array.isArray(d)) return d as TicketDTO[];
  if (Array.isArray(d?.tickets)) return d.tickets as TicketDTO[];
  if (Array.isArray(d?.data)) return d.data as TicketDTO[];

  return [] as TicketDTO[];
}

export async function getTicketById(id: string): Promise<TicketDetailsResponse> {
  const res = await api.get(`/api/tickets/${id}`);
  return res.data as TicketDetailsResponse;
}

export async function updateTicketStatus(id: string, status: TicketStatus) {
  const res = await api.patch(`/api/tickets/${id}/status`, { status });
  return res.data as TicketDTO;
}

export async function createTicket(payload: CreateTicketPayload): Promise<TicketDTO> {
  const res = await api.post<TicketDTO>("/api/tickets", payload);
  return res.data;
}

export async function updateTicket(id: string, payload: UpdateTicketPayload): Promise<TicketDTO> {
  const res = await api.put<TicketDTO>(`/api/tickets/${id}`, payload);
  return res.data;
}

export async function addTicketComment(id: string, text: string) {
  const res = await api.post(`/api/tickets/${id}/comments`, { text });
  return res.data as { comment: CommentDTO };
}

export async function getManagerInbox() {
  const res = await api.get("/api/tickets/inbox");
  return res.data as TicketDTO[];
}

export async function assignTicket(ticketId: string, assigneeId: string) {
  const res = await api.patch(`/api/tickets/${ticketId}/assign`, { assigneeId });
  return res.data as TicketDTO;
}

// ✅ Watchers
export async function addWatcher(ticketId: string, userId: string, permission: WatcherPermission) {
  const res = await api.post(`/api/tickets/${ticketId}/watchers`, { userId, permission });
  return res.data as TicketDTO;
}

export async function removeWatcher(ticketId: string, userId: string) {
  const res = await api.delete(`/api/tickets/${ticketId}/watchers/${userId}`);
  return res.data as TicketDTO;
}

// Optional view helpers (only work if backend supports ?view=...)
export async function getMyCreatedTickets() {
  return getTickets({ view: "created" });
}
export async function getAssignedToMeTickets() {
  return getTickets({ view: "assigned" });
}
export async function getWatchingTickets() {
  return getTickets({ view: "watching" });
}
