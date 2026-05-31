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
  JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
  DATABASE_URL: getEnv("DATABASE_URL"),
  PORT: Number(process.env.PORT || 3001),
  NODE_ENV: getEnv("NODE_ENV") || "development",
  SENTRY_DSN: getEnv("SENTRY_DSN"),
};
