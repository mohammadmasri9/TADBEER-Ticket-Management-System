import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Footer from "../components/Footer";
import "../style/TicketDetails.css";

type Ticket = {
  id: string;
  title: string;
  description: string;
  status: "open" | "in-progress" | "closed" | "overdue";
  priority: "low" | "medium" | "high";
};

export default function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const ticket = useMemo<Ticket>(
    () => ({
      id: id || "N/A",
      title: "Email Delivery Issue",
      description: "User reports messages are delayed. Need to check SMTP logs and queue.",
      status: "in-progress",
      priority: "high",
    }),
    [id]
  );

  const [status, setStatus] = useState(ticket.status);
  const [comment, setComment] = useState("");

  const addComment = () => {
    if (!comment.trim()) return;
    alert(`Comment saved (mock): ${comment}`);
    setComment("");
  };

  // Get priority class
  const getPriorityClass = (priority: string) => {
    return `ticket-chip priority-${priority}`;
  };

  // Get status class
  const getStatusClass = (status: string) => {
    return `ticket-chip status-${status}`;
  };

  return (
    <div className="ticket-details-page">
      <div className="ticket-details-content">
        {/* Header */}
        <div className="ticket-details-header">
          <h2 className="ticket-details-title">Ticket Details</h2>
          <span className="ticket-id-badge">#{ticket.id}</span>
        </div>

        {/* Main Info Card */}
        <div className="ticket-info-card">
          <div className="ticket-info-title">{ticket.title}</div>
          <div className="ticket-info-description">{ticket.description}</div>

          <div className="ticket-badges-container">
            <span className={getPriorityClass(ticket.priority)}>
              Priority: {ticket.priority}
            </span>
            <span className={getStatusClass(status)}>
              Status: {status}
            </span>
          </div>

          <div className="status-update-section">
            <label className="status-update-label">
              <span className="status-update-label-text">Update Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="status-update-select"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="closed">Closed</option>
                <option value="overdue">Overdue</option>
              </select>
            </label>

            <button
              onClick={() => alert(`Status updated to "${status}" (mock)`)}
              className="status-save-btn"
            >
              Save Status
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="comments-card">
          <h3 className="comments-title">Comments</h3>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            rows={4}
            className="comment-textarea"
          />

          <button onClick={addComment} className="comment-add-btn">
            Add Comment
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
