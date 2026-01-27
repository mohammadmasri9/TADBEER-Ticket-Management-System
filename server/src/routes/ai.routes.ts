import { Router } from "express";
import rateLimit from "express-rate-limit";
import { suggestTicket, assistTicket } from "../controllers/ai.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 20, // 20 requests per 5 min
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

// 🔒 Must be logged in
router.use(requireAuth);

// ⛔ Limit AI abuse
router.use(aiLimiter);

// POST /api/ai/tickets/suggest
router.post("/tickets/suggest", suggestTicket);

// ✅ Assist (legacy - body: { ticketId, question })
router.post("/tickets/assist", assistTicket);

// ✅ Assist (new - param: /tickets/:ticketId/assist  body: { question })
router.post("/tickets/:ticketId/assist", assistTicket);

export default router;
