"use client";

import { useRouter } from "next/navigation";
import { Check, ChevronDown, FileUser } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { JobPost } from "@/types/employer/jobPost.types";

interface JobPostsTableProps {
  posts: JobPost[];
  onEdit: (id: string) => void;
  onViewCandidates: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, nextStatus: "Draft" | "Active" | "Closed") => void;
  deletingId?: string | null;
  closingId?: string | null;
  jobType?: string;
  onJobTypeChange?: (val: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (val: string) => void;
  period?: string;
  onPeriodChange?: (val: string) => void;
}

const ColHeader = ({
  label,
  align = "left",
}: {
  label: string;
  align?: "left" | "center";
}) => (
  <th
    className={`px-4 py-3 text-sm font-semibold text-gray-600 ${
      align === "center" ? "text-center" : "text-left"
    }`}
  >
    <span
      className={`flex items-center gap-1 select-none ${
        align === "center" ? "justify-center" : ""
      }`}
    >
      {label}
    </span>
  </th>
);

function TypeHeaderDropdown({
  jobType,
  onJobTypeChange,
}: {
  jobType?: string;
  onJobTypeChange?: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isFiltered = jobType && jobType !== "Job Type";
  const displayLabel = isFiltered ? `Type: ${jobType}` : "Type";

  return (
    <th className="px-4 py-3 text-sm font-semibold text-left text-gray-600">
      <div ref={ref} className="relative inline-block">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold transition-all select-none ${
            isFiltered
              ? "bg-indigo-100 text-indigo-700 shadow-xs"
              : "hover:bg-gray-200/60 hover:text-gray-900"
          }`}
        >
          <span>{displayLabel}</span>
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div className="absolute left-0 z-50 mt-1.5 w-36 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
            {[
              { label: "All Types", value: "Job Type" },
              { label: "Job", value: "Job" },
              { label: "Internship", value: "Internship" },
            ].map((opt) => {
              const active = (jobType || "Job Type") === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    if (onJobTypeChange) onJobTypeChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3.5 py-2.5 text-xs transition-colors ${
                    active
                      ? "bg-indigo-50 font-semibold text-indigo-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{opt.label}</span>
                  {active && <Check size={13} className="text-indigo-500" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </th>
  );
}

function StatusHeaderDropdown({
  statusFilter,
  onStatusFilterChange,
}: {
  statusFilter?: string;
  onStatusFilterChange?: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isFiltered = statusFilter && statusFilter !== "Status";
  const displayLabel = isFiltered ? `Status: ${statusFilter === "Close" ? "Closed" : statusFilter}` : "Status";

  return (
    <th className="px-4 py-3 text-sm font-semibold text-left text-gray-600">
      <div ref={ref} className="relative inline-block">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold transition-all select-none ${
            isFiltered
              ? "bg-indigo-100 text-indigo-700 shadow-xs"
              : "hover:bg-gray-200/60 hover:text-gray-900"
          }`}
        >
          <span>{displayLabel}</span>
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div className="absolute left-0 z-50 mt-1.5 w-36 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
            {[
              { label: "All Statuses", value: "Status" },
              { label: "Active", value: "Active" },
              { label: "Closed", value: "Close" },
            ].map((opt) => {
              const active = (statusFilter || "Status") === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    if (onStatusFilterChange) onStatusFilterChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3.5 py-2.5 text-xs transition-colors ${
                    active
                      ? "bg-indigo-50 font-semibold text-indigo-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{opt.label}</span>
                  {active && <Check size={13} className="text-indigo-500" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </th>
  );
}

function DateHeaderDropdown({
  period,
  onPeriodChange,
}: {
  period?: string;
  onPeriodChange?: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isFiltered = period && period !== "All Time";
  const displayLabel = isFiltered ? `Closing Date (${period})` : "Closing Date";

  return (
    <th className="px-4 py-3 text-sm font-semibold text-left text-gray-600">
      <div ref={ref} className="relative inline-block">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold transition-all select-none ${
            isFiltered
              ? "bg-indigo-100 text-indigo-700 shadow-xs"
              : "hover:bg-gray-200/60 hover:text-gray-900"
          }`}
        >
          <span>{displayLabel}</span>
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div className="absolute left-0 z-50 mt-1.5 w-40 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
            {[
              { label: "All Time", value: "All Time" },
              { label: "This Week", value: "This Week" },
              { label: "This Month", value: "This Month" },
              { label: "Next 3 Months", value: "Next 3 Months" },
            ].map((opt) => {
              const active = (period || "All Time") === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    if (onPeriodChange) onPeriodChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3.5 py-2.5 text-xs transition-colors ${
                    active
                      ? "bg-indigo-50 font-semibold text-indigo-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{opt.label}</span>
                  {active && <Check size={13} className="text-indigo-500" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </th>
  );
}

// Status dropdown component
function StatusDropdown({
  postId,
  status,
  onStatusChange,
  isClosing,
}: {
  postId: string;
  status: string;
  onStatusChange: (id: string, newStatus: "Draft" | "Active" | "Closed") => void;
  isClosing: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (newStatus: "Draft" | "Active" | "Closed") => {
    if (newStatus !== status) {
      onStatusChange(postId, newStatus);
    }
    setOpen(false);
  };

  const isClosed = status === "Closed";
  const isDraft = status === "Draft";
  const isActive = status === "Active";
  const mainColor = isClosed ? "#C61D20" : isDraft ? "#FF9500" : "#4CD964";
  const mainBg = isClosed
    ? "rgba(198, 29, 32, 0.08)"
    : isDraft
      ? "rgba(255, 149, 0, 0.10)"
      : "rgba(76, 217, 100, 0.08)";

  const canMoveToActive = status === "Draft" || status === "Closed";
  const canMoveToClosed = status === "Active" || status === "Draft";

  if (isDraft) {
    return (
      <div className="relative inline-block">
        <span
          className="inline-flex min-w-27 items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-semibold"
          style={{
            borderColor: "#FF9500",
            color: "#FF9500",
            backgroundColor: "rgba(255, 149, 0, 0.10)",
            boxShadow: "0 2px 8px rgba(255, 149, 0, 0.16)",
          }}
        >
          Draft
        </span>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={isClosing}
        className="inline-flex min-w-27 items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          borderColor: mainColor,
          color: mainColor,
          backgroundColor: mainBg,
          boxShadow: isClosed
            ? "0 2px 8px rgba(198, 29, 32, 0.14)"
            : isDraft
              ? "0 2px 8px rgba(255, 149, 0, 0.16)"
              : "0 2px 8px rgba(76, 217, 100, 0.14)",
        }}
      >
        <span>{isClosing ? "Updating..." : status}</span>
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ color: mainColor }}
        />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-1.5 min-w-35 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
          {isDraft && (
            <button
              type="button"
              onClick={() => handleSelect("Draft")}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-semibold transition-colors"
              style={{
                color: "#FF9500",
                backgroundColor: status === "Draft" ? "rgba(255, 149, 0, 0.12)" : "transparent",
              }}
            >
              <span>Draft</span>
              {status === "Draft" && <Check size={13} style={{ color: "#FF9500" }} />}
            </button>
          )}

          {canMoveToActive && (
            <button
              type="button"
              onClick={() => handleSelect("Active")}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-semibold transition-colors"
              style={{
                color: "#4CD964",
                backgroundColor: isActive ? "rgba(76, 217, 100, 0.12)" : "transparent",
              }}
            >
              <span>Active</span>
              {isActive && <Check size={13} style={{ color: "#4CD964" }} />}
            </button>
          )}

          {canMoveToClosed && (
            <button
              type="button"
              onClick={() => handleSelect("Closed")}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-semibold transition-colors"
              style={{
                color: "#C61D20",
                backgroundColor: isClosed ? "rgba(198, 29, 32, 0.12)" : "transparent",
              }}
            >
              <span>Close</span>
              {isClosed && <Check size={13} style={{ color: "#C61D20" }} />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function JobPostsTable({
  posts,
  onEdit,
  onViewCandidates,
  onDelete,
  onStatusChange,
  deletingId,
  closingId,
  jobType,
  onJobTypeChange,
  statusFilter,
  onStatusFilterChange,
  period,
  onPeriodChange,
}: JobPostsTableProps) {
  const router = useRouter();

  // Render posts in the order provided by parent component (which handles sorting)
  const sortedPosts = posts;

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderActionButtons = (post: JobPost) => {
    const isActive = post.status === "Active";
    const isClosed = post.status === "Closed";
    const isDraft = post.status === "Draft";

    // Only show allowed actions for each status
    if (isDraft) {
      return (
        <>
          <button
            onClick={() => onEdit(post.id)}
            className="px-4 py-1.5 rounded-lg border border-gray-300 text-gray-500 bg-white text-xs font-semibold hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(post.id)}
            disabled={deletingId === post.id}
            className="px-4 py-1.5 rounded-lg border border-red-300 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deletingId === post.id ? "Deleting..." : "Delete"}
          </button>
        </>
      );
    }
    if (isClosed) {
      return (
        <>
          <button
            onClick={() => router.push(`/users/employer/job-posts/${post.id}`)}
            className="px-4 py-1.5 rounded-lg border border-indigo-400 text-indigo-500 bg-white text-xs font-semibold hover:bg-indigo-50 transition-colors"
          >
            View
          </button>
          <button
            onClick={() => onViewCandidates(post.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-400 text-emerald-500 bg-white text-xs font-semibold hover:bg-emerald-50 transition-colors"
            title="Applicants"
          >
            <FileUser size={14} />
            Applicants
          </button>
          <button
            onClick={() => onDelete(post.id)}
            disabled={deletingId === post.id}
            className="px-4 py-1.5 rounded-lg border border-red-300 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deletingId === post.id ? "Deleting..." : "Delete"}
          </button>
        </>
      );
    }
    if (isActive) {
      return (
        <>
          <button
            onClick={() => router.push(`/users/employer/job-posts/${post.id}`)}
            className="px-4 py-1.5 rounded-lg border border-indigo-400 text-indigo-500 bg-white text-xs font-semibold hover:bg-indigo-50 transition-colors"
          >
            View
          </button>
          <button
            onClick={() => onViewCandidates(post.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-400 text-emerald-500 bg-white text-xs font-semibold hover:bg-emerald-50 transition-colors"
            title="Applicants"
          >
            <FileUser size={14} />
            Applicants
          </button>
          <button
            onClick={() => onEdit(post.id)}
            className="px-4 py-1.5 rounded-lg border border-gray-300 text-gray-500 bg-white text-xs font-semibold hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
        </>
      );
    }
    return null;
  };

  return (
    <div className="overflow-visible bg-white border border-gray-100 rounded-2xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800">Job Posts</h3>
      </div>

      {/* Mobile list view */}
      <div className="space-y-4 lg:hidden px-4 py-4">
        {sortedPosts.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            No job posts found. Click &quot;Post New Job&quot; to get started.
          </div>
        ) : (
          sortedPosts.map((post, idx) => (
            <div key={post.id ?? `mobile-post-${idx}`} className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{post.title}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500 items-center">
                      <button
                        type="button"
                        onClick={() => onJobTypeChange && onJobTypeChange(post.type)}
                        className="rounded-md bg-gray-100 px-2 py-0.5 font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                        title={`Filter by ${post.type}`}
                      >
                        {post.type}
                      </button>
                      <span>{formatDate(post.closingDate)}</span>
                    </div>
                  </div>
                  <StatusDropdown
                    postId={post.id}
                    status={post.status}
                    onStatusChange={onStatusChange}
                    isClosing={closingId === post.id}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {renderActionButtons(post)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table view — always rendered with headers */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="table-auto min-w-full w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <ColHeader label="Job Title" align="center" />
              <TypeHeaderDropdown jobType={jobType} onJobTypeChange={onJobTypeChange} />
              <DateHeaderDropdown period={period} onPeriodChange={onPeriodChange} />
              <StatusHeaderDropdown statusFilter={statusFilter} onStatusFilterChange={onStatusFilterChange} />
              <ColHeader label="Action" align="center" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sortedPosts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                  No job posts found. Click &quot;Post New Job&quot; to get started.
                </td>
              </tr>
            ) : (
              sortedPosts.map((post, idx) => (
                <tr key={post.id ?? `desktop-post-${idx}`} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-800">
                    {post.title}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-500">
                    <button
                      type="button"
                      onClick={() => onJobTypeChange && onJobTypeChange(post.type)}
                      className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                      title={`Filter by ${post.type}`}
                    >
                      {post.type}
                    </button>
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-500">
                    {formatDate(post.closingDate)}
                  </td>

                  <td className="px-4 py-4">
                    <StatusDropdown
                      postId={post.id}
                      status={post.status}
                      onStatusChange={onStatusChange}
                      isClosing={closingId === post.id}
                    />
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {renderActionButtons(post)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}