"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Calendar,
  Clock,
  User,
  Briefcase,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Trash2,
  Video,
  MapPin,
  Phone,
} from "lucide-react";
import { InterviewDTO } from "@/types/employer/interview.types";

interface InterviewCardProps {
  interview: InterviewDTO;
  openMenuId: string | null;
  onMenuClick: (id: string) => void;
  onCardClick: (interview: InterviewDTO) => void;
  onReschedule: (interview: InterviewDTO) => void;
  onCancel: (id: string) => void;
  getTypeIcon: (type: string) => React.ReactNode;
  getTypeLabel: (type: string, meetingLink?: string | null) => string;
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
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState<string | null>(null);

  const getMeetingBadgeStyle = (type: string) => {
    const t = type?.toLowerCase() ?? "";
    if (t === "online") return "bg-blue-50 text-blue-700 border-blue-200/80";
    if (t === "onsite") return "bg-purple-50 text-purple-700 border-purple-200/80";
    if (t === "phone") return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div
      key={iv.id}
      onClick={() => onCardClick(iv)}
      className="relative flex flex-col gap-4 rounded-2xl border border-gray-200/80 bg-white p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-indigo-300 hover:-translate-y-0.5 group overflow-hidden"
    >
      {/* Decorative Accent Line on left */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-blue-600 rounded-l-2xl" />

      {/* Top Header: Date, Time & Options Menu */}
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50/80 text-indigo-600 border border-indigo-100/80 shrink-0">
            <Calendar size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                {formatDate(iv.scheduledAt)}
              </h3>
              <span className="text-xs font-semibold text-gray-400">·</span>
              <span className="text-sm font-semibold text-indigo-600 flex items-center gap-1">
                <Clock size={13} className="text-indigo-500" />
                {formatTime(iv.scheduledAt)}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">UTC Timezone</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Format Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${getMeetingBadgeStyle(
              iv.meetingType
            )}`}
          >
            {getTypeIcon(iv.meetingType)}
            {getTypeLabel(iv.meetingType, iv.meetingLink)}
          </span>

          {/* Options button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick(openMenuId === iv.id ? "" : iv.id);
            }}
            className={`p-1.5 rounded-xl transition-colors ${
              openMenuId === iv.id
                ? "bg-gray-100 text-gray-900"
                : "text-gray-400 hover:text-gray-700 hover:bg-gray-100/80"
            }`}
            aria-label="Options"
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Options Dropdown */}
      {openMenuId === iv.id && (
        <div
          className="absolute right-4 top-14 z-30 w-48 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            disabled={isNavigating !== null}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!iv.jobPost?.id || !iv.candidate?.id || !iv.id) {
                alert("Interview data is incomplete. Please refresh and try again.");
                return;
              }
              setIsNavigating("reschedule");
              router.push(
                `/users/employer/job-posts/${iv.jobPost?.id}/candidates/${iv.candidate?.id}/schedule?interviewId=${iv.id}`
              );
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 active:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <RotateCcw size={14} className="text-indigo-500" />
            {isNavigating === "reschedule" ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              "Reschedule Interview"
            )}
          </button>

          <div className="my-1 border-t border-gray-100" />

          <button
            type="button"
            disabled={isNavigating !== null}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsNavigating("cancel");
              router.push(`/users/employer/interviews/${iv.id}/cancel`);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Trash2 size={14} className="text-red-500" />
            {isNavigating === "cancel" ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              "Cancel Interview"
            )}
          </button>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-100/80 ml-2" />

      {/* Candidate & Job Info Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
        {/* Candidate Info */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/80 border border-gray-100">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 text-xs font-bold text-indigo-700 border border-indigo-200/50 shadow-xs">
            {getInitials(iv.candidate?.name ?? "?")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Candidate</p>
            <p className="text-sm font-bold text-gray-900 truncate">{iv.candidate?.name ?? "—"}</p>
          </div>
        </div>

        {/* Job Position Info */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/80 border border-gray-100">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
            <Briefcase size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Job Position</p>
            <p className="text-sm font-bold text-gray-900 truncate">{iv.jobPost?.title ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* Bottom Link or Location Indicator & View Action */}
      <div className="flex items-center justify-between pt-1 pl-2 text-xs">
        {iv.meetingType === "ONLINE" && iv.meetingLink ? (
          <a
            href={iv.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold truncate max-w-[75%]"
          >
            <Video size={14} className="shrink-0 text-indigo-500" />
            <span className="truncate">{iv.meetingLink}</span>
            <ExternalLink size={12} className="shrink-0" />
          </a>
        ) : iv.meetingType === "ONSITE" && iv.location ? (
          <span className="inline-flex items-center gap-1.5 text-gray-600 font-medium truncate max-w-[75%]">
            <MapPin size={14} className="shrink-0 text-purple-600" />
            <span className="truncate">{iv.location}</span>
          </span>
        ) : (
          <span className="text-gray-400 font-medium">Scheduled interview</span>
        )}

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
          Details
          <ChevronRight size={14} />
        </span>
      </div>
    </div>
  );
}

