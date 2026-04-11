import { ApplicationStatus, Role } from "@prisma/client";
import { Request, Response } from "express";
import { aiRepository } from "./ai.repository";
import { aiService } from "./ai.service";

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

    const candidate = await aiRepository.findCandidateProfileByUserId(userId);
    if (!candidate) return res.status(200).json({ jobs: [] });

    const userRole = req.user?.role;
    const type = userRole === Role.PROFESSIONAL ? "JOB" : "INTERNSHIP";

    const jobs = await aiRepository.findActiveJobsByRole(type);
    
    // If candidate has no skills extracted yet, just return jobs with 0 match
    if (!candidate.extractedSkills?.length) {
      return res.status(200).json({
        jobs: jobs.map(j => ({ ...j, matchScore: 0 }))
      });
    }

    // Fast matching logic
    const rankedJobs = await Promise.all(jobs.map(async (job) => {
      // Build a simple description for keyword extraction if not already cached
      // In a real system, we'd cache the JD keywords in the JobPost table
      const jdKeywords = job.skillsRequired?.length ? job.skillsRequired : await aiService.extractJdKeywords(job.description || job.title);
      
      const score = aiService.calculateSimilarity(candidate.extractedSkills, jdKeywords);
      
      return {
        id: job.id,
        title: job.title,
        company: job.employer.companyName,
        companyLogoUrl: job.employer.companyLogoUrl,
        location: job.location,
        type: job.type,
        matchScore: score,
        tags: [job.workMode, job.employmentType].filter(Boolean)
      };
    }));

    return res.status(200).json({
      jobs: rankedJobs.sort((a, b) => b.matchScore - a.matchScore)
    });
  } catch (err: any) {
    console.error("getRecommendations error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// APPLY FOR JOB
// POST /api/ai/apply/:jobPostId
// ─────────────────────────────────────────────────────────────────────────────

export const applyForJob = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const jobPostId = getParam(req.params.jobPostId, "jobPostId");
    const file = req.file;

    // 1. Get Job Post
    const jobPost = await aiRepository.findJobPostById(jobPostId);
    if (!jobPost) return res.status(404).json({ message: "Job post not found" });

    // 2. Handle CV Upload & Text Extraction
    let cvText = "";
    let candidate = await aiRepository.findCandidateProfileByUserId(userId);

    if (file) {
      cvText = await aiService.extractCvText(file.path);
      // Extract skills for the profile if it's a new upload
      const extractedSkills = await aiService.extractSkills(cvText);
      candidate = await aiRepository.upsertCandidateProfile(userId, {
        cvPath: file.path,
        cvFileName: file.originalname,
        cvText,
        extractedSkills
      });
    } else {
      if (!candidate?.cvText) return res.status(400).json({ message: "No CV on file. Please upload one." });
      cvText = candidate.cvText;
    }

    // 3. Create/Find Application
    let application = await aiRepository.findApplicationByCandidateAndJob(candidate.id, jobPostId);
    if (application) return res.status(400).json({ message: "Already applied", applicationId: application.id });

    application = await aiRepository.createApplication({
      candidateProfileId: candidate.id,
      jobPostId,
      cvPath: candidate.cvPath!,
      cvFileName: candidate.cvFileName!,
      cvText: candidate.cvText!
    });

    // 4. Run Comprehensive AI Analysis
    const jobDescription = `${jobPost.title}\n${jobPost.description}\nSkills: ${jobPost.skillsRequired.join(", ")}`;
    const analysis = await aiService.analyzeCv(cvText, jobDescription);

    // 5. Save Results
    await aiRepository.saveAnalysisResult(application.id, {
      aiScore: analysis.overallScore,
      aiSuggestions: analysis.suggestions,
      coverLetter: analysis.coverLetter
    });

    return res.status(201).json({
      message: "Application submitted and analyzed",
      applicationId: application.id,
      analysis
    });
  } catch (err: any) {
    console.error("applyForJob error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET APPLICATION (For Result View)
// GET /api/ai/applications/:applicationId
// ─────────────────────────────────────────────────────────────────────────────

export const getApplicationResult = async (req: Request, res: Response) => {
  try {
    const applicationId = getParam(req.params.applicationId, "applicationId");
    const application = await aiRepository.findApplicationById(applicationId);
    
    if (!application) return res.status(404).json({ message: "Application not found" });

    return res.status(200).json(application);
  } catch (err: any) {
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
        headline: a.candidateProfile.headline
      }))
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const applicationId = getParam(req.params.applicationId, "applicationId");
    const { status } = req.body as { status: ApplicationStatus };

    const updated = await aiRepository.updateApplicationStatus(applicationId, status);
    return res.status(200).json(updated);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};
