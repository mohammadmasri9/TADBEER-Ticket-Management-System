export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "new" | "ongoing" | "resolved";
  priority?: "high" | "normal" | "low";
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TicketFilters {
  status?: Ticket["status"];
  priority?: Ticket["priority"];
  timeframe?: "week" | "month" | "quarter";
  search?: string;
}
