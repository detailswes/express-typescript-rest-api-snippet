import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../errors/AppError";
import { PostRepository } from "../repositories/post.repository";
import { assertPostOwnership } from "../utils/authorization";

export class PostMiddleware {
  static async loadPostById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const post = await PostRepository.findById(req.params.id);

      if (!post) {
        throw new NotFoundError("Post does not exist!");
      }

      req.post = post;
      next();
    } catch (error) {
      next(error);
    }
  }

  static requirePostOwnership(
    req: Request,
    _res: Response,
    next: NextFunction
  ): void {
    try {
      if (!req.post) {
        throw new NotFoundError("Post does not exist!");
      }
      assertPostOwnership(req.post, req.user?.user_id);
      next();
    } catch (error) {
      next(error);
    }
  }
}
