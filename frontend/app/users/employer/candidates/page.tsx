/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users } from "lucide-react";
import { CandidateInfo, CandidateStatus } from "@/types/candidate/candidate.types";
import { getCandidates } from "@/lib/employer/candidates.service";
import CandidateFilterBar from "@/components/employer/candidates/CandidateFilterBar";
import CandidatesGrid from "@/components/employer/candidates/CandidatesGrid";

// Clear the offline job-posts cache so stale localStorage data doesn't
// persist after the database recovers from a 503 outage.
function clearOfflineJobPostsCache() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("employerOfflineJobPosts");
  } catch {
    // Ignore storage errors
  }
}

export default function CandidatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("postId"); // Get postId from URL if available

  const [status, setStatus]   = useState<CandidateStatus>("Applied");
  const [query, setQuery]     = useState("");
  const [all, setAll]         = useState<CandidateInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Clear stale offline cache on mount so DB-recovered data is fetched fresh
  useEffect(() => {
    clearOfflineJobPostsCache();
  }, []);

  // Fetch candidate data directly from real API
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const fetchAll = async () => {
      try {
        const data = await getCandidates(status, postId || undefined);
        if (mounted) {
          setAll(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("[CandidatesPage] Failed to fetch candidates:", err);
        if (mounted) {
          setAll([]);
          setLoading(false);
        }
      }
    };

    fetchAll();
    return () => { mounted = false; };
  }, [status, postId]);

  /* ── Filtered list — derived from status + search query ── */
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return all.filter((c) => {
      const matchesStatus =
        status === "AI Matches"
          ? c.status === "Applied" && c.matchScore >= 85
          : c.status === status;

      return (
        matchesStatus &&
        (!q ||
          c.name.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q)))
      );
    });
  }, [all, status, query]);

  /* ── Handlers ── */
  const handleViewProfile = (id: string) => {
    router.push(`/users/employer/candidates/${id}`);
  };

  const handleSchedule = (id: string) => {
    const url = `/users/employer/candidates/${id}/schedule${postId ? `?postId=${postId}` : ""}`;
    router.push(url);
  };

  return (
    <div className="min-h-screen px-8.5 pt-7 pb-10">

      {/* ── Filter bar (top) ── */}
      <CandidateFilterBar
        status={status}
        onStatusChange={(s) => { setStatus(s); setQuery(""); }}
        query={query}
        onQueryChange={setQuery}
      />

      {/* ── Page heading ── */}
      <div className="mb-5.5">
        <div className="mb-1 flex items-center gap-2.5">
          <Users size={26} strokeWidth={2.2} className="text-[#4F46E5]" />
          <h1 className="text-3xl font-bold tracking-tight text-indigo-500">
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
              className="animate-pulse rounded-2xl border border-[#E3E5EF] bg-white p-[20px_22px]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-[#E8EBF3] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-[#E8EBF3] rounded-full w-3/4" />
                  <div className="h-2.5 bg-[#E8EBF3] rounded-full w-1/2" />
                </div>
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