// Service layer for authentication, registration, login, token, and password reset logic.

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { authRepository } from "./auth.repository";
import { validateResetPassword } from "./auth.validation";
import { createHash } from "crypto";
import { prisma } from "../../config/db";
import { sendPasswordResetEmail } from "../../utils/email";
import { env } from "../../config/env";

const JWT_SECRET = env.JWT_SECRET;
const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET;

const generateAccessToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "15m" });
};

const hashToken = (token: string) => {
  return createHash("sha256").update(token).digest("hex");
};

const generateRefreshToken = async (userId: string) => {
  const token = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
  const hashedToken = hashToken(token);

  await authRepository.createRefreshToken({
    token: hashedToken,
    userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return token;
};

export const authService = {
  async registerUser(data: any) {
    const existing = await authRepository.findUserByEmail(data.email);
    if (existing) throw new Error("User already exists");

    // Only allow STUDENT or PROFESSIONAL roles
    const allowedRoles = ["STUDENT", "PROFESSIONAL"];
    const requestedRole = (data.role || "").toUpperCase();
    if (!allowedRoles.includes(requestedRole)) {
      throw new Error("Invalid role. Only STUDENT or PROFESSIONAL registration allowed.");
    }

    const hashed = await bcrypt.hash(data.password, 10);

    const user = await authRepository.createUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashed,
      role: requestedRole,
    });

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = await generateRefreshToken(user.id);

    return { accessToken, refreshToken };
  },

  async registerEmployer(data: any) {
    const existing = await authRepository.findUserByEmail(data.email);
    if (existing) throw new Error("User already exists");

    if (!data.registrationFileUrl || !data.registrationFileName) {
      throw new Error("Business registration PDF is required");
    }

    const hashed = await bcrypt.hash(data.password, 10);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashed,
          role: "EMPLOYER",
        },
      });

      await tx.employerProfile.create({
        data: {
          userId: user.id,
          companyName: data.companyName,
          registrationFileUrl: data.registrationFileUrl,
          registrationFileName: data.registrationFileName,
        },
      });

      return user;
    });

    const created = await authRepository.findUserByEmail(data.email);
    return {
      message: "Registration successful. Await admin approval.",
      userId: created!.id,
    };
  },

  async login(data: any) {
    const user = await authRepository.findUserByEmail(data.email);
    if (!user || !user.password) throw new Error("Invalid credentials");

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) throw new Error("Invalid credentials");

    if (user.role === "EMPLOYER") {
      if (
        !user.employerProfile ||
        user.employerProfile.verificationStatus !== "APPROVED"
      ) {
        throw new Error("Account pending admin approval");
      }
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = await generateRefreshToken(user.id);

    return { accessToken, refreshToken };
  },

  async refresh(token: string) {
    const hashedToken = hashToken(token);
    const stored = await authRepository.findRefreshToken(hashedToken);
    if (!stored || stored.isRevoked) {
      throw new Error("Invalid refresh token");
    }
    if (stored.expiresAt < new Date()) {
      throw new Error("Refresh token expired");
    }

    // Revoke old refresh token (rotation)
    await authRepository.revokeRefreshToken(stored.token);

    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as any;
    // Issue new refresh token
    const newRefreshToken = await generateRefreshToken(payload.userId);

    // Fetch the user to get the real role
    const user = await authRepository.findUserById(payload.userId);
    if (!user) throw new Error("User not found");

    return {
      accessToken: generateAccessToken(payload.userId, user.role),
      refreshToken: newRefreshToken,
    };
  },

  async logout(token: string) {
    await authRepository.revokeRefreshToken(hashToken(token));
    return { message: "Logged out successfully" };
  },

  async forgotPassword(email: string) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) return { message: "If email exists, reset link sent" };

    // Invalidate any previous reset tokens for this user
    await authRepository.deleteOldPasswordResetTokens(user.id);

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = hashToken(resetToken);

    await authRepository.createPasswordResetToken({
      token: hashedResetToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    await sendPasswordResetEmail(email, resetToken);

    return { message: "If email exists, reset link sent" };
  },

  async resetPassword(token: string, newPassword: string) {
    validateResetPassword(newPassword);

    const hashedToken = hashToken(token);
    const stored = await authRepository.findPasswordResetToken(hashedToken);
    if (!stored || stored.expiresAt < new Date()) {
      throw new Error("Invalid or expired token");
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    // Update user password
    await authRepository.updateUserPassword(stored.userId, hashed);

    await authRepository.deletePasswordResetToken(hashedToken);

    return { message: "Password reset successful" };
  },

  async approveEmployer(userId: string) {
    await authRepository.approveEmployer(userId);
    return { message: "Employer approved successfully" };
  },

  async rejectEmployer(userId: string) {
    await authRepository.rejectEmployer(userId);
    return { message: "Employer rejected" };
  },

  async getEmployersByStatus(status: "pending" | "approved" | "rejected") {
    return authRepository.getEmployersByStatus(status);
  },

  async getPendingEmployers() {
    return authRepository.getPendingEmployers();
  },
};