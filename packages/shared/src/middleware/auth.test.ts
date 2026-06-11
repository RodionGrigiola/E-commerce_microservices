import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./auth";
import { AppError } from "../errors";

describe("authMiddleware (Unit Tests)", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const secret = "test_access_secret_key";

  beforeEach(() => {
    // Set up test environment variables
    process.env.JWT_ACCESS_SECRET = secret;

    // Reset standard Express stubs before each test execution
    req = {
      headers: {},
    };
    res = {};
    next = vi.fn() as unknown as NextFunction;
  });

  it("should successfully populate req.user and call next() when given a valid Bearer token", () => {
    // Arrange: Create a real valid token containing a mocked user ID
    const payload = { userId: "user-uuid-999" };
    const validToken = jwt.sign(payload, secret);
    req.headers!.authorization = `Bearer ${validToken}`;

    // Act
    authMiddleware(req as Request, res as Response, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual({ id: "user-uuid-999" });
  });

  it("should throw a 401 AppError if the Authorization header is completely missing", () => {
    // Arrange: req.headers.authorization is undefined by default

    // Act & Assert: For synchronous errors, wrap the execution inside an arrow function
    expect(() => {
      authMiddleware(req as Request, res as Response, next);
    }).toThrow(new AppError("No access token provided", 401));

    expect(next).not.toHaveBeenCalled();
  });

  it("should throw a 401 AppError if the header schema does not use Bearer format", () => {
    // Arrange: Using Basic auth scheme instead of Bearer
    req.headers!.authorization = "Basic token_string";

    // Act & Assert
    expect(() => {
      authMiddleware(req as Request, res as Response, next);
    }).toThrow(
      new AppError("Invalid token format, Bearer schema required", 401),
    );

    expect(next).not.toHaveBeenCalled();
  });

  it("should throw a 401 AppError if the Bearer prefix is present but the token is missing", () => {
    // Arrange
    req.headers!.authorization = "Bearer ";

    // Act & Assert
    expect(() => {
      authMiddleware(req as Request, res as Response, next);
    }).toThrow(
      new AppError("Invalid token format, Bearer schema required", 401),
    );

    expect(next).not.toHaveBeenCalled();
  });

  it("should throw a 401 AppError if the token signature is completely invalid", () => {
    // Arrange: Signing the token with a completely wrong secret key
    const invalidToken = jwt.sign({ userId: "123" }, "wrong_secret_key");
    req.headers!.authorization = `Bearer ${invalidToken}`;

    // Act & Assert
    expect(() => {
      authMiddleware(req as Request, res as Response, next);
    }).toThrow(new AppError("Invalid or expired access token", 401));

    expect(next).not.toHaveBeenCalled();
  });

  it("should throw a 401 AppError if the token has expired", () => {
    // Arrange: Create a token that expired 1 second ago
    const expiredToken = jwt.sign({ userId: "123" }, secret, {
      expiresIn: "-1s",
    });
    req.headers!.authorization = `Bearer ${expiredToken}`;

    // Act & Assert
    expect(() => {
      authMiddleware(req as Request, res as Response, next);
    }).toThrow(new AppError("Invalid or expired access token", 401));

    expect(next).not.toHaveBeenCalled();
  });
});
