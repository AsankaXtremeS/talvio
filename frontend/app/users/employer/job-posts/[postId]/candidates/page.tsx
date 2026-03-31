"use client";

import { use, useEffect, useMemo, useState } from "react";
import CandidateFilterBar from "@/components/employer/candidates/CandidateFilterBar";
import CandidatesGrid from "@/components/employer/candidates/CandidatesGrid";
import { getCandidates } from "@/lib/employer/candidates.service";
import { CandidateInfo, CandidateStatus } from "@/types/candidate/candidate.types";


interface Props {
  params: Promise<{ postId: string }>;
}

export default function PostCandidatesPage({ params }: Props) {
  
  const { postId } = use(params);

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
      {/* 3. Use the unwrapped postId variable here */}
      <h1 className="text-2xl font-bold text-indigo-500">Candidates for Post — {postId}</h1>
      
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