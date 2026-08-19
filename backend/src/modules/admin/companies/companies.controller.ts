// Controller layer for admin company management.
//
// A controller's only job is HTTP: read the request, call the service,
// send the response. No business logic or DB queries belong here.
//
// Error handling pattern:
//   We let service errors bubble up. Typed errors (with statusCode) are
//   surfaced with that code; anything else falls back to 500.

import { Request, Response } from "express";
import { companiesService } from "./companies.service";

type CompanyIdParams = { id: string };


// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolve HTTP status code from a thrown error.
 * Services attach a `statusCode` property for known error cases (e.g. 404).
 */
const resolveStatusCode = (err: any): number => {
  if (typeof err?.statusCode === "number") return err.statusCode;
  return 500;
};


// ─── GET /admin/companies ─────────────────────────────────────────────────────
//
// Returns a paginated list of all approved companies.
//
// Query params:
//   search  - optional string, filters by company name or email
//   page    - optional number (default: 1)
//   limit   - optional number (default: 20, max: 100)
//
// Response: { data: CompanyDTO[], pagination: { total, page, limit, totalPages } }

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const rawPage = Number(req.query.page);
    const rawLimit = Number(req.query.limit);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.floor(rawLimit) : 20;

    const result = await companiesService.getCompanies({ search, page, limit });
    res.json(result);
  } catch (err: any) {
    console.error("getCompanies error:", err);
    res.status(resolveStatusCode(err)).json({ message: "Failed to fetch companies." });
  }
};


// ─── GET /admin/companies/:id ─────────────────────────────────────────────────
//
// Returns the profile of a single approved company by user ID.
// Used by the "View" button on the Companies list page.
//
// Route params:
//   id  - the user's UUID
//
// Response: CompanyDTO
// Errors:   404 if no approved company found with that ID

export const getCompanyById = async (req: Request<CompanyIdParams>, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Company ID is required." });
    }
    const company = await companiesService.getCompanyById(id);
    res.json(company);
  } catch (err: any) {
    console.error("getCompanyById error:", err);
    res.status(resolveStatusCode(err)).json({ message: err.message || "Failed to fetch company." });
  }
};


// ─── DELETE /admin/companies/:id ─────────────────────────────────────────────
//
// Permanently removes a company (the employer user and all related records).
// Only approved employer accounts can be deleted via this endpoint.
//
// Route params:
//   id  - the user's UUID
//
// Response: { message: "Company removed successfully." }
// Errors:   404 if not found or not an approved employer

export const deleteCompany = async (req: Request<CompanyIdParams>, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Company ID is required." });
    }
    await companiesService.deleteCompany(id);
    res.json({ message: "Company removed successfully." });
  } catch (err: any) {
    console.error("deleteCompany error:", err);
    res.status(resolveStatusCode(err)).json({ message: err.message || "Failed to remove company." });
  }
};