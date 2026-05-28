import { Document, Types } from "mongoose";

export interface IPost extends Document {
  comments: Types.ObjectId[];
  user_id: Types.ObjectId;
  content: string;
  created_at: Date;
  updated_at: Date;
  commentCount?: number;
}
