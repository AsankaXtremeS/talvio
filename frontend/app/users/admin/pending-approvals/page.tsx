"use client";

import { useEffect, useState, useCallback } from "react";
import { ClipboardCheck } from "lucide-react";
import PendingApprovalsTable from "@/components/admin/pending-approvals/PendingApprovalsTable";
import {
  fetchPendingApprovals,
  approveCompany,
  rejectCompany,
  getBusinessRegistrationUrl,
} from "@/lib/admin/approvals.service";
import { PendingApproval } from "@/types/admin/approval.types";

// -------------------------------------------------
// Mock data — remove when API is wired up
// -------------------------------------------------
const MOCK_APPROVALS: PendingApproval[] = [
  {
    id: "1",
    companyName: "Tech Solutions",
    createdAt: "2025-12-26T10:00:00Z",
    email: "JohnD2024@gmail.com",
    status: "pending",
  },
  {
    id: "2",
    companyName: "Vision Corp",
    createdAt: "2025-12-26T09:30:00Z",
    email: "vision2025@gmail.com",
    status: "pending",
  },
  {
    id: "3",
    companyName: "Xplore IT",
    createdAt: "2025-12-26T09:00:00Z",
    email: "Xplore.IT@gmail.com",
    status: "pending",
  },
  {
    id: "4",
    companyName: "App Center",
    createdAt: "2025-12-26T08:45:00Z",
    email: "AppC_Software@gmail.com",
    status: "pending",
  },
  {
    id: "5",
    companyName: "Rocks Holdings",
    createdAt: "2025-12-26T08:00:00Z",
    email: "Rocks3@gmail.com",
    status: "pending",
  },
  {
    id: "6",
    companyName: "Xtreme Software",
    createdAt: "2025-12-25T22:00:00Z",
    email: "XtremeSoftware@email.com",
    status: "pending",
  },
  {
    id: "7",
    companyName: "Xtreme Software",
    createdAt: "2025-12-25T22:00:00Z",
    email: "XtremeSoftware@email.com",
    status: "pending",
  },
  
];

// -------------------------------------------------
// Page
// -------------------------------------------------
export default function PendingApprovalsPage() {
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch on mount ──
  useEffect(() => {
    const load = async () => {
      try {
        // TODO: replace with real API call:
        // const data = await fetchPendingApprovals();
        const data = MOCK_APPROVALS;
        setApprovals(data);
      } catch (err) {
        setError("Failed to load pending approvals.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Approve ──
  const handleApprove = useCallback(async (id: string) => {
    // TODO: await approveCompany(id);
    // Optimistically remove from list after short delay
    await new Promise((r) => setTimeout(r, 600));
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // ── Reject ──
  const handleReject = useCallback(async (id: string) => {
    // TODO: await rejectCompany(id);
    await new Promise((r) => setTimeout(r, 600));
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // ── View Business Registration ──
  const handleViewBR = useCallback(async (id: string) => {
    try {
      // TODO: const url = await getBusinessRegistrationUrl(id);
      // window.open(url, "_blank");
      console.log("View BR for company:", id);
    } catch {
      console.error("Could not fetch business registration document.");
    }
  }, []);

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
          approvals={approvals}
          onApprove={handleApprove}
          onReject={handleReject}
          onViewBR={handleViewBR}
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