import winston from "winston";
import { env } from "../config/env.js";

const { combine, timestamp, printf, colorize, uncolorize } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} [${level}] ${message} ${
    Object.keys(meta).length ? JSON.stringify(meta) : ""
  }`;
});

export const logger = winston.createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  transports: [
    new winston.transports.Console({
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        colorize(),
        logFormat,
      ),
    }),

    new winston.transports.File({
      filename: "logs/app.log",
      format: combine(timestamp(), uncolorize(), logFormat),
    }),
  ],
});
