// server/src/models/User.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "user" | "agent" | "manager" | "admin";
export type UserStatus = "available" | "busy" | "offline";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  phone?: string;
  status: UserStatus;
  expertise?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    role: { type: String, enum: ["user", "agent", "manager", "admin"], default: "user" },
    status: { type: String, enum: ["available", "busy", "offline"], default: "offline" },

    avatar: { type: String },
    department: { type: String, trim: true },
    phone: { type: String, trim: true },
    expertise: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// Helpful indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
