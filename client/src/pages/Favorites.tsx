// src/pages/Favorites.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getFavorites, toggleFavorite, TicketDTO } from "../../api/tickets";
import "../style/CommonPage.css";

const Favorites: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tickets, setTickets] = useState<TicketDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const data = await getFavorites();
            // Filter tickets favorited by current user
            const userFavorites = data.filter((ticket: any) => {
                const favoritedBy = ticket.favoritedBy || [];
                const userId = (user as any)?.userId || (user as any)?._id || (user as any)?.id;
                return favoritedBy.some((fav: any) => {
                    const favId = fav?._id?.toString() || fav?.toString() || String(fav);
                    return favId === String(userId);
                });
            });
            setTickets(userFavorites);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Failed to load favorites");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const handleToggleFavorite = async (ticketId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await toggleFavorite(ticketId);
            fetchFavorites(); // Refresh the list
        } catch (err: any) {
            console.error("Failed to toggle favorite:", err);
        }
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
                <p className="page-description">
                    Quick access to your favorite and starred tickets
                </p>
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
                                <div
                                    key={ticket._id}
                                    className="ticket-card favorite"
                                    onClick={() => navigate(`/tickets/${ticket._id}`)}
                                >
                                    <div className="ticket-header">
                                        <span className={`priority-badge ${ticket.priority}`}>
                                            {ticket.priority}
                                        </span>
                                        <span className={`status-badge ${ticket.status}`}>
                                            {ticket.status}
                                        </span>
                                        <button
                                            className="favorite-btn active"
                                            onClick={(e) => handleToggleFavorite(ticket._id, e)}
                                            title="Remove from favorites"
                                        >
                                            ⭐
                                        </button>
                                    </div>
                                    <h3 className="ticket-title">{ticket.title}</h3>
                                    <p className="ticket-description">
                                        {ticket.description.substring(0, 150)}
                                        {ticket.description.length > 150 && "..."}
                                    </p>
                                    <div className="ticket-footer">
                                        <span className="ticket-meta">
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </span>
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
