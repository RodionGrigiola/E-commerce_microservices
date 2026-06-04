import { describe, it, expect, beforeEach } from "vitest";
import { UsersRepository } from "./users.repository";
import { prisma } from "../../db/prisma";

describe("AuthRepository (Database Integration Tests)", () => {
  let repository: UsersRepository;

  beforeEach(async () => {
    repository = new UsersRepository(prisma);
    await prisma.userProfile.deleteMany();
  });

  it("should successfully create a new user profile and find it by id or email", async () => {
    const externalUserId = "auth-generated-uuid-111-222";
    const email = "db_test@example.com";

    const profile = await repository.createUserProfile(externalUserId, email);
    expect(profile.id).toBe(externalUserId);
    expect(profile.email).toBe(email);

    const foundById = await repository.findById(externalUserId);
    expect(foundById).not.toBeNull();
    expect(foundById!.id).toBe(externalUserId);

    const foundByEmail = await repository.findByEmail(email);
    expect(foundByEmail).not.toBeNull();
    expect(foundByEmail!.id).toBe(externalUserId);
  });

  it("should return null if user profile is not found by email", async () => {
    const found = await repository.findByEmail("non_existent@example.com");
    expect(found).toBeNull();
  });

  it("should return null if user profile is not found by id", async () => {
    const found = await repository.findByEmail("non_existent_id");
    expect(found).toBeNull();
  });

  it("should successfully delete a user profile by id", async () => {
    const externalUserId = "auth-generated-uuid-111-222";
    const email = "db_test@example.com";

    const profile = await repository.createUserProfile(externalUserId, email);
    expect(profile.id).toBe(externalUserId);

    const deletedProfile = await repository.deleteProfile(externalUserId);
    expect(deletedProfile).toBeDefined();
    expect(deletedProfile.id).toBe(externalUserId);

    const foundAfterDelete = await repository.findById(externalUserId);
    expect(foundAfterDelete).toBeNull();
  });

  it("should successfully update a user profile by id", async () => {
    const externalUserId = "auth-generated-uuid-111-222";
    const email = "db_test@example.com";

    const profile = await repository.createUserProfile(externalUserId, email);

    const updateData = {
      firstName: "John",
      lastName: "Doe",
      phone: "+123456789",
      address: "123 Main St, New York",
    };

    const updatedProfile = await repository.updateProfile(
      externalUserId,
      updateData,
    );
    expect(updatedProfile.firstName).toBe(updateData.firstName);
    expect(updatedProfile.address).toBe(updateData.address);

    const freshProfileFromDb = await repository.findById(externalUserId);
    expect(freshProfileFromDb).not.toBeNull();
    expect(freshProfileFromDb!.firstName).toBe("John");
    expect(freshProfileFromDb!.lastName).toBe("Doe");
    expect(freshProfileFromDb!.phone).toBe("+123456789");
    expect(freshProfileFromDb!.address).toBe("123 Main St, New York");

    expect(freshProfileFromDb!.id).toBe(externalUserId);
    expect(freshProfileFromDb!.email).toBe(email);
  });
});
