"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import PendingApprovalsTable from "@/components/admin/pending-approvals/PendingApprovalsTable";
import AdminLoadingCard from "@/components/admin/layout/AdminLoadingCard";
import AdminTopbar from "@/components/admin/layout/AdminTopbar";
import { PendingApproval } from "@/types/admin/approval.types";
import { authService } from "@/lib/auth.service";

type ApprovalStatus = "pending" | "approved" | "rejected";

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
};

function StatusFilterButtons({
  statusFilter,
  onStatusFilterChange,
}: {
  statusFilter: ApprovalStatus;
  onStatusFilterChange: (status: ApprovalStatus) => void;
}) {
  return (
    <div className="flex gap-2">
      <button
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors duration-150 ${statusFilter === 'pending' ? 'bg-indigo-50 text-indigo-700 border-indigo-300' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
        onClick={() => onStatusFilterChange('pending')}
      >
        Pending
      </button>
      <button
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors duration-150 ${statusFilter === 'approved' ? 'bg-green-50 text-green-700 border-green-300' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
        onClick={() => onStatusFilterChange('approved')}
      >
        Approved
      </button>
      <button
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors duration-150 ${statusFilter === 'rejected' ? 'bg-red-50 text-red-600 border-red-300' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
        onClick={() => onStatusFilterChange('rejected')}
      >
        Rejected
      </button>
    </div>
  );
}

// -------------------------------------------------
// Page
// -------------------------------------------------
export default function PendingApprovalsPage() {
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus>("pending");
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch by status filter ──
  useEffect(() => {
    const load = async () => {
      setError(null);
      setIsLoading(true);
      try {
        const employers = await authService.getEmployers(statusFilter);
        const data: PendingApproval[] = employers
          .map((employer) => ({
          id: employer.id,
          companyName: employer.employerProfile.companyName,
          email: employer.email,
          createdAt: employer.createdAt,
          status: statusFilter,
          companyLogoUrl: undefined,
            registrationFileUrl: employer.employerProfile.registrationFileUrl,
            rejectionReason: employer.employerProfile.rejectionReason ?? null,
          }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setApprovals(data);
      } catch (err: unknown) {
        setError(getErrorMessage(err, `Failed to load ${statusFilter} approvals.`));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [statusFilter]);

  // ── Approve ──
  const handleApprove = useCallback(async (id: string) => {
    await authService.approveEmployer(id);
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // ── Reject ──
  const handleReject = useCallback(async (id: string, reason?: string) => {
    await authService.rejectEmployer(id, reason);
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // ── View Business Registration ──
  const handleViewBR = useCallback(async (id: string) => {
    const approval = approvals.find((entry) => entry.id === id);
    const fileUrl = approval?.registrationFileUrl;

    if (!fileUrl) {
      setError("Business registration document not found.");
      return;
    }

    window.open(fileUrl, "_blank");
  }, [approvals]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <AdminTopbar
        rightControl={<StatusFilterButtons statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} />}
      />

      <div className="admin-scroll min-h-0 flex-1 overflow-y-auto px-6 pb-6">
        <PageHeader pendingCount={approvals.length} loading={isLoading} />

        {isLoading ? (
          <AdminLoadingCard label={`Loading ${statusFilter} approvals...`} />
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-white p-6 text-sm text-red-500">
            {error}
          </div>
        ) : approvals.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500">
            No {statusFilter} approvals found.
          </div>
        ) : (
          <div className="min-h-0 flex-1">
            <PendingApprovalsTable
              statusFilter={statusFilter}
              approvals={approvals}
              onApprove={handleApprove}
              onReject={handleReject}
              onViewBR={handleViewBR}
            />
          </div>
        )}
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
    <div className="mb-6 flex items-center gap-3">
      {/* Icon */}
      <div>
        <ClipboardCheck size={24} className="text-indigo-600" />
      </div>

      <div>
        <h1 className="text-2xl font-bold leading-tight text-indigo-600">
          Pending Approvals
        </h1>
        {!loading && (
          <p className="mt-0.5 text-sm text-green-600">
            {pendingCount === 0
              ? "No pending approvals"
              : `${pendingCount} compan${pendingCount === 1 ? "y" : "ies"} awaiting review`}
          </p>
        )}
      </div>
    </div>
  );
}