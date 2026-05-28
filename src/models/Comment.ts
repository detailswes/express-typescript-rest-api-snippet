import mongoose from "mongoose";
import Post from "./Post";
import { IComment } from "../interfaces/CommentInterface";

const commentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    content: { type: String, required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

commentSchema.index({ user_id: 1 });

async function removeCommentFromPost(doc: IComment): Promise<void> {
  await Post.updateOne(
    { comments: doc._id },
    { $pull: { comments: doc._id } }
  );
}

commentSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function (this: IComment) {
    await removeCommentFromPost(this);
  }
);

const Comment = mongoose.model<IComment>("comments", commentSchema);

export default Comment;
