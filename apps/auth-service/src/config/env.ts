import dotenv from "dotenv";

dotenv.config();

export const env = {
  JWT_SECRET: process.env.JWT_SECRET || "secret",
  PORT: process.env.PORT || 3001,
};
