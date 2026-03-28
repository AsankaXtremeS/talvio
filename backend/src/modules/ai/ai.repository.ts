// All database operations for AI module.
// This layer is the ONLY place where Prisma is used.
// Controllers and services must never directly query the database.

import { prisma } from "../../config/db";
import { ApplicationStatus } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// REPOSITORY
// ─────────────────────────────────────────────────────────────────────────────

export const aiRepository = {

  // ── Candidate Profile ──────────────────────────────────────────────────────

  /**
   * Find candidate profile by user ID
   */
  async findCandidateProfileByUserId(userId: string) {
    return prisma.candidateProfile.findUnique({
      where: { userId },
    });
  },

  /**
   * Create or update candidate profile (CV data)
   * Ensures a user always has one profile
   */
  async upsertCandidateProfile(
    userId: string,
    data: {
      cvPath: string;
      cvFileName: string;
      cvText: string;
    }
  ) {
    return prisma.candidateProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });
  },

  // ── Job Post ───────────────────────────────────────────────────────────────

  /**
   * Get job post with employer details
   */
  async findJobPostById(id: string) {
    return prisma.jobPost.findUnique({
      where: { id },
      include: {
        employer: {
          select: {
            companyName: true,
            companyLogoUrl: true,
            companyDescription: true,
            companyWebsite: true,
            companyLocation: true,
          },
        },
      },
    });
  },

  // ── Application ────────────────────────────────────────────────────────────

  /**
   * Find application by ID with related AI data
   */
  async findApplicationById(id: string) {
    return prisma.application.findUnique({
      where: { id },
      include: {
        jobPost: true,
        cvSuggestion: true,
        generatedCoverLetter: true,
      },
    });
  },

  /**
   * Prevent duplicate applications
   * Requires composite unique constraint in Prisma schema:
   * @@unique([candidateProfileId, jobPostId])
   */
  async findApplicationByCandidateAndJob(
    candidateProfileId: string,
    jobPostId: string
  ) {
    return prisma.application.findUnique({
      where: {
        candidateProfileId_jobPostId: {
          candidateProfileId,
          jobPostId,
        },
      },
    });
  },

  /**
   * Create new job application
   */
  async createApplication(data: {
    candidateProfileId: string;
    jobPostId: string;
    cvPath: string;
    cvFileName: string;
    cvText: string;
    coverLetter?: string;
  }) {
    return prisma.application.create({
      data,
    });
  },

  /**
   * Save AI scoring results
   */
  async saveScore(
    applicationId: string,
    score: {
      aiScore: number;
      skillsMatchScore: number;
      experienceMatchScore: number;
      educationMatchScore: number;
      keywordsMatchScore: number;
      matchedSkills: string[];
      missingSkills: string[];
      aiSummary: string;
    }
  ) {
    return prisma.application.update({
      where: { id: applicationId },
      data: {
        ...score,
        scoredAt: new Date(),
      },
    });
  },

  // ── CV Suggestions ─────────────────────────────────────────────────────────

  /**
   * Create or update CV suggestions
   * Avoids duplicate records per application
   */
  async upsertCvSuggestion(
    applicationId: string,
    data: {
      overallScore: number;
      summaryScore: number;
      summaryFeedback: string[];
      skillsScore: number;
      skillsFeedback: string[];
      experienceScore: number;
      experienceFeedback: string[];
      educationScore: number;
      educationFeedback: string[];
      missingKeywords: string[];
      strengthsToHighlight: string[];
    }
  ) {
    return prisma.cvSuggestion.upsert({
      where: { applicationId },
      create: {
        applicationId,
        ...data,
      },
      update: data,
    });
  },

  // ── Cover Letter ───────────────────────────────────────────────────────────

  /**
   * Store or update generated cover letter
   */
  async upsertGeneratedCoverLetter(
    applicationId: string,
    content: string
  ) {
    return prisma.generatedCoverLetter.upsert({
      where: { applicationId },
      create: {
        applicationId,
        content,
      },
      update: {
        content,
        updatedAt: new Date(),
      },
    });
  },

  // ── Company: Ranked Applicants ─────────────────────────────────────────────

  /**
   * Get applicants sorted by AI score (descending)
   */
  async findRankedApplicants(jobPostId: string) {
    return prisma.application.findMany({
      where: { jobPostId },
      orderBy: { aiScore: "desc" },
      include: {
        candidateProfile: {
          select: {
            headline: true,
            skills: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * Update application status (HR actions)
   */
  async updateApplicationStatus(
    id: string,
    applicationStatus: ApplicationStatus
  ) {
    return prisma.application.update({
      where: { id },
      data: { applicationStatus },
    });
  },
};