"use client";

import { Search, Users, Calendar, CheckCircle, Bot } from "lucide-react";
import { CandidateStatus } from "@/types/candidate/candidate.types";

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
    label: "AI Matches",
    icon: <Bot size={13} strokeWidth={2} />,
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
    <div className="mb-6 flex flex-wrap items-center gap-2.5">

      {/* ── Search box ── */}
      <div className="relative max-w-72 min-w-44 flex-1">
        <input
          type="text"
          placeholder="Search candidates"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full rounded-xl border border-[#E4E6EE] bg-white py-2.5 pl-4 pr-10 text-[13px] text-[#444] outline-none transition-all placeholder:text-[#BCBCC6] focus:border-[#A5B4FC] focus:ring-2 focus:ring-[#A5B4FC]/20"
        />
        <Search
          size={15}
          strokeWidth={2}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#C8CADB]"
        />
      </div>

      {/* ── Status pills ── */}
      {PILLS.map(({ label, icon }) => {
        const active = status === label;
        return (
          <button
            key={label}
            onClick={() => onStatusChange(label)}
            className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-[12.5px] font-semibold whitespace-nowrap transition-all
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