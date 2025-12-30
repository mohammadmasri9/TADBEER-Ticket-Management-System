// server/src/routes/tickets.routes.ts
import { Router } from "express";
import { z } from "zod";
import Ticket from "../models/Ticket.model";
import Comment from "../models/Comments";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(requireAuth);

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

// GET /api/tickets (filters supported)
router.get("/", async (req: any, res) => {
  const { status, priority, category, assignee, createdBy } = req.query;

  const filter: any = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (assignee) filter.assignee = assignee;
  if (createdBy) filter.createdBy = createdBy;

  // If normal user, show only tickets createdBy or assigned to them
  if (req.user.role === "user") {
    filter.$or = [{ createdBy: req.user.userId }, { assignee: req.user.userId }];
  }

  const tickets = await Ticket.find(filter)
    .populate("createdBy", "name email role")
    .populate("assignee", "name email role")
    .sort({ createdAt: -1 });

  res.json(tickets);
});

// POST /api/tickets (manager/admin can create, optional for user if you want)
router.post("/", requireRole("manager", "admin", "agent"), async (req: any, res) => {
  try {
    const data = createTicketSchema.parse(req.body);

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

    res.status(201).json(full);
  } catch (err: any) {
    if (err?.name === "ZodError") return res.status(400).json({ message: err.errors });
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// GET /api/tickets/:id
router.get("/:id", async (req: any, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate("createdBy", "name email role")
    .populate("assignee", "name email role");

  if (!ticket) return res.status(404).json({ message: "Ticket not found" });

  // User can only access own/assigned tickets
  if (req.user.role === "user") {
    const uid = req.user.userId;
    if (ticket.createdBy?._id.toString() !== uid && ticket.assignee?._id?.toString() !== uid) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  const comments = await Comment.find({ ticketId: ticket._id })
    .populate("userId", "name email role")
    .sort({ createdAt: 1 });

  res.json({ ticket, comments });
});

// PUT /api/tickets/:id
router.put("/:id", async (req: any, res) => {
  try {
    const data = updateTicketSchema.parse(req.body);

    // User can only update status/comments in real apps; here we allow broader update for simplicity
    // You can restrict later by role.
    const updated = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      { new: true }
    )
      .populate("createdBy", "name email role")
      .populate("assignee", "name email role");

    if (!updated) return res.status(404).json({ message: "Ticket not found" });
    res.json(updated);
  } catch (err: any) {
    if (err?.name === "ZodError") return res.status(400).json({ message: err.errors });
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// PATCH /api/tickets/:id/status
router.patch("/:id/status", async (req: any, res) => {
  const schema = z.object({
    status: z.enum(["open", "in-progress", "pending", "resolved", "closed"]),
  });

  try {
    const { status } = schema.parse(req.body);

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("createdBy", "name email role")
      .populate("assignee", "name email role");

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (err: any) {
    if (err?.name === "ZodError") return res.status(400).json({ message: err.errors });
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// DELETE /api/tickets/:id (admin/manager)
router.delete("/:id", requireRole("admin", "manager"), async (req, res) => {
  const deleted = await Ticket.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Ticket not found" });
  res.json({ message: "Ticket deleted" });
});

export default router;
