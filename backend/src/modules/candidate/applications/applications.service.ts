import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const prismaAny = prisma as any;

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

  async applyToJob(userId: string, jobPostId: string, data: { cvUrl?: string; cvFileName?: string; coverLetter?: string; useDefaultCv?: boolean }) {
    // 1. Ensure candidate profile exists
    const candidateProfile = await prisma.candidateProfile.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    // 2. Fetch Job Details for AI analysis
    const jobPost = await prisma.jobPost.findUnique({
      where: { id: jobPostId },
    });
    if (!jobPost) throw new Error("Job post not found");

    // 3. Handle CV Selection (Uploaded vs Default)
    let finalCvUrl = data.cvUrl;
    let finalCvFileName = data.cvFileName;

    if (data.useDefaultCv) {
      if (!candidateProfile.cvUrl) throw new Error("No default CV found in your profile. Please upload one first.");
      finalCvUrl = candidateProfile.cvUrl;
      finalCvFileName = candidateProfile.cvFileName || "Resume.pdf";
    }

    if (!finalCvUrl) throw new Error("Resume is required is apply for a job.");

    // 4. Check if already applied
    const existing = await prisma.application.findUnique({
      where: {
        candidateProfileId_jobPostId: {
          candidateProfileId: candidateProfile.id,
          jobPostId,
        },
      },
    });

    if (existing) throw new Error("Already applied to this job");

    // 5. Trigger AI Analysis (Score + Suggestions + Cover Letter if not provided)
    let aiScore = undefined;
    let aiSuggestions: string[] = [];
    let finalCoverLetter = data.coverLetter;

    try {
      const cvText = await aiService.extractCvText(finalCvUrl);
      const fullJd = `${jobPost.title}\n${jobPost.description}\n${jobPost.requirements.join("\n")}`;
      
      const analysis = await aiService.analyzeCv(cvText, fullJd);
      aiScore = analysis.overallScore;
      aiSuggestions = analysis.suggestions;
      
      // If user didn't provide a cover letter, we can use the AI generated one
      if (!finalCoverLetter) {
        finalCoverLetter = analysis.coverLetter;
      }
    } catch (error) {
      console.error("AI Analysis failed during application:", error);
      // We still allow application to proceed even if AI fails (robustness)
    }

    // 6. Create Application Record
    return prisma.application.create({
      data: {
        candidateProfileId: candidateProfile.id,
        jobPostId,
        cvUrl: finalCvUrl,
        cvFileName: finalCvFileName,
        coverLetter: finalCoverLetter,
        aiScore,
        aiSuggestions,
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
      prismaAny.interview.count({
        where: {
          candidateProfileId: candidateProfile.id,
          status: "SCHEDULED",
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
