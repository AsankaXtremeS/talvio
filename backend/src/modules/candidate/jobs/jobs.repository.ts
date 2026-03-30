import { prisma } from "../../../config/db";
import { JobType } from "@prisma/client";

export const jobsRepository = {

  // Get all ACTIVE job posts filtered by type (JOB or INTERNSHIP)
  findActiveJobsByType: async (type: JobType) => {
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
            companyLocation: true,
            companyDescription: true,
            companyWebsite: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

};