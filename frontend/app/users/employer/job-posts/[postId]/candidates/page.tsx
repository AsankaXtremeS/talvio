"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation"; // <-- Added for navigation
import { ArrowLeft } from "lucide-react"; // <-- Added for the back icon
import CandidateFilterBar from "@/components/employer/candidates/CandidateFilterBar";
import CandidatesGrid from "@/components/employer/candidates/CandidatesGrid";
import { getCandidates } from "@/lib/employer/candidates.service";
import { CandidateInfo, CandidateStatus } from "@/types/candidate/candidate.types";

interface Props {
  params: Promise<{ postId: string }>;
}

export default function PostCandidatesPage({ params }: Props) {
  const { postId } = use(params);
  const router = useRouter(); // <-- Initialize the router

  const [status, setStatus] = useState<CandidateStatus>("Applied");
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<CandidateInfo[]>([]);

  useEffect(() => {
    let mounted = true;

    getCandidates(status)
      .then((data) => {
        if (mounted) {
          setCandidates(data);
        }
      })
      .catch(() => {
        if (mounted) {
          setCandidates([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, [status]);

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
        Candidates for Post — {postId}
      </h1>
      
      <CandidateFilterBar
        status={status}
        onStatusChange={setStatus}
        query={query}
        onQueryChange={setQuery}
      />
      
      <CandidatesGrid
        candidates={filteredCandidates}
        onViewProfile={(id) => {
          console.log("View profile", id);
        }}
        onSchedule={(id) => {
          console.log("Schedule interview", id);
        }}
      />
    </div>
  );
}