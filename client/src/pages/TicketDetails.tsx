// src/pages/TicketDetails.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import "../style/TicketDetails.css";

import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  UserPlus2,
  Eye,
  Shield,
  Trash2,
  Wand2,
  Sparkles,
  MessageSquare,
  Copy,
  X,
} from "lucide-react";

import {
  getTicketById,
  updateTicketStatus,
  addTicketComment,
  assignTicket,
  addWatcher,
  removeWatcher,
  TicketStatus,
  TicketDetailsResponse,
  CommentDTO,
  TicketDTO,
  WatcherPermission,
} from "../../api/tickets";

import { getDepartmentEmployees, UserDTO } from "../../api/users";
import { useAuth } from "../context/AuthContext";

// ✅ AI API
import { assistTicketAI } from "../../api/ai";

function isObjectId(val: any) {
  return typeof val === "string" && /^[a-f\d]{24}$/i.test(val);
}

function normalizeId(val: any): string {
  return val?._id?.toString?.() ?? val?.toString?.() ?? "";
}

function joinStepsAsText(steps: string[]) {
  if (!steps?.length) return "";
  return steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
}

function extractSuggestedStatus(text: string): TicketStatus | null {
  const t = String(text || "").toLowerCase();

  // Look for explicit label first
  const m = t.match(/suggested\s*status\s*[:\-]\s*(open|in-progress|pending|resolved|closed)/i);
  if (m?.[1]) return m[1] as TicketStatus;

  // Other variants
  const m2 = t.match(/status\s*[:\-]\s*(open|in-progress|pending|resolved|closed)/i);
  if (m2?.[1]) return m2[1] as TicketStatus;

  // Fallback: try to detect if it contains one status word clearly
  const statuses: TicketStatus[] = ["open", "in-progress", "pending", "resolved", "closed"];
  for (const s of statuses) {
    if (t.includes(` ${s} `) || t.includes(`${s}.`) || t.includes(`${s},`) || t.includes(`${s}\n`)) {
      return s;
    }
  }

  return null;
}

