// All database operations for AI module.
// This layer is the ONLY place where Prisma is used.

import { prisma } from "../../config/db";
import { ApplicationStatus, Prisma } from "@prisma/client";

export const aiRepository = {

  // ── AI Specific Cache Operations ───────────────────────────────────────────

  async findCandidateProfileByUserId(userId: string) {
    return prisma.candidateProfile.findUnique({
      where: { userId },
    });
  },

  async updateRecommendationCache(userId: string, recommendations: any) {
    return prisma.candidateProfile.update({
      where: { userId },
      data: {
        recommendationCache: recommendations,
        lastRecommendedAt: new Date(),
      },
    });
  },

  async updateAnalysisCache(userId: string, jobId: string, analysis: any) {
    const profile = await this.findCandidateProfileByUserId(userId);
    const existingCache = (profile?.jobAnalysisCache as Record<string, any>) || {};
    
    return prisma.candidateProfile.update({
      where: { userId },
      data: {
        jobAnalysisCache: {
          ...existingCache,
          [jobId]: {
            ...analysis,
            cachedAt: new Date(),
          },
        },
      },
    });
  },

  async findAnalysisInCache(userId: string, jobId: string) {
    const profile = await this.findCandidateProfileByUserId(userId);
    const cache = (profile?.jobAnalysisCache as Record<string, any>) || {};
    return cache[jobId] || null;
  },

  // ── AI Result Persistence ──────────────────────────────────────────────────

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
      data: result,
    });
  },

  // ── Helper lookups for AI Context ──────────────────────────────────────────

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

  async findJobPostById(id: string) {
    return prisma.jobPost.findUnique({
      where: { id },
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
};
