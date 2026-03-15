"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Pencil } from "lucide-react";
import { JobPost } from "@/types/employer/jobPost.types";
import JobPostForm from "@/components/employer/job-posts/JobPostForm";

// Mock data — remove when backend is ready
const MOCK_POSTS: Record<string, JobPost> = {
  "1": { id: "1", title: "Frontend Developer", department: "Engineering", type: "Job",        closedDate: "2024-04-26", status: "Draft"  },
  "2": { id: "2", title: "UI/UX Designer",     department: "Design",      type: "Internship", closedDate: "2024-04-26", status: "Active" },
};

export default function EditJobPostPage() {
  const params = useParams<{ postId?: string | string[] }>();
  const postId = useMemo(() => {
    const raw = params?.postId;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const post = useMemo<JobPost | null>(() => {
    if (!postId) {
      return null;
    }

    return MOCK_POSTS[postId] ?? null;
  }, [postId]);

  if (!post) {
    return (
      <div className="p-8 text-sm text-gray-400">Loading...</div>
    );
  }

  return (
    <div className="p-8 bg-[#F4F6FB] min-h-screen">
      <div className="flex items-center gap-2.5 mb-6">
        <Pencil size={20} className="text-indigo-500" />
        <h1 className="text-2xl font-bold text-indigo-600">Edit Job Post</h1>
      </div>
      <JobPostForm
        postId={post.id}
        initialData={{
          title:          post.title,
          department:     post.department,
          type:           post.type,
          closedDate:     post.closedDate,
          status:         post.status,
          location:       post.location ?? "",
          salaryMin:      post.salaryMin?.toString() ?? "",
          salaryMax:      post.salaryMax?.toString() ?? "",
          description:    post.description ?? "",
          requirements:   post.requirements ?? "",
          workMode:       post.workMode ?? "On site",
          employmentType: post.employmentType ?? "Full-time",
        }}
      />
    </div>
  );
}