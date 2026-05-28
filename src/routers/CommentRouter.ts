import { Router } from "express";
import { CommentController } from "../controllers/CommentController";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { CommentValidators } from "../validators/CommentValidators";
import { CommentMiddleware } from "../middlewares/CommentMiddleware";

class CommentRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.postRoutes();
    this.patchRoutes();
    this.deleteRoutes();
  }

  postRoutes() {
    this.router.post(
      "/add/:postId",
      GlobalMiddleware.authenticate,
      CommentValidators.addComment(),
      GlobalMiddleware.checkErrors,
      CommentMiddleware.loadPostById,
      CommentController.addComment
    );
  }

  patchRoutes() {
    this.router.patch(
      "/edit/:id",
      GlobalMiddleware.authenticate,
      CommentValidators.editComment(),
      GlobalMiddleware.checkErrors,
      CommentMiddleware.loadCommentById,
      CommentController.editComment
    );
  }

  deleteRoutes() {
    this.router.delete(
      "/delete/:id",
      GlobalMiddleware.authenticate,
      CommentValidators.commentIdParam(),
      GlobalMiddleware.checkErrors,
      CommentMiddleware.loadCommentById,
      CommentController.deleteComment
    );
  }
}

export default new CommentRouter().router;
