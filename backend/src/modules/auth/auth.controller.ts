import { Request, Response } from "express";
import { authService } from "./auth.service";
import {
  validateRegisterUser,
  validateRegisterEmployer,
  validateLogin,
} from "./auth.validation";



// REGISTER STUDENT / PROFESSIONAL
// Public endpoint for registering a new student or professional user.
// Expects: { firstName, lastName, email, password, confirmPassword, role }
// Only allows role: STUDENT or PROFESSIONAL
// Returns: { accessToken, refreshToken } on success

export const registerUser = async (req: Request, res: Response) => {
  try {
    validateRegisterUser(req.body);
    await authService.registerUser(req.body);
    res.status(201).json({ message: "Registration successful. Please log in." });
  } catch (err: any) {
    console.error("registerUser error:", err);
    res.status(400).json({ message: "Registration failed. Please try again." });
  }
};



// REGISTER EMPLOYER (WITH PDF UPLOAD)
// Public endpoint for registering a new employer user.
// Expects: { email, password, confirmPassword, companyName } and PDF file (registrationFile)
// Returns: { message, userId } on success. Requires admin approval before login.


export const registerEmployer = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      throw new Error("Business registration PDF is required");
    }
    validateRegisterEmployer(req.body);
    const result = await authService.registerEmployer({
      ...req.body,
      registrationFileUrl: file.path,
      registrationFileName: file.filename,
    });
    res.status(201).json(result);
  } catch (err: any) {
    console.error("registerEmployer error:", err);
    res.status(400).json({ message: "Employer registration failed. Please try again." });
  }
};



// LOGIN
// Public endpoint for user login.
// Expects: { email, password }
// Returns: { accessToken, refreshToken } on success


export const login = async (req: Request, res: Response) => {
  try {
    validateLogin(req.body);
    const { accessToken, refreshToken } = await authService.login(req.body);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (err: any) {
    console.error("login error:", err);
    res.status(401).json({ message: "Login failed. Please check your credentials." });
  }
};



// REFRESH TOKEN
// Public endpoint to refresh access and refresh tokens.
// Expects: { refreshToken }
// Returns: { accessToken, refreshToken } on success


export const refresh = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }
    const { accessToken, refreshToken } = await authService.refresh(token);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (err: any) {
    console.error("refresh error:", err);
    res.status(401).json({ message: "Token refresh failed." });
  }
};



// LOGOUT
// Public endpoint to revoke a refresh token (logout).
// Expects: { refreshToken }
// Returns: { message } on success


export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) await authService.logout(token);
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (err: any) {
    console.error("logout error:", err);
    res.status(400).json({ message: "Logout failed." });
  }
};



// FORGOT PASSWORD
// Public endpoint to request a password reset link.
// Expects: { email }
// Returns: { message } (always generic for security)


export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new Error("Email required");
    }
    const result = await authService.forgotPassword(email);
    res.json(result);
  } catch (err: any) {
    console.error("forgotPassword error:", err);
    res.status(400).json({ message: "Password reset request failed." });
  }
};



// RESET PASSWORD
// Public endpoint to reset password using a reset token.
// Expects: { token, newPassword }
// Returns: { message } on success


export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      throw new Error("Token and new password required");
    }
    const result = await authService.resetPassword(token, newPassword);
    res.json(result);
  } catch (err: any) {
    console.error("resetPassword error:", err);
    res.status(400).json({ message: "Password reset failed." });
  }
};



// ADMIN APPROVE EMPLOYER
// Admin-only endpoint to approve an employer account.
// Expects: { userId }
// Returns: { message } on success


export const approveEmployer = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      throw new Error("User ID required");
    }
    const result = await authService.approveEmployer(userId);
    res.json(result);
  } catch (err: any) {
    console.error("approveEmployer error:", err);
    res.status(400).json({ message: "Employer approval failed." });
  }
};


// ADMIN REJECT EMPLOYER
// Admin-only endpoint to reject an employer account.
// Expects: { userId }
// Returns: { message } on success


export const rejectEmployer = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) throw new Error("User ID required");
    const result = await authService.rejectEmployer(userId);
    res.json(result);
  } catch (err: any) {
    console.error("rejectEmployer error:", err);
    res.status(400).json({ message: "Employer rejection failed." });
  }
};


// ADMIN GET PENDING EMPLOYERS
// Admin-only endpoint to list all pending employer registrations.
// Returns: array of users with employerProfile


export const getPendingEmployers = async (req: Request, res: Response) => {
  try {
    const employers = await authService.getPendingEmployers();
    res.json(employers);
  } catch (err: any) {
    console.error("getPendingEmployers error:", err);
    res.status(500).json({ message: "Failed to fetch pending employers." });
  }
};