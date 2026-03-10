/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { CandidateInfo, CandidateStatus } from "@/types/employer/candidate.types";
import { MOCK_CANDIDATES } from "@/lib/employer/candidates.service";
import CandidateFilterBar from "@/components/employer/candidates/CandidateFilterBar";
import CandidatesGrid from "@/components/employer/candidates/CandidatesGrid";

export default function CandidatesPage() {
  const router = useRouter();

  const [status, setStatus]   = useState<CandidateStatus>("Applied");
  const [query, setQuery]     = useState("");
  const [all, setAll]         = useState<CandidateInfo[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Fetch all candidates once on mount ──
     When backend is ready, replace MOCK_CANDIDATES with:
     const data = await getCandidates(status) — or fetch all and filter client-side */
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setAll(MOCK_CANDIDATES);
      setLoading(false);
    }, 300);
  }, []);

  /* ── Filtered list — derived from status + search query ── */
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return all.filter(
      (c) =>
        c.status === status &&
        (!q ||
          c.name.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q)))
    );
  }, [all, status, query]);

  /* ── Handlers ── */
  const handleViewProfile = (id: string) => {
    router.push(`/users/employer/candidates/${id}`);
  };

  const handleSchedule = (id: string) => {
    router.push(`/users/employer/interviews/schedule?candidateId=${id}`);
  };

  return (
    <div className="min-h-screen  px-[34px] pt-[28px] pb-10">

      {/* ── Filter bar (top) ── */}
      <CandidateFilterBar
        status={status}
        onStatusChange={(s) => { setStatus(s); setQuery(""); }}
        query={query}
        onQueryChange={setQuery}
      />

      {/* ── Page heading ── */}
      <div className="mb-[22px]">
        <div className="flex items-center gap-[10px] mb-1">
          <Users size={26} strokeWidth={2.2} className="text-[#4F46E5]" />
          <h1 className="text-3xl font-bold tracking-tight text-indigo-500 ">
            Candidates
          </h1>
        </div>
        <p className="text-[12.5px] text-[#ADADAD]">
          Manage and review all job applicants
        </p>
      </div>

      {/* ── Candidates grid ── */}
      {loading ? (
        /* Loading skeleton — 4 placeholder cards */
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-[#E3E5EF] rounded-[16px] p-[20px_22px] animate-pulse"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-[48px] h-[48px] rounded-full bg-[#E8EBF3] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-[#E8EBF3] rounded-full w-3/4" />
                  <div className="h-2.5 bg-[#E8EBF3] rounded-full w-1/2" />
                </div>
              </div>
              <div className="h-2.5 bg-[#E8EBF3] rounded-full w-2/3 mb-3" />
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-[#E8EBF3] rounded-full w-16" />
                <div className="h-6 bg-[#E8EBF3] rounded-full w-20" />
                <div className="h-6 bg-[#E8EBF3] rounded-full w-14" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-9 bg-[#E8EBF3] rounded-[10px]" />
                <div className="flex-1 h-9 bg-[#E8EBF3] rounded-[10px]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <CandidatesGrid
          candidates={filtered}
          onViewProfile={handleViewProfile}
          onSchedule={handleSchedule}
        />
      )}
    </div>
  );
}