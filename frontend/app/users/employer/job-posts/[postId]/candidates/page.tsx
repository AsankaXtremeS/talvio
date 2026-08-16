"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CandidateFilterBar from "@/components/employer/candidates/CandidateFilterBar";
import CandidatesGrid from "@/components/employer/candidates/CandidatesGrid";
import { getJobPostById } from "@/lib/employer/jobPosts.service";
import { getCandidates } from "@/lib/employer/candidates.service";
import type { JobPost } from "@/types/employer/jobPost.types";
import { CandidateInfo, CandidateStatus } from "@/types/candidate/candidate.types";

interface Props {
  params: Promise<{ postId: string }>;
}

export default function PostCandidatesPage({ params }: Props) {
  const { postId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialStatus = (searchParams.get("status") as CandidateStatus) || "Applied";
  const [status, setStatus] = useState<CandidateStatus>(initialStatus);
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<CandidateInfo[]>([]);
  const [jobPost, setJobPost] = useState<JobPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state when URL status query changes (e.g. back/forward navigation or redirect)
  useEffect(() => {
    const urlStatus = searchParams.get("status") as CandidateStatus | null;
    if (urlStatus && urlStatus !== status) {
      setStatus(urlStatus);
    }
  }, [searchParams]);

  const handleStatusChange = (newStatus: CandidateStatus) => {
    setStatus(newStatus);
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", newStatus);
    router.replace(`/users/employer/job-posts/${postId}/candidates?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    let mounted = true;

    setIsLoading(true);
    getCandidates(status, postId)
      .then((data) => {
        if (mounted) {
          setCandidates(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setCandidates([]);
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [status, postId]);

  useEffect(() => {
    let mounted = true;

    getJobPostById(postId)
      .then((data) => {
        if (mounted) setJobPost(data);
      })
      .catch(() => {
        if (mounted) setJobPost(null);
      });

    return () => {
      mounted = false;
    };
  }, [postId]);

  const filteredCandidates = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return candidates;
    }

    return candidates.filter((candidate) => {
      return (
        candidate.name.toLowerCase().includes(term) ||
        candidate.role.toLowerCase().includes(term) ||
        candidate.skills.some((skill) => skill.toLowerCase().includes(term))
      );
    });
  }, [candidates, query]);

  return (
    <div className="p-6 space-y-6">

      {/* ─── BACK BUTTON ────────────────────────────────────────────── */}
      <button
        onClick={() => router.push("/users/employer/job-posts")}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 transition-colors rounded-lg hover:text-gray-900 hover:bg-gray-100 w-fit"
      >
        <ArrowLeft size={16} />
        Back to Job Posts
      </button>

      {/* Used text-gray-900 to ensure the heading is clearly visible on the light background */}
      <h1 className="text-2xl font-bold text-gray-900">
        Candidates for Post — {jobPost?.title ?? postId}
      </h1>

      <CandidateFilterBar
        status={status}
        onStatusChange={handleStatusChange}
        query={query}
        onQueryChange={setQuery}
      />

      {/* ─── UPDATED GRID ROUTING ───────────────────────────────────── */}
      <CandidatesGrid
        candidates={filteredCandidates}
        isLoading={isLoading}
        onViewProfile={(id) => {
          // Pass postId so the profile page can update application status in context
          router.push(`/users/employer/candidates/${id}?postId=${postId}`);
        }}
        onSchedule={(id) => {
          // Route includes both postId and candidateProfileId.
          router.push(`/users/employer/job-posts/${postId}/candidates/${id}/schedule`);
        }}
      />
    </div>
  );
}