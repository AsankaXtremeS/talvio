import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ApplicationsService {
  async getCandidateApplications(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    // First find the candidate profile for this user
    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidateProfile) {
      return {
        applications: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: {
          candidateProfileId: candidateProfile.id,
        },
        include: {
          jobPost: {
            include: {
              employer: true,
            },
          },
        },
        orderBy: {
          appliedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.application.count({
        where: {
          candidateProfileId: candidateProfile.id,
        },
      }),
    ]);

    return {
      applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async applyToJob(userId: string, jobPostId: string, data: { cvUrl: string; cvFileName: string; coverLetter?: string }) {
    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidateProfile) throw new Error("Candidate profile not found");

    // Check if already applied
    const existing = await prisma.application.findUnique({
      where: {
        candidateProfileId_jobPostId: {
          candidateProfileId: candidateProfile.id,
          jobPostId,
        },
      },
    });

    if (existing) throw new Error("Already applied to this job");

    return prisma.application.create({
      data: {
        candidateProfileId: candidateProfile.id,
        jobPostId,
        cvUrl: data.cvUrl,
        cvFileName: data.cvFileName,
        coverLetter: data.coverLetter,
      },
    });
  }

  async withdrawApplication(userId: string, applicationId: string) {
    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidateProfile) throw new Error("Candidate profile not found");

    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        candidateProfileId: candidateProfile.id,
      },
    });

    if (!application) throw new Error("Application not found or unauthorized");

    return prisma.application.delete({
      where: { id: applicationId },
    });
  }

  async getCandidateApplicationWithHistory(userId: string, applicationId: string) {
    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidateProfile) throw new Error("Candidate profile not found");

    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        candidateProfileId: candidateProfile.id,
      },
      include: {
        jobPost: {
          include: {
            employer: true,
          },
        },
        statusHistory: {
          orderBy: { changedAt: "asc" },
        },
      },
    });

    if (!application) throw new Error("Application not found or unauthorized");

    return application;
  }

  async getCandidateStats(userId: string) {
    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        applications: {
          select: { jobPostId: true }
        }
      }
    });

    if (!candidateProfile) {
      return {
        applicationsSent: 0,
        interviewsScheduled: 0,
        pendingMatches: 0,
        totalAvailable: 0,
        profileViews: 12, // Mocked for now
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    const jobType = user?.role === "PROFESSIONAL" ? "JOB" : "INTERNSHIP";

    const [applicationsSent, interviewsScheduled, totalAvailable] = await Promise.all([
      prisma.application.count({
        where: { candidateProfileId: candidateProfile.id },
      }),
      prisma.application.count({
        where: {
          candidateProfileId: candidateProfile.id,
          applicationStatus: "SHORTLISTED",
        },
      }),
      prisma.jobPost.count({
        where: {
          type: jobType,
          status: "ACTIVE",
        },
      }),
    ]);

    // Calculate pending matches from recommendation cache
    let pendingMatches = 0;
    const recommendations = (candidateProfile.recommendationCache as any[]) || [];
    if (recommendations.length > 0) {
      const appliedJobIds = new Set(candidateProfile.applications.map(a => a.jobPostId));
      pendingMatches = recommendations.filter(rec => !appliedJobIds.has(rec.id)).length;
    }

    return {
      applicationsSent,
      interviewsScheduled,
      pendingMatches,
      totalAvailable,
      profileViews: 12, // Realistic mock for "workable" UI
    };
  }
}

export const applicationsService = new ApplicationsService();
