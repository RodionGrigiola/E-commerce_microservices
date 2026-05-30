import type { PrismaClient } from "../../generated/prisma/index.js";

export class AuthRepository {
  constructor(private prisma: PrismaClient) {}

  // USERS

  createUser(email: string, passwordHash: string) {
    return this.prisma.authUser.create({
      data: { email, passwordHash },
    });
  }

  findByEmail(email: string) {
    return this.prisma.authUser.findUnique({
      where: { email },
    });
  }

  findById(id: string) {
    return this.prisma.authUser.findUnique({
      where: { id },
    });
  }

  // REFRESH TOKENS

  saveRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return this.prisma.refreshToken.create({
      data,
    });
  }

  revokeToken(tokenHash: string) {
    return this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  revokeAllByUser(userId: string) {
    return this.prisma.refreshToken.updateMany({
      where: { userId },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  findValidToken(tokenHash: string) {
    return this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }
}
