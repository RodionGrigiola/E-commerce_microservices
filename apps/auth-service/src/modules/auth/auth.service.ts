import bcrypt from "bcrypt";
import { AuthRepository } from "./auth.repository.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { logger } from "../../lib/logger.js";

export class AuthService {
  constructor(private repo: AuthRepository) {}

  async register(email: string, password: string) {
    const existing = await this.repo.findByEmail(email);

    if (existing) {
      logger.warn("Registration blocked: email already exists", { email });
      throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.repo.createUser(email, passwordHash);

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);
    const refreshTokenHash = this.hashToken(refreshToken);

    await this.repo.saveRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: this.getRefreshExpiry(),
    });

    return {
      user: { id: user.id, email: user.email },
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    const user = await this.repo.findByEmail(email);

    if (!user) {
      logger.warn("Login failed: email not found", { email });
      throw new Error("Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      logger.warn("Login failed: incorrect password", {
        email,
        userId: user.id,
      });
      throw new Error("Invalid credentials");
    }

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);
    const refreshTokenHash = this.hashToken(refreshToken);

    await this.repo.saveRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: this.getRefreshExpiry(),
    });

    return {
      user: { id: user.id, email: user.email },
      accessToken,
      refreshToken,
    };
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await this.repo.revokeRefreshToken(tokenHash);
    return { success: true };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new Error("No refresh token");
    }

    let payload: any;

    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
      logger.debug("Refresh token JWT signature verified", {
        userId: payload.userId,
      });
    } catch (error: any) {
      logger.warn("Refresh token JWT verification failed", {
        error: error.message,
      });
      throw new Error("Invalid refresh token");
    }

    const userId: string = payload.userId;
    const tokenHash = this.hashToken(refreshToken);
    const storedToken = await this.repo.findValidRefreshToken(tokenHash);

    if (!storedToken) {
      logger.warn(
        "Security Alert: Attempted use of a revoked or reused refresh token",
        { userId },
      );
      throw new Error("Refresh token revoked");
    }

    const newAccessToken = this.generateAccessToken(userId);
    const newRefreshToken = this.generateRefreshToken(userId);
    const newRefreshHash = this.hashToken(newRefreshToken);

    await this.repo.deleteToken(tokenHash);
    await this.repo.saveRefreshToken({
      tokenHash: newRefreshHash,
      userId,
      expiresAt: this.getRefreshExpiry(),
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  // helpers
  private generateAccessToken(userId: string) {
    return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: "15m",
    });
  }

  private generateRefreshToken(userId: string) {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: "7d",
    });
  }

  private getRefreshExpiry() {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  private hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}
