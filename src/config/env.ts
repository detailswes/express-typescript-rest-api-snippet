import * as dotenv from "dotenv";

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const jwtSecret = requireEnv("JWT_SECRET");
if (jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters");
}

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  dbUrl: requireEnv("DB_URL"),
  jwtSecret,
  mailHost: requireEnv("MAIL_HOST"),
  mailPort: parseInt(requireEnv("MAIL_PORT"), 10),
  mailUsername: requireEnv("MAIL_USERNAME"),
  mailPassword: requireEnv("MAIL_PASSWORD"),
  mailFromEmail: requireEnv("MAIL_FROM_EMAIL"),
  mailFromName: process.env.MAIL_FROM_NAME || "Code Snippet API",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim()),
};
