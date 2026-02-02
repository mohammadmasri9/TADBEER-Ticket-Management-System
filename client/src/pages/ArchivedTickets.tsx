// src/pages/ArchivedTickets.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getArchivedTickets, TicketDTO } from "../../api/tickets";
import "../style/CommonPage.css";

const ArchivedTickets: React.FC = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<TicketDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setLoading(true);
                const data = await getArchivedTickets();
                setTickets(data);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || "Failed to load archived tickets");
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    if (loading) {
        return (
            <div className="common-page">
                <div className="page-header">
                    <h1>Archived Tickets</h1>
                </div>
                <div className="empty-state">
                    <div className="empty-icon">⏳</div>
                    <p>Loading archived tickets...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="common-page">
                <div className="page-header">
                    <h1>Archived Tickets</h1>
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
                <h1>Archived Tickets</h1>
                <p className="page-description">
                    Access your archived and historical tickets (closed more than 30 days ago)
                </p>
            </div>

            <div className="page-content">
                {tickets.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📦</div>
                        <h3>No Archived Tickets</h3>
                        <p>No tickets have been archived</p>
                    </div>
                ) : (
                    <div className="content-section">
                        <h2>Archived Tickets ({tickets.length})</h2>
                        <div className="ticket-list">
                            {tickets.map((ticket) => (
                                <div
                                    key={ticket._id}
                                    className="ticket-card archived"
                                    onClick={() => navigate(`/tickets/${ticket._id}`)}
                                >
                                    <div className="ticket-header">
                                        <span className={`priority-badge ${ticket.priority}`}>
                                            {ticket.priority}
                                        </span>
                                        <span className="status-badge archived">archived</span>
                                    </div>
                                    <h3 className="ticket-title">{ticket.title}</h3>
                                    <p className="ticket-description">
                                        {ticket.description.substring(0, 150)}
                                        {ticket.description.length > 150 && "..."}
                                    </p>
                                    <div className="ticket-footer">
                                        <span className="ticket-meta">
                                            Archived: {new Date(ticket.updatedAt).toLocaleDateString()}
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

export default ArchivedTickets;
