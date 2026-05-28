import { Document, Types } from "mongoose";

export interface IComment extends Document {
  user_id: Types.ObjectId;
  content: string;
  created_at: Date;
  updated_at: Date;
}
