import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signToken(payload: object) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "15m",
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET);
}
