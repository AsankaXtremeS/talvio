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

// OAUTH STATE SECRET is used to sign the state parameter for OAuth flows to prevent CSRF attacks.
const OAUTH_STATE_SECRET = `${env.JWT_SECRET}_oauth_state`;

type OAuthProvider = "google" | "linkedin";
type OAuthRole = "STUDENT" | "PROFESSIONAL";

// Interfaces for pending employers and OAuth profiles
interface OAuthProfile {
  providerUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

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
// Issues access and refresh tokens for a given user ID and role.(Access token is short-lived, refresh token is long-lived and stored in DB for rotation and revocation)

const issueTokensForUser = async (userId: string, role: string) => {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = await generateRefreshToken(userId);
  return { accessToken, refreshToken };
};

const validateOAuthRole = (role: string): OAuthRole => {
  const normalized = String(role || "").toUpperCase();
  if (normalized !== "STUDENT" && normalized !== "PROFESSIONAL") {
    throw new Error("Invalid role for OAuth signup.");
  }
  return normalized;
};

const createOAuthState = (provider: OAuthProvider, role: OAuthRole) => {
  return jwt.sign({ provider, role }, OAUTH_STATE_SECRET, { expiresIn: "10m" });
};

const parseOAuthState = (state: string): { provider: OAuthProvider; role: OAuthRole } => {
  const payload = jwt.verify(state, OAUTH_STATE_SECRET) as { provider?: OAuthProvider; role?: OAuthRole };
  if (!payload.provider || !payload.role) {
    throw new Error("Invalid OAuth state payload");
  }
  if (payload.provider !== "google" && payload.provider !== "linkedin") {
    throw new Error("Invalid OAuth provider in state");
  }
  if (payload.role !== "STUDENT" && payload.role !== "PROFESSIONAL") {
    throw new Error("Invalid OAuth role in state");
  }
  return { provider: payload.provider, role: payload.role };
};

const getCallbackUrl = (provider: OAuthProvider) => `${env.BACKEND_URL}/api/auth/oauth/${provider}/callback`;

const buildGoogleAuthUrl = (state: string) => {
  if (!env.GOOGLE_CLIENT_ID) throw new Error("Google OAuth is not configured on server");
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: getCallbackUrl("google"),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

const buildLinkedInAuthUrl = (state: string) => {
  if (!env.LINKEDIN_CLIENT_ID) throw new Error("LinkedIn OAuth is not configured on server");
  const params = new URLSearchParams({
    client_id: env.LINKEDIN_CLIENT_ID,
    redirect_uri: getCallbackUrl("linkedin"),
    response_type: "code",
    scope: "openid profile email",
    state,
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
};

const exchangeGoogleCode = async (code: string): Promise<{ profile: OAuthProfile; accessToken: string; refreshToken?: string; expiresIn?: number }> => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth is not configured on server");
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: getCallbackUrl("google"),
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    throw new Error(`Google token exchange failed: ${body}`);
  }

  const tokenData = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!profileRes.ok) {
    const body = await profileRes.text();
    throw new Error(`Google user info failed: ${body}`);
  }

  const profileData = (await profileRes.json()) as {
    sub: string;
    email?: string;
    given_name?: string;
    family_name?: string;
    name?: string;
  };

  if (!profileData.sub || !profileData.email) {
    throw new Error("Google OAuth response is missing required profile fields");
  }

  const [firstFromName, ...rest] = (profileData.name || "").trim().split(" ").filter(Boolean);
  const fallbackLast = rest.join(" ") || undefined;

  return {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresIn: tokenData.expires_in,
    profile: {
      providerUserId: profileData.sub,
      email: profileData.email,
      firstName: profileData.given_name || firstFromName,
      lastName: profileData.family_name || fallbackLast,
    },
  };
};

const exchangeLinkedInCode = async (code: string): Promise<{ profile: OAuthProfile; accessToken: string; refreshToken?: string; expiresIn?: number }> => {
  if (!env.LINKEDIN_CLIENT_ID || !env.LINKEDIN_CLIENT_SECRET) {
    throw new Error("LinkedIn OAuth is not configured on server");
  }

  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.LINKEDIN_CLIENT_ID,
      client_secret: env.LINKEDIN_CLIENT_SECRET,
      redirect_uri: getCallbackUrl("linkedin"),
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    throw new Error(`LinkedIn token exchange failed: ${body}`);
  }

