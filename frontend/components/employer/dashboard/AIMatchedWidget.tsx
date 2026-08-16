import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import type { CandidateInfo } from "@/types/candidate/candidate.types";

import { getAvatarGradient } from "@/lib/employer/candidates.service";

interface AIMatchedWidgetProps {
  candidates: CandidateInfo[];
  isLoading?: boolean;
  onViewProfile?: (candidateId: string, jobPostId?: string) => void;
}

function CandidateAvatar({ candidate, index }: { candidate: CandidateInfo; index: number }) {
  const [imgError, setImgError] = useState(false);

  if (candidate.avatarUrl && !imgError) {
    return (
      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-indigo-50 border border-slate-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={candidate.avatarUrl}
          alt={candidate.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const grad = candidate.avatarGradient ?? getAvatarGradient(index);
  const initial = candidate.initial || candidate.name?.charAt(0)?.toUpperCase() || "C";

  return (
    <div
      style={{ background: grad }}
      className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0 text-white font-semibold text-sm shadow-xs"
    >
      {initial}
    </div>
  );
}

export default function AIMatchedWidget({ candidates, isLoading, onViewProfile }: AIMatchedWidgetProps) {
  const roles = useMemo(
    () => ["Show All", ...Array.from(new Set(candidates.map((candidate) => candidate.role)))],
    [candidates]
  );

  const [selectedRole, setSelectedRole] = useState("Show All");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredCandidates = useMemo(() => {
    const sorted = [...candidates].sort((a, b) => b.matchScore - a.matchScore);
    if (selectedRole === "Show All") {
      return sorted.slice(0, 3);
    }
    return sorted.filter((candidate) => candidate.role === selectedRole);
  }, [candidates, selectedRole]);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-slate-200/70">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div>
          <h2 className="font-semibold text-gray-900">Top AI-Matched Candidates</h2>
          <p className="text-xs text-slate-500">Filtered by role and AI score</p>
        </div>
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((value) => !value)}
            className="flex items-center gap-2 rounded-2xl border border-indigo-200 bg-white px-3 py-2 text-sm text-indigo-600 transition hover:bg-indigo-50"
          >
            {selectedRole}
            <ChevronDown
              size={14}
              className={dropdownOpen ? "rotate-180 transition-transform duration-200" : "transition-transform duration-200"}
            />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 z-50 mt-2 min-w-[160px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              {roles.map((role) => {
                const roleClassName =
                  selectedRole === role
                    ? "w-full text-left px-4 py-2.5 text-sm font-semibold text-indigo-700 bg-indigo-50"
                    : "w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50";
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role);
                      setDropdownOpen(false);
                    }}
                    className={roleClassName}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Loading AI matches…</div>
        ) : filteredCandidates.length > 0 ? (
          filteredCandidates.map((candidate, idx) => (
            <div
              key={candidate.id}
              role={onViewProfile ? "button" : undefined}
              tabIndex={onViewProfile ? 0 : undefined}
              onClick={onViewProfile ? () => onViewProfile(candidate.id, candidate.jobPostId) : undefined}
              onKeyDown={
                onViewProfile
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onViewProfile(candidate.id, candidate.jobPostId);
                      }
                    }
                  : undefined
              }
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 cursor-pointer transition hover:border-slate-300 hover:bg-slate-100"
            >
              <CandidateAvatar candidate={candidate} index={idx} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{candidate.name}</p>
                <p className="truncate text-xs text-slate-500">{candidate.role}</p>
              </div>
              <div className="min-w-[90px] text-right">
                <p className="text-xs text-slate-500">AI score</p>
                <p className="text-sm font-semibold text-slate-900">{candidate.matchScore}%</p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No AI-matched candidates found yet.</div>
        )}
      </div>
    </div>
  );
}
