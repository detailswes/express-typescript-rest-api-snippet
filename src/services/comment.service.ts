import { IComment } from "../interfaces/CommentInterface";
import { IPost } from "../interfaces/PostInterface";
import { CommentRepository } from "../repositories/comment.repository";
import { assertCommentOwnership } from "../utils/authorization";

export class CommentService {
  static async addComment(
    postId: string,
    userId: string,
    content: string
  ): Promise<IPost> {
    const result = await CommentRepository.create(postId, userId, content);
    return result.post;
  }

  static async editComment(
    comment: IComment,
    userId: string,
    content: string
  ): Promise<IComment> {
    assertCommentOwnership(comment, userId);
    return CommentRepository.updateDocument(comment, content);
  }

  static async deleteComment(comment: IComment, userId: string) {
    assertCommentOwnership(comment, userId);
    await CommentRepository.deleteDocument(comment);
    return { message: "Comment deleted successfully", id: comment._id };
  }
}
