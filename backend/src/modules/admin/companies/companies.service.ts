// Service layer for admin company management.
// This layer contains business logic — it talks to the repository and shapes
// the data the controller will send to the client.
//
// Why a separate service layer?
//   Controllers handle HTTP (req/res). Repositories handle DB queries.
//   Services sit in between and own the "rules" — validation, data shaping,
//   business decisions. This makes the logic easy to unit-test independently.

import { companiesRepository, GetCompaniesOptions } from "./companies.repository";

// Maximum number of records per page — prevents clients from requesting
// huge payloads that would strain the DB and slow the response.
const MAX_PAGE_LIMIT = 100;
const DEFAULT_PAGE_LIMIT = 20;

// ─── Response shape types ─────────────────────────────────────────────────────
// Define what the API will actually return so the controller stays clean.

export interface CompanyDTO {
  id: string;           // user ID (primary key we use for delete/view)
  companyName: string;
  email: string;
  companyLogoUrl?: string | null;
  postCount: number;
  joinedAt: string;     // ISO date string — frontend formats as needed
}

export interface CompanyListResponse {
  data: CompanyDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const companiesService = {

  /**
   * Get a paginated, searchable list of all approved companies.
   *
   * Business rules applied here:
   *  - page must be >= 1
   *  - limit is capped at MAX_PAGE_LIMIT (prevents abuse)
   *  - search string is trimmed
   *  - raw DB records are mapped to CompanyDTO (never expose raw DB shape)
   */
  async getCompanies(options: GetCompaniesOptions): Promise<CompanyListResponse> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(MAX_PAGE_LIMIT, Math.max(1, options.limit ?? DEFAULT_PAGE_LIMIT));
    const search = options.search?.trim() || undefined;

    const { companies, total } = await companiesRepository.findAll({ search, page, limit });

    const data: CompanyDTO[] = companies.map((user) => ({
      id: user.id,
      companyName: user.employerProfile?.companyName ?? "Unknown",
      email: user.email,
      companyLogoUrl: user.employerProfile?.companyLogoUrl ?? null,
      postCount: user.employerProfile?._count.jobPosts ?? 0,
      joinedAt: user.createdAt.toISOString(),
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
   * Get a single company's profile by their user ID.
   * Throws a typed error the controller can map to the right HTTP status.
   */
  async getCompanyById(userId: string): Promise<CompanyDTO> {
    const user = await companiesRepository.findById(userId);

    if (!user) {
      const err: any = new Error("Company not found");
      err.statusCode = 404;
      throw err;
    }

    return {
      id: user.id,
      companyName: user.employerProfile?.companyName ?? "Unknown",
      email: user.email,
      companyLogoUrl: user.employerProfile?.companyLogoUrl ?? null,
      postCount: user.employerProfile?._count.jobPosts ?? 0,
      joinedAt: user.createdAt.toISOString(),
    };
  },

  /**
   * Delete a company (their user record + all related data via cascade).
   *
   * Business rules:
   *  - Only approved employers can be deleted through this endpoint
   *  - If the user doesn't exist or isn't an approved employer → 404
   *  - We do NOT allow deleting ADMIN accounts here (different endpoint)
   */
  async deleteCompany(userId: string): Promise<void> {
    const exists = await companiesRepository.isApprovedEmployer(userId);

    if (!exists) {
      const err: any = new Error("Company not found");
      err.statusCode = 404;
      throw err;
    }

    await companiesRepository.deleteById(userId);
  },
};