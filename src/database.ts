import mongoose from "mongoose";
import { config } from "./config/env";
import { logger } from "./config/logger";

export async function connectDatabase(url?: string): Promise<void> {
  const dbUrl = url || config.dbUrl;

  await mongoose.connect(dbUrl);
  logger.info("Database connected");
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info("Database connection closed");
}
