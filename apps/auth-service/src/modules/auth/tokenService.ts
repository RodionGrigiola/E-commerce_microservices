import jwt from "jsonwebtoken";
import crypto from "crypto";

export class TokenService {
  generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: "15m",
    });
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: "7d",
    });
  }

  getRefreshExpiry(): Date {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  verifyRefreshToken(token: string): any {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
  }
}
