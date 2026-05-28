import { Router } from "express";
import { PostValidators } from "../validators/PostValidators";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { PostMiddleware } from "../middlewares/PostMiddleware";
import { PostController } from "../controllers/PostController";

class PostRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.getRoutes();
    this.postRoutes();
    this.patchRoutes();
    this.deleteRoutes();
  }

  getRoutes() {
    this.router.get(
      "/me",
      GlobalMiddleware.authenticate,
      PostController.getPostByUser
    );
    this.router.get(
      "/:id",
      GlobalMiddleware.authenticate,
      PostValidators.postIdParam(),
      GlobalMiddleware.checkErrors,
      PostMiddleware.loadPostById,
      PostMiddleware.requirePostOwnership,
      PostController.getPostById
    );
  }

  postRoutes() {
    this.router.post(
      "/add",
      GlobalMiddleware.authenticate,
      PostValidators.addPost(),
      GlobalMiddleware.checkErrors,
      PostController.addPost
    );
  }

  patchRoutes() {
    this.router.patch(
      "/edit/:id",
      GlobalMiddleware.authenticate,
      PostValidators.editPost(),
      GlobalMiddleware.checkErrors,
      PostMiddleware.loadPostById,
      PostMiddleware.requirePostOwnership,
      PostController.editPost
    );
  }

  deleteRoutes() {
    this.router.delete(
      "/delete/:id",
      GlobalMiddleware.authenticate,
      PostValidators.postIdParam(),
      GlobalMiddleware.checkErrors,
      PostMiddleware.loadPostById,
      PostMiddleware.requirePostOwnership,
      PostController.deletePost
    );
  }
}

export default new PostRouter().router;