  const tokenData = (await tokenRes.json()) as {
    access_token: string;
    expires_in?: number;
    refresh_token?: string;
  };

  const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!profileRes.ok) {
    const body = await profileRes.text();
    throw new Error(`LinkedIn user info failed: ${body}`);
  }

  const profileData = (await profileRes.json()) as {
    sub: string;
    email?: string;
    given_name?: string;
    family_name?: string;
    name?: string;
  };

  if (!profileData.sub || !profileData.email) {
    throw new Error("LinkedIn OAuth response is missing required profile fields");
  }

  const [firstFromName, ...rest] = (profileData.name || "").trim().split(" ").filter(Boolean);
  const fallbackLast = rest.join(" ") || undefined;

  return {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresIn: tokenData.expires_in,
    profile: {
      providerUserId: profileData.sub,
      email: profileData.email,
      firstName: profileData.given_name || firstFromName,
      lastName: profileData.family_name || fallbackLast,
    },
  };
};
//OAuth ends here

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

    return issueTokensForUser(user.id, user.role);
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

    return issueTokensForUser(user.id, user.role);
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

  async rejectEmployer(userId: string, reason?: string) {
    await authRepository.rejectEmployer(userId, reason);
    return { message: "Employer rejected" };
  },

  async getEmployersByStatus(status: "pending" | "approved" | "rejected") {
    return authRepository.getEmployersByStatus(status);
  },

  async getPendingEmployers() {
    return authRepository.getPendingEmployers();
  },


  //Oauth methods here
  getOAuthAuthorizationUrl(provider: OAuthProvider, role: string) {
    const validatedRole = validateOAuthRole(role);
    const state = createOAuthState(provider, validatedRole);

    if (provider === "google") {
      return buildGoogleAuthUrl(state);
    }

    return buildLinkedInAuthUrl(state);
  },

  async handleOAuthCallback(provider: OAuthProvider, code: string, state: string) {
    if (!code || !state) {
      throw new Error("Missing OAuth code or state");
    }

    const parsedState = parseOAuthState(state);
    if (parsedState.provider !== provider) {
      throw new Error("OAuth provider mismatch in callback");
    }

    const providerData =
      provider === "google"
        ? await exchangeGoogleCode(code)
        : await exchangeLinkedInCode(code);

    const providerEnum = provider === "google" ? "GOOGLE" : "LINKEDIN";

    const existingAuth = await authRepository.findAuthAccount(
      providerEnum,
      providerData.profile.providerUserId
    );

    let user = existingAuth?.user ?? null;

    if (!user) {
      const existingByEmail = await authRepository.findUserByEmail(providerData.profile.email);
      if (existingByEmail) {
        user = existingByEmail;
      } else {
        const createdUser = await authRepository.createUser({
          firstName: providerData.profile.firstName,
          lastName: providerData.profile.lastName,
          email: providerData.profile.email,
          password: null,
          role: parsedState.role,
          isVerified: true,
        });

        user = await authRepository.findUserById(createdUser.id);
      }

      if (!user) {
        throw new Error("Failed to create OAuth user");
      }

      await authRepository.createAuthAccount({
        userId: user.id,
        provider: providerEnum,
        providerUserId: providerData.profile.providerUserId,
        accessToken: providerData.accessToken,
        refreshToken: providerData.refreshToken,
        expiresAt: providerData.expiresIn
          ? new Date(Date.now() + providerData.expiresIn * 1000)
          : undefined,
      });
    } else {
      await authRepository.updateAuthAccountTokens(providerEnum, providerData.profile.providerUserId, {
        accessToken: providerData.accessToken,
        refreshToken: providerData.refreshToken,
        expiresAt: providerData.expiresIn
          ? new Date(Date.now() + providerData.expiresIn * 1000)
          : undefined,
      });
    }

    if (!user) {
      throw new Error("OAuth user not found");
    }

    const tokens = await issueTokensForUser(user.id, user.role);
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  },
};