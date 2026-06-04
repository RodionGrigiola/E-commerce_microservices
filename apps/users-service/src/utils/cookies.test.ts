import { describe, it, expect, beforeEach, vi } from "vitest";
import { setRefreshTokenCookie, clearRefreshTokenCookie } from "./cookies";
import type { Response } from "express";

describe("Cookies Utility (Unit Tests)", () => {
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Create clear spies for Express response methods
    mockResponse = {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    };
  });

  describe("setRefreshTokenCookie", () => {
    it("should set refreshToken cookie with secure, httpOnly options in production", () => {
      // Arrange: Force production environment to test secure flag toggle
      process.env.NODE_ENV = "production";
      const token = "mock_refresh_token_123";

      // Act
      setRefreshTokenCookie(mockResponse as Response, token);

      // Assert: Verify exact secure config mapping
      expect(mockResponse.cookie).toHaveBeenCalledTimes(1);
      expect(mockResponse.cookie).toHaveBeenCalledWith("refreshToken", token, {
        httpOnly: true,
        secure: true, // Must be true in production context
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    });

    it("should set secure to false when NODE_ENV is not production", () => {
      // Arrange: Set development or test environment
      process.env.NODE_ENV = "development";
      const token = "mock_refresh_token_123";

      // Act
      setRefreshTokenCookie(mockResponse as Response, token);

      // Assert
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "refreshToken",
        token,
        expect.objectContaining({ secure: false }), // secure must toggle off for local HTTP setups
      );
    });
  });

  describe("clearRefreshTokenCookie", () => {
    it("should invoke clearCookie using identical security specifications", () => {
      // Arrange
      process.env.NODE_ENV = "production";

      // Act
      clearRefreshTokenCookie(mockResponse as Response);

      // Assert: Clearing cookies requires the exact same options (except maxAge/expires) to work in browsers
      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(1);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    });
  });
});
