import { apiClient } from "@/lib/apiClient";
import { PendingApproval } from "@/types/admin/approval.types";

// GET /admin/approvals?status=pending
export async function fetchPendingApprovals(): Promise<PendingApproval[]> {
  return apiClient<PendingApproval[]>("/admin/approvals?status=pending");
}

// PATCH /admin/approvals/:id/approve
export async function approveCompany(id: string): Promise<void> {
  await apiClient<void>(`/admin/approvals/${id}/approve`, { method: "PATCH" });
}

// PATCH /admin/approvals/:id/reject
export async function rejectCompany(id: string): Promise<void> {
  await apiClient<void>(`/admin/approvals/${id}/reject`, { method: "PATCH" });
}

// GET /admin/approvals/:id/business-registration  (returns a URL or blob)
export async function getBusinessRegistrationUrl(id: string): Promise<string> {
  const res = await apiClient<{ url: string }>(`/admin/approvals/${id}/business-registration`);
  return res.url;
}