export default function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState<TicketDetailsResponse | null>(null);
  const [status, setStatus] = useState<TicketStatus>("open");
  const [commentText, setCommentText] = useState("");

  // reassignment
  const [employees, setEmployees] = useState<UserDTO[]>([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [empError, setEmpError] = useState("");

  const [assigneeId, setAssigneeId] = useState("");
  const [assigning, setAssigning] = useState(false);

  // watchers UI
  const [watcherUserId, setWatcherUserId] = useState("");
  const [watcherPerm, setWatcherPerm] = useState<WatcherPermission>("read");
  const [watcherSaving, setWatcherSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingComment, setSavingComment] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const isManager = String((user as any)?.role || "") === "manager";

  /* =========================
     ✅ AI Assistant (Floating)
  ========================= */
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [aiStepsText, setAiStepsText] = useState("");
  const [aiClarify, setAiClarify] = useState("");

  const [aiSuggestedStatus, setAiSuggestedStatus] = useState<TicketStatus | null>(null);
  const [aiApplyingStatus, setAiApplyingStatus] = useState(false);

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

        const currentAssignee = normalizeId((res.ticket as any)?.assignee) || "";
        setAssigneeId(currentAssignee);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e?.message || "Failed to load ticket");
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

  /* =========================
     Load dept employees for manager actions
  ========================= */
  useEffect(() => {
    if (!isManager) return;

    let mounted = true;
    (async () => {
      try {
        setEmpLoading(true);
        setEmpError("");

        const res = await getDepartmentEmployees(); // manager’s dept
        if (!mounted) return;

        setEmployees(Array.isArray(res) ? res : []);
      } catch (e: any) {
        if (!mounted) return;
        setEmpError(e?.response?.data?.message || e?.message || "Failed to load employees");
        setEmployees([]);
      } finally {
        if (!mounted) return;
        setEmpLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isManager]);

  /* =========================
     Resolve permissions for current viewer
  ========================= */
  const myId = useMemo(
    () =>
      String(
        (user as any)?.userId ||
          (user as any)?.id ||
          (user as any)?._id ||
          (user as any)?.uid ||
          ""
      ),
    [user]
  );

  const myDeptId = useMemo(() => {
    const raw = (user as any)?.departmentId;
    return raw && isObjectId(String(raw)) ? String(raw) : "";
  }, [user]);

  const ticketDeptId = useMemo(() => {
    if (!ticket) return "";
    const raw: any = (ticket as any).departmentId;

    const populatedId = raw?._id?.toString?.();
    if (populatedId && isObjectId(populatedId)) return populatedId;

    if (typeof raw === "string" && isObjectId(raw)) return raw;

    return "";
  }, [ticket]);

  const canManagerAssignThisTicket = useMemo(() => {
    if (!isManager) return false;
    if (!ticket) return false;
    if (!myDeptId || !ticketDeptId) return false;
    return String(myDeptId) === String(ticketDeptId);
  }, [isManager, ticket, myDeptId, ticketDeptId]);

  const myWatcherPermission = useMemo<WatcherPermission | null>(() => {
    const ws = ((ticket as any)?.watchers || []) as any[];
    const found = ws.find((w) => normalizeId(w.userId) === myId);
    return found?.permission || null;
  }, [ticket, myId]);

  const isAssignee = useMemo(() => {
    const aId = normalizeId((ticket as any)?.assignee);
    return !!aId && !!myId && aId === myId;
  }, [ticket, myId]);

  const isCreator = useMemo(() => {
    const cId = normalizeId((ticket as any)?.createdBy);
    return !!cId && !!myId && cId === myId;
  }, [ticket, myId]);

  // ✅ “Write” permission for status/comment:
  const canWrite = useMemo(() => {
    if (!ticket) return false;
    if (String((user as any)?.role || "") === "admin") return true;
    if (isManager && canManagerAssignThisTicket) return true;
    if (isAssignee) return true;
    if (isCreator) return true;
    return myWatcherPermission === "write";
  }, [ticket, user, isManager, canManagerAssignThisTicket, isAssignee, isCreator, myWatcherPermission]);

  const currentAssigneeLabel = useMemo(() => {
    const a: any = (ticket as any)?.assignee;
    if (!a) return "Unassigned";
    if (typeof a === "string") return a;
    return `${a?.name || "User"}${a?.email ? ` (${a.email})` : ""}`;
  }, [ticket]);

  const departmentEmployees = useMemo(() => {
    return employees.filter((u: any) => {
      const r = String(u.role || "");
      return r === "agent" || r === "user";
    });
  }, [employees]);

  const canSaveStatus = useMemo(() => {
    if (!ticket) return false;
    if (!canWrite) return false;
    return status !== ticket.status && !savingStatus;
  }, [ticket, status, savingStatus, canWrite]);

  const canAssign = useMemo(() => {
    if (!ticket) return false;
    if (!canManagerAssignThisTicket) return false;
    if (!assigneeId) return false;

    const current = normalizeId((ticket as any)?.assignee) || "";
    return !assigning && assigneeId !== current;
  }, [ticket, canManagerAssignThisTicket, assigneeId, assigning]);

  /* =========================
     Handlers
  ========================= */
  const handleSaveStatus = async () => {
    if (!id || !ticket) return;
    if (!canWrite) {
      setToast("Read-only access: you can’t change status.");
      setTimeout(() => setToast(""), 1800);
      return;
    }

    try {
      setSavingStatus(true);
      setToast("");

      const updated = await updateTicketStatus(id, status);
      setData((prev) =>
        prev ? { ...prev, ticket: { ...prev.ticket, status: updated.status } } : prev
      );

      setToast("Status updated ✅");
    } catch (e: any) {
      setToast(e?.response?.data?.message || e?.message || "Failed to update status");
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

    if (!canWrite) {
      setToast("Read-only access: you can’t add comments.");
      setTimeout(() => setToast(""), 1800);
      return;
    }

    try {
      setSavingComment(true);
      setToast("");

      const res = await addTicketComment(id, text);
      const newComment: CommentDTO | undefined = res?.comment;
      if (!newComment) throw new Error("Comment not returned from server");

      setData((prev) => (prev ? { ...prev, comments: [...prev.comments, newComment] } : prev));
      setCommentText("");
      setToast("Comment added ✅");

      // ✅ If AI modal is open, remind user they can ask AI again
      if (aiOpen) {
        setAiReply("");
        setAiStepsText("");
        setAiClarify("");
        setAiSuggestedStatus(null);
      }
    } catch (e: any) {
      setToast(e?.response?.data?.message || e?.message || "Failed to add comment");
    } finally {
      setSavingComment(false);
      setTimeout(() => setToast(""), 1500);
    }
  };

  const handleAssign = async () => {
    if (!id || !ticket) return;

    if (!canManagerAssignThisTicket) {
      setToast("You can only reassign tickets that belong to your department.");
      setTimeout(() => setToast(""), 1800);
      return;
    }

    try {
      setAssigning(true);
      setToast("");

      const updated = await assignTicket(id, assigneeId);
      setData((prev) =>
        prev
          ? {
              ...prev,
              ticket: {
                ...(prev.ticket as TicketDTO),
                assignee: (updated as any).assignee,
                watchers: (updated as any).watchers,
              },
            }
          : prev
      );

      setToast("Ticket reassigned ✅");
    } catch (e: any) {
      setToast(e?.response?.data?.message || e?.message || "Failed to assign ticket");
    } finally {
      setAssigning(false);
      setTimeout(() => setToast(""), 1500);
    }
  };

  const handleAddWatcher = async () => {
    if (!id || !ticket) return;
    if (!watcherUserId) return;

    if (!canManagerAssignThisTicket && String((user as any)?.role || "") !== "admin") {
      setToast("You can only manage watchers for tickets in your department.");
      setTimeout(() => setToast(""), 1800);
      return;
    }

    try {
      setWatcherSaving(true);
      setToast("");

      const updated = await addWatcher(id, watcherUserId, watcherPerm);
      setData((prev) => (prev ? { ...prev, ticket: updated as any } : prev));

      setWatcherUserId("");
      setWatcherPerm("read");
      setToast("Watcher updated ✅");
    } catch (e: any) {
      setToast(e?.response?.data?.message || e?.message || "Failed to add watcher");
    } finally {
      setWatcherSaving(false);
      setTimeout(() => setToast(""), 1500);
    }
  };

  const handleRemoveWatcher = async (uid: string) => {
    if (!id || !ticket) return;

    try {
      setWatcherSaving(true);
      setToast("");

      const updated = await removeWatcher(id, uid);
      setData((prev) => (prev ? { ...prev, ticket: updated as any } : prev));

      setToast("Watcher removed ✅");
    } catch (e: any) {
      setToast(e?.response?.data?.message || e?.message || "Failed to remove watcher");
    } finally {
      setWatcherSaving(false);
      setTimeout(() => setToast(""), 1500);
    }
  };

  /* =========================
     ✅ AI: Ask assistant (reads comments from backend context)
     - We force a structured first line: Suggested Status: <...>
  ========================= */
  const handleAskAI = async () => {
    if (!id) return;

    const q = aiQuestion.trim();
    if (!q) return;

    setAiLoading(true);
    setAiError("");

    try {
      const forcedPrompt = `
You are an IT helpdesk assistant for a ticket management system.

You WILL be given ticket context (title, description, status, priority) and recent comments.

Your job:
1) Answer the user's question clearly.
2) Based on the ticket comments and current progress, recommend the BEST ticket status from:
open | in-progress | pending | resolved | closed
3) Output MUST start with exactly:
Suggested Status: <one-of-the-statuses>

Then provide:
- Reply: (short paragraph)
- Steps: (bulleted list, if needed)
- Clarifying Question: (optional)

User Question: ${q}
`.trim();

      const res = await assistTicketAI({ ticketId: id, question: forcedPrompt });

      const reply = String((res as any)?.reply || "");
      const steps = Array.isArray((res as any)?.steps) ? ((res as any)?.steps as string[]) : [];
      const clarify = String((res as any)?.clarifyingQuestion || "");

      setAiReply(reply);
      setAiStepsText(joinStepsAsText(steps));
      setAiClarify(clarify);

      const suggested = extractSuggestedStatus(`${reply}\n${clarify}\n${steps.join("\n")}`);
      setAiSuggestedStatus(suggested);
    } catch (e: any) {
      setAiError(e?.response?.data?.message || e?.message || "AI request failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyAI = async () => {
    try {
      const block = [
        aiSuggestedStatus ? `Suggested Status: ${aiSuggestedStatus}` : "",
        aiReply ? `Reply:\n${aiReply}` : "",
        aiStepsText ? `Steps:\n${aiStepsText}` : "",
        aiClarify ? `Clarifying Question:\n${aiClarify}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      await navigator.clipboard.writeText(block);
      setToast("Copied ✅");
      setTimeout(() => setToast(""), 1200);
    } catch {
      // ignore
    }
  };

  // ✅ Apply AI suggested status to UI + (optional) save to backend
  const handleApplyAISuggestedStatus = async (saveToServer: boolean) => {
    if (!ticket || !id) return;
    if (!aiSuggestedStatus) return;

    // Set local status dropdown
    setStatus(aiSuggestedStatus);

    if (!saveToServer) {
      setToast("AI status applied (not saved yet).");
      setTimeout(() => setToast(""), 1500);
      return;
    }

    if (!canWrite) {
      setToast("Read-only: cannot save status.");
      setTimeout(() => setToast(""), 1500);
      return;
    }

    try {
      setAiApplyingStatus(true);
      setToast("");

      const updated = await updateTicketStatus(id, aiSuggestedStatus);
      setData((prev) =>
        prev ? { ...prev, ticket: { ...prev.ticket, status: updated.status } } : prev
      );
      setToast("AI status saved ✅");
    } catch (e: any) {
      setToast(e?.response?.data?.message || e?.message || "Failed to save AI status");
    } finally {
      setAiApplyingStatus(false);
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

  const watchers = ((ticket as any)?.watchers || []) as any[];

  return (
    <div className="ticket-details-page" style={{ position: "relative" }}>
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

        {/* Permission banner */}
        {(myWatcherPermission === "read" || myWatcherPermission === "write") && (
          <div
            style={{
              border: "2px solid var(--ooredoo-grey-lightest)",
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
              background: "var(--ooredoo-bg-light)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {myWatcherPermission === "read" ? <Eye size={18} /> : <Shield size={18} />}
            <strong>
              You are a watcher: {myWatcherPermission === "read" ? "Read-only" : "Read & Write"}
            </strong>
          </div>
        )}

        {/* Ticket Card */}
        <div className="ticket-info-card">
          <div className="ticket-info-title">{ticket.title}</div>
          <div className="ticket-info-description">{ticket.description}</div>

          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span style={{ opacity: 0.9 }}>
              <strong>Department:</strong> {(ticket as any)?.departmentId?.name || "—"}
            </span>
            <span style={{ opacity: 0.9 }}>
              <strong>Assigned To:</strong> {currentAssigneeLabel}
            </span>
          </div>

          <div className="ticket-badges-container">
            <span className={`ticket-chip priority-${ticket.priority}`}>Priority: {ticket.priority}</span>
            <span className={`ticket-chip status-${status}`}>Status: {status}</span>
          </div>

          {/* ✅ Manager Assign Section */}
          {isManager && (
            <div
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 12,
                border: "2px solid var(--ooredoo-grey-lightest)",
                background: "var(--ooredoo-bg-light)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <UserPlus2 size={18} />
                <strong>Manager: Reassign Ticket</strong>
              </div>

              {!canManagerAssignThisTicket ? (
                <div style={{ color: "#b91c1c", fontWeight: 600 }}>
                  You can only reassign tickets that belong to your department.
                </div>
              ) : (
                <>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span style={{ fontWeight: 600 }}>Assign to (users/agents in same department)</span>

                    <select
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      disabled={assigning || empLoading}
                      className="status-update-select"
                    >
                      <option value="">{empLoading ? "Loading..." : "Select employee"}</option>
                      {departmentEmployees.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} — {u.email} ({u.role})
                        </option>
                      ))}
                    </select>
                  </label>

                  {empError && (
                    <div className="error-banner" style={{ marginTop: 10 }}>
                      <AlertCircle size={18} />
                      <div>
                        <strong>Employees:</strong> {empError}
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "center" }}>
                    <button
                      className="status-save-btn"
                      onClick={handleAssign}
                      disabled={!canAssign}
                      style={{ opacity: !canAssign ? 0.6 : 1 }}
                    >
                      {assigning ? "Assigning..." : "Assign"}
                    </button>
                    <span style={{ fontSize: 13, opacity: 0.8 }}>
                      Only employees inside your department appear here.
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ✅ Watchers Section (manager/admin) */}
          {(isManager || String((user as any)?.role || "") === "admin") && (
            <div
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 12,
                border: "2px solid var(--ooredoo-grey-lightest)",
                background: "var(--ooredoo-bg-light)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Eye size={18} />
                <strong>Watchers</strong>
              </div>

              {isManager && !canManagerAssignThisTicket ? (
                <div style={{ color: "#b91c1c", fontWeight: 600 }}>
                  You can only manage watchers for tickets in your department.
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 10 }}>
                    <select
                      value={watcherUserId}
                      onChange={(e) => setWatcherUserId(e.target.value)}
                      className="status-update-select"
                      disabled={watcherSaving || empLoading}
                    >
                      <option value="">{empLoading ? "Loading..." : "Select watcher"}</option>
                      {departmentEmployees.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} — {u.email} ({u.role})
                        </option>
                      ))}
                    </select>

                    <select
                      value={watcherPerm}
                      onChange={(e) => setWatcherPerm(e.target.value as WatcherPermission)}
                      className="status-update-select"
                      disabled={watcherSaving}
                    >
                      <option value="read">Read-only</option>
                      <option value="write">Read & Write</option>
                    </select>

                    <button
                      className="status-save-btn"
                      onClick={handleAddWatcher}
                      disabled={!watcherUserId || watcherSaving}
                      style={{ opacity: !watcherUserId || watcherSaving ? 0.6 : 1 }}
                    >
                      {watcherSaving ? "Saving..." : "Add/Update"}
                    </button>
                  </div>

                  <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                    {watchers.length === 0 ? (
                      <strong style={{ opacity: 0.7 }}>No watchers yet.</strong>
                    ) : (
                      watchers.map((w: any, idx: number) => {
                        const u = w?.userId; // populated
                        const label =
                          typeof u === "object" && u
                            ? `${u.name} — ${u.email} (${u.role})`
                            : normalizeId(u);

                        return (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 10,
                              border: "2px solid var(--ooredoo-grey-lightest)",
                              borderRadius: 12,
                              padding: 12,
                              background: "#fff",
                            }}
                          >
                            <div>
                              <strong>{label}</strong>
                              <div style={{ opacity: 0.75, fontSize: 13 }}>
                                Permission:{" "}
                                <b>{w.permission === "write" ? "Read & Write" : "Read-only"}</b>
                              </div>
                            </div>

                            <button
                              className="status-save-btn"
                              onClick={() => handleRemoveWatcher(normalizeId(w.userId))}
                              disabled={watcherSaving}
                              style={{ opacity: watcherSaving ? 0.6 : 1 }}
                            >
                              <Trash2 size={16} /> Remove
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Status Update */}
          <div className="status-update-section">
            <label className="status-update-label">
              <span className="status-update-label-text">Update Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TicketStatus)}
                className="status-update-select"
                disabled={savingStatus || !canWrite}
                style={{ opacity: !canWrite ? 0.6 : 1 }}
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

            {!canWrite && (
              <div style={{ marginTop: 8, color: "#b91c1c", fontWeight: 600 }}>
                Read-only: you can view the ticket, but cannot change status or comment.
              </div>
            )}

            {toast && <strong>{toast}</strong>}
          </div>
        </div>

        {/* Comments */}
        <div className="comments-card">
          <h3 className="comments-title">Comments</h3>

          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={canWrite ? "Write a comment..." : "Read-only access"}
            rows={4}
            className="comment-textarea"
            disabled={savingComment || !canWrite}
            style={{ opacity: !canWrite ? 0.6 : 1 }}
          />

          <button
            className="comment-add-btn"
            onClick={handleAddComment}
            disabled={savingComment || !commentText.trim() || !canWrite}
            style={{ opacity: savingComment || !commentText.trim() || !canWrite ? 0.6 : 1 }}
          >
            {savingComment ? "Adding..." : "Add Comment"}
          </button>

          <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
            {comments.length === 0 ? (
              <strong style={{ color: "var(--ooredoo-grey-medium)" }}>No comments yet.</strong>
            ) : (
              comments.map((c) => {
                const u = typeof c.userId === "object" && c.userId ? (c.userId as any) : null;

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
                      {u?.name || "User"}
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

      {/* ✅ Floating AI Button */}
      <button
        type="button"
        onClick={() => {
          setAiOpen(true);
          setAiError("");
          setAiReply("");
          setAiStepsText("");
          setAiClarify("");
          setAiSuggestedStatus(null);

          // prefill a strong default question that requests status update based on comments
          setAiQuestion(
            "Based on the recent comments and progress, what should the ticket status be now? Explain briefly and give steps if needed."
          );
        }}
        style={{
          position: "fixed",
          right: 22,
          bottom: 22,
          zIndex: 9999,
          border: "none",
          borderRadius: 18,
          padding: "14px 16px",
          cursor: "pointer",
          boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
          background: "#E60000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontWeight: 900,
          fontSize: 15,
        }}
        title="Open AI Assistant"
      >
        <Wand2 size={20} />
        AI Assistant
      </button>

      {/* ✅ Big AI Modal */}
      {aiOpen && (
        <div
          onClick={() => setAiOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.50)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(980px, 96vw)",
              height: "min(86vh, 900px)",
              borderRadius: 18,
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 24px 70px rgba(0,0,0,0.38)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid rgba(0,0,0,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Wand2 size={20} />
                <div style={{ display: "grid" }}>
                  <strong style={{ fontSize: 16 }}>AI Assistant</strong>
                  <span style={{ fontSize: 13, opacity: 0.75 }}>Ticket #{ticket._id}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAiOpen(false)}
                style={{
                  border: "none",
                  background: "rgba(0,0,0,0.04)",
                  cursor: "pointer",
                  padding: 8,
                  borderRadius: 12,
                }}
                aria-label="Close AI Assistant"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div
              style={{
                padding: 16,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                flex: 1,
                overflow: "auto",
              }}
            >
              {/* Left: question + actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {aiError && (
                  <div className="error-banner" style={{ marginBottom: 6 }}>
                    <AlertCircle size={18} />
                    <div>
                      <strong>AI:</strong> {aiError}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid rgba(0,0,0,0.10)",
                    background: "rgba(0,0,0,0.02)",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 6 }}>AI will read:</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.9 }}>
                    • Ticket title/description/status/priority <br />
                    • Last comments (from backend) <br />
                    Then it will recommend the best status.
                  </div>
                </div>

                <label style={{ display: "grid", gap: 8 }}>
                  <span style={{ fontWeight: 900, fontSize: 14 }}>Your question</span>
                  <textarea
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    rows={8}
                    placeholder="Example: Based on comments, what status should be now?"
                    disabled={aiLoading}
                    style={{
                      width: "100%",
                      resize: "vertical",
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.14)",
                      fontSize: 14,
                      lineHeight: 1.6,
                      background: "#fff",
                    }}
                  />
                </label>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={handleAskAI}
                    disabled={aiLoading || !aiQuestion.trim()}
                    className="status-save-btn"
                    style={{
                      opacity: aiLoading || !aiQuestion.trim() ? 0.6 : 1,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 size={18} className="saving-spinner" /> Thinking...
                      </>
                    ) : (
                      <>
                        <Wand2 size={18} /> Ask AI
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyAI}
                    disabled={!aiReply && !aiStepsText && !aiClarify}
                    className="status-save-btn"
                    style={{
                      opacity: !aiReply && !aiStepsText && !aiClarify ? 0.6 : 1,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Copy size={18} /> Copy
                  </button>
                </div>

                {/* ✅ Status control from AI */}
                <div
                  style={{
                    marginTop: 4,
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid rgba(0,0,0,0.10)",
                    background: "#fff",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <Sparkles size={18} />
                    <strong style={{ fontSize: 14 }}>Status suggestion</strong>
                  </div>

                  <div style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.9 }}>
                    <strong>Current:</strong> {ticket.status}
                    <br />
                    <strong>AI Suggested:</strong>{" "}
                    {aiSuggestedStatus ? (
                      <span style={{ color: "#0f766e", fontWeight: 900 }}>{aiSuggestedStatus}</span>
                    ) : (
                      <span style={{ opacity: 0.7 }}>— ask AI to get suggestion</span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="status-save-btn"
                      disabled={!aiSuggestedStatus || aiApplyingStatus}
                      onClick={() => handleApplyAISuggestedStatus(false)}
                      style={{
                        opacity: !aiSuggestedStatus || aiApplyingStatus ? 0.6 : 1,
                        padding: "10px 14px",
                      }}
                      title="Apply to status dropdown only"
                    >
                      Apply to UI
                    </button>

                    <button
                      type="button"
                      className="status-save-btn"
                      disabled={!aiSuggestedStatus || aiApplyingStatus || !canWrite}
                      onClick={() => handleApplyAISuggestedStatus(true)}
                      style={{
                        opacity: !aiSuggestedStatus || aiApplyingStatus || !canWrite ? 0.6 : 1,
                        padding: "10px 14px",
                      }}
                      title={!canWrite ? "Read-only: cannot save status" : "Save status to server"}
                    >
                      {aiApplyingStatus ? "Saving..." : "Save Status"}
                    </button>
                  </div>

                  {!canWrite && (
                    <div style={{ marginTop: 8, color: "#b91c1c", fontWeight: 800, fontSize: 13 }}>
                      Read-only: you can see AI suggestion, but you cannot save status.
                    </div>
                  )}
                </div>
              </div>

              {/* Right: response */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  borderLeft: "1px solid rgba(0,0,0,0.08)",
                  paddingLeft: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Sparkles size={18} />
                  <strong style={{ fontSize: 15 }}>AI Response</strong>
                </div>

                {/* Reply box */}
                <div
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid rgba(0,0,0,0.10)",
                    background: "rgba(0,0,0,0.02)",
                    minHeight: 160,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 8 }}>Reply</div>
                  <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                    {aiReply || "Ask a question to generate a reply…"}
                  </div>
                </div>

                {/* Clarifying */}
                {aiClarify && (
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      border: "1px solid rgba(124,45,18,0.18)",
                      background: "rgba(124,45,18,0.06)",
                      color: "#7c2d12",
                      fontSize: 14,
                      lineHeight: 1.6,
                    }}
                  >
                    <strong>Clarifying question:</strong> {aiClarify}
                  </div>
                )}

                {/* Steps */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 8 }}>
                    Steps (editable)
                  </div>
                  <textarea
                    value={aiStepsText}
                    onChange={(e) => setAiStepsText(e.target.value)}
                    placeholder="AI steps will appear here…"
                    disabled={aiLoading}
                    style={{
                      width: "100%",
                      flex: 1,
                      minHeight: 220,
                      resize: "none",
                      padding: 12,
                      borderRadius: 14,
                      border: "1px solid rgba(0,0,0,0.14)",
                      fontSize: 14,
                      lineHeight: 1.7,
                      background: "#fff",
                    }}
                  />
                </div>

                {/* Quick suggestion buttons */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="status-save-btn"
                    onClick={() =>
                      setAiQuestion(
                        "Based on comments, tell me the best next step and whether status should change."
                      )
                    }
                    style={{ padding: "10px 14px" }}
                    disabled={aiLoading}
                  >
                    <MessageSquare size={18} /> Next step + status
                  </button>

                  <button
                    type="button"
                    className="status-save-btn"
                    onClick={() =>
                      setAiQuestion(
                        "Summarize the progress from comments and recommend status."
                      )
                    }
                    style={{ padding: "10px 14px" }}
                    disabled={aiLoading}
                  >
                    <Sparkles size={18} /> Summarize + status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
