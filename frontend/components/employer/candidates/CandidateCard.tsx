import { Check, Clock, Briefcase, CalendarPlus, UserRound } from "lucide-react";
import Image from "next/image";
import { CandidateInfo } from "@/types/employer/candidate.types";
import { getAvatarGradient } from "@/lib/employer/candidates.service";
import { useState } from "react";

interface Props {
  candidate: CandidateInfo;
  index: number;
  onViewProfile: (id: string) => void;
  onSchedule: (id: string) => void;
}



function matchStyle(score: number) {
  if (score >= 90) return { bg: "#ECFDF5", border: "#6EE7B7", text: "#059669" }; 
  if (score >= 75) return { bg: "#EEF2FF", border: "#A5B4FC", text: "#4F46E5" }; 
  return           { bg: "#FFFBEB", border: "#FCD34D", text: "#B45309" };         
}

export default function CandidateCard({ candidate, index, onViewProfile, onSchedule }: Props) {
  const grad      = candidate.avatarGradient ?? getAvatarGradient(index);
  const daysLabel = candidate.appliedDaysAgo === 1 ? "day" : "days";
  const ms        = matchStyle(candidate.matchScore);
  const [imgSrc, setImgSrc] = useState(`/images/avatar${candidate.id}.jpg`);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group bg-white border border-[#E8EBF4] rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:border-[#C7C4F4] hover:shadow-[0_8px_30px_rgba(79,70,229,0.10)] hover:-translate-y-[2px]">

      {/* ══ TOP: avatar · name · match badge ══ */}
      <div className="flex items-start justify-between gap-3">

        {/* Avatar + Identity */}
        <div className="flex items-center min-w-0 gap-3">
          {imgError ? (
            <div
              className="w-[52px] h-[52px] rounded-xl shrink-0 flex items-center justify-center text-[18px] font-black text-white shadow-sm"
              style={{ background: grad }}
            >
              {candidate.initial}
            </div>
          ) : (
            <Image
              src={imgSrc}
              alt={candidate.name}
              width={52}
              height={52}
              className="object-cover bg-gray-100 rounded-xl shrink-0"
              onError={() => {
                if (imgSrc.endsWith('.jpg')) {
                  setImgSrc(`/images/avatar${candidate.id}.png`);
                } else {
                  setImgError(true);
                }
              }}
            />
          )}
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-[#0F172A] leading-snug truncate">
              {candidate.name}
            </p>
            <p className="text-[12px] font-medium text-[#4F46E5] mt-[2px] truncate">
              {candidate.role}
            </p>
          </div>
        </div>

        {/* Match badge — score-driven color */}
        <div
          className="flex items-center gap-[5px] px-[10px] py-[5px] rounded-full border text-[11px] font-bold whitespace-nowrap shrink-0"
          style={{ background: ms.bg, borderColor: ms.border, color: ms.text }}
        >
          <Check size={11} strokeWidth={3} />
          {candidate.matchScore}% Match
        </div>
      </div>

      {/* ══ META: experience + applied date ══ */}
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-[11.5px] text-amber-600">
          <Briefcase size={12} strokeWidth={2} className="text-amber-600 shrink-0" />
          {candidate.experience} exp.
        </span>
        <span className="flex items-center gap-1.5 text-[11.5px] text-[#64748B]">
          <Clock size={12} strokeWidth={2} className="text-[#94A3B8] shrink-0" />
          Applied {candidate.appliedDaysAgo} {daysLabel} ago
        </span>
      </div>

      {/* ══ SKILLS — indigo tint tags ══ */}
      <div className="flex flex-wrap gap-[6px]">
        {candidate.skills.map((skill) => (
          <span
            key={skill}
            className="px-[10px] py-[4px] rounded-md bg-[#EEF2FF] text-[#4F46E5] text-[11px] font-medium border border-[#E0E7FF]"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* ══ DIVIDER ══ */}
      <div className="h-px bg-[#F1F3F9]" />

      {/* ══ ACTIONS ══ */}
      <div className="flex gap-[10px]">

        {/* Secondary — ghost style */}
        <button
          onClick={() => onViewProfile(candidate.id)}
          className="flex-1 flex items-center justify-center gap-[7px] py-[9px] rounded-xl border border-[#E0E7FF] bg-[#F8FAFF] text-[#4F46E5] text-[12px] font-semibold hover:bg-[#EEF2FF] hover:border-[#C7D2FE] transition-colors duration-150"
        >
          <UserRound size={13} strokeWidth={2} />
          View Profile
        </button>

        {/* Primary CTA — with shadow for visual importance */}
        <button
          onClick={() => onSchedule(candidate.id)}
          className="flex-1 flex items-center justify-center gap-[7px] py-[9px] rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white text-[12px] font-semibold shadow-[0_2px_8px_rgba(79,70,229,0.30)] hover:shadow-[0_4px_14px_rgba(79,70,229,0.40)] transition-all duration-150"
        >
          <CalendarPlus size={13} strokeWidth={2} />
          Schedule
        </button>
      </div>
    </div>
  );
}