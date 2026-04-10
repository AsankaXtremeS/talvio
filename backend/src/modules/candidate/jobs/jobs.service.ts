import { JobType } from "@prisma/client";
import { jobsRepository } from "./jobs.repository";

export const jobsService = {

  // Get jobs based on candidate role
  // STUDENT → gets INTERNSHIP posts
  // PROFESSIONAL → gets JOB posts
  getJobsByRole: async (role: string) => {
    const jobType: JobType = role === "PROFESSIONAL" ? JobType.JOB : JobType.INTERNSHIP;
    
    const jobs = await jobsRepository.findActiveJobsByType(jobType);

    // Format the data to send back to frontend
    return jobs.map((job) => ({
      id: job.id,
      title: job.title,
      type: job.type,
      description: job.description,
      requirements: job.requirements,
      responsibilities: job.responsibilities,
      skillsRequired: job.skillsRequired,
      workMode: job.workMode,
      employmentType: job.employmentType,
      stipendType: job.stipendType,
      location: job.location,
      duration: job.duration,
      experienceLevel: job.experienceLevel,
      closingDate: job.closingDate,
      createdAt: job.createdAt,
      // Company info
      company: job.employer.companyName,
      companyLogoUrl: job.employer.companyLogoUrl,
      companyLocation: job.employer.companyLocation,
      companyDescription: job.employer.companyDescription,
      companyWebsite: job.employer.companyWebsite,
    }));
  },

};