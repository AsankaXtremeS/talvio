"use client";

import { useRouter } from "next/navigation";
import { Check, ChevronDown, Bot } from "lucide-react";
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
      className={`flex items-center gap-1 cursor-pointer select-none hover:text-gray-900 ${
        align === "center" ? "justify-center" : ""
      }`}
    >
      {label} <ChevronDown size={13} />
    </span>
  </th>
);

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
  const mainColor = isClosed ? "#C61D20" : isDraft ? "#FF9500" : "#4CD964";
  const mainBg = isClosed
    ? "rgba(198, 29, 32, 0.08)"
    : isDraft
      ? "rgba(255, 149, 0, 0.10)"
      : "rgba(76, 217, 100, 0.08)";

  if (isDraft) {
    return (
      <div className="relative inline-block">
        <span
          className="inline-flex min-w-[108px] items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-semibold"
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
        className="inline-flex min-w-[108px] items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
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
        <div className="absolute left-0 z-50 mt-1.5 min-w-[140px] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
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

          {(status === "Active" || status === "Closed") && (
            <button
              type="button"
              onClick={() => handleSelect("Active")}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-semibold transition-colors"
              style={{
                color: "#4CD964",
                backgroundColor: status === "Active" ? "rgba(76, 217, 100, 0.12)" : "transparent",
              }}
            >
              <span>Active</span>
              {status === "Active" && <Check size={13} style={{ color: "#4CD964" }} />}
            </button>
          )}

          {(status === "Active" || status === "Closed") && (
            <button
              type="button"
              onClick={() => handleSelect("Closed")}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-semibold transition-colors"
              style={{
                color: "#C61D20",
                backgroundColor: status === "Closed" ? "rgba(198, 29, 32, 0.12)" : "transparent",
              }}
            >
              <span>Close</span>
              {status === "Closed" && <Check size={13} style={{ color: "#C61D20" }} />}
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
}: JobPostsTableProps) {
  const router = useRouter();

  // Sort posts by createdAt descending (latest first)
  const sortedPosts = [...posts].sort((a, b) => {
    if (!a.createdAt && !b.createdAt) return 0;
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="overflow-visible bg-white border border-gray-100 rounded-2xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800">Job Posts</h3>
      </div>

      {sortedPosts.length === 0 ? (
        <div className="px-6 py-12 text-sm text-center text-gray-400">
          No job posts found. Click &quot;Post New Job&quot; to get started.
        </div>
      ) : (
        <>
          <div className="space-y-4 lg:hidden px-4 pb-4">
            {sortedPosts.map((post, idx) => (
              <div key={post.id ?? `mobile-post-${idx}`} className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{post.title}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                        <span>{post.type}</span>
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
                    {post.status !== "Draft" && (
                      <button
                        onClick={() => onViewCandidates(post.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-emerald-400 px-3 py-2 text-[11px] font-semibold text-emerald-500 bg-white hover:bg-emerald-50 transition-colors"
                        title="View AI Shortlist"
                      >
                        <Bot size={14} />
                        AI Matches
                      </button>
                    )}
                    {post.status !== "Draft" && (
                      <button
                        onClick={() => router.push(`/users/employer/job-posts/${post.id}`)}
                        className="rounded-lg border border-indigo-400 px-3 py-2 text-[11px] font-semibold text-indigo-500 bg-white hover:bg-indigo-50 transition-colors"
                      >
                        View
                      </button>
                    )}
                    {post.status !== "Closed" && (
                      <button
                        onClick={() => onEdit(post.id)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-[11px] font-semibold text-gray-500 bg-white hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(post.id)}
                      disabled={deletingId === post.id}
                      className="rounded-lg border border-red-300 px-3 py-2 text-[11px] font-semibold text-red-600 bg-white hover:bg-red-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === post.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:block overflow-x-auto">
            <table className="table-auto min-w-full w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <ColHeader label="Job Title" />
                  <ColHeader label="Type" />
                  <ColHeader label="Closing Date" />
                  <ColHeader label="Status" />
                  <ColHeader label="Action" align="center" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedPosts.map((post, idx) => (
                  <tr key={post.id ?? `desktop-post-${idx}`} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-800">
                      {post.title}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-500">
                      {post.type}
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
                        {post.status !== "Draft" && (
                          <>
                            <button
                              onClick={() => onViewCandidates(post.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-400 text-emerald-500 bg-white text-xs font-semibold hover:bg-emerald-50 transition-colors"
                              title="View AI Shortlist"
                            >
                              <Bot size={14} />
                              AI Matches
                            </button>
                            <button
                              onClick={() => router.push(`/users/employer/job-posts/${post.id}`)}
                              className="px-4 py-1.5 rounded-lg border border-indigo-400 text-indigo-500 bg-white text-xs font-semibold hover:bg-indigo-50 transition-colors"
                            >
                              View
                            </button>
                          </>
                        )}

                        {post.status !== "Closed" && (
                          <button
                            onClick={() => onEdit(post.id)}
                            className="px-4 py-1.5 rounded-lg border border-gray-300 text-gray-500 bg-white text-xs font-semibold hover:bg-gray-50 transition-colors"
                          >
                            Edit
                          </button>
                        )}

                        <button
                          onClick={() => onDelete(post.id)}
                          disabled={deletingId === post.id}
                          className="px-4 py-1.5 rounded-lg border border-red-300 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === post.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}