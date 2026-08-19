import { Check, Clock, Briefcase, CalendarPlus, UserRound, RotateCcw } from "lucide-react";
import Image from "next/image";
import { CandidateInfo } from "@/types/candidate/candidate.types";
import { getAvatarGradient } from "@/lib/employer/candidates.service";
import { useState } from "react";

interface Props {
  candidate: CandidateInfo;
  index: number;
  onViewProfile: (id: string) => void;
  onSchedule: (id: string) => void;
  onMoveToApplied?: (id: string) => void;
  onUnshortlist?: (id: string) => void;
}

function matchStyle(score: number) {
  if (score >= 90) return { bg: "#ECFDF5", border: "#6EE7B7", text: "#059669" }; 
  if (score >= 75) return { bg: "#EEF2FF", border: "#A5B4FC", text: "#4F46E5" }; 
  return           { bg: "#FFFBEB", border: "#FCD34D", text: "#B45309" };         
}

export default function CandidateCard({ candidate, index, onViewProfile, onSchedule, onMoveToApplied, onUnshortlist }: Props) {
  const grad      = candidate.avatarGradient ?? getAvatarGradient(index);
  const daysLabel = candidate.appliedDaysAgo === 1 ? "day" : "days";
  const ms        = matchStyle(candidate.matchScore);
  const hasRealImage = !!candidate.avatarUrl;
  const [imgSrc, setImgSrc] = useState(candidate.avatarUrl || "");
  const [imgError, setImgError] = useState(!hasRealImage);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onViewProfile(candidate.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onViewProfile(candidate.id);
        }
      }}
      className="group flex flex-col gap-4 rounded-2xl border border-[#E8EBF4] bg-white p-5 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:border-[#C7C4F4] hover:shadow-[0_8px_30px_rgba(79,70,229,0.10)]"
    >

      {/* ══ TOP: avatar · name · match badge ══ */}
      <div className="flex items-start justify-between gap-3">

        {/* Avatar + Identity */}
        <div className="flex items-center min-w-0 gap-3">
          {imgError ? (
            <div
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl text-[18px] font-black text-white shadow-sm"
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
              className="object-cover bg-gray-100 rounded-xl shrink-0 h-[52px] w-[52px]"
              onError={() => {
                setImgError(true);
              }}
            />
          )}
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-[#0F172A] leading-snug truncate">
              {candidate.name}
            </p>
            <p className="mt-0.5 text-[12px] font-medium text-[#4F46E5] truncate">
              {candidate.role}
            </p>
          </div>
        </div>

        {/* Match badge — score-driven color */}
        <div
          className="flex items-center gap-1.25 rounded-full border px-2.5 py-1.25 text-[11px] font-bold whitespace-nowrap shrink-0"
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
      <div className="flex flex-wrap gap-1.5">
        {candidate.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-md border border-[#E0E7FF] bg-[#EEF2FF] px-2.5 py-1 text-[11px] font-medium text-[#4F46E5]"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* ══ DIVIDER ══ */}
      <div className="h-px bg-[#F1F3F9]" />

      {/* ══ ACTIONS ══ */}
      <div className="flex gap-2.5">

        {/* Secondary — ghost style */}
        <button
          onClick={() => onViewProfile(candidate.id)}
          className="flex-1 flex items-center justify-center gap-1.75 rounded-xl border border-[#E0E7FF] bg-[#F8FAFF] py-2.25 text-[12px] font-semibold text-[#4F46E5] transition-colors duration-150 hover:border-[#C7D2FE] hover:bg-[#EEF2FF]"
        >
          <UserRound size={13} strokeWidth={2} />
          View Profile
        </button>

        {/* If in Reviewed tab, provide quick Move to Applied button */}
        {candidate.status === "Reviewed" && onMoveToApplied ? (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onMoveToApplied(candidate.id);
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E0E7FF] bg-[#F8FAFF] px-3 py-2.25 text-[12px] font-semibold text-[#4F46E5] transition-colors duration-150 hover:border-[#C7D2FE] hover:bg-[#EEF2FF]"
            title="Move candidate back to Applied"
          >
            <RotateCcw size={13} strokeWidth={2} />
            To Applied
          </button>
        ) : null}

        {/* If in Shortlisted tab, provide quick Unshortlist button */}
        {candidate.status === "Shortlisted" && onUnshortlist ? (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onUnshortlist(candidate.id);
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-[#D1FAE5] bg-[#F0FDF4] px-3 py-2.25 text-[12px] font-semibold text-[#059669] transition-colors duration-150 hover:border-[#6EE7B7] hover:bg-[#DCFCE7]"
            title="Remove candidate from Shortlist"
          >
            <RotateCcw size={13} strokeWidth={2} />
            Unshortlist
          </button>
        ) : null}

        {/* Primary CTA — with shadow for visual importance */}
        <button
          onClick={(event) => {
            event.stopPropagation();
            onSchedule(candidate.id);
          }}
          className="flex-1 flex items-center justify-center gap-1.75 rounded-xl bg-[#4F46E5] py-2.25 text-[12px] font-semibold text-white shadow-[0_2px_8px_rgba(79,70,229,0.30)] transition-all duration-150 hover:bg-[#4338CA] hover:shadow-[0_4px_14px_rgba(79,70,229,0.40)] active:bg-[#3730A3]"
        >
          <CalendarPlus size={13} strokeWidth={2} />
          Schedule
        </button>
      </div>
    </div>
  );
}