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

    // 1. Initial filter by Keyword Similarity (Fast)
    let filteredJobs = await Promise.all(jobs.map(async (job) => {
      const jdKeywords = job.skillsRequired?.length ? job.skillsRequired : await aiService.extractJdKeywords(job.description || job.title);
      const score = aiService.calculateSimilarity(candidate.extractedSkills, jdKeywords);
      return { ...job, initialScore: score };
    }));

    // Take top 20 for AI ranking to ensure accuracy while keeping latency reasonable
    const topJobs = filteredJobs
      .sort((a, b) => b.initialScore - a.initialScore)
      .slice(0, 20);

    // 2. High-Accuracy AI Ranking
    const candidateSummary = {
      headline: candidate.headline,
      skills: [...new Set([...candidate.skills, ...candidate.extractedSkills])],
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

    return res.status(200).json({
      recommendations: recommendations
        .filter(j => j.matchPercent >= 70) // Higher threshold for AI matches
        .sort((a, b) => b.matchPercent - a.matchPercent)
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
    const { cvUrl, cvFileName } = req.body as { cvUrl?: string; cvFileName?: string };

    // 1. Get Job Post
    const jobPost = await aiRepository.findJobPostById(jobPostId);
    if (!jobPost) return res.status(404).json({ message: "Job post not found" });

    // 2. Handle CV: Priority to Application-Specific, then Profile-Default
    let cvText = "";
    let finalCvUrl = "";
    let finalCvFileName = "";
    let candidate = await aiRepository.findCandidateProfileByUserId(userId);

    if (cvUrl) {
      // SCENARIO: User uploaded a new CV for this specific application (UploadThing)
      cvText = await aiService.extractCvText(cvUrl);
      finalCvUrl = cvUrl;
      finalCvFileName = cvFileName || "Application_CV.pdf";

      // If candidate profile exists, we don't necessarily want to overwrite their DEFAULT CV
      // unless you want the profile to always reflect the LATEST CV.
      // The user specified: "company can be see that uploaded one not the profile default CV we stored"
      // So we keep the profile CV as is.
      if (!candidate) {
        // If they have NO profile yet, create one using this CV
        const extractedSkills = await aiService.extractSkills(cvText);
        candidate = await aiRepository.upsertCandidateProfile(userId, {
          cvUrl: finalCvUrl,
          cvFileName: finalCvFileName,
          extractedSkills
        });
      }
    } else {
      // SCENARIO: Use existing profile CV
      if (!candidate?.cvUrl) {
        return res.status(400).json({ message: "No CV on file. Please upload a CV to apply." });
      }
      finalCvUrl = candidate.cvUrl;
      finalCvFileName = candidate.cvFileName || "Profile_CV.pdf";
      // Re-extract text from URL since we no longer store it in DB
      cvText = await aiService.extractCvText(finalCvUrl);
    }

    // 3. Create/Find Application (Store the specific CV URL used for this application)
    let application = await aiRepository.findApplicationByCandidateAndJob(candidate.id, jobPostId);
    if (application) return res.status(400).json({ message: "Already applied", applicationId: application.id });

    application = await aiRepository.createApplication({
      candidateProfileId: candidate.id,
      jobPostId,
      cvUrl: finalCvUrl,
      cvFileName: finalCvFileName,
    });

    // 4. Run AI Analysis
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
      analysis,
      cvUrl: finalCvUrl
    });
  } catch (err: any) {
    console.error("applyForJob error:", err);
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
    const candidate = await aiRepository.findCandidateProfileByUserId(userId);
    if (!candidate?.cvUrl) {
      return res.status(400).json({ message: "No CV on file. Please upload a CV first." });
    }

    // 3. Extract Text & Generate CL
    const cvText = await aiService.extractCvText(candidate.cvUrl);
    const jobDescription = `${jobPost.title}\n${jobPost.description}\nSkills: ${jobPost.skillsRequired.join(", ")}`;
    
    // We can use the same analyzeCv service but just take the cover letter
    const analysis = await aiService.analyzeCv(cvText, jobDescription);

    return res.status(200).json({
      coverLetter: analysis.coverLetter
    });
  } catch (err: any) {
    console.error("generateCoverLetter error:", err);
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
        headline: a.candidateProfile.headline,
        cvUrl: a.cvUrl
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
