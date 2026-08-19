"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { Pencil } from "lucide-react";
import { JobPost } from "@/types/employer/jobPost.types";
import JobPostForm from "@/components/employer/job-posts/JobPostForm";
import { getJobPostById } from "@/lib/employer/jobPosts.service";

export default function EditJobPostPage() {
  const params = useParams<{ postId?: string | string[] }>();
  const postId = useMemo(() => {
    const raw = params?.postId;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const [post, setPost] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Fetch real post data from backend ──
  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getJobPostById(postId);
        setPost(data);
      } catch (err: unknown) {
        console.error("Failed to load job post:", err);
        setError("Job post not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return <div className="p-8 text-sm text-gray-400">Loading...</div>;
  }

  if (error || !post) {
    return <div className="p-8 text-sm text-red-400">{error || "Post not found."}</div>;
  }

  return (
    <div className="p-8 bg-[#F4F6FB] min-h-screen">
      <div className="flex items-center gap-2.5 mb-6">
        <Pencil size={20} className="text-indigo-500" />
        <h1 className="text-2xl font-bold text-indigo-600">Edit Job Post</h1>
        {post.isOffline && (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800 ring-1 ring-yellow-200">
            Offline draft
          </span>
        )}
      </div>
      <JobPostForm
        postId={post.id}
        initialData={{
          title:          post.title,
          type:           post.type,
          closingDate:    post.closingDate,
          status:         post.status,
          location:       post.location ?? "",
          description:    post.description ?? "",
          responsibilities: post.responsibilities ?? "",
          requirements:   post.requirements ?? "",
          additionalInformation: post.additionalInformation ?? "",
          skills:         Array.isArray(post.skills)
            ? post.skills.join(", ")
            : typeof post.skills === "string"
              ? post.skills
              : "",
          workMode:       post.workMode ?? "On site",
          employmentType: post.employmentType ?? "Full-time",
        }}
      />
    </div>
  );
}
