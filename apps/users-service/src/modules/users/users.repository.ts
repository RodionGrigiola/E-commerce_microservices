import type { PrismaClient } from "../../generated/prisma/index";

export class UsersRepository {
  constructor(private prisma: PrismaClient) {}

  createUserProfile(id: string, email: string) {
    return this.prisma.userProfile.create({
      data: { id, email },
    });
  }

  updateProfile(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      address?: string;
    },
  ) {
    return this.prisma.userProfile.update({
      where: { id },
      data,
    });
  }

  deleteProfile(id: string) {
    return this.prisma.userProfile.delete({
      where: { id },
    });
  }

  findByEmail(email: string) {
    return this.prisma.userProfile.findUnique({
      where: { email },
    });
  }

  findById(id: string) {
    return this.prisma.userProfile.findUnique({
      where: { id },
    });
  }
}
