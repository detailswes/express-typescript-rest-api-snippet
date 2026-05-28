import Post from "../models/Post";
import { IPost } from "../interfaces/PostInterface";
import { Types } from "mongoose";

export interface PaginatedPosts {
  posts: IPost[];
  total: number;
  page: number;
  limit: number;
}

export class PostRepository {
  static create(userId: string, content: string): Promise<IPost> {
    return new Post({
      user_id: new Types.ObjectId(userId),
      content,
    }).save();
  }

  static findById(id: string): Promise<IPost | null> {
    return Post.findById(id).exec();
  }

  static findByUserPaginated(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginatedPosts> {
    const skip = (page - 1) * limit;
    const filter = { user_id: new Types.ObjectId(userId) };

    return Promise.all([
      Post.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .populate("comments")
        .exec(),
      Post.countDocuments(filter).exec(),
    ]).then(([posts, total]) => ({ posts, total, page, limit }));
  }

  static updateDocument(post: IPost, content: string): Promise<IPost> {
    post.content = content;
    return post.save();
  }

  static async deleteDocument(post: IPost): Promise<void> {
    await post.deleteOne();
  }
}
