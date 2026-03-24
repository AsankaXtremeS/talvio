// Service layer for employer job post management.
// This layer contains all business logic — it talks to the repository
// and shapes the data the controller will send to the client.
//
// Why a separate service layer?
//   Controllers handle HTTP (req/res). Repositories handle DB queries.
//   Services sit in between and own the "rules" — authorization checks,
//   data shaping, business decisions. Easy to unit-test independently.
//
// Pattern followed from: src/modules/admin/companies/companies.service.ts

import { prisma } from "../../../config/db";
import { jobsRepository } from "./jobPosts.repository";
import { CreateJobPostInput, UpdateJobPostInput, JobPostQueryInput } from "./jobPosts.validation";

// Maximum records per page — prevents clients requesting huge payloads
const MAX_PAGE_LIMIT = 100;
const DEFAULT_PAGE_LIMIT = 20;

// ─── Response Shape Types ─────────────────────────────────────────────────────
// Define what the API returns — never expose raw DB records directly.

export interface JobPostDTO {
  id: string;
  title: string;
  department: string;
  type: string;
  status: string;
  closedDate: string | null;  // ISO string — frontend formats as needed
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
  };
}

export interface JobPostListResponse {
  data: JobPostDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface JobPostStatsResponse {
  total: number;
  active: number;
  closed: number;
  draft: number;
}

// ─── Helper: create a typed error with HTTP status code ──────────────────────
// Services throw these; controllers read err.statusCode to set the response.

function createError(message: string, statusCode: number): Error {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const jobsService = {

  /**
   * Resolve the EmployerProfile ID from a User ID.
   *
   * The JWT stores the User ID, but JobPost links to EmployerProfile ID.
   * We need to look up the profile to get the correct ID for all queries.
   *
   * Security checks applied here:
   *   1. User must have an EmployerProfile (i.e. they registered as employer)
   *   2. Profile must be APPROVED — pending/rejected employers cannot post jobs
   *
   * Throws 403 if either check fails.
   */
  async resolveEmployerProfileId(userId: string): Promise<string> {
    const profile = await prisma.employerProfile.findUnique({
      where: { userId },
      select: { id: true, verificationStatus: true },
    });

    // No profile — user is not an employer
    if (!profile) {
      throw createError("Employer profile not found", 403);
    }

    // Profile exists but not yet approved by admin
    if (profile.verificationStatus !== "APPROVED") {
      throw createError(
        "Your employer account is not yet approved. Please wait for admin approval before posting jobs.",
        403
      );
    }

    return profile.id;
  },

  /**
   * Get a paginated, filtered list of job posts for the requesting employer.
   *
   * Business rules:
   *   - page >= 1
   *   - limit capped at MAX_PAGE_LIMIT
   *   - search is trimmed
   *   - Raw DB records mapped to JobPostDTO (never expose raw DB shape)
   */
  async getJobPosts(
    userId: string,
    query: JobPostQueryInput
  ): Promise<JobPostListResponse> {
    // Resolve employer profile ID (also validates approval status)
    const employerId = await this.resolveEmployerProfileId(userId);

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(MAX_PAGE_LIMIT, Math.max(1, query.limit ?? DEFAULT_PAGE_LIMIT));
    const search = query.search?.trim() || undefined;

    const { posts, total } = await jobsRepository.findAll({
      employerId,
      status: query.status,
      type: query.type,
      search,
      page,
      limit,
    });

    // Map raw DB records to clean DTOs
    const data: JobPostDTO[] = posts.map((post) => ({
      id: post.id,
      title: post.title,
      department: post.department,
      type: post.type,
      status: post.status,
      closedDate: post.closedDate ? post.closedDate.toISOString() : null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      company: {
        id: post.employer.id,
        name: post.employer.companyName,
      },
    }));

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get stats for the employer's dashboard stats cards.
   * Returns total, active, draft, and closed post counts.
   */
  async getStats(userId: string): Promise<JobPostStatsResponse> {
    const employerId = await this.resolveEmployerProfileId(userId);
    const stats = await jobsRepository.getStats(employerId);

    return {
      total: stats.TOTAL,
      active: stats.ACTIVE,
      closed: stats.CLOSED,
      draft: stats.DRAFT,
    };
  },

  /**
   * Get a single job post by ID.
   *
   * Security: resolveEmployerProfileId ensures only approved employers access this.
   * The repository's findById also enforces ownership (employerId check).
   * Throws 404 if not found or doesn't belong to this employer.
   */
  async getJobPostById(userId: string, postId: string): Promise<JobPostDTO> {
    const employerId = await this.resolveEmployerProfileId(userId);
    const post = await jobsRepository.findById(postId, employerId);

    if (!post) {
      throw createError("Job post not found", 404);
    }

    // Fetch company name to include in response
    const profile = await prisma.employerProfile.findUnique({
      where: { id: employerId },
      select: { companyName: true },
    });

    return {
      id: post.id,
      title: post.title,
      department: post.department,
      type: post.type,
      status: post.status,
      closedDate: post.closedDate ? post.closedDate.toISOString() : null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      company: {
        id: employerId,
        name: profile?.companyName ?? "",
      },
    };
  },

  /**
   * Create a new job post.
   *
   * Business rules:
   *   - Employer must be APPROVED before creating posts
   *   - New posts default to DRAFT status
   */
  async createJobPost(userId: string, data: CreateJobPostInput): Promise<JobPostDTO> {
    const employerId = await this.resolveEmployerProfileId(userId);

    // Fetch company name to include in response
    const profile = await prisma.employerProfile.findUnique({
      where: { id: employerId },
      select: { companyName: true },
    });

    const post = await jobsRepository.create(employerId, data);

    return {
      id: post.id,
      title: post.title,
      department: post.department,
      type: post.type,
      status: post.status,
      closedDate: post.closedDate ? post.closedDate.toISOString() : null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      company: { id: employerId, name: profile?.companyName ?? "" },
    };
  },

  /**
   * Update an existing job post.
   *
   * Security:
   *   - We verify ownership in findById BEFORE updating
   *   - If post doesn't exist or belongs to another employer → 404
   *   - This prevents an employer from updating another employer's post
   */
  async updateJobPost(
    userId: string,
    postId: string,
    data: UpdateJobPostInput
  ): Promise<JobPostDTO> {
    const employerId = await this.resolveEmployerProfileId(userId);

    const existing = await jobsRepository.findById(postId, employerId);
    if (!existing) {
      throw createError("Job post not found", 404);
    }

    // Fetch company name to include in response
    const profile = await prisma.employerProfile.findUnique({
      where: { id: employerId },
      select: { companyName: true },
    });

    const updated = await jobsRepository.update(postId, employerId, data);

    return {
      id: updated.id,
      title: updated.title,
      department: updated.department,
      type: updated.type,
      status: updated.status,
      closedDate: updated.closedDate ? updated.closedDate.toISOString() : null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      company: { id: employerId, name: profile?.companyName ?? "" },
    };
  },

  /**
   * Delete a job post permanently.
   *
   * Security:
   *   - Verify ownership in findById BEFORE deleting
   *   - If post doesn't exist or belongs to another employer → 404
   */
  async deleteJobPost(userId: string, postId: string): Promise<void> {
    const employerId = await this.resolveEmployerProfileId(userId);

    // Ownership check before delete
    const existing = await jobsRepository.findById(postId, employerId);
    if (!existing) {
      throw createError("Job post not found", 404);
    }

    await jobsRepository.deleteById(postId, employerId);
  },
};