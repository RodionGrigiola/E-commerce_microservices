import bcrypt from "bcrypt";
import { AuthRepository } from "./auth.repository.js";
import jwt from "jsonwebtoken";

export class AuthService {
  constructor(private repo: AuthRepository) {}

  async register(email: string, password: string) {
    // 1. check if user exists
    const existing = await this.repo.findByEmail(email);

    if (existing) {
      throw new Error("User already exists");
    }

    // 2. hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. create user
    const user = await this.repo.createUser(email, passwordHash);

    // 4. create tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    // 5. save refresh token (hash it!)
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

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
}
