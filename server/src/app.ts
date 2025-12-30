// server/src/app.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/user.routes";
import ticketsRoutes from "./routes/ticket.routes";

const app = express();

// middleware
app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })
);

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// health
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/tickets", ticketsRoutes);

// 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(err?.status || 500).json({
    message: err?.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err?.stack,
  });
});

export default app;
