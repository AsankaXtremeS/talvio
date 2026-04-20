"use client";

import { MoreVertical } from "lucide-react";
import { InterviewDTO } from "@/types/employer/interview.types";

interface InterviewCardProps {
  interview: InterviewDTO;
  openMenuId: string | null;
  onMenuClick: (id: string) => void;
  onCardClick: (interview: InterviewDTO) => void;
  onReschedule: (interview: InterviewDTO) => void;
  onCancel: (id: string) => void;
  getTypeIcon: (type: string) => React.ReactNode;
  getTypeLabel: (type: string) => string;
  getInitials: (name: string) => string;
  formatDate: (iso: string) => string;
  formatTime: (iso: string) => string;
}

export default function InterviewCard({
  interview: iv,
  openMenuId,
  onMenuClick,
  onCardClick,
  onReschedule,
  onCancel,
  getTypeIcon,
  getTypeLabel,
  getInitials,
  formatDate,
  formatTime,
}: InterviewCardProps) {
  return (
    <div
      key={iv.id}
      onClick={() => onCardClick(iv)}
      className="relative flex flex-col gap-3 rounded-2xl border border-[#dbe7ff] bg-white p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-indigo-400 hover:-translate-y-0.5 group"
    >
      {/* Options menu button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onMenuClick(openMenuId === iv.id ? "" : iv.id);
        }}
        className={`absolute p-1.5 rounded-lg top-4 right-4 z-20 transition-colors
          ${openMenuId === iv.id ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"}`}
      >
        <MoreVertical size={18} />
      </button>

      {/* Dropdown */}
      {openMenuId === iv.id && (
        <div className="absolute right-4 top-12 z-30 w-44 rounded-xl border border-[#dbe7ff] bg-white py-1.5 shadow-lg animate-in fade-in zoom-in-95 duration-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              console.log("[Reschedule Button] Clicked - Interview ID:", iv.id);
              console.log("[Reschedule Button] Data:", {
                interviewId: iv.id,
                jobPostId: iv.jobPost?.id,
                candidateId: iv.candidate?.id,
              });

              // Verify data exists before navigating
              if (!iv.jobPost?.id || !iv.candidate?.id || !iv.id) {
                console.error("[Reschedule Button] Missing data:", {
                  jobPostId: iv.jobPost?.id,
                  candidateId: iv.candidate?.id,
                  interviewId: iv.id,
                });
                alert("Interview data is incomplete. Please refresh and try again.");
                return;
              }

              // Call the reschedule handler
              onReschedule(iv);
            }}
            className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100"
          >
            Reschedule
          </button>
          <div className="my-1 border-t border-gray-100" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel(iv.id);
            }}
            className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Cancel Interview
          </button>
        </div>
      )}

      {/* Date/time + icon */}
      <div className="flex items-center gap-3 pr-10">
        {getTypeIcon(iv.meetingType)}
        <span className="text-lg font-bold text-gray-800 tracking-tight">
          {formatDate(iv.scheduledAt)}, {formatTime(iv.scheduledAt)}
        </span>
      </div>

      <div className="my-0.5 border-t border-gray-100" />

      {/* Candidate pill */}
      <div className="flex items-center gap-2 w-fit px-3 py-1.5 bg-[#F5F6F8] rounded-xl">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-100 to-purple-100 text-[10px] font-bold text-indigo-700">
          {getInitials(iv.candidate?.name ?? "?")}
        </div>
        <span className="text-sm font-medium text-gray-900">{iv.candidate?.name ?? "—"}</span>
      </div>

      {/* Role + type pill */}
      <div className="flex items-center gap-2 w-fit px-3 py-1.5 bg-[#F5F6F8] rounded-xl">
        <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
        <span className="text-sm font-medium text-gray-600">
          {iv.jobPost?.title ?? "—"} · {getTypeLabel(iv.meetingType)} Interview
        </span>
      </div>

      {/* Meet link if online */}
      {iv.meetingType === "ONLINE" && iv.meetingLink && (
        <a
          href={iv.meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-500 underline ml-1 hover:text-indigo-700 truncate"
        >
          {iv.meetingLink}
        </a>
      )}
      {iv.meetingType === "ONSITE" && iv.location && (
        <p className="text-xs text-gray-400 ml-1">📍 {iv.location}</p>
      )}
    </div>
  );
}
