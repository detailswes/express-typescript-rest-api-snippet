import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import * as Jwt from "jsonwebtoken";
import { config } from "../config/env";
import { UnauthorizedError, ValidationError } from "../errors/AppError";

export class GlobalMiddleware {
  static checkErrors(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(new ValidationError(errors.array()[0].msg));
    }

    return next();
  }

  static authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new UnauthorizedError("User not authorised"));
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = Jwt.verify(token, config.jwtSecret) as {
        user_id: string;
        email: string;
      };
      req.user = decoded;
      next();
    } catch (error) {
      next(new UnauthorizedError("Invalid or expired token"));
    }
  }
}
