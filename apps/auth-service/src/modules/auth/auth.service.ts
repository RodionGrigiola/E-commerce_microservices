import bcrypt from "bcrypt";
import { AuthRepository } from "./auth.repository";
import { TokenService } from "./tokenService";
import { logger } from "../../lib/logger";

export class AuthService {
  constructor(
    private repo: AuthRepository,
    private tokenService: TokenService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.repo.findByEmail(email);

    if (existing) {
      logger.warn("Registration blocked: email already exists", { email });
      throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.repo.createUser(email, passwordHash);

    const accessToken = this.tokenService.generateAccessToken(user.id);
    const refreshToken = this.tokenService.generateRefreshToken(user.id);
    const refreshTokenHash = this.tokenService.hashToken(refreshToken);

    await this.repo.saveRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: this.tokenService.getRefreshExpiry(),
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

    const accessToken = this.tokenService.generateAccessToken(user.id);
    const refreshToken = this.tokenService.generateRefreshToken(user.id);
    const refreshTokenHash = this.tokenService.hashToken(refreshToken);

    await this.repo.saveRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: this.tokenService.getRefreshExpiry(),
    });

    return {
      user: { id: user.id, email: user.email },
      accessToken,
      refreshToken,
    };
  }

  async logout(refreshToken: string) {
    const tokenHash = this.tokenService.hashToken(refreshToken);
    await this.repo.revokeRefreshToken(tokenHash);
    return { success: true };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new Error("No refresh token");
    }

    let payload: any;

    try {
      // Используем метод из TokenService
      payload = this.tokenService.verifyRefreshToken(refreshToken);
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
    const tokenHash = this.tokenService.hashToken(refreshToken);
    const storedToken = await this.repo.findValidRefreshToken(tokenHash);

    if (!storedToken) {
      logger.warn(
        "Security Alert: Attempted use of a revoked or reused refresh token",
        { userId },
      );
      throw new Error("Refresh token revoked");
    }

    const newAccessToken = this.tokenService.generateAccessToken(userId);
    const newRefreshToken = this.tokenService.generateRefreshToken(userId);
    const newRefreshHash = this.tokenService.hashToken(newRefreshToken);

    await this.repo.deleteToken(tokenHash);
    await this.repo.saveRefreshToken({
      tokenHash: newRefreshHash,
      userId,
      expiresAt: this.tokenService.getRefreshExpiry(),
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
