import dotenv from "dotenv";

dotenv.config();

function getEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `CRITICAL STARTUP ERROR: Missing required env variable: ${name})`,
    );
  }

  return value;
}

export const env = {
  DATABASE_URL: getEnv("DATABASE_URL"),
  PORT: Number(process.env.PORT || 3002),
  NODE_ENV: getEnv("NODE_ENV") || "development",
  SENTRY_DSN: getEnv("SENTRY_DSN"),
};
