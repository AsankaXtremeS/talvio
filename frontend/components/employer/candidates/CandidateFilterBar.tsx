"use client";

import { Search, Users, Calendar, CheckCircle} from "lucide-react";
import { CandidateStatus } from "@/types/employer/candidate.types";

interface Props {
  status: CandidateStatus;
  onStatusChange: (s: CandidateStatus) => void;
  query: string;
  onQueryChange: (q: string) => void;
}

const PILLS: { label: CandidateStatus; icon: React.ReactNode }[] = [
  {
    label: "Applied",
    icon: <Users size={13} strokeWidth={2} />,
  },
  {
    label: "Shortlisted",
    icon: <Users size={13} strokeWidth={2} />,
  },
  {
    label: "Interview Scheduled",
    icon: <Calendar size={13} strokeWidth={2} />,
  },
  {
    label: "Hired",
    icon: <CheckCircle size={13} strokeWidth={2} />,
  },
];

export default function CandidateFilterBar({ status, onStatusChange, query, onQueryChange }: Props) {
  return (
    <div className="flex items-center gap-[10px] flex-wrap mb-6">

      {/* ── Search box ── */}
      <div className="relative flex-1 min-w-[180px] max-w-[280px]">
        <input
          type="text"
          placeholder="Search candidates"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full py-[10px] pl-[15px] pr-[42px] border border-[#E4E6EE] rounded-[11px] text-[13px] text-[#444] bg-white outline-none placeholder:text-[#BCBCC6] focus:border-[#A5B4FC] focus:ring-2 focus:ring-[#A5B4FC]/20 transition-all"
        />
        <Search
          size={15}
          strokeWidth={2}
          className="absolute right-[13px] top-1/2 -translate-y-1/2 text-[#C8CADB] pointer-events-none"
        />
      </div>

      {/* ── Status pills ── */}
      {PILLS.map(({ label, icon }) => {
        const active = status === label;
        return (
          <button
            key={label}
            onClick={() => onStatusChange(label)}
            className={`flex items-center gap-[6px] px-[15px] py-[9px] rounded-[11px] border text-[12.5px] font-semibold whitespace-nowrap transition-all
              ${active
                ? "border-[#4F46E5] bg-[#EEEEFF] text-[#4F46E5]"
                : "border-[#E4E6EE] bg-white text-[#777] hover:border-[#A5B4FC] hover:text-[#4F46E5] hover:bg-[#FAFBFF]"
              }`}
          >
            <span className={active ? "text-[#4F46E5]" : "text-[#ADADAD]"}>
              {icon}
            </span>
            {label}
          </button>
        );
      })}
    </div>
  );
}