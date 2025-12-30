import api from "./api";

export type TicketStatus = "open" | "in-progress" | "pending" | "resolved" | "closed";

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
