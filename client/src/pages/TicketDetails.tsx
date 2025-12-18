import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

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

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h2 style={{ margin: 0 }}>Ticket #{ticket.id}</h2>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, display: "grid", gap: 8 }}>
        <div style={{ fontWeight: 900, fontSize: 18 }}>{ticket.title}</div>
        <div style={{ color: "#374151" }}>{ticket.description}</div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
          <Chip label={`Priority: ${ticket.priority}`} />
          <Chip label={`Current status: ${status}`} />
        </div>

        <div style={{ marginTop: 10, display: "grid", gap: 8, maxWidth: 320 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 800 }}>Update status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
            >
              <option value="open">open</option>
              <option value="in-progress">in-progress</option>
              <option value="closed">closed</option>
              <option value="overdue">overdue</option>
            </select>
          </label>

          <button
            onClick={() => alert(`Status updated to "${status}" (mock)`)}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #111827",
              background: "#111827",
              color: "white",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Save Status
          </button>
        </div>
      </div>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, display: "grid", gap: 10 }}>
        <h3 style={{ margin: 0 }}>Comments</h3>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
          rows={4}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
        />

        <button
          onClick={addComment}
          style={{
            width: 160,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "white",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          Add Comment
        </button>
      </div>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid #e5e7eb",
        fontWeight: 800,
        fontSize: 12,
        background: "#fff",
      }}
    >
      {label}
    </span>
  );
}
