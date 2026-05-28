import { Types } from "mongoose";
import Comment from "../models/Comment";
import Post from "../models/Post";
import { NotFoundError } from "../errors/AppError";
import { IComment } from "../interfaces/CommentInterface";
import { IPost } from "../interfaces/PostInterface";

export class CommentRepository {
  static findById(id: string): Promise<IComment | null> {
    return Comment.findById(id).exec();
  }

  static async create(
    postId: string,
    userId: string,
    content: string
  ): Promise<{ comment: IComment; post: IPost }> {
    const comment = await Comment.create({
      content,
      user_id: new Types.ObjectId(userId),
    });

    const post = await Post.findById(postId).exec();
    if (!post) {
      await comment.deleteOne();
      throw new NotFoundError("Post does not exist!");
    }

    post.comments.push(comment._id);
    await post.save();
    return { comment, post };
  }

  static updateDocument(comment: IComment, content: string): Promise<IComment> {
    comment.content = content;
    return comment.save();
  }

  static async deleteDocument(comment: IComment): Promise<void> {
    await comment.deleteOne();
  }
}
