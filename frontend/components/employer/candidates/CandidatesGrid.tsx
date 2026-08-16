import { Users } from "lucide-react";
import { CandidateInfo } from "@/types/candidate/candidate.types";
import CandidateCard from "./CandidateCard";

interface Props {
  candidates: CandidateInfo[];
  isLoading?: boolean;
  onViewProfile: (id: string) => void;
  onSchedule: (id: string) => void;
  onMoveToApplied?: (id: string) => void;
}

export default function CandidatesGrid({ candidates, isLoading = false, onViewProfile, onSchedule, onMoveToApplied }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        <p className="text-[13.5px] font-medium text-[#6B7280]">Loading candidates...</p>
      </div>
    );
  }

  /* ── Empty state ── */
  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Users size={38} strokeWidth={1.5} className="text-[#D0D3E0]" />
        <p className="text-[13.5px] font-medium text-[#ADADAD]">
          No candidates found for this status.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 🚀 Updated Grid: 1 col on mobile, 2 on tablets, 3 on large desktop screens */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {candidates.map((candidate, i) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            index={i}
            onViewProfile={onViewProfile}
            onSchedule={onSchedule}
            onMoveToApplied={onMoveToApplied}
          />
        ))}
      </div>
    </>
  );
}