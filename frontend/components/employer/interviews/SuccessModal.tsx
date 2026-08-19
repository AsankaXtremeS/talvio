// SuccessModal.tsx
// Shown after the interview email is sent successfully.
// Displays: confirmation message, candidate name, job title,
// interview date/time, meeting details, and link to interviews page.

"use client";

import { CheckCircle2, XCircle, CalendarDays, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { MeetingType } from "@/types/employer/interview.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  type?: "scheduled" | "cancelled";
  candidateName?: string;
  candidateEmail?: string;
  jobTitle?: string;
  scheduledAt?: string;     // ISO string
  meetingType?: MeetingType;
  meetingLink?: string | null;
  location?: string | null;
  emailSentAt?: string | null;
}

const detectMeetingProvider = (link?: string | null) => {
  if (!link) return "Video Call";
  const url = link.toLowerCase();
  if (url.includes("teams.microsoft.com") || url.includes("teams.live.com")) {
    return "Microsoft Teams";
  }
  if (url.includes("meet.google.com")) {
    return "Google Meet";
  }
  if (url.includes("skype.com") || url.startsWith("skype:")) {
    return "Skype";
  }
  return "Video Call";
};

const MEETING_LABEL: Record<string, string> = {
  ONLINE: "Online",
  ONSITE: "On-Site",
  PHONE:  "Phone Call",
};

function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

export default function SuccessModal({
  isOpen,
  onClose,
  type = "scheduled",
  candidateName,
  candidateEmail,
  jobTitle,
  scheduledAt,
  meetingType,
  meetingLink,
  location,
  emailSentAt,
}: Props) {
  const router = useRouter();
  if (!isOpen) return null;

  const isCancelled = type === "cancelled";
  const emailDelivered = !isCancelled ? !!emailSentAt : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: "fadeInScale 0.18s ease" }}
      >
        {/* ── Top icon ── */}
        <div className="px-6 pt-8 pb-4 text-center border-b border-gray-100">
          <div className={`flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full ${isCancelled ? "bg-red-100" : emailDelivered ? "bg-green-100" : "bg-yellow-100"}`}>
            {isCancelled ? (
              <XCircle size={32} className="text-red-600" />
            ) : (
              <CheckCircle2 size={32} className={emailDelivered ? "text-green-600" : "text-yellow-600"} />
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {isCancelled ? "Interview Cancelled ❌" : "Interview Scheduled! 🎉"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {isCancelled ? (
              <>
                The cancellation email has been sent to{" "}
                <span className="font-semibold text-gray-700">{candidateName ?? "the candidate"}</span>.
              </>
            ) : emailDelivered ? (
              <>
                The invitation email has been sent to{" "}
                <span className="font-semibold text-gray-700">{candidateName ?? "the candidate"}</span>.
              </>
            ) : (
              <>
                The interview is scheduled, but we could not send the invitation email to{" "}
                <span className="font-semibold text-gray-700">{candidateName ?? "the candidate"}</span>.
              </>
            )}
          </p>
        </div>

        {!isCancelled && !emailDelivered && (
          <div className="px-6 pb-4">
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
              The interview was scheduled successfully, but email delivery failed. Please notify the candidate directly or try again later.
            </div>
          </div>
        )}

        {/* ── Details ── */}
        <div className="px-6 py-4 space-y-3">

          {/* Job title */}
          {jobTitle && (
            <div className="flex items-center gap-2.5 p-3 bg-indigo-50 rounded-xl">
              <CalendarDays size={15} className="text-indigo-500 shrink-0" />
              <div>
                <p className="text-xs text-indigo-400 font-medium">Position</p>
                <p className="text-sm font-semibold text-indigo-800">{jobTitle}</p>
              </div>
            </div>
          )}

          {/* Date/time */}
          {scheduledAt && (
            <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl">
              <CalendarDays size={15} className="text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-medium">Date & Time</p>
                <p className="text-sm font-semibold text-gray-800">{formatDateTime(scheduledAt)}</p>
              </div>
            </div>
          )}

          {/* Format */}
          {meetingType && (
            <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl">
              <Mail size={15} className="text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-medium">Format</p>
                <p className="text-sm font-semibold text-gray-800">
                  {meetingType === "ONLINE" && meetingLink
                    ? `Online · ${detectMeetingProvider(meetingLink)}`
                    : MEETING_LABEL[meetingType] ?? meetingType
                  }
                </p>
                {meetingType === "ONLINE" && meetingLink && (
                  <a
                    href={meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-500 underline hover:text-indigo-700 truncate block max-w-60"
                  >
                    {meetingLink}
                  </a>
                )}
                {meetingType === "ONSITE" && location && (
                  <p className="text-xs text-gray-500">{location}</p>
                )}
              </div>
            </div>
          )}

          {/* Email sent to / delivery status */}
          {candidateEmail && (
            <div className={`flex items-center gap-2.5 p-3 rounded-xl border ${emailDelivered ? "bg-green-50 border-green-100" : "bg-yellow-50 border-yellow-200"}`}>
              <Mail size={15} className={`${emailDelivered ? "text-green-500" : "text-yellow-500"} shrink-0`} />
              <div>
                <p className={`text-xs font-medium ${emailDelivered ? "text-green-600" : "text-yellow-700"}`}>
                  {emailDelivered ? "Email sent to" : "Email delivery failed for"}
                </p>
                <p className={`text-sm font-semibold ${emailDelivered ? "text-green-800" : "text-yellow-900"}`}>
                  {candidateEmail}
                </p>
                {!emailDelivered && (
                  <p className="mt-1 text-xs text-yellow-700">The interview was scheduled, but the email could not be delivered.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => router.push("/users/employer/interviews")}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            View Interviews
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