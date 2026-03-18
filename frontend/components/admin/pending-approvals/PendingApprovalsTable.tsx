"use client";

import { useState } from "react";
import Image from "next/image";
import { Building2, ExternalLink, Check, X } from "lucide-react";
import { PendingApproval } from "@/types/admin/approval.types";
import RejectConfirmationModal from "./RejectConfirmationModal";

type ApprovalStatus = "pending" | "approved" | "rejected";

// -------------------------------------------------
// Helpers
// -------------------------------------------------
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

// -------------------------------------------------
// Company Logo / Initials fallback
// -------------------------------------------------
function CompanyAvatar({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl?: string;
}) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={name}
        width={36}
        height={36}
        className="object-cover rounded-lg shrink-0"
      />
    );
  }
  return (
    <div className="flex items-center justify-center bg-indigo-100 rounded-lg shrink-0 w-9 h-9">
      <Building2 size={18} className="text-indigo-500" />
    </div>
  );
}

// -------------------------------------------------
// Row-level action state
// -------------------------------------------------
type RowState = "idle" | "approving" | "rejecting" | "approved" | "rejected";

interface RowProps {
  statusFilter: ApprovalStatus;
  item: PendingApproval;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
  onViewBR: (id: string) => void;
}

function ApprovalRow({ statusFilter, item, onApprove, onReject, onViewBR }: RowProps) {
  const [state, setState] = useState<RowState>("idle");
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const isPending = item.status === "pending";

  const handleApprove = async () => {
    setState("approving");
    try {
      await onApprove(item.id);
      setState("approved");
    } catch {
      setState("idle");
    }
  };

  const handleReject = async (reason?: string) => {
    setState("rejecting");
    try {
      await onReject(item.id, reason);
      setState("rejected");
      setOpenRejectModal(false);
    } catch {
      setState("idle");
    }
  };

  // Fade out resolved rows
  const isDone = state === "approved" || state === "rejected";

  return (
    <>
      <tr
        className={`
          border-b border-gray-100 last:border-0
          transition-all duration-300
          ${isDone ? "opacity-40 pointer-events-none" : "hover:bg-gray-50/60"}
        `}
      >
        {/* Company */}
        <td className="py-4 pl-2 pr-4">
          <div className="flex items-center gap-3">
            <CompanyAvatar name={item.companyName} logoUrl={item.companyLogoUrl} />
            <span className="text-sm font-semibold text-gray-800">
              {item.companyName}
            </span>
          </div>
        </td>

        {/* Created */}
        <td className="py-4 pr-8 text-sm text-gray-500 whitespace-nowrap">
          {formatDate(item.createdAt)}
        </td>

        {/* Email */}
        <td className="py-4 pr-8 text-sm text-gray-500">
          {item.email}
        </td>

        {/* Rejection Reason */}
        {statusFilter === "rejected" && (
          <td className="py-4 pr-8 text-sm text-gray-500 max-w-70">
            <p className="line-clamp-2 text-xs leading-5 text-gray-600">
              {item.rejectionReason?.trim() || "No reason provided"}
            </p>
          </td>
        )}

        {/* Actions */}
        <td className="py-4 pr-2">
          <div className="flex items-center justify-center gap-2">
              {/* View BR */}
            <button
              onClick={() => onViewBR(item.id)}
              className="
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                border border-indigo-300 text-indigo-600 text-xs font-semibold
                hover:bg-indigo-50 transition-colors duration-150
                whitespace-nowrap
              "
            >
              <ExternalLink size={12} />
              View BR
            </button>

            {isPending ? (
              <>
                {/* Approve */}
                <button
                  onClick={handleApprove}
                  disabled={state !== "idle"}
                  className="
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                    border border-green-300 text-green-600 text-xs font-semibold
                    hover:bg-green-50 transition-colors duration-150
                    disabled:opacity-50 disabled:cursor-not-allowed
                    whitespace-nowrap
                  "
                >
                  {state === "approving" ? (
                    <span className="w-3 h-3 border-2 border-green-500 rounded-full border-t-transparent animate-spin" />
                  ) : (
                    <Check size={12} />
                  )}
                  Approve
                </button>

                {/* Reject */}
                <button
                  onClick={() => setOpenRejectModal(true)}
                  disabled={state !== "idle"}
                  className="
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                    border border-red-300 text-red-500 text-xs font-semibold
                    hover:bg-red-50 transition-colors duration-150
                    disabled:opacity-50 disabled:cursor-not-allowed
                    whitespace-nowrap
                  "
                >
                  {state === "rejecting" ? (
                    <span className="w-3 h-3 border-2 border-red-400 rounded-full border-t-transparent animate-spin" />
                  ) : (
                    <X size={12} />
                  )}
                  Reject
                </button>
              </>
            ) : (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  item.status === "approved"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {item.status === "approved" ? "Approved" : "Rejected"}
              </span>
            )}
          </div>
        </td>
      </tr>

      <RejectConfirmationModal
        isOpen={openRejectModal}
        companyName={item.companyName}
        onCancel={() => setOpenRejectModal(false)}
        onConfirm={async (reason) => {
          await handleReject(reason);
        }}
      />
    </>
  );
}

// -------------------------------------------------
// Main table component
// -------------------------------------------------
interface PendingApprovalsTableProps {
  statusFilter: ApprovalStatus;
  onStatusFilterChange: (status: ApprovalStatus) => void;
  approvals: PendingApproval[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
  onViewBR: (id: string) => void;
  loading?: boolean;
}

export default function PendingApprovalsTable({
  statusFilter,
  onStatusFilterChange,
  approvals,
  onApprove,
  onReject,
  onViewBR,
  loading = false,
}: PendingApprovalsTableProps) {
  return (
    <div className="flex flex-col h-full p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
      {/* Card header with sorting buttons */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <h2 className="text-base font-semibold text-gray-800">
          Recent Companies
        </h2>
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
      </div>
      {loading && (
        <div className="mb-4 text-xs font-medium text-gray-400">Loading companies...</div>
      )}
      {/* Empty state */}
      {!loading && approvals.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-16 text-center">
          <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-green-50">
            <Check size={22} className="text-green-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700">All caught up!</p>
          <p className="mt-1 text-xs text-gray-400">
            No {statusFilter} company approvals at the moment.
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-gray-100">
                <th className="pb-3 pl-2 text-xs font-medium tracking-wide text-left text-gray-400 uppercase">
                  Company
                </th>
                <th className="pb-3 text-xs font-medium tracking-wide text-left text-gray-400 uppercase">
                  Created
                </th>
                <th className="pb-3 text-xs font-medium tracking-wide text-left text-gray-400 uppercase">
                  Email
                </th>
                {statusFilter === "rejected" && (
                  <th className="pb-3 text-xs font-medium tracking-wide text-left text-gray-400 uppercase">
                    Reason
                  </th>
                )}
                <th className="pb-3 pr-2 text-xs font-medium tracking-wide text-center text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((item) => (
                <ApprovalRow
                  key={item.id}
                  statusFilter={statusFilter}
                  item={item}
                  onApprove={onApprove}
                  onReject={onReject}
                  onViewBR={onViewBR}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}