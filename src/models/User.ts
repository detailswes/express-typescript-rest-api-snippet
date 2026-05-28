import mongoose from "mongoose";
import { IUser } from "../interfaces/UserInterface";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    verified: { type: Boolean, required: true, default: false },
    verification_token: { type: Number, default: null },
    verification_token_time: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model<IUser>("users", userSchema);

export default User;
