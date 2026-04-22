import { Role } from "@prisma/client";
import { Request, Response } from "express";
import { aiRepository } from "./ai.repository";
import { aiService } from "./ai.service";
import { candidateRepository } from "../candidate/candidate.repository";

/**
 * Safely extract route param as string
 */
const getParam = (value: string | string[] | undefined, name: string): string => {
  const val = Array.isArray(value) ? value[0] : value;
  if (!val) throw new Error(`Missing required param: ${name}`);
  return val;
};

// ─────────────────────────────────────────────────────────────────────────────
// RECOMMENDATIONS
// GET /api/ai/recommendations
// ─────────────────────────────────────────────────────────────────────────────

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const candidate = await candidateRepository.findProfileByUserId(userId);
    if (!candidate) return res.status(200).json({ recommendations: [] });

    const userRole = req.user?.role;
    const type = userRole === Role.PROFESSIONAL ? "JOB" : "INTERNSHIP";

    const jobs = await aiRepository.findActiveJobsByRole(type);
    
    // 0. Caching Logic (12 Hours)
    const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours in ms
    const now = new Date();
    
    if (
      candidate.recommendationCache &&
      candidate.lastRecommendedAt &&
      (now.getTime() - candidate.lastRecommendedAt.getTime()) < CACHE_DURATION &&
      candidate.lastRecommendedAt >= candidate.updatedAt
    ) {
      return res.status(200).json({
        recommendations: candidate.recommendationCache,
        fromCache: true
      });
    }

    // Combine manual and extracted skills
    const allCandidateSkills = [...new Set([...(candidate.skills || []), ...(candidate.extractedSkills || [])])];

    if (allCandidateSkills.length === 0) {
      return res.status(200).json({
        recommendations: []
      });
    }

    // 1. Initial filter by Keyword Similarity (Fast)
    let filteredJobs = await Promise.all(jobs.map(async (job) => {
      const jdKeywords = job.skillsRequired?.length ? job.skillsRequired : await aiService.extractJdKeywords(job.description || job.title);
      const score = aiService.calculateSimilarity(allCandidateSkills, jdKeywords);
      return { ...job, initialScore: score };
    }));

    // Take top 20 for AI ranking to ensure accuracy while keeping latency reasonable
    const topJobs = filteredJobs
      .sort((a, b) => b.initialScore - a.initialScore)
      .slice(0, 20);

    // 2. High-Accuracy AI Ranking
    const candidateSummary = {
      headline: candidate.headline,
      skills: allCandidateSkills,
      bio: candidate.bio?.slice(0, 500)
    };

    const aiRankings = await aiService.rankJobsWithAI(candidateSummary, topJobs);

    // 3. Map results back
    const recommendations = topJobs.map(job => {
      const ranking = aiRankings.find(r => r.id === job.id);
      return {
        id: job.id,
        title: job.title,
        company: job.employer.companyName,
        companyLogoUrl: job.employer.companyLogoUrl,
        location: job.location,
        type: job.type,
        matchPercent: ranking ? ranking.matchPercent : job.initialScore,
        createdAt: job.createdAt,
        tags: [job.workMode, job.employmentType].filter(Boolean)
      };
    });

    const finalRecommendations = recommendations
      .filter(j => j.matchPercent >= 70) // Higher threshold for AI matches
      .sort((a, b) => b.matchPercent - a.matchPercent);

    // Save to Cache
    await aiRepository.updateRecommendationCache(userId, finalRecommendations);

    return res.status(200).json({
      recommendations: finalRecommendations
    });
  } catch (err: any) {
    console.error("getRecommendations error:", err);
    return res.status(500).json({ message: err.message });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// GENERATE COVER LETTER ONLY
// POST /api/ai/generate-cover-letter/:jobPostId
// ─────────────────────────────────────────────────────────────────────────────

export const generateCoverLetter = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const jobPostId = getParam(req.params.jobPostId, "jobPostId");

    // 1. Get Job Post
    const jobPost = await aiRepository.findJobPostById(jobPostId);
    if (!jobPost) return res.status(404).json({ message: "Job post not found" });

    // 2. Get Candidate Profile
    const candidate = await candidateRepository.findProfileByUserId(userId);
    if (!candidate?.cvUrl) {
      return res.status(400).json({ message: "No CV on file. Please upload a CV first." });
    }

    // 3. Check Cache First
    const cachedAnalysis = await aiRepository.findAnalysisInCache(userId, jobPostId);
    if (cachedAnalysis) {
      return res.status(200).json({
        coverLetter: cachedAnalysis.coverLetter,
        fromCache: true
      });
    }

    // 4. Extract Text & Generate CL
    const cvText = await aiService.extractCvText(candidate.cvUrl);
    const jobDescription = `${jobPost.title}\n${jobPost.description}\nSkills: ${jobPost.skillsRequired.join(", ")}`;
    
    // We can use the same analyzeCv service but just take the cover letter
    const analysis = await aiService.analyzeCv(cvText, jobDescription);

    // 5. Save to Cache
    await aiRepository.updateAnalysisCache(userId, jobPostId, analysis);

    return res.status(200).json({
      coverLetter: analysis.coverLetter
    });
  } catch (err: any) {
    console.error("generateCoverLetter error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// EMPLOYER: APPLICANTS
// ─────────────────────────────────────────────────────────────────────────────

export const getRankedApplicants = async (req: Request, res: Response) => {
  try {
    const jobPostId = getParam(req.params.jobPostId, "jobPostId");
    const applicants = await aiRepository.findRankedApplicants(jobPostId);

    return res.status(200).json({
      total: applicants.length,
      applicants: applicants.map(a => ({
        id: a.id,
        aiScore: a.aiScore,
        status: a.applicationStatus,
        candidateName: `${a.candidateProfile.user.firstName} ${a.candidateProfile.user.lastName}`,
        email: a.candidateProfile.user.email,
        headline: a.candidateProfile.headline,
        cvUrl: a.cvUrl
      }))
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

