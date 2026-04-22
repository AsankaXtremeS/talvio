// Route definitions for employer interview scheduling.
//
// All routes are protected by:
//   1. authenticate  — valid JWT required
//   2. requireRole("EMPLOYER") — only employers can access
//
// Base path (registered in routes.ts): /api/employer/interviews
//
// Route order matters:
//   - Static segments (/stats, /generate-email, /scheduled-dates) must be
//     registered BEFORE dynamic /:id segments to avoid param matching.

import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware";
import { requireRole } from "../../../middlewares/role.middleware";
import {
  listInterviews,
  getScheduledDates,
  getInterview,
  getCandidateProfile,
  createInterview,
  updateInterview,
  generateEmailPreview,
  scheduleAndSend,
  saveEmailBody,
  cancelInterview,
  generateCancelEmailPreview,
  cancelAndSendEmail,
} from "./interview.controller";

const router = Router();

// ─── Apply auth guard to ALL routes in this file ──────────────────────────────
// Only EMPLOYER role can access interview scheduling endpoints.
router.use(authenticate, requireRole("EMPLOYER"));

// ─── Static paths — must come BEFORE /:id ────────────────────────────────────

// GET  /api/employer/interviews/scheduled-dates?year=2026&month=4
// Returns array of "YYYY-MM-DD" strings for calendar dot indicators.
router.get("/scheduled-dates", getScheduledDates);

// POST /api/employer/interviews/generate-email
// Generate an email preview based on form data (no DB write).
router.post("/generate-email", generateEmailPreview);

// GET /api/employer/interviews/candidates/:candidateProfileId
// Returns minimal candidate profile details for schedule UI.
router.get("/candidates/:candidateProfileId", getCandidateProfile);

// ─── Collection routes ────────────────────────────────────────────────────────

// GET  /api/employer/interviews          — List all interviews (paginated)
// POST /api/employer/interviews          — Create a draft interview
router.get("/", listInterviews);
router.post("/", createInterview);

// ─── Single resource routes ───────────────────────────────────────────────────

// GET    /api/employer/interviews/:id              — Get single interview
// PATCH  /api/employer/interviews/:id              — Update draft fields
// DELETE /api/employer/interviews/:id              — Cancel + delete interview
router.get("/:id", getInterview);
router.patch("/:id", updateInterview);
router.delete("/:id", cancelInterview);

// POST  /api/employer/interviews/:id/schedule      — Confirm + send email
router.post("/:id/schedule", scheduleAndSend);

// PATCH /api/employer/interviews/:id/email-body    — Save custom email body
router.patch("/:id/email-body", saveEmailBody);

// POST  /api/employer/interviews/:id/generate-cancel-email  — Generate cancellation email preview
router.post("/:id/generate-cancel-email", generateCancelEmailPreview);

// POST  /api/employer/interviews/:id/cancel-and-send        — Cancel interview + send email
router.post("/:id/cancel-and-send", cancelAndSendEmail);

export default router;