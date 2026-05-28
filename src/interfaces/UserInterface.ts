import { Document } from "mongoose";

export interface IUser extends Document {
  verified: boolean;
  created_at: Date;
  updated_at: Date;
  email: string;
  password: string;
  username: string;
  verification_token: number | null;
  verification_token_time: Date | null;
}
