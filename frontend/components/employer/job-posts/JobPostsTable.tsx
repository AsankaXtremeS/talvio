"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, Bot } from "lucide-react";
import { JobPost } from "@/types/employer/jobPost.types";
import JobStatusBadge from "./JobStatusBadge";

interface JobPostsTableProps {
  posts: JobPost[];
  onEdit: (id: string) => void;
  onViewCandidates: (id: string) => void;
}

const ColHeader = ({ label }: { label: string }) => (
  <th className="px-4 py-3 text-sm font-semibold text-left text-gray-600">
    <span className="flex items-center gap-1 cursor-pointer select-none hover:text-gray-900">
      {label} <ChevronDown size={13} />
    </span>
  </th>
);

export default function JobPostsTable({ posts, onEdit, onViewCandidates }: JobPostsTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-hidden bg-white border border-gray-100 rounded-2xl ">
      {/* Table header row */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800">Job Posts</h3>
      </div>

      <table className="w-full">
        <thead className="bg-gray-50 sticky top-0 z-10">
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
                    <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-300 rounded-full bg-white">
                      Closed ({post.applicantsCount})
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      
                      {/* ONLY SHOW AI MATCHES IF NOT A DRAFT */}
                      {post.status !== "Draft" && (
                        <button
                          onClick={() => onViewCandidates(post.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-400 text-emerald-500
                                     bg-white text-xs font-semibold hover:bg-emerald-50 transition-colors"
                          title="View AI Shortlist"
                        >
                          <Bot size={14} />
                          AI Matches
                        </button>
                      )}

                      <button
                        onClick={() =>
                          router.push(`/users/employer/job-posts/${post.id}`)
                        }
                        className="px-4 py-1.5 rounded-lg border border-indigo-400 text-indigo-500
                                   bg-white text-xs font-semibold hover:bg-indigo-50 transition-colors"
                      >
                        View
                      </button>
                      
                      <button
                        onClick={() => onEdit(post.id)}
                        className="px-4 py-1.5 rounded-lg border border-gray-300 text-gray-500
                                   bg-white text-xs font-semibold hover:bg-gray-50 transition-colors"
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