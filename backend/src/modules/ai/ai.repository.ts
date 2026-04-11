// All database operations for AI module.
// This layer is the ONLY place where Prisma is used.

import { prisma } from "../../config/db";
import { ApplicationStatus } from "@prisma/client";

export const aiRepository = {

  // ── Candidate Profile ──────────────────────────────────────────────────────

  async findCandidateProfileByUserId(userId: string) {
    return prisma.candidateProfile.findUnique({
      where: { userId },
    });
  },

  /**
   * Create or update candidate profile (CV data + extracted skills)
   */
  async upsertCandidateProfile(
    userId: string,
    data: {
      cvUrl: string;
      cvFileName: string;
      cvText: string;
      extractedSkills?: string[];
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

  /**
   * Find active jobs matching the user's career path
   */
  async findActiveJobsByRole(type: "JOB" | "INTERNSHIP") {
    return prisma.jobPost.findMany({
      where: {
        status: "ACTIVE",
        type: type,
      },
      include: {
        employer: {
          select: {
            companyName: true,
            companyLogoUrl: true,
          },
        },
      },
    });
  },

  // ── Application ────────────────────────────────────────────────────────────

  async findApplicationById(id: string) {
    return prisma.application.findUnique({
      where: { id },
      include: {
        jobPost: true,
      },
    });
  },

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

  async createApplication(data: {
    candidateProfileId: string;
    jobPostId: string;
    cvUrl: string;
    cvFileName: string;
    cvText: string;
  }) {
    return prisma.application.create({
      data,
    });
  },

  /**
   * Save consolidated AI analysis result
   */
  async saveAnalysisResult(
    applicationId: string,
    result: {
      aiScore: number;
      aiSuggestions: string[];
      coverLetter: string;
    }
  ) {
    return prisma.application.update({
      where: { id: applicationId },
      data: {
        ...result,
        updatedAt: new Date(),
      },
    });
  },

  // ── Company: Ranked Applicants ─────────────────────────────────────────────

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
ked Applicants ─────────────────────────────────────────────

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