/// <reference path="./types/express.d.ts" />
import { createApp } from "./app";
import { config } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./database";
import { logger } from "./config/logger";

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  const httpServer = app.listen(config.port, () => {
    logger.info({ port: config.port }, "Server is running");
  });

  const gracefulShutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down gracefully");

    httpServer.close(async () => {
      try {
        await disconnectDatabase();
        process.exit(0);
      } catch (error) {
        logger.error({ err: error }, "Error during shutdown");
        process.exit(1);
      }
    });
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

bootstrap().catch((error) => {
  logger.error({ err: error }, "Failed to start server");
  process.exit(1);
});
