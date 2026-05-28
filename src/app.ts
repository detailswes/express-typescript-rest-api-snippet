import mongoose from "mongoose";
import express, { Application, ErrorRequestHandler, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";
import { config } from "./config/env";
import { logger } from "./config/logger";
import UserRouter from "./routers/UserRouter";
import PostRouter from "./routers/PostRouter";
import CommentRouter from "./routers/CommentRouter";
import { AppError } from "./errors/AppError";
import { setupSwagger, isSwaggerEnabled } from "./config/swagger.setup";

export function createApp(): Application {
  const app = express();

  app.set("trust proxy", 1);

  app.use(
    helmet(
      isSwaggerEnabled()
        ? {
            contentSecurityPolicy: {
              directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
                fontSrc: ["'self'", "data:"],
              },
            },
          }
        : {}
    )
  );
  app.use(
    cors({
      origin: config.allowedOrigins,
      credentials: true,
    })
  );
  app.use(
    pinoHttp({
      logger,
      autoLogging: process.env.NODE_ENV !== "test",
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  setupSwagger(app);

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  app.get("/health/ready", async (_req: Request, res: Response) => {
    const dbState = mongoose.connection.readyState;
    const isReady = dbState === 1;

    res.status(isReady ? 200 : 503).json({
      status: isReady ? "ready" : "not_ready",
      database: isReady ? "connected" : "disconnected",
    });
  });

  app.use("/api/v1/user", UserRouter);
  app.use("/api/v1/post", PostRouter);
  app.use("/api/v1/comment", CommentRouter);

  app.use((req: Request, res: Response) => {
    res.status(404).json({
      message: "Not Found",
      status_code: 404,
      path: req.path,
    });
  });

  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    const statusCode = error instanceof AppError ? error.statusCode : 500;

    res.status(statusCode).json({
      message: error.message || "Something went wrong. Please try again!",
      status_code: statusCode,
    });
  };

  app.use(errorHandler);

  return app;
}
