// Repository functions for user, employer, refresh token, and password reset token database operations.
import { prisma } from "../../config/db";

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { employerProfile: true },
    });
  },

  createUser(data: any) {
    return prisma.user.create({ data });
  },

  createEmployerProfile(data: any) {
    return prisma.employerProfile.create({ data });
  },

  createRefreshToken(data: any) {
    return prisma.refreshToken.create({ data });
  },

  findRefreshToken(token: string) {
    // token is now always hashed
    return prisma.refreshToken.findUnique({ where: { token } });
  },

  revokeRefreshToken(token: string) {
    return prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    });
  },

  approveEmployer(userId: string) {
    return prisma.employerProfile.update({
      where: { userId },
      data: { verificationStatus: "APPROVED" },
    });
  },

  createPasswordResetToken(data: any) {
    return prisma.passwordResetToken.create({ data });
  },

  findPasswordResetToken(token: string) {
    // token is now always hashed
    return prisma.passwordResetToken.findUnique({ where: { token } });
  },

  deletePasswordResetToken(token: string) {
    return prisma.passwordResetToken.delete({ where: { token } });
  },

  updateUserPassword(userId: string, password: string) {
    return prisma.user.update({ where: { id: userId }, data: { password } });
  },
};