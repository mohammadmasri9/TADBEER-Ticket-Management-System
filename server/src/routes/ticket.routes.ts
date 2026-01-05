// server/src/routes/tickets.routes.ts
import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import Ticket from "../models/Ticket.model";
import Comment from "../models/Comments";
import Notification from "../models/Notification.model";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();
router.use(requireAuth);

/* =========================
   Validation Schemas
========================= */

const createTicketSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(5).max(5000),
  category: z.enum(["Technical", "Security", "Feature", "Account", "Bug"]),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  status: z.enum(["open", "in-progress", "pending", "resolved", "closed"]).optional(),
  assignee: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
});

const updateTicketSchema = createTicketSchema.partial();

/* =========================
   Helpers
========================= */

const isValidObjectId = (id: string) => mongoose.isValidObjectId(id);

function ensureTicketAccess(req: any, ticket: any) {
  // user can only access createdBy/assigned tickets
  if (req.user.role !== "user") return true;

  const uid = req.user.userId;
  const createdById =
    ticket.createdBy?._id?.toString?.() ?? ticket.createdBy?.toString?.();
  const assigneeId =
    ticket.assignee?._id?.toString?.() ?? ticket.assignee?.toString?.();

  return createdById === uid || assigneeId === uid;
}

async function createNotification(params: {
  userId: string;
  type: "ticket_assigned" | "ticket_updated" | "comment_added" | "ticket_overdue" | "system";
  title: string;
  message: string;
  link?: string;
}) {
  try {
    if (!params.userId) return;

    await Notification.create({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      isRead: false,
    });
  } catch (err) {
    // don't break the main request
    console.error("❌ Notification create failed:", err);
  }
}

/* =========================
   Routes
========================= */

// GET /api/tickets
router.get("/", async (req: any, res) => {
  const { status, priority, category, assignee, createdBy } = req.query;

  const filter: any = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (assignee) filter.assignee = assignee;
  if (createdBy) filter.createdBy = createdBy;

  if (req.user.role === "user") {
    filter.$or = [{ createdBy: req.user.userId }, { assignee: req.user.userId }];
  }

  const tickets = await Ticket.find(filter)
    .populate("createdBy", "name email role")
    .populate("assignee", "name email role")
    .sort({ createdAt: -1 });

  res.json(tickets);
});

