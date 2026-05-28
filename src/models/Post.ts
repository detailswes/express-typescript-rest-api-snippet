import mongoose from "mongoose";
import Comment from "./Comment";
import { IPost } from "../interfaces/PostInterface";

const postSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    content: { type: String, required: true },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "comments" }],
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

postSchema.index({ user_id: 1 });

postSchema.virtual("commentCount").get(function (this: IPost) {
  return this.comments.length;
});

postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

postSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function (this: IPost) {
    if (this.comments?.length > 0) {
      await Comment.deleteMany({ _id: { $in: this.comments } });
    }
  }
);

const Post = mongoose.model<IPost>("posts", postSchema);

export default Post;
