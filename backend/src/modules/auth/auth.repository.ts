// Repository functions for user, employer, refresh token, and password reset token database operations.
import { prisma } from "../../config/db";

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { employerProfile: true },
    });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { employerProfile: true },
    });
  },

  getPendingEmployers() {
    return prisma.user.findMany({
      where: { role: 'EMPLOYER', employerProfile: { verificationStatus: 'PENDING' } },
      include: { employerProfile: true },
    });
  },

  getEmployersByStatus(status: "pending" | "approved" | "rejected") {
    const statusMap = {
      pending: "PENDING",
      approved: "APPROVED",
      rejected: "REJECTED",
    } as const;

    return prisma.user.findMany({
      where: {
        role: "EMPLOYER",
        employerProfile: { verificationStatus: statusMap[status] },
      },
      include: { employerProfile: true },
    });
  },

  rejectEmployer(userId: string) {
    return prisma.employerProfile.update({
      where: { userId },
      data: { verificationStatus: 'REJECTED' },
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

  deleteOldPasswordResetTokens(userId: string) {
    return prisma.passwordResetToken.deleteMany({ where: { userId } });
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