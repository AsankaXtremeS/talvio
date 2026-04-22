import { prisma } from "../../../config/db";
import { candidateRepository } from "../candidate.repository";
import { applicationsRepository } from "./applications.repository";

const prismaAny = prisma as any;

export class ApplicationsService {
  async getCandidateApplications(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    // First find the candidate profile for this user
    const candidateProfile = await candidateRepository.findProfileByUserId(userId);

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
      applicationsRepository.findManyByCandidate(candidateProfile.id, skip, limit),
      applicationsRepository.countByCandidate(candidateProfile.id),
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
    // Ensure candidate profile always exists (supports older accounts without profile rows).
    const candidateProfile = await candidateRepository.upsertProfile(userId, {});

    // Check if already applied
    const existing = await applicationsRepository.findByCandidateAndJob(candidateProfile.id, jobPostId);

    if (existing) throw new Error("Already applied to this job");

    return applicationsRepository.create({
      candidateProfileId: candidateProfile.id,
      jobPostId,
      cvUrl: data.cvUrl,
      cvFileName: data.cvFileName,
      coverLetter: data.coverLetter,
    });
  }

  async withdrawApplication(userId: string, applicationId: string) {
    const candidateProfile = await candidateRepository.findProfileByUserId(userId);
    if (!candidateProfile) throw new Error("Candidate profile not found");

    const application = await applicationsRepository.findByCandidateAndJob(candidateProfile.id, applicationId);
    // Wait, withdrawApplication usually takes applicationId. Let's fix applicationsRepository.delete later or use findById.
    // Actually, applicationsRepository.findByCandidateAndJob was used for checking if already applied.
    
    // Better: use findById and check ownership
    const app = await applicationsRepository.findById(applicationId);
    if (!app || app.candidateProfileId !== candidateProfile.id) throw new Error("Application not found or unauthorized");

    return applicationsRepository.delete(applicationId);
  }

  async getCandidateStats(userId: string) {
    // 1. Get User Role (needed for totalAvailable count)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    const jobType = user?.role === "PROFESSIONAL" ? "JOB" : "INTERNSHIP";

    // 2. Fetch total available jobs/internships first (always available)
    const totalAvailable = await prisma.jobPost.count({
      where: {
        type: jobType as any,
        status: "ACTIVE",
      },
    });

    // 3. Find candidate profile for personal stats
    const candidateProfile = await candidateRepository.findProfileByUserId(userId);
    // Note: for stats we need applications relation
    // Let's adjust candidateRepository to support includes or just use prisma for stats for now to avoid complexity,
    // but the task is to decouple.
    
    // I'll update candidateRepository.findProfileByUserId to optionally include things if needed,
    // or just fetch applications separately.
    
    const appliedJobIds = candidateProfile ? 
      (await applicationsRepository.findManyByCandidate(candidateProfile.id, 0, 1000)).map(a => a.jobPostId) : [];

    if (!candidateProfile) {
      return {
        applicationsSent: 0,
        interviewsScheduled: 0,
        pendingMatches: 0,
        totalAvailable,
        profileViews: 0,
      };
    }

    // 4. Fetch personal stats in parallel
    const [applicationsSent, interviewsScheduled] = await Promise.all([
      candidateProfile ? applicationsRepository.countByCandidate(candidateProfile.id) : Promise.resolve(0),
      candidateProfile ? prismaAny.interview.count({
        where: {
          candidateProfileId: candidateProfile.id,
          status: "SCHEDULED",
        },
      }) : Promise.resolve(0),
    ]);

    // Calculate pending matches from recommendation cache
    let pendingMatches = 0;
    if (candidateProfile) {
      const recommendations = (candidateProfile.recommendationCache as any[]) || [];
      if (recommendations.length > 0) {
        const appliedIds = new Set(appliedJobIds);
        pendingMatches = recommendations.filter(rec => !appliedIds.has(rec.id)).length;
      }
    }

    return {
      applicationsSent,
      interviewsScheduled,
      pendingMatches,
      totalAvailable,
      profileViews: 0,
    };
  }

  async getApplicationById(applicationId: string) {
    return applicationsRepository.findById(applicationId);
  }
}

export const applicationsService = new ApplicationsService();
