// server/src/routes/users.routes.ts
import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import User from "../models/User.model";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

// Admin-only endpoints
router.use(requireAuth, requireRole("admin"));

/* =========================
   Schemas
========================= */

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["user", "agent", "manager", "admin"]).default("user"),
  department: z.string().optional(),
  status: z.enum(["available", "busy", "offline"]).default("available"),
  phone: z.string().optional(),
  expertise: z.array(z.string()).optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(["user", "agent", "manager", "admin"]).optional(),
  department: z.string().optional(),
  status: z.enum(["available", "busy", "offline"]).optional(),
  phone: z.string().optional(),
  expertise: z.array(z.string()).optional(),
});

/* =========================
   Routes
========================= */

// POST /api/users  ✅ Create User (admin only)
router.post("/", async (req, res) => {
  try {
    const data = createUserSchema.parse(req.body);

    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const created = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role,
      department: data.department,
      status: data.status,
      phone: data.phone,
      expertise: data.expertise || [],
    });

    const safeUser = await User.findById(created._id).select("-passwordHash");
    return res.status(201).json(safeUser);
  } catch (err: any) {
    if (err?.name === "ZodError") return res.status(400).json({ message: err.errors });
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

// GET /api/users
router.get("/", async (_req, res) => {
  const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
  res.json(users);
});

// GET /api/users/:id
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// PUT /api/users/:id
router.put("/:id", async (req, res) => {
  try {
    const data = updateUserSchema.parse(req.body);

    const user = await User.findByIdAndUpdate(req.params.id, data, {
      new: true,
    }).select("-passwordHash");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err: any) {
    if (err?.name === "ZodError") return res.status(400).json({ message: err.errors });
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// DELETE /api/users/:id
router.delete("/:id", async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted" });
});

export default router;
