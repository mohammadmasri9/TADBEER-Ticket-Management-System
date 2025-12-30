// server/src/models/Ticket.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type TicketCategory = "Technical" | "Security" | "Feature" | "Account" | "Bug";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketStatus = "open" | "in-progress" | "pending" | "resolved" | "closed";

export interface ITicketAttachment {
  filename: string;
  url: string;
  mimetype?: string;
  size?: number;
  uploadedAt?: Date;
}

export interface ITicket extends Document {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;

  createdBy: Types.ObjectId;
  assignee?: Types.ObjectId;

  dueDate?: Date;
  attachments?: ITicketAttachment[];
  tags?: string[];

  estimatedTime?: number;
  actualTime?: number;

  embedding?: number[]; // optional for AI
  resolution?: string;
  satisfactionRating?: number;

  closedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<ITicketAttachment>(
  {
    filename: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    mimetype: { type: String, trim: true },
    size: { type: Number },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TicketSchema = new Schema<ITicket>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },

    category: { type: String, required: true, enum: ["Technical", "Security", "Feature", "Account", "Bug"] },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    status: { type: String, enum: ["open", "in-progress", "pending", "resolved", "closed"], default: "open" },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignee: { type: Schema.Types.ObjectId, ref: "User" },

    dueDate: { type: Date },
    attachments: { type: [AttachmentSchema], default: [] },
    tags: { type: [String], default: [] },

    estimatedTime: { type: Number },
    actualTime: { type: Number },

    embedding: { type: [Number], default: undefined },
    resolution: { type: String, trim: true },
    satisfactionRating: { type: Number, min: 1, max: 5 },

    closedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for performance
TicketSchema.index({ status: 1, priority: 1, createdAt: -1 });
TicketSchema.index({ assignee: 1, status: 1 });
TicketSchema.index({ createdBy: 1, status: 1 });
TicketSchema.index({ category: 1, createdAt: -1 });

const Ticket: Model<ITicket> = mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", TicketSchema);
export default Ticket;
