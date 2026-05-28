import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../errors/AppError";
import { CommentRepository } from "../repositories/comment.repository";
import { PostRepository } from "../repositories/post.repository";

export class CommentMiddleware {
  static async loadPostById(
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const post = await PostRepository.findById(req.params.postId);

      if (!post) {
        throw new NotFoundError("Post does not exist!");
      }

      req.post = post;
      next();
    } catch (error) {
      next(error);
    }
  }

  static async loadCommentById(
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const comment = await CommentRepository.findById(req.params.id);

      if (!comment) {
        throw new NotFoundError("Comment does not exist!");
      }

      req.comment = comment;
      next();
    } catch (error) {
      next(error);
    }
  }
}
