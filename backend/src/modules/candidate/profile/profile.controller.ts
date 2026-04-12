import { Request, Response } from "express";
import { aiRepository } from "../../ai/ai.repository";
import { aiService } from "../../ai/ai.service";

/**
 * Get the current candidate's profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const profile = await aiRepository.findCandidateProfileByUserId(userId);
    if (!profile) {
      return res.status(200).json({ profile: null });
    }

    return res.status(200).json({ profile });
  } catch (err: any) {
    console.error("getProfile error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Update candidate's default resume
 */
export const updateResume = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { cvUrl, cvFileName } = req.body as { cvUrl: string; cvFileName: string };
    if (!cvUrl) return res.status(400).json({ message: "CV URL is required" });

    // 1. Extract Text from PDF
    const cvText = await aiService.extractCvText(cvUrl);

    // 2. Extract Skills using AI
    const extractedSkills = await aiService.extractSkills(cvText);

    // 3. Update Profile
    const updatedProfile = await aiRepository.upsertCandidateProfile(userId, {
      cvUrl,
      cvFileName: cvFileName || "Resume.pdf",
      extractedSkills
    });

    return res.status(200).json({
      message: "Resume updated successfully",
      profile: updatedProfile
    });
  } catch (err: any) {
    console.error("updateResume error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Remove candidate's default resume
 */
export const removeResume = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const updatedProfile = await aiRepository.clearCandidateProfileResume(userId);

    return res.status(200).json({
      message: "Resume removed successfully",
      profile: updatedProfile
    });
  } catch (err: any) {
    console.error("removeResume error:", err);
    return res.status(500).json({ message: err.message });
  }
};
