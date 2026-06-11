import { vi, describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../app";
import { UsersService } from "./users.service";

vi.mock("./users.service");

vi.mock("@ecom/shared", async (importOriginal) => {
  const original = await importOriginal<typeof import("@ecom/shared")>();
  return {
    ...original,

    authMiddleware: (req: any, res: any, next: any) => {
      req.user = { id: "authenticated-user-uuid-123" };
      next();
    },

    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
  };
});

describe("UsersController (Integration Tests - Real App Engine)", () => {
  const mockUsersService = vi.mocked(UsersService.prototype);
  const mockUserId = "authenticated-user-uuid-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /users/me", () => {
    it("should return 200 and the user profile if context is present", async () => {
      const mockProfile = {
        id: mockUserId,
        email: "user@test.com",
        firstName: "Alice",
      };
      mockUsersService.getProfile.mockResolvedValue(mockProfile as any);

      const response = await request(app).get("/users/me");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProfile);
      expect(mockUsersService.getProfile).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe("PUT /users/profile", () => {
    it("should return 200 and updated data when given valid payload fields", async () => {
      const validPayload = { firstName: "Bob", phone: "+1234567890" };
      mockUsersService.updateProfile.mockResolvedValue({
        id: mockUserId,
        ...validPayload,
      } as any);

      const response = await request(app)
        .put("/users/profile")
        .send(validPayload);

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe("Bob");
    });

    it("should return 400 Validation Error if phone number layout breaks Zod regex rules", async () => {
      const invalidPayload = { phone: "not-an-email" };

      const response = await request(app)
        .put("/users/profile")
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(mockUsersService.updateProfile).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /users/profile", () => {
    it("should return 200 and success status upon deletion completion", async () => {
      mockUsersService.deleteProfile.mockResolvedValue({
        success: true,
      } as any);

      const response = await request(app).delete("/users/profile");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(mockUsersService.deleteProfile).toHaveBeenCalledWith(mockUserId);
    });
  });
});
