"use client";

import { useEffect, useState, useCallback } from "react";
import { ClipboardCheck } from "lucide-react";
import PendingApprovalsTable from "@/components/admin/pending-approvals/PendingApprovalsTable";
import { PendingApproval } from "@/types/admin/approval.types";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/lib/auth.service";

type ApprovalStatus = "pending" | "approved" | "rejected";

// -------------------------------------------------
// Page
// -------------------------------------------------
export default function PendingApprovalsPage() {
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus>("pending");
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();

  // ── Fetch by status filter ──
  useEffect(() => {
    const load = async () => {
      setError(null);
      setLoading(true);
      try {
        if (!accessToken) {
          setError("Not authenticated");
          return;
        }

        const employers = await authService.getEmployers(statusFilter);
        const data: PendingApproval[] = employers
          .map((employer) => ({
          id: employer.id,
          companyName: employer.employerProfile.companyName,
          email: employer.email,
          createdAt: employer.createdAt,
          status: statusFilter,
          companyLogoUrl: undefined,
            rejectionReason: employer.employerProfile.rejectionReason ?? null,
          }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setApprovals(data);
      } catch {
        setError(`Failed to load ${statusFilter} approvals.`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [accessToken, statusFilter]);

  // ── Approve ──
  const handleApprove = useCallback(async (id: string) => {
    if (!accessToken) return;

    await authService.approveEmployer(id);
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  }, [accessToken]);

  // ── Reject ──
  const handleReject = useCallback(async (id: string, reason?: string) => {
    if (!accessToken) return;

    await authService.rejectEmployer(id, reason);
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  }, [accessToken]);

  // ── View Business Registration ──
  const handleViewBR = useCallback(async (id: string) => {
    try {
      if (!accessToken) return;

      const employers = await authService.getEmployers(statusFilter);
      const employer = employers.find((e) => e.id === id);
      const fileUrl = employer?.employerProfile.registrationFileUrl;

      if (!fileUrl) {
        setError("Business registration document not found.");
        return;
      }

      window.open(fileUrl, "_blank");
    } catch {
      console.error("Could not fetch business registration document.");
    }
  }, [accessToken, statusFilter]);

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <PageHeader pendingCount={0} loading />
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl animate-pulse">
          <div className="w-40 h-4 mb-6 bg-gray-100 rounded" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-b border-gray-50">
              <div className="bg-gray-100 rounded-lg w-9 h-9" />
              <div className="flex-1 h-3 bg-gray-100 rounded" />
              <div className="w-24 h-3 bg-gray-100 rounded" />
              <div className="w-40 h-3 bg-gray-100 rounded" />
              <div className="flex gap-2 ml-auto">
                <div className="w-16 bg-gray-100 rounded-lg h-7" />
                <div className="w-16 bg-gray-100 rounded-lg h-7" />
                <div className="bg-gray-100 rounded-lg w-14 h-7" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <PageHeader pendingCount={0} />
        <div className="p-10 text-center bg-white border border-red-100 shadow-sm rounded-2xl">
          <p className="text-sm font-medium text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 h-[90dvh]">
      <div className="shrink-0">
        <PageHeader pendingCount={approvals.length} />
      </div>
      <div className="flex-1 min-h-[80.15dvh]">
        <PendingApprovalsTable
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          approvals={approvals}
          onApprove={handleApprove}
          onReject={handleReject}
          onViewBR={handleViewBR}
          loading={loading}
        />
      </div>
    </div>
  );
}

// -------------------------------------------------
// Page header sub-component
// -------------------------------------------------
function PageHeader({
  pendingCount,
  loading = false,
}: {
  pendingCount: number;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {/* Icon */}
      <div>
        <ClipboardCheck size={35} className="text-indigo-600" />
      </div>

      <div>
        <h1 className="text-2xl font-bold leading-tight text-indigo-700">
          Pending Approvals
        </h1>
        {!loading && (
          <p className="text-s text-green-600 mt-0.5">
            {pendingCount === 0
              ? "No pending approvals"
              : `${pendingCount} compan${pendingCount === 1 ? "y" : "ies"} awaiting review`}
          </p>
        )}
      </div>
    </div>
  );
}