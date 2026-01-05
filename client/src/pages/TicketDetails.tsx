import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import "../style/TicketDetails.css";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

import {
  getTicketById,
  updateTicketStatus,
  addTicketComment,
  TicketStatus,
  TicketDetailsResponse,
  CommentDTO,
} from "../../api/tickets";

export default function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<TicketDetailsResponse | null>(null);
  const [status, setStatus] = useState<TicketStatus>("open");
  const [commentText, setCommentText] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingComment, setSavingComment] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  /* =========================
     Load ticket + comments
  ========================= */
  useEffect(() => {
    if (!id) return;

    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getTicketById(id);
        if (!mounted) return;

        setData(res);
        setStatus(res.ticket.status);
      } catch (e: any) {
        if (!mounted) return;
        setError(
          e?.response?.data?.message ||
            e?.message ||
            "Failed to load ticket"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const ticket = data?.ticket;
  const comments = data?.comments || [];

  const canSaveStatus = useMemo(() => {
    if (!ticket) return false;
    return status !== ticket.status && !savingStatus;
  }, [ticket, status, savingStatus]);

  /* =========================
     Handlers
  ========================= */

  const handleSaveStatus = async () => {
    if (!id || !ticket || status === ticket.status) return;

    try {
      setSavingStatus(true);
      setToast("");

      const updated = await updateTicketStatus(id, status);

      setData((prev) =>
        prev
          ? { ...prev, ticket: { ...prev.ticket, status: updated.status } }
          : prev
      );

      setToast("Status updated ✅");
    } catch (e: any) {
      setToast(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to update status"
      );
      setStatus(ticket.status);
    } finally {
      setSavingStatus(false);
      setTimeout(() => setToast(""), 1500);
    }
  };

  const handleAddComment = async () => {
    if (!id) return;

    const text = commentText.trim();
    if (!text) return;

    try {
      setSavingComment(true);
      setToast("");

      // 🔴 IMPORTANT: backend expects { text }
      const res = await addTicketComment(id, text);

      const newComment: CommentDTO | undefined = res?.comment;
      if (!newComment) {
        throw new Error("Comment not returned from server");
      }

      setData((prev) =>
        prev
          ? { ...prev, comments: [...prev.comments, newComment] }
          : prev
      );

      setCommentText("");
      setToast("Comment added ✅");
    } catch (e: any) {
      setToast(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to add comment"
      );
    } finally {
      setSavingComment(false);
      setTimeout(() => setToast(""), 1500);
    }
  };

  /* =========================
     UI states
  ========================= */

  if (loading) {
    return (
      <div className="ticket-details-page">
        <div className="ticket-details-content">
          <div className="ticket-info-card" style={{ display: "flex", gap: 10 }}>
            <Loader2 size={18} />
            <strong>Loading ticket...</strong>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="ticket-details-page">
        <div className="ticket-details-content">
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error || "Ticket not found"}</span>
          </div>
          <button className="status-save-btn" onClick={() => navigate("/tickets")}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  /* =========================
     Render
  ========================= */

  return (
    <div className="ticket-details-page">
      <div className="ticket-details-content">
        {/* Header */}
        <div className="ticket-details-header">
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              className="status-save-btn"
              onClick={() => navigate("/tickets")}
              style={{ padding: "10px 14px" }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <h2 className="ticket-details-title">Ticket Details</h2>
          </div>
          <span className="ticket-id-badge">#{ticket._id}</span>
        </div>

        {/* Ticket Card */}
        <div className="ticket-info-card">
          <div className="ticket-info-title">{ticket.title}</div>
          <div className="ticket-info-description">{ticket.description}</div>

          <div className="ticket-badges-container">
            <span className={`ticket-chip priority-${ticket.priority}`}>
              Priority: {ticket.priority}
            </span>
            <span className={`ticket-chip status-${status}`}>
              Status: {status}
            </span>
          </div>

          <div className="status-update-section">
            <label className="status-update-label">
              <span className="status-update-label-text">Update Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TicketStatus)}
                className="status-update-select"
                disabled={savingStatus}
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </label>

            <button
              className="status-save-btn"
              onClick={handleSaveStatus}
              disabled={!canSaveStatus}
              style={{ opacity: !canSaveStatus ? 0.6 : 1 }}
            >
              {savingStatus ? "Saving..." : "Save Status"}
            </button>

            {toast && <strong>{toast}</strong>}
          </div>
        </div>

        {/* Comments */}
        <div className="comments-card">
          <h3 className="comments-title">Comments</h3>

          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            rows={4}
            className="comment-textarea"
            disabled={savingComment}
          />

          <button
            className="comment-add-btn"
            onClick={handleAddComment}
            disabled={savingComment || !commentText.trim()}
            style={{
              opacity:
                savingComment || !commentText.trim() ? 0.6 : 1,
            }}
          >
            {savingComment ? "Adding..." : "Add Comment"}
          </button>

          <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
            {comments.length === 0 ? (
              <strong style={{ color: "var(--ooredoo-grey-medium)" }}>
                No comments yet.
              </strong>
            ) : (
              comments.map((c) => {
                const user =
                  typeof c.userId === "object" && c.userId
                    ? c.userId
                    : null;

                return (
                  <div
                    key={c._id}
                    style={{
                      border: "2px solid var(--ooredoo-grey-lightest)",
                      borderRadius: 12,
                      padding: 14,
                      background: "var(--ooredoo-bg-light)",
                    }}
                  >
                    <strong>
                      {user?.name || "User"}
                      {c.createdAt && (
                        <span style={{ marginLeft: 8, opacity: 0.7 }}>
                          • {new Date(c.createdAt).toLocaleString()}
                        </span>
                      )}
                    </strong>
                    <div style={{ marginTop: 6 }}>{c.content}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
