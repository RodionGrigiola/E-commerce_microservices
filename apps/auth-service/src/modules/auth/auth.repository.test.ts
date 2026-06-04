import { describe, it, expect, beforeEach } from "vitest";
import { AuthRepository } from "./auth.repository";
import { prisma } from "../../db/prisma";

describe("AuthRepository (Database Integration Tests)", () => {
  let repository: AuthRepository;

  beforeEach(async () => {
    repository = new AuthRepository(prisma);

    await prisma.refreshToken.deleteMany();
    await prisma.authUser.deleteMany();
  });

  it("should successfully create a new user and find them by email", async () => {
    const email = "db_test@example.com";
    const passwordHash = "some_hashed_password_string";

    const createdUser = await repository.createUser(email, passwordHash);

    expect(createdUser).toBeDefined();
    expect(createdUser.id).toBeDefined();
    expect(createdUser.email).toBe(email);

    const foundUser = await repository.findByEmail(email);

    expect(foundUser).not.toBeNull();
    expect(foundUser!.id).toBe(createdUser.id);
    expect(foundUser!.passwordHash).toBe(passwordHash);
  });

  it("should return null if user is not found by email", async () => {
    const foundUser = await repository.findByEmail("non_existent@example.com");
    expect(foundUser).toBeNull();
  });
});
