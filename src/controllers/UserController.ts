import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.service";

export class UserController {
  static async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.signUp({
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
      });
      res.status(201).send(user);
    } catch (error) {
      next(error);
    }
  }

  static async verifyUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.verifyUser(
        req.body.email,
        req.body.verification_token
      );
      res.send(user);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.login({
        email: req.body.email,
        password: req.body.password,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  static async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.updatePassword({
        userId: req.user?.user_id as string,
        currentPassword: req.body.current_password,
        newPassword: req.body.new_password,
      });
      res.send(user);
    } catch (error) {
      next(error);
    }
  }
}
