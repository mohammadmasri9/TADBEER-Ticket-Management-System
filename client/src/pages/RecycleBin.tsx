// src/pages/RecycleBin.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecycleBin, restoreTicket, permanentDelete, TicketDTO } from "../../api/tickets";
import "../style/CommonPage.css";

const RecycleBin: React.FC = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<TicketDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const data = await getRecycleBin();
            setTickets(data);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Failed to load recycle bin");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleRestore = async (ticketId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Restore this ticket?")) {
            try {
                await restoreTicket(ticketId);
                fetchTickets(); // Refresh the list
            } catch (err: any) {
                alert("Failed to restore ticket: " + (err.response?.data?.message || err.message));
            }
        }
    };

    const handlePermanentDelete = async (ticketId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Permanently delete this ticket? This action cannot be undone!")) {
            try {
                await permanentDelete(ticketId);
                fetchTickets(); // Refresh the list
            } catch (err: any) {
                alert("Failed to delete ticket: " + (err.response?.data?.message || err.message));
            }
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
                <p className="page-description">
                    Restore or permanently delete removed tickets
                </p>
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
                                        <span className={`priority-badge ${ticket.priority}`}>
                                            {ticket.priority}
                                        </span>
                                        <span className="status-badge deleted">deleted</span>
                                    </div>
                                    <h3 className="ticket-title">{ticket.title}</h3>
                                    <p className="ticket-description">
                                        {ticket.description.substring(0, 150)}
                                        {ticket.description.length > 150 && "..."}
                                    </p>
                                    <div className="ticket-footer">
                                        <span className="ticket-meta">{ticket.category}</span>
                                        <div className="ticket-actions">
                                            <button
                                                className="btn-restore"
                                                onClick={(e) => handleRestore(ticket._id, e)}
                                            >
                                                Restore
                                            </button>
                                            <button
                                                className="btn-delete-permanent"
                                                onClick={(e) => handlePermanentDelete(ticket._id, e)}
                                            >
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
