// ConfirmationModal.tsx
// Shown when employer clicks "Schedule & Send Email".
// Displays a summary of what will be sent and asks for confirmation.
// On confirm: sends the API call. On cancel: modal closes.

"use client";

import { AlertTriangle, Mail, Calendar, User } from "lucide-react";
import { MeetingType } from "@/types/employer/interview.types";

interface Props {
  isOpen: boolean;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  scheduledAt: string;   // ISO string
  meetingType: MeetingType;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const MEETING_LABEL: Record<MeetingType, string> = {
  ONLINE: "Online · Google Meet",
  ONSITE: "On-Site",
  PHONE:  "Phone Call",
};

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
      timeZoneName: "short",
    });
  } catch {
    return iso;
  }
}

export default function ConfirmationModal({
  isOpen,
  candidateName,
  candidateEmail,
  jobTitle,
  scheduledAt,
  meetingType,
  onConfirm,
  onCancel,
  isLoading = false,
}: Props) {
  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: "fadeInScale 0.18s ease" }}
      >
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100">
              <AlertTriangle size={20} className="text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Confirm & Send Email</h2>
          </div>
          <p className="text-sm text-gray-500 ml-13">
            This will send a confirmation email to the candidate immediately. This action cannot be undone.
          </p>
        </div>

        {/* ── Summary card ── */}
        <div className="px-6 py-4 space-y-3">

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <User size={15} className="text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Candidate</p>
              <p className="text-sm font-semibold text-gray-900">{candidateName}</p>
              <p className="text-xs text-gray-400">{candidateEmail}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <Calendar size={15} className="text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Interview Details</p>
              <p className="text-sm font-semibold text-gray-900">{jobTitle}</p>
              <p className="text-xs text-gray-600 mt-0.5">{formatDateTime(scheduledAt)}</p>
              <p className="text-xs text-gray-400">{MEETING_LABEL[meetingType]}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
            <Mail size={15} className="text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-sm text-indigo-700">
              An invitation email will be sent to <strong>{candidateEmail}</strong> with all interview details.
            </p>
          </div>
        </div>

        {/* ── Buttons ── */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Mail size={15} />
                Confirm & Send
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}