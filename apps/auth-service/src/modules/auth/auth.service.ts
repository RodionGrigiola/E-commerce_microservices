import bcrypt from "bcrypt";
import { AuthRepository } from "./auth.repository.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export class AuthService {
  constructor(private repo: AuthRepository) {}

  async register(email: string, password: string) {
    const existing = await this.repo.findByEmail(email);

    if (existing) {
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
      user: {
        id: user.id,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    // 1. find user
    const user = await this.repo.findByEmail(email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // 2. check password
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    // 3. create tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    // 4. store refresh token hash
    const refreshTokenHash = this.hashToken(refreshToken);

    await this.repo.saveRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: this.getRefreshExpiry(),
    });

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  }

  async logout(refreshToken: string) {
    // hash incoming token (because we store hash in DB)
    const tokenHash = this.hashToken(refreshToken);

    // revoke it
    await this.repo.revokeRefreshToken(tokenHash);

    return { success: true };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new Error("No refresh token");
    }

    // 1. verify JWT signature
    let payload: any;

    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
      console.log(payload);
    } catch {
      throw new Error("Invalid refresh token");
    }

    const userId: string = payload.userId;

    // 2. check DB (token rotation / revocation protection)
    const tokenHash = this.hashToken(refreshToken);

    const storedToken = await this.repo.findValidRefreshToken(tokenHash);

    if (!storedToken) {
      throw new Error("Refresh token revoked");
    }

    // 3. generate new tokens
    const newAccessToken = this.generateAccessToken(userId);
    const newRefreshToken = this.generateRefreshToken(userId);
    const newRefreshHash = this.hashToken(newRefreshToken);

    await this.repo.deleteToken(tokenHash);
    await this.repo.saveRefreshToken({
      tokenHash: newRefreshHash,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
