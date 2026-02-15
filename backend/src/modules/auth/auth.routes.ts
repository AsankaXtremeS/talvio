// Express routes for authentication and user management APIs.

import { Router } from "express";
import {
  registerUser,
  registerEmployer,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  approveEmployer,
} from "./auth.controller";
import { upload } from "../../middlewares/upload.middleware";
import rateLimit from "express-rate-limit";
// Rate limiter: 5 requests per minute per IP for sensitive routes
const sensitiveLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { message: "Too many requests, please try again later." },
});
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = Router();

router.post("/register", sensitiveLimiter, registerUser);
router.post(
  "/register-employer",
  upload.single("registrationFile"),
  registerEmployer
);

router.post("/login", sensitiveLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/forgot-password", sensitiveLimiter, forgotPassword);
router.post("/reset-password", sensitiveLimiter, resetPassword);
router.post("/approve-employer", authenticate, requireRole("ADMIN"), approveEmployer);

export default router;
