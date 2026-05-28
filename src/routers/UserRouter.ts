import { NextFunction, Request, Response, Router } from "express";
import rateLimit from "express-rate-limit";
import { UserController } from "../controllers/UserController";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { UserValidators } from "../validators/UserValidators";

const noop = (_req: Request, _res: Response, next: NextFunction) => next();

const authRateLimit =
  process.env.NODE_ENV === "test"
    ? noop
    : rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10,
        message: "Too many attempts. Please try again later.",
      });

const verifyRateLimit =
  process.env.NODE_ENV === "test"
    ? noop
    : rateLimit({
        windowMs: 60 * 60 * 1000,
        max: 5,
        message: "Too many verification attempts. Please try again later.",
      });

export class UserRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.postRoutes();
    this.patchRoutes();
  }

  postRoutes() {
    this.router.post(
      "/sign-up",
      authRateLimit,
      UserValidators.signUp(),
      GlobalMiddleware.checkErrors,
      UserController.signUp
    );
    this.router.post(
      "/verify",
      verifyRateLimit,
      UserValidators.verifyUser(),
      GlobalMiddleware.checkErrors,
      UserController.verifyUser
    );
    this.router.post(
      "/login",
      authRateLimit,
      UserValidators.login(),
      GlobalMiddleware.checkErrors,
      UserController.login
    );
  }

  patchRoutes() {
    this.router.patch(
      "/update/password",
      GlobalMiddleware.authenticate,
      UserValidators.updatePassword(),
      GlobalMiddleware.checkErrors,
      UserController.updatePassword
    );
  }
}

export default new UserRouter().router;
