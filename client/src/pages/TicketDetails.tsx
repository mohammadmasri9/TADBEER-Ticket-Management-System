// src/pages/TicketDetails.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import "../style/TicketDetails.css";
import { AlertCircle, ArrowLeft, Loader2, UserPlus2, Eye, Shield, Trash2 } from "lucide-react";

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

function isObjectId(val: any) {
  return typeof val === "string" && /^[a-f\d]{24}$/i.test(val);
}

function normalizeId(val: any): string {
  return val?._id?.toString?.() ?? val?.toString?.() ?? "";
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
  // ✅ FIX: include userId + uid as well
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
      setData((prev) => (prev ? { ...prev, ticket: { ...prev.ticket, status: updated.status } } : prev));

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
        prev ? { ...prev, ticket: { ...(prev.ticket as TicketDTO), assignee: (updated as any).assignee, watchers: (updated as any).watchers } } : prev
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
    <div className="ticket-details-page">
      <div className="ticket-details-content">
        {/* Header */}
        <div className="ticket-details-header">
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button className="status-save-btn" onClick={() => navigate("/tickets")} style={{ padding: "10px 14px" }}>
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
            <strong>You are a watcher: {myWatcherPermission === "read" ? "Read-only" : "Read & Write"}</strong>
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
            <div style={{ marginTop: 14, padding: 12, borderRadius: 12, border: "2px solid var(--ooredoo-grey-lightest)", background: "var(--ooredoo-bg-light)" }}>
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
                    <button className="status-save-btn" onClick={handleAssign} disabled={!canAssign} style={{ opacity: !canAssign ? 0.6 : 1 }}>
                      {assigning ? "Assigning..." : "Assign"}
                    </button>
                    <span style={{ fontSize: 13, opacity: 0.8 }}>Only employees inside your department appear here.</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ✅ Watchers Section (manager/admin) */}
          {(isManager || String((user as any)?.role || "") === "admin") && (
            <div style={{ marginTop: 14, padding: 12, borderRadius: 12, border: "2px solid var(--ooredoo-grey-lightest)", background: "var(--ooredoo-bg-light)" }}>
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
                                Permission: <b>{w.permission === "write" ? "Read & Write" : "Read-only"}</b>
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

      <Footer />
    </div>
  );
}
