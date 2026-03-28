import { Request, Response } from "express";
import { aiService } from "./ai.service";
import { aiRepository } from "./ai.repository";
import { ApplicationStatus } from "@prisma/client";

/**
 * Safely extract route param as string
 */
const getParam = (value: string | string[] | undefined, name: string): string => {
  const val = Array.isArray(value) ? value[0] : value;

  if (!val) {
    throw new Error(`Missing required param: ${name}`);
  }

  return val;
};

// ─────────────────────────────────────────────────────────────────────────────
// APPLY FOR JOB
// POST /api/ai/apply/:jobPostId
// ─────────────────────────────────────────────────────────────────────────────

export const applyForJob = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const jobPostId = getParam(req.params.jobPostId, "jobPostId");
    const file = req.file;

    // If the candidate has already applied to this job, return success idempotently.
    let candidateProfile = await aiRepository.findCandidateProfileByUserId(userId);
    if (candidateProfile) {
      const existing = await aiRepository.findApplicationByCandidateAndJob(
        candidateProfile.id,
        jobPostId
      );

      if (existing) {
        return res.status(200).json({
          message: "You have already applied",
          alreadyApplied: true,
          applicationId: existing.id,
          applicationStatus: existing.applicationStatus,
          aiScore: existing.aiScore,
        });
      }
    }

    if (!file) {
      return res.status(400).json({ message: "CV file is required" });
    }

    // Extract CV text
    const cvText = await aiService.extractCvText(file.path);

    // Save profile
    candidateProfile = await aiRepository.upsertCandidateProfile(userId, {
      cvPath: file.path,
      cvFileName: file.originalname,
      cvText,
    });

    // Prevent duplicate application
    const existing = await aiRepository.findApplicationByCandidateAndJob(
      candidateProfile.id,
      jobPostId
    );

    if (existing) {
      return res.status(200).json({
        message: "You have already applied",
        alreadyApplied: true,
        applicationId: existing.id,
        applicationStatus: existing.applicationStatus,
        aiScore: existing.aiScore,
      });
    }

    // Get job post
    const jobPost = await aiRepository.findJobPostById(jobPostId);
    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }

    const jobDescription = buildJobDescription(jobPost);

    // Create application
    const application = await aiRepository.createApplication({
      candidateProfileId: candidateProfile.id,
      jobPostId,
      cvPath: file.path,
      cvFileName: file.originalname,
      cvText,
    });

    // Score CV
    const score = await aiService.scoreCv(cvText, jobDescription);

    // Save score
    await aiRepository.saveScore(application.id, {
      aiScore: score.overallScore,
      skillsMatchScore: score.skillsMatchScore,
      experienceMatchScore: score.experienceMatchScore,
      educationMatchScore: score.educationMatchScore,
      keywordsMatchScore: score.keywordsMatchScore,
      matchedSkills: score.matchedSkills,
      missingSkills: score.missingSkills,
      aiSummary: score.summary,
    });

    return res.status(201).json({
      message: "Application submitted successfully",
      applicationId: application.id,
      score,
    });

  } catch (err: any) {
    console.error("applyForJob error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET CV SUGGESTIONS
// GET /api/ai/applications/:applicationId/suggestions
// ─────────────────────────────────────────────────────────────────────────────

export const getCvSuggestions = async (req: Request, res: Response) => {
  try {
    const applicationId = getParam(req.params.applicationId, "applicationId");

    const application = await aiRepository.findApplicationById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (!application.cvText) {
      return res.status(400).json({ message: "CV text missing" });
    }

    const jobPost = await aiRepository.findJobPostById(application.jobPostId);
    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }

    const jobDescription = buildJobDescription(jobPost);

    const suggestions = await aiService.getCvSuggestions(
      application.cvText,
      jobDescription
    );

    const saved = await aiRepository.upsertCvSuggestion(applicationId, suggestions);

    return res.status(200).json(saved);

  } catch (err: any) {
    console.error("getCvSuggestions error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE COVER LETTER
// POST /api/ai/applications/:applicationId/cover-letter
// ─────────────────────────────────────────────────────────────────────────────

export const generateCoverLetter = async (req: Request, res: Response) => {
  try {
    const applicationId = getParam(req.params.applicationId, "applicationId");

    const application = await aiRepository.findApplicationById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (!application.cvText) {
      return res.status(400).json({ message: "CV text missing" });
    }

    const jobPost = await aiRepository.findJobPostById(application.jobPostId);
    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }

    const jobDescription = buildJobDescription(jobPost);

    const content = await aiService.generateCoverLetter(
      application.cvText,
      jobDescription
    );

    const saved = await aiRepository.upsertGeneratedCoverLetter(
      applicationId,
      content
    );

    return res.status(200).json({
      coverLetter: saved.content,
    });

  } catch (err: any) {
    console.error("generateCoverLetter error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET RANKED APPLICANTS (EMPLOYER)
// GET /api/ai/jobs/:jobPostId/applicants
// ─────────────────────────────────────────────────────────────────────────────

export const getRankedApplicants = async (req: Request, res: Response) => {
  try {
    const jobPostId = getParam(req.params.jobPostId, "jobPostId");

    const applicants = await aiRepository.findRankedApplicants(jobPostId);

    return res.status(200).json({
      total: applicants.length,
      applicants: applicants.map((a) => ({
        applicationId: a.id,
        aiScore: a.aiScore,
        applicationStatus: a.applicationStatus,
        appliedAt: a.appliedAt,
        matchedSkills: a.matchedSkills,
        missingSkills: a.missingSkills,
        summary: a.aiSummary,
        candidate: {
          name: `${a.candidateProfile.user.firstName ?? ""} ${a.candidateProfile.user.lastName ?? ""}`.trim(),
          email: a.candidateProfile.user.email,
          headline: a.candidateProfile.headline,
          skills: a.candidateProfile.skills,
        },
      })),
    });

  } catch (err: any) {
    console.error("getRankedApplicants error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE APPLICATION STATUS
// PATCH /api/ai/applications/:applicationId/status
// ─────────────────────────────────────────────────────────────────────────────

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const applicationId = getParam(req.params.applicationId, "applicationId");
    const { status } = req.body as { status: ApplicationStatus };

    const validStatuses = ["PENDING", "REVIEWED", "SHORTLISTED", "REJECTED", "HIRED"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const updated = await aiRepository.updateApplicationStatus(applicationId, status);

    return res.status(200).json({
      applicationId: updated.id,
      applicationStatus: updated.applicationStatus,
    });

  } catch (err: any) {
    console.error("updateApplicationStatus error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────────────────────────────────────

function buildJobDescription(jobPost: any): string {
  const parts: string[] = [];

  parts.push(`Job Title: ${jobPost.title}`);
  if (jobPost.description) parts.push(`Description: ${jobPost.description}`);
  if (jobPost.skillsRequired?.length)
    parts.push(`Skills: ${jobPost.skillsRequired.join(", ")}`);
  if (jobPost.employer?.companyName)
    parts.push(`Company: ${jobPost.employer.companyName}`);

  return parts.join("\n");
}