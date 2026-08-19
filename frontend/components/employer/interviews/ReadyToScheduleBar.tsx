// ReadyToScheduleBar.tsx
// Bottom summary bar that shows selected date/time and action buttons.
// Updates live as date/time/type change.
// Buttons: Save as Draft | Remove | Schedule & Send Email

"use client";

import { Mail, Trash2, Video, Building2, Phone, CalendarCheck } from "lucide-react";
import { MeetingType } from "@/types/employer/interview.types";

interface Props {
  date: string;
  time: string;
  meetingType: MeetingType;
  location?: string;
  meetingLink?: string | null;
  candidateEmail?: string;
  onRemove: () => void;
  onSchedule: () => void;
  isScheduling?: boolean;
  hasEmailPreview?: boolean;  // disable Schedule until email is generated
  isDisabled?: boolean;       // disable while loading data
}

const MEETING_ICON: Record<MeetingType, React.ReactNode> = {
  ONLINE: <Video size={15} className="text-indigo-500" />,
  ONSITE: <Building2 size={15} className="text-indigo-500" />,
  PHONE:  <Phone size={15} className="text-indigo-500" />,
};

const MEETING_LABEL: Record<MeetingType, string> = {
  ONLINE: "Online (Google Meet)",
  ONSITE: "On-Site",
  PHONE:  "Phone Call",
};

function formatDisplay(date: string, time: string): string {
  if (!date || !time) return "Not set";
  try {
    const dt = new Date(`${date}T${time}`);
    return dt.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return `${date} at ${time}`;
  }
}

export default function ReadyToScheduleBar({
  date,
  time,
  meetingType,
  location,
  meetingLink,
  candidateEmail,
  onRemove,
  onSchedule,
  isScheduling = false,
  hasEmailPreview = false,
  isDisabled = false,
}: Props) {
  const displayDate = formatDisplay(date, time);
  const isReady = !!date && !!time;

  return (
    <div className="mt-6 bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">

      {/* ── Info row ── */}
      <div className="px-6 py-4 border-b border-gray-100 bg-linear-to-r from-indigo-50 to-white">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <CalendarCheck size={16} className="text-indigo-500 shrink-0" />
              <p className="text-sm font-semibold text-gray-900">
                {isReady ? displayDate : "Select a date and time to proceed"}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-6">
              {MEETING_ICON[meetingType]}
              <p className="text-xs text-gray-500">{MEETING_LABEL[meetingType]}</p>
              {meetingType === "ONSITE" && location && (
                <span className="text-xs text-gray-400">· {location}</span>
              )}
              {meetingType === "ONLINE" && meetingLink && (
                <a
                  href={meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-500 underline hover:text-indigo-700 truncate max-w-xs"
                >
                  {meetingLink}
                </a>
              )}
            </div>
            {candidateEmail && (
              <p className="text-xs text-gray-400 ml-6">
                <Mail size={16} className="inline mr-1" /> Invite will be sent to: <span className="font-medium text-gray-600">{candidateEmail}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">

        {/* Left: destructive action */}
        <button
          type="button"
          onClick={onRemove}
          disabled={isScheduling}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 size={14} />
          Remove
        </button>

        {/* Right: primary CTA */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSchedule}
            disabled={isScheduling || !isReady || !hasEmailPreview || isDisabled}
            title={isDisabled ? "Loading candidate and job post information..." : !hasEmailPreview ? "Generate email preview first" : ""}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-indigo-200"
          >
            {isScheduling ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Scheduling…
              </>
            ) : isDisabled ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading…
              </>
            ) : (
              <>
                <Mail size={14} />
                Schedule & Send Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}