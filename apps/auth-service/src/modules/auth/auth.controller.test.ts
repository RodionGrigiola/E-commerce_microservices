import { vi, describe, it, expect, beforeEach, type Mocked } from "vitest";
import bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { AuthRepository } from "./auth.repository";
import { TokenService } from "./tokenService";

// Mock the logger module globally using Vitest mock feature
vi.mock("../../lib/logger", () => ({
  logger: {
    warn: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  },
}));

describe("AuthService (Unit Tests with TokenService Mock)", () => {
  let authService: AuthService;
  let mockRepo: Mocked<AuthRepository>;
  let mockTokenService: Mocked<TokenService>;

  beforeEach(() => {
    // 1. Manually shape the mock repository using native Vitest spies
    mockRepo = {
      findByEmail: vi.fn(),
      createUser: vi.fn(),
      saveRefreshToken: vi.fn(),
      revokeRefreshToken: vi.fn(),
      findValidRefreshToken: vi.fn(),
      deleteToken: vi.fn(),
    } as unknown as Mocked<AuthRepository>;

    // 2. Shape the mock token service with predefined fast resolutions
    mockTokenService = {
      generateAccessToken: vi.fn().mockReturnValue("fake_access_token"),
      generateRefreshToken: vi.fn().mockReturnValue("fake_refresh_token"),
      hashToken: vi.fn().mockReturnValue("fake_hash_value"),
      getRefreshExpiry: vi
        .fn()
        .mockReturnValue(new Date("2026-06-11T00:00:00.000Z")),
      verifyRefreshToken: vi.fn(),
    } as unknown as Mocked<TokenService>;

    // 3. Perform Dependency Injection cleanly
    authService = new AuthService(mockRepo, mockTokenService);
  });

  describe("register", () => {
    it("should successfully register a user and return mocked tokens", async () => {
      const email = "test@example.com";
      const password = "password123";

      const mockUser = {
        id: "user-uuid-123",
        email,
        passwordHash: "hashed_pass",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Set up the mock storage behavior
      mockRepo.findByEmail.mockResolvedValue(null);
      mockRepo.createUser.mockResolvedValue(mockUser);
      mockRepo.saveRefreshToken.mockResolvedValue({} as any);

      // Execute application service function
      const result = await authService.register(email, password);

      // Verify overall dictionary mapping matches requirements
      expect(result).toEqual({
        user: { id: "user-uuid-123", email: "test@example.com" },
        accessToken: "fake_access_token",
        refreshToken: "fake_refresh_token",
      });

      // Verify code successfully delegating jobs to TokenService
      expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith(
        "user-uuid-123",
      );
      expect(mockTokenService.generateRefreshToken).toHaveBeenCalledWith(
        "user-uuid-123",
      );
      expect(mockRepo.saveRefreshToken).toHaveBeenCalledWith({
        userId: "user-uuid-123",
        tokenHash: "fake_hash_value",
        expiresAt: expect.any(Date),
      });
    });

    it("should throw 'User already exists' error if email is taken", async () => {
      mockRepo.findByEmail.mockResolvedValue({
        email: "existing_email@gtest.com",
      } as any);

      await expect(
        authService.register("existing_email@gtest.com", "pass"),
      ).rejects.toThrow("User already exists");

      expect(mockRepo.createUser).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should throw 'Invalid credentials' error if password does not match", async () => {
      const trueHash = await bcrypt.hash("correct_pass", 10);
      mockRepo.findByEmail.mockResolvedValue({
        id: "id",
        email: "a@b.com",
        passwordHash: trueHash,
      } as any);

      await expect(authService.login("a@b.com", "wrong_pass")).rejects.toThrow(
        "Invalid credentials",
      );
    });
  });
});
