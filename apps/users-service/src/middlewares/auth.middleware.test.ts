import { describe, it, expect, beforeEach, vi } from "vitest";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./auth.middleware";
import { AppError } from "../utils/AppError";
import type { Request, Response, NextFunction } from "express";

describe("authMiddleware (Unit Tests)", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const secret = "test_access_secret_key";

  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = secret;

    req = {
      headers: {},
    };
    res = {};
    next = vi.fn() as unknown as NextFunction;
  });

  it("should successfully populate req.user and call next() when given a valid Bearer token", () => {
    const payload = { userId: "user-uuid-999" };
    const validToken = jwt.sign(payload, secret);
    req.headers!.authorization = `Bearer ${validToken}`;

    authMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual({ id: "user-uuid-999" });
  });

  it("should throw a 401 AppError if the Authorization header is completely missing", () => {
    expect(() => {
      authMiddleware(req as Request, res as Response, next);
    }).toThrow(new AppError("No access token provided", 401));

    expect(next).not.toHaveBeenCalled();
  });

  it("should throw a 401 AppError if the header schema does not use Bearer format", () => {
    req.headers!.authorization = "Basic token_string";

    expect(() => {
      authMiddleware(req as Request, res as Response, next);
    }).toThrow(
      new AppError("Invalid token format, Bearer schema required", 401),
    );

    expect(next).not.toHaveBeenCalled();
  });

  it("should throw a 401 AppError if the Bearer prefix is present but the token is missing", () => {
    req.headers!.authorization = "Bearer ";

    expect(() => {
      authMiddleware(req as Request, res as Response, next);
    }).toThrow(
      new AppError("Invalid token format, Bearer schema required", 401),
    );

    expect(next).not.toHaveBeenCalled();
  });

  it("should throw a 401 AppError if the token signature is completely invalid", () => {
    const invalidToken = jwt.sign({ userId: "123" }, "wrong_secret_key");
    req.headers!.authorization = `Bearer ${invalidToken}`;

    expect(() => {
      authMiddleware(req as Request, res as Response, next);
    }).toThrow(new AppError("Invalid or expired access token", 401));

    expect(next).not.toHaveBeenCalled();
  });

  it("should throw a 401 AppError if the token has expired", () => {
    const expiredToken = jwt.sign({ userId: "123" }, secret, {
      expiresIn: "-1s",
    });
    req.headers!.authorization = `Bearer ${expiredToken}`;

    expect(() => {
      authMiddleware(req as Request, res as Response, next);
    }).toThrow(new AppError("Invalid or expired access token", 401));

    expect(next).not.toHaveBeenCalled();
  });
});
