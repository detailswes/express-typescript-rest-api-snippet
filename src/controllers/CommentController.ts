import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../errors/AppError";
import { CommentService } from "../services/comment.service";

export class CommentController {
  static async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await CommentService.addComment(
        req.params.postId,
        req.user?.user_id as string,
        req.body.content
      );
      res.send(post);
    } catch (error) {
      next(error);
    }
  }

  static async editComment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.comment) {
        throw new NotFoundError("Comment does not exist!");
      }
      const comment = await CommentService.editComment(
        req.comment,
        req.user?.user_id as string,
        req.body.content
      );
      res.send(comment);
    } catch (error) {
      next(error);
    }
  }

  static async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.comment) {
        throw new NotFoundError("Comment does not exist!");
      }
      const result = await CommentService.deleteComment(
        req.comment,
        req.user?.user_id as string
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
}
