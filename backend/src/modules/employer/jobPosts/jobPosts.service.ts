// Service layer for employer job post management.
// Owns business rules: employer verification, ownership checks, pagination,
// and response shaping for controllers.

import { JobPost, VerificationStatus } from "@prisma/client";
import { jobsRepository } from "./jobPosts.repository";
import { JobPostQueryInput, CreateJobPostInput, UpdateJobPostInput } from "./jobPosts.validation";

const MAX_PAGE_LIMIT = 100;
const DEFAULT_PAGE_LIMIT = 20;

interface ServiceError extends Error {
  statusCode?: number;
}

const buildHttpError = (message: string, statusCode: number): ServiceError => {
  const err: ServiceError = new Error(message);
  err.statusCode = statusCode;
  return err;
};

interface JobPostDTO {
  id: string;
  title: string;
  type: JobPost["type"];
  status: JobPost["status"];
  description: string | null;
  requirements: string | null;
  closingDate: string | null;
  createdAt: string;
  updatedAt: string;
  company: {
    name: string;
  };
}

interface JobPostListResponse {
  data: JobPostDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const mapToDTO = (post: {
  id: string;
  title: string;
  type: JobPost["type"];
  status: JobPost["status"];
  description: string | null;
  requirements: string | null;
  closingDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  employer?: {
    companyName: string;
  } | null;
}): JobPostDTO => ({
  id: post.id,
  title: post.title,
  type: post.type,
  status: post.status,
  description: post.description,
  requirements: post.requirements,
  closingDate: post.closingDate ? post.closingDate.toISOString() : null,
  createdAt: post.createdAt.toISOString(),
  updatedAt: post.updatedAt.toISOString(),
  company: {
    name: post.employer?.companyName ?? "",
  },
});

const resolveApprovedEmployerId = async (userId: string): Promise<string> => {
  // IMPORTANT: This function enforces the critical business rule:
  // Only APPROVED employers can manage job posts.
  // Called at the start of EVERY service method to ensure authorization.
  
  const employerProfile = await jobsRepository.findEmployerProfileByUserId(userId);

  if (!employerProfile) {
    // User has no employer profile — not an employer account
    throw buildHttpError("Employer profile not found", 404);
  }

  if (employerProfile.verificationStatus !== VerificationStatus.APPROVED) {
    // Employer exists but isn't approved yet (PENDING or REJECTED)
    throw buildHttpError("Your company is not approved to manage job posts.", 403);
  }

  // Return the employer ID for use in repository queries
  return employerProfile.id;
};

export const jobsService = {
  // ═══════════════════════════════════════════════════════════════════════════
  // GET STATS — Returns counts of job posts by status for dashboard cards.
  // Used by employer dashboard to show "Total: X  |  Active: X  |  Draft: X"
  // ═══════════════════════════════════════════════════════════════════════════
  async getStats(userId: string) {
    // Verify employer is approved — throws 403 or 404 if not
    const employerId = await resolveApprovedEmployerId(userId);
    
    // Query stats from repository (counts per status)
    const stats = await jobsRepository.getStats(employerId);

    // Return dashboard-friendly format: { total, active, draft, closed }
    return {
      total: stats.TOTAL,
      active: stats.ACTIVE,
      draft: stats.DRAFT,
      closed: stats.CLOSED,
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GET JOB POSTS — Returns paginated, filterable list of employer's job posts.
  // Supports filtering by status/type and searching by title.
  // ═══════════════════════════════════════════════════════════════════════════
  async getJobPosts(userId: string, query: JobPostQueryInput): Promise<JobPostListResponse> {
    // Verify employer is approved
    const employerId = await resolveApprovedEmployerId(userId);
    
    // Validate and sanitize pagination params to prevent abuse
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(MAX_PAGE_LIMIT, Math.max(1, query.limit ?? DEFAULT_PAGE_LIMIT));
    const search = query.search?.trim() || undefined;

    // Query repository with filter + pagination
    const { posts, total } = await jobsRepository.findAll({
      employerId,
      status: query.status,        // Filter by DRAFT | ACTIVE | CLOSED
      type: query.type,            // Filter by JOB | INTERNSHIP
      search,                       // Text search in title
      page,
      limit,
    });

    // Transform database posts to DTOs and calculate page metadata
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

  // ═══════════════════════════════════════════════════════════════════════════
  // GET JOB POST BY ID — Returns a single job post.
  // IMPORTANT: Only returns post if owned by the employer (ownership check).
  // ═══════════════════════════════════════════════════════════════════════════
  async getJobPostById(userId: string, postId: string): Promise<JobPostDTO> {
    // Verify employer is approved
    const employerId = await resolveApprovedEmployerId(userId);
    
    // Query repository with ownership filter built into the WHERE clause
    const post = await jobsRepository.findById(postId, employerId);

    if (!post) {
      // Either post doesn't exist or employer doesn't own it
      throw buildHttpError("Job post not found", 404);
    }

    // Transform to DTO and return
    return mapToDTO(post);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE JOB POST — Creates a new job post.
  // Only approved employers can create posts. Defaults to DRAFT status.
  // ═══════════════════════════════════════════════════════════════════════════
  async createJobPost(userId: string, data: CreateJobPostInput): Promise<JobPostDTO> {
    // Verify employer is approved — throws 403 if not
    const employerId = await resolveApprovedEmployerId(userId);
    
    // Insert new post into database (repository handles defaults)
    const created = await jobsRepository.create(employerId, data);

    // Transform and return with company context
    return {
      ...mapToDTO(created),
      company: { name: "" },
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE JOB POST — Partially updates a job post (PATCH).
  // Only updates fields provided in data. Ownership verified via findById.
  // Can be used to update title, description, status, etc.
  // ═══════════════════════════════════════════════════════════════════════════
  async updateJobPost(userId: string, postId: string, data: UpdateJobPostInput): Promise<JobPostDTO> {
    // Verify employer is approved
    const employerId = await resolveApprovedEmployerId(userId);

    // Check if post exists AND belongs to this employer before updating
    const existing = await jobsRepository.findById(postId, employerId);
    if (!existing) {
      // Either post doesn't exist or employer doesn't own it
      throw buildHttpError("Job post not found", 404);
    }

    // Update post in database (only provided fields are changed)
    const updated = await jobsRepository.update(postId, employerId, data);
    return {
      ...mapToDTO(updated),
      company: { name: "" },
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE JOB POST — Permanently deletes a job post.
  // Ownership verified via findById before deletion.
  // This operation is IRREVERSIBLE — no recovery possible.
  // ═══════════════════════════════════════════════════════════════════════════
  async deleteJobPost(userId: string, postId: string): Promise<void> {
    // Verify employer is approved
    const employerId = await resolveApprovedEmployerId(userId);

    // Check if post exists AND belongs to this employer before deleting
    const existing = await jobsRepository.findById(postId, employerId);
    if (!existing) {
      // Either post doesn't exist or employer doesn't own it
      throw buildHttpError("Job post not found", 404);
    }

    // Permanently delete the post from database
    await jobsRepository.deleteById(postId, employerId);
  },
};
