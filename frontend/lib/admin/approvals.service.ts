import apiClient from "@/lib/apiClient";
import { PendingApproval } from "@/types/admin/approval.types";

// GET /admin/approvals?status=pending
export async function fetchPendingApprovals(): Promise<PendingApproval[]> {
  const res = await apiClient.get("/admin/approvals?status=pending");
  return res.data;
}

// PATCH /admin/approvals/:id/approve
export async function approveCompany(id: string): Promise<void> {
  await apiClient.patch(`/admin/approvals/${id}/approve`);
}

// PATCH /admin/approvals/:id/reject
export async function rejectCompany(id: string): Promise<void> {
  await apiClient.patch(`/admin/approvals/${id}/reject`);
}

// GET /admin/approvals/:id/business-registration  (returns a URL or blob)
export async function getBusinessRegistrationUrl(id: string): Promise<string> {
  const res = await apiClient.get(`/admin/approvals/${id}/business-registration`);
  return res.data.url;
}