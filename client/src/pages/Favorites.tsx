// src/pages/Favorites.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
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

const toggleFavoriteLS = (id: string) => {
  const s = getActionState();
  const favorites = s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [...s.favorites, id];
  setActionState({ ...s, favorites });
};

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // refresh trigger when we toggle
  const [version, setVersion] = useState(0);

  const favoriteIds = useMemo(() => getActionState().favorites, [version]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getTickets(undefined as any);
        const all = Array.isArray(data) ? data : [];

        const fav = all.filter((t: any) => favoriteIds.includes(String(t._id)));
        setTickets(fav);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || "Failed to load favorites");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [favoriteIds]);

  const handleToggleFavorite = (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteLS(String(ticketId));
    setVersion((v) => v + 1);
  };

  if (loading) {
    return (
      <div className="common-page">
        <div className="page-header">
          <h1>Favorites</h1>
        </div>
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <p>Loading favorites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="common-page">
        <div className="page-header">
          <h1>Favorites</h1>
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
        <h1>Favorites</h1>
        <p className="page-description">Quick access to your favorite and starred tickets</p>
      </div>

      <div className="page-content">
        {tickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⭐</div>
            <h3>No Favorite Tickets</h3>
            <p>Star important tickets to find them quickly here</p>
          </div>
        ) : (
          <div className="content-section">
            <h2>Favorite Tickets ({tickets.length})</h2>
            <div className="ticket-list">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="ticket-card favorite" onClick={() => navigate(`/tickets/${ticket._id}`)}>
                  <div className="ticket-header" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className={`priority-badge ${ticket.priority}`}>{ticket.priority}</span>
                    <span className={`status-badge ${ticket.status}`}>{ticket.status}</span>

                    <button
                      className="favorite-btn active"
                      onClick={(e) => handleToggleFavorite(ticket._id, e)}
                      title="Remove from favorites"
                      style={{ marginLeft: "auto" }}
                    >
                      <Star size={18} fill="currentColor" />
                    </button>
                  </div>

                  <h3 className="ticket-title">{ticket.title}</h3>

                  <p className="ticket-description">
                    {ticket.description?.substring(0, 150) || "No description"}
                    {ticket.description && ticket.description.length > 150 && "..."}
                  </p>

                  <div className="ticket-footer">
                    <span className="ticket-meta">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    <span className="ticket-meta">{ticket.category}</span>
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

export default Favorites;
