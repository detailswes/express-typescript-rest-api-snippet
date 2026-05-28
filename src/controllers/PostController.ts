import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../errors/AppError";
import { PostService } from "../services/post.service";

export class PostController {
  static async addPost(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await PostService.createPost(
        req.user?.user_id as string,
        req.body.content
      );
      res.send(post);
    } catch (error) {
      next(error);
    }
  }

  static async getPostByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PostService.getPostsByUser(
        req.user?.user_id as string,
        parseInt(String(req.query.page || 1), 10),
        parseInt(String(req.query.limit || 20), 10)
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  static getPostById(req: Request, res: Response) {
    res.json(PostService.getPostById(req.post!));
  }

  static async editPost(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.post) {
        throw new NotFoundError("Post does not exist!");
      }
      const post = await PostService.editPost(
        req.post,
        req.user?.user_id as string,
        req.body.content
      );
      res.send(post);
    } catch (error) {
      next(error);
    }
  }

  static async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.post) {
        throw new NotFoundError("Post does not exist!");
      }
      const result = await PostService.deletePost(
        req.post,
        req.user?.user_id as string
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
}
