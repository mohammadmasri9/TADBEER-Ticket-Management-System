// src/pages/RecycleBin.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { getTickets, TicketDTO } from "../../api/tickets";
import "../style/CommonPage.css";

/* =========================
   LOCAL STORAGE STORE
========================= */
const LS_KEY = "tadbeer_ticket_actions_v1";

type TicketActionState = {
  favorites: string[];
  archived: string[];
  deleted: string[];
};

const safeParse = <T,>(val: string | null, fallback: T): T => {
  try {
    return val ? (JSON.parse(val) as T) : fallback;
  } catch {
    return fallback;
  }
};

const getActionState = (): TicketActionState =>
  safeParse<TicketActionState>(localStorage.getItem(LS_KEY), {
    favorites: [],
    archived: [],
    deleted: [],
  });

const setActionState = (next: TicketActionState) => {
  localStorage.setItem(LS_KEY, JSON.stringify(next));
};

const restoreLS = (id: string) => {
  const s = getActionState();
  const deleted = s.deleted.filter((x) => x !== id);
  setActionState({ ...s, deleted });
};

const permanentDeleteLS = (id: string) => {
  const s = getActionState();
  // remove from all lists
  setActionState({
    favorites: s.favorites.filter((x) => x !== id),
    archived: s.archived.filter((x) => x !== id),
    deleted: s.deleted.filter((x) => x !== id),
  });
};

const RecycleBin: React.FC = () => {
  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [version, setVersion] = useState(0);
  const deletedIds = useMemo(() => getActionState().deleted, [version]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getTickets(undefined as any);
        const all = Array.isArray(data) ? data : [];

        const deleted = all.filter((t: any) => deletedIds.includes(String(t._id)));
        setTickets(deleted);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || "Failed to load recycle bin");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [deletedIds]);

  const handleRestore = (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Restore this ticket?")) {
      restoreLS(String(ticketId));
      setVersion((v) => v + 1);
    }
  };

  const handlePermanentDelete = (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Permanently delete this ticket? This action cannot be undone!")) {
      permanentDeleteLS(String(ticketId));
      setVersion((v) => v + 1);
    }
  };

  if (loading) {
    return (
      <div className="common-page">
        <div className="page-header">
          <h1>Recycle Bin</h1>
        </div>
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <p>Loading recycle bin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="common-page">
        <div className="page-header">
          <h1>Recycle Bin</h1>
        </div>
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="common-page">
      <div className="page-header">
        <h1>Recycle Bin</h1>
        <p className="page-description">Restore or permanently delete removed tickets</p>
      </div>

      <div className="page-content">
        {tickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🗑️</div>
            <h3>Recycle Bin is Empty</h3>
            <p>No deleted tickets</p>
          </div>
        ) : (
          <div className="content-section">
            <h2>Deleted Tickets ({tickets.length})</h2>
            <div className="ticket-list">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="ticket-card deleted">
                  <div className="ticket-header">
                    <span className={`priority-badge ${ticket.priority}`}>{ticket.priority}</span>
                    <span className="status-badge deleted">deleted</span>
                  </div>

                  <h3 className="ticket-title">{ticket.title}</h3>

                  <p className="ticket-description">
                    {ticket.description?.substring(0, 150) || "No description"}
                    {ticket.description && ticket.description.length > 150 && "..."}
                  </p>

                  <div className="ticket-footer">
                    <span className="ticket-meta">
                      <Trash2 size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
                      {ticket.category}
                    </span>

                    <div className="ticket-actions">
                      <button className="btn-restore" onClick={(e) => handleRestore(ticket._id, e)}>
                        Restore
                      </button>
                      <button className="btn-delete-permanent" onClick={(e) => handlePermanentDelete(ticket._id, e)}>
                        Delete Forever
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecycleBin;
