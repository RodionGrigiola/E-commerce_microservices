import { describe, it, expect, beforeAll, vi } from "vitest";
import jwt from "jsonwebtoken";
import { TokenService } from "./tokenService";

describe("TokenService (Unit Tests)", () => {
  let tokenService: TokenService;
  const userId = "test-user-uuid-123";

  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = "test_access_secret_key";
    process.env.JWT_REFRESH_SECRET = "test_refresh_secret_key";

    tokenService = new TokenService();
  });

  describe("generateAccessToken", () => {
    it("should generate a valid JWT access token with correct payload", () => {
      const token = tokenService.generateAccessToken(userId);

      expect(typeof token).toBe("string");

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;
      expect(decoded.userId).toBe(userId);

      expect(decoded.exp).toBeDefined();
    });
  });

  describe("generateRefreshToken and verifyRefreshToken", () => {
    it("should generate and successfully verify a refresh token", () => {
      const token = tokenService.generateRefreshToken(userId);
      expect(typeof token).toBe("string");

      const payload = tokenService.verifyRefreshToken(token);

      expect(payload.userId).toBe(userId);
    });

    it("should throw an error if verifyRefreshToken is called with an invalid token", () => {
      expect(() => {
        tokenService.verifyRefreshToken("invalid.token.string");
      }).toThrow();
    });
  });

  describe("hashToken", () => {
    it("should deterministically hash a token string using SHA256", () => {
      const token = "my-secret-refresh-token";

      const hash1 = tokenService.hashToken(token);
      const hash2 = tokenService.hashToken(token);

      expect(hash1).toHaveLength(64);
      expect(/^[a-f0-9]{64}$/.test(hash1)).toBe(true);

      expect(hash1).toBe(hash2);
    });
  });

  describe("getRefreshExpiry", () => {
    it("should return a date exactly 7 days in the future", () => {
      vi.useFakeTimers();
      const systemTime = new Date("2026-06-04T12:00:00.000Z");
      vi.setSystemTime(systemTime);

      const expiryDate = tokenService.getRefreshExpiry();

      const expectedTime = systemTime.getTime() + 7 * 24 * 60 * 60 * 1000;

      expect(expiryDate.getTime()).toBe(expectedTime);

      vi.useRealTimers();
    });
  });
});
