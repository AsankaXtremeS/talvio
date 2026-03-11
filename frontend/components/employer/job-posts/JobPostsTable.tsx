"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { JobPost } from "@/types/employer/jobPost.types";
import JobStatusBadge from "./JobStatusBadge";

interface JobPostsTableProps {
  posts: JobPost[];
  onEdit: (id: string) => void;
}

const ColHeader = ({ label }: { label: string }) => (
  <th className="px-4 py-3 text-sm font-semibold text-left text-gray-600">
    <span className="flex items-center gap-1 cursor-pointer select-none hover:text-gray-900">
      {label} <ChevronDown size={13} />
    </span>
  </th>
);

export default function JobPostsTable({ posts, onEdit }: JobPostsTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-hidden bg-white border border-gray-100 rounded-2xl">
      {/* Table header row */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800">Job Posts</h3>
        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
          View
        </button>
      </div>

      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <ColHeader label="Job Title" />
            <ColHeader label="Department" />
            <ColHeader label="Type" />
            <ColHeader label="Closed Date" />
            <ColHeader label="Status" />
            <ColHeader label="Action" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {posts.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-sm text-center text-gray-400">
                No job posts found. Click &quot;Post New Job&quot; to get started.
              </td>
            </tr>
          ) : (
            posts.map((post) => (
              <tr
                key={post.id}
                className="transition-colors hover:bg-gray-50"
              >
                {/* Title */}
                <td className="px-4 py-4 text-sm font-medium text-gray-800">
                  {post.title}
                </td>

                {/* Department */}
                <td className="px-4 py-4 text-sm text-gray-500">
                  {post.department}
                </td>

                {/* Type */}
                <td className="px-4 py-4 text-sm text-gray-500">
                  {post.type}
                </td>

                {/* Closed Date */}
                <td className="px-4 py-4 text-sm text-gray-500">
                  {post.closedDate}
                </td>

                {/* Status badge */}
                <td className="px-4 py-4">
                  <JobStatusBadge
                    status={post.status}
                    count={
                      post.status === "Closed"
                        ? post.applicantsCount
                        : undefined
                    }
                  />
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  {post.status === "Closed" ? (
                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-red-600 border border-red-400 rounded-full bg-red-50">
                      Closed ({post.applicantsCount})
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          router.push(`/users/employer/job-posts/${post.id}`)
                        }
                        className="px-4 py-1.5 rounded-lg border border-indigo-400 text-indigo-600
                                   text-xs font-semibold hover:bg-indigo-50 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onEdit(post.id)}
                        className="px-4 py-1.5 rounded-lg border border-gray-300 text-gray-600
                                   text-xs font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}