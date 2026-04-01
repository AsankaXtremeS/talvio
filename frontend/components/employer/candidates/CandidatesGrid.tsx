import { Users } from "lucide-react";
import { CandidateInfo } from "@/types/candidate/candidate.types";
import CandidateCard from "./CandidateCard";

interface Props {
  candidates: CandidateInfo[];
  onViewProfile: (id: string) => void;
  onSchedule: (id: string) => void;
}

export default function CandidatesGrid({ candidates, onViewProfile, onSchedule }: Props) {
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
          />
        ))}
      </div>
    </>
  );
}