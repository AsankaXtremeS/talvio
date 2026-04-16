// JobPostPanel.tsx
// Displays the job post details in the schedule interview page.
// Fetches real data from the backend using the jobPostId prop.
// Falls back to a skeleton loader while fetching.

"use client";

import { useEffect, useState } from "react";
import { Users, Briefcase, MapPin, ExternalLink } from "lucide-react";
import { JobPost } from "@/types/employer/jobPost.types";
import { getJobPostById } from "@/lib/employer/jobPosts.service";
import { useRouter } from "next/navigation";

interface Props {
  jobPostId?: string;       // Pass undefined → show static placeholder
  postId?: string;          // Alias accepted too
}

export default function JobPostPanel({ jobPostId, postId }: Props) {
  const id = jobPostId ?? postId;
  const router = useRouter();

  const [post, setPost] = useState<JobPost | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    getJobPostById(id)
      .then((data) => {
        if (mounted) {
          setPost(data);
          setError(null);
        }
      })
      .catch(() => {
        if (mounted) {
          setPost(null);
          setError("Failed to load job post");
        }
      });

    return () => { mounted = false; };
  }, [id]);

  const loading = Boolean(id) && !error && (!post || post.id !== id);

  // ── Skeleton ──
  if (loading) {
    return (
      <div className="flex flex-col min-h-0 p-6 bg-white border border-gray-100 shadow-sm rounded-xl animate-pulse">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-md bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-20 bg-gray-100 rounded-full" />
          <div className="h-6 w-20 bg-gray-100 rounded-full" />
        </div>
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
    );
  }

  // ── Error / no ID ──
  if (error || !post) {
    return (
      <div className="flex flex-col min-h-0 p-6 bg-white border border-red-100 shadow-sm rounded-xl">
        <p className="text-sm text-red-500">{error ?? "No job post selected."}</p>
      </div>
    );
  }

  const statusColor =
    post.status === "Active"
      ? "text-green-700 bg-green-100"
      : post.status === "Closed"
      ? "text-red-700 bg-red-100"
      : "text-gray-700 bg-gray-100";

  const initial = (post.companyName ?? post.title ?? "?")[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex flex-col min-h-0 p-6 bg-white border border-gray-100 shadow-sm rounded-xl">

      {/* ── Header: company logo + title ── */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 font-bold text-white bg-gray-900 rounded-md shrink-0">
            {initial}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 leading-snug">{post.title}</h3>
            <p className="text-sm text-blue-500">{post.companyName ?? "—"}</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColor}`}>
          {post.status}
        </span>
      </div>

      {/* ── Badges ── */}
      <div className="flex flex-wrap gap-2 mb-4">
        {post.employmentType && (
          <span className="px-3 py-1 text-xs text-blue-600 rounded-full bg-blue-50">
            {post.employmentType}
          </span>
        )}
        {post.workMode && (
          <span className="px-3 py-1 text-xs text-blue-600 rounded-full bg-blue-50">
            {post.workMode}
          </span>
        )}
        {post.type && (
          <span className="px-3 py-1 text-xs text-purple-600 rounded-full bg-purple-50">
            {post.type}
          </span>
        )}
      </div>

      {/* ── Meta ── */}
      <div className="flex items-center gap-4 pb-4 mb-4 text-sm text-gray-500 border-b border-gray-100">
        <div className="flex items-center gap-1 font-medium text-green-600">
          <Users size={16} />
          <span>{post.applicantsCount ?? 0} Applicants</span>
        </div>
        {post.location && (
          <>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{post.location}</span>
            </div>
          </>
        )}
        {post.closingDate && (
          <>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <div className="flex items-center gap-1">
              <Briefcase size={14} />
              <span>Closes {post.closingDate}</span>
            </div>
          </>
        )}
      </div>

      {/* ── Action ── */}
      <div className="flex justify-end mt-auto">
        <button
          onClick={() => id && router.push(`/users/employer/job-posts/${id}`)}
          className="flex items-center gap-2 px-6 py-2 font-medium text-indigo-600 transition-colors border-2 border-indigo-600 rounded-lg hover:bg-indigo-50"
        >
          <ExternalLink size={15} />
          View Post
        </button>
      </div>
    </div>
  );
}