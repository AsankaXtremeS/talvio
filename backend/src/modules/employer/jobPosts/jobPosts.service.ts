import { VerificationStatus } from "@prisma/client";
import { jobsRepository } from "./jobPosts.repository";
import { CreateJobPostInput, JobPostQueryInput, UpdateJobPostInput } from "./jobPosts.validation";

interface ServiceError extends Error {
  statusCode?: number;
}

const httpError = (message: string, statusCode: number): ServiceError => {
  const err: ServiceError = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const mapToDTO = (post: {
  id: string;
  title: string;
  type: "JOB" | "INTERNSHIP";
  status: "DRAFT" | "ACTIVE" | "CLOSED";
  description: string | null;
  requirements: string | null;
  closingDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: post.id,
  title: post.title,
  type: post.type,
  status: post.status,
  description: post.description,
  requirements: post.requirements,
  closingDate: post.closingDate ? post.closingDate.toISOString() : null,
  createdAt: post.createdAt.toISOString(),
  updatedAt: post.updatedAt.toISOString(),
  company: { name: "" },
});

const resolveEmployerId = async (userId: string): Promise<string> => {
  const profile = await jobsRepository.findEmployerProfileByUserId(userId);
  if (!profile) throw httpError("Employer profile not found", 404);

  const status = profile.verificationStatus as VerificationStatus;
  if (status !== VerificationStatus.APPROVED) {
    throw httpError("Your company is not approved to manage job posts.", 403);
  }

  return profile.id;
};

export const jobsService = {
  async getStats(userId: string) {
    const employerId = await resolveEmployerId(userId);
    const stats = await jobsRepository.getStats(employerId);
    return {
      total: stats.TOTAL,
      active: stats.ACTIVE,
      draft: stats.DRAFT,
      closed: stats.CLOSED,
    };
  },

  async getJobPosts(userId: string, query: JobPostQueryInput) {
    const employerId = await resolveEmployerId(userId);
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));

    const { posts, total } = await jobsRepository.findAll({
      employerId,
      status: query.status,
      type: query.type,
      search: query.search,
      page,
      limit,
    });

    return {
      data: posts.map(mapToDTO),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getJobPostById(userId: string, postId: string) {
    const employerId = await resolveEmployerId(userId);
    const post = await jobsRepository.findById(postId, employerId);
    if (!post) throw httpError("Job post not found", 404);
    return mapToDTO(post);
  },

  async createJobPost(userId: string, data: CreateJobPostInput) {
    const employerId = await resolveEmployerId(userId);
    const post = await jobsRepository.create(employerId, data);
    return mapToDTO(post);
  },

  async updateJobPost(userId: string, postId: string, data: UpdateJobPostInput) {
    const employerId = await resolveEmployerId(userId);
    const exists = await jobsRepository.findById(postId, employerId);
    if (!exists) throw httpError("Job post not found", 404);

    const updated = await jobsRepository.update(postId, employerId, data);
    return mapToDTO(updated);
  },

  async deleteJobPost(userId: string, postId: string) {
    const employerId = await resolveEmployerId(userId);
    const exists = await jobsRepository.findById(postId, employerId);
    if (!exists) throw httpError("Job post not found", 404);
    await jobsRepository.deleteById(postId, employerId);
  },
};
