import { Request } from "express";
import { ForbiddenError } from "../errors/AppError";
import { IPost } from "../interfaces/PostInterface";
import { IComment } from "../interfaces/CommentInterface";

export function assertPostOwnership(
  post: IPost,
  userId: string | undefined
): void {
  if (post.user_id.toString() !== userId) {
    throw new ForbiddenError("You do not own this post");
  }
}

export function assertCommentOwnership(
  comment: IComment,
  userId: string | undefined
): void {
  if (comment.user_id.toString() !== userId) {
    throw new ForbiddenError("You do not own this comment");
  }
}

export function getAuthenticatedUserId(req: Request): string {
  return req.user?.user_id as string;
}