// POST /api/tickets  (manager/admin/agent)
router.post("/", requireRole("manager", "admin", "agent"), async (req: any, res) => {
  try {
    const data = createTicketSchema.parse(req.body);

    if (data.assignee && !isValidObjectId(data.assignee)) {
      return res.status(400).json({ message: "Invalid assignee id" });
    }

    const ticket = await Ticket.create({
      ...data,
      priority: data.priority || "medium",
      status: data.status || "open",
      createdBy: req.user.userId,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });

    const full = await Ticket.findById(ticket._id)
      .populate("createdBy", "name email role")
      .populate("assignee", "name email role");

    // ✅ FIX: null guard
    if (!full) {
      return res.status(500).json({ message: "Failed to load created ticket" });
    }

    // ✅ Notification: when ticket assigned on create
    const assigneeId = (full as any).assignee?._id?.toString?.();
    if (assigneeId) {
      await createNotification({
        userId: assigneeId,
        type: "ticket_assigned",
        title: "New Ticket Assigned",
        message: `A new ticket "${full.title}" has been assigned to you.`,
        link: `/tickets/${full._id}`,
      });
    }

    return res.status(201).json(full);
  } catch (err: any) {
    if (err?.name === "ZodError") return res.status(400).json({ message: err.errors });
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

// GET /api/tickets/:id  (returns { ticket, comments })
router.get("/:id", async (req: any, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid ticket id" });

  const ticket = await Ticket.findById(id)
    .populate("createdBy", "name email role")
    .populate("assignee", "name email role");

  if (!ticket) return res.status(404).json({ message: "Ticket not found" });

  if (!ensureTicketAccess(req, ticket)) return res.status(403).json({ message: "Forbidden" });

  const comments = await Comment.find({ ticketId: ticket._id, deletedAt: null })
    .populate("userId", "name email role")
    .sort({ createdAt: 1 });

  res.json({ ticket, comments });
});

// ✅ POST /api/tickets/:id/comments  (creates comment + notifications)
router.post("/:id/comments", async (req: any, res) => {
  const schema = z.object({
    text: z.string().min(1).max(5000),
  });

  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid ticket id" });

    const { text } = schema.parse(req.body);

    // load ticket to know creator/assignee
    const ticket = await Ticket.findById(id)
      .populate("createdBy", "name email role")
      .populate("assignee", "name email role");

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (!ensureTicketAccess(req, ticket)) return res.status(403).json({ message: "Forbidden" });

    // create comment
    const created = await Comment.create({
      ticketId: ticket._id,
      userId: req.user.userId,
      content: text.trim(),
      attachments: [],
      deletedAt: null,
    });

    const fullComment = await Comment.findById(created._id).populate("userId", "name email role");

    // ✅ Notification: notify assignee + creator (except commenter)
    const commenterId = String(req.user.userId);

    const assigneeId = (ticket as any).assignee?._id?.toString?.() || "";
    const createdById = (ticket as any).createdBy?._id?.toString?.() || "";

    const targets = Array.from(new Set([assigneeId, createdById].filter(Boolean))).filter(
      (uid) => uid !== commenterId
    );

    const commenterName = (fullComment as any)?.userId?.name || "Someone";

    await Promise.all(
      targets.map((uid) =>
        createNotification({
          userId: uid,
          type: "comment_added",
          title: "New Comment Added",
          message: `${commenterName} commented on: "${ticket.title}"`,
          link: `/tickets/${ticket._id}`,
        })
      )
    );

    return res.status(201).json({ comment: fullComment });
  } catch (err: any) {
    if (err?.name === "ZodError") return res.status(400).json({ message: err.errors });
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

// PUT /api/tickets/:id  (update ticket + notify if assignee changed)
router.put("/:id", async (req: any, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid ticket id" });

    const data = updateTicketSchema.parse(req.body);

    if (data.assignee && !isValidObjectId(String(data.assignee))) {
      return res.status(400).json({ message: "Invalid assignee id" });
    }

    const before = await Ticket.findById(id);
    if (!before) return res.status(404).json({ message: "Ticket not found" });

    if (!ensureTicketAccess(req, before)) return res.status(403).json({ message: "Forbidden" });

    const beforeAssignee = before.assignee?.toString?.() || "";

    const updated = await Ticket.findByIdAndUpdate(
      id,
      { ...data, dueDate: data.dueDate ? new Date(data.dueDate) : undefined },
      { new: true }
    )
      .populate("createdBy", "name email role")
      .populate("assignee", "name email role");

    if (!updated) return res.status(404).json({ message: "Ticket not found" });

    const afterAssignee = (updated as any).assignee?._id?.toString?.() || "";

    if (afterAssignee && afterAssignee !== beforeAssignee) {
      await createNotification({
        userId: afterAssignee,
        type: "ticket_assigned",
        title: "Ticket Assigned To You",
        message: `Ticket "${updated.title}" has been assigned to you.`,
        link: `/tickets/${updated._id}`,
      });
    }

    res.json(updated);
  } catch (err: any) {
    if (err?.name === "ZodError") return res.status(400).json({ message: err.errors });
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

// PATCH /api/tickets/:id/status
router.patch("/:id/status", async (req: any, res) => {
  const schema = z.object({
    status: z.enum(["open", "in-progress", "pending", "resolved", "closed"]),
  });

  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid ticket id" });

    const { status } = schema.parse(req.body);

    const ticket = await Ticket.findByIdAndUpdate(id, { status }, { new: true })
      .populate("createdBy", "name email role")
      .populate("assignee", "name email role");

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (!ensureTicketAccess(req, ticket)) return res.status(403).json({ message: "Forbidden" });

    res.json(ticket);
  } catch (err: any) {
    if (err?.name === "ZodError") return res.status(400).json({ message: err.errors });
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

// DELETE /api/tickets/:id
router.delete("/:id", requireRole("admin", "manager"), async (req, res) => {
  const deleted = await Ticket.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Ticket not found" });
  res.json({ message: "Ticket deleted" });
});

export default router;
