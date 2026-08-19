// ApplicantPanel.tsx
// Displays candidate info in the schedule interview page.
// Fetches real candidate data using candidateProfileId.

"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { CandidateInfo } from "@/types/candidate/candidate.types";
import { getCandidateById } from "@/lib/employer/candidates.service";

interface Props {
  candidateId?: string;
  candidateProfileId?: string;
}

export default function ApplicantPanel({ candidateId, candidateProfileId }: Props) {
  const id = candidateProfileId ?? candidateId;

  const [candidate, setCandidate] = useState<CandidateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    getCandidateById(id)
      .then((data) => {
        if (mounted) {
          setCandidate(data);
          setError(null);
        }
      })
      .catch(() => {
        if (mounted) {
          setCandidate(null);
          setError("Failed to load candidate info");
        }
      });

    return () => { mounted = false; };
  }, [id]);

  const loading = Boolean(id) && !error && (!candidate || candidate.id !== id);

  // ── Skeleton ──
  if (loading) {
    return (
      <div className="flex flex-col min-h-0 p-4 bg-white border border-gray-100 shadow-sm rounded-xl animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 w-16 rounded-full bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error or no data ──
  if (error || !candidate) {
    return (
      <div className="flex flex-col min-h-0 p-4 bg-white border border-red-100 shadow-sm rounded-xl">
        <p className="text-sm text-red-500">{error ?? "Candidate not found."}</p>
      </div>
    );
  }

  // Get initials from name
  const initials = candidate.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const scoreColor =
    candidate.matchScore >= 90
      ? "text-green-600 border-green-200 bg-green-50"
      : candidate.matchScore >= 75
      ? "text-indigo-600 border-indigo-200 bg-indigo-50"
      : "text-amber-600 border-amber-200 bg-amber-50";

  return (
    <div className="flex flex-col min-h-0 p-2 bg-white border border-gray-100 shadow-sm rounded-xl" style={{maxHeight:'180px'}}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Avatar — gradient fallback */}
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white shrink-0"
            style={{ background: candidate.avatarGradient ?? "linear-gradient(135deg,#4F46E5,#7C3AED)" }}
          >
            {initials}
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">{candidate.name}</h3>
            <p className="text-xs text-blue-500">{candidate.role}</p>
          </div>
        </div>

        {/* Match score badge */}
        <span className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium border rounded-full ${scoreColor}`}>
          <CheckCircle2 size={13} />
          {candidate.matchScore}% Match
        </span>
      </div>

      {/* ── Meta ── */}
      <p className="mb-2 text-xs text-gray-500">
        {candidate.experience} experience · Applied {candidate.appliedDaysAgo}{" "}
        {candidate.appliedDaysAgo === 1 ? "day" : "days"} ago
      </p>

      {/* ── Skills ── */}
      <div className="flex flex-wrap gap-1 pb-2 mb-2 border-b border-gray-100">
        {candidate.skills.map((skill) => (
          <span
            key={skill}
            className="px-3 py-1 text-xs text-blue-700 bg-blue-100 rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* ── Email info ── */}
      <p className="mb-4 text-xs text-gray-400 truncate">
        <Mail size={16} className="inline mr-1" /> {candidate.email}
      </p>

      {/* ── CTA — Note: candidate profile not implemented yet ── */}
      <div className="flex justify-end mt-auto">
        <span className="px-4 py-2 text-xs font-medium text-gray-400 border border-dashed border-gray-200 rounded-lg cursor-not-allowed select-none">
          Profile view coming soon
        </span>
      </div>
    </div>
  );
}