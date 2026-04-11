// AI feature routes.
// All routes require authentication via the existing `authenticate` middleware.
// Role-specific restrictions use the existing `requireRole` middleware.

import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { upload } from "../../middlewares/upload.middleware";
import {
  applyForJob,
  getRecommendations,
  getApplicationResult,
  getRankedApplicants,
  updateApplicationStatus,
} from "./ai.controller";

const router = Router();

// ── Candidate routes ──────────────────────────────────────────────────────────

// Get job recommendations based on CV
// GET /api/ai/recommendations
router.get(
  "/recommendations",
  authenticate,
  requireRole(["STUDENT", "PROFESSIONAL"]),
  getRecommendations
);

// Apply for a job — upload CV, get scored
// POST /api/ai/apply/:jobPostId
router.post(
  "/apply/:jobPostId",
  authenticate,
  requireRole(["STUDENT", "PROFESSIONAL"]),
  upload.single("cv"),
  applyForJob
);

// Get application result (analysis + cover letter)
// GET /api/ai/applications/:applicationId
router.get(
  "/applications/:applicationId",
  authenticate,
  requireRole(["STUDENT", "PROFESSIONAL"]),
  getApplicationResult
);

// ── Employer routes ───────────────────────────────────────────────────────────

// Get all applicants for a job post, ranked by AI score
// GET /api/ai/jobs/:jobPostId/applicants
router.get(
  "/jobs/:jobPostId/applicants",
  authenticate,
  requireRole("EMPLOYER"),
  getRankedApplicants
);

// Move a candidate through the hiring pipeline
// PATCH /api/ai/applications/:applicationId/status
router.patch(
  "/applications/:applicationId/status",
  authenticate,
  requireRole("EMPLOYER"),
  updateApplicationStatus
);

export default router;