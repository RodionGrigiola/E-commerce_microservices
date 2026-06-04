import { vi, describe, it, expect, beforeEach, type Mocked } from "vitest";
import { UsersService } from "./users.service";
import { UsersRepository } from "./users.repository";
import { AppError } from "../../utils/AppError";

describe("UsersService (Unit Tests)", () => {
  let usersService: UsersService;
  let mockRepo: Mocked<UsersRepository>;
  const userId = "test-user-uuid-111";

  beforeEach(() => {
    mockRepo = {
      createUserProfile: vi.fn(),
      findById: vi.fn(),
      updateProfile: vi.fn(),
      deleteProfile: vi.fn(),
      findByEmail: vi.fn(),
    } as unknown as Mocked<UsersRepository>;

    usersService = new UsersService(mockRepo);
  });

  describe("getProfile", () => {
    it("should return a profile if the user exists in the database", async () => {
      const mockProfile = {
        id: userId,
        email: "test@mail.com",
        firstName: "John",
      };
      mockRepo.findById.mockResolvedValue(mockProfile as any);

      const result = await usersService.getProfile(userId);

      expect(result).toEqual(mockProfile);
      expect(mockRepo.findById).toHaveBeenCalledWith(userId);
    });

    it("should throw a 404 AppError if the user profile is missing", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(usersService.getProfile(userId)).rejects.toThrow(
        new AppError("User profile not found", 404),
      );
    });
  });

  describe("updateProfile", () => {
    it("should successfully update profile fields if the user exists", async () => {
      const mockProfile = { id: userId, email: "test@mail.com" };
      const updateData = { firstName: "John", lastName: "Doe" };

      mockRepo.findById.mockResolvedValue(mockProfile as any);
      mockRepo.updateProfile.mockResolvedValue({
        ...mockProfile,
        ...updateData,
      } as any);

      const result = await usersService.updateProfile(userId, updateData);

      expect(result.firstName).toBe("John");
      expect(mockRepo.updateProfile).toHaveBeenCalledWith(userId, updateData);
    });
  });
});
