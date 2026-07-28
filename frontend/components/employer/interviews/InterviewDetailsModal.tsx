"use client";

import {
  X,
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  Briefcase,
  Building2,
  FileText,
  ExternalLink,
  Loader2,
  Copy,
  Check,
  Phone,
  ArrowUpRight,
  Mail,
  CalendarCheck,
  AlertCircle,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { InterviewDTO } from "@/types/employer/interview.types";
import { useLayoutEffect, useState } from "react";

interface InterviewDetailsModalProps {
  interview: InterviewDTO | null;
  isOpen: boolean;
  onClose: () => void;
  loading?: boolean;
  onReschedule?: (interview: InterviewDTO) => void;
  onCancel?: (interviewId: string) => void;
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
  if (url.includes("zoom.us")) {
    return "Zoom Meeting";
  }
  return "Video Call";
};

export default function InterviewDetailsModal({
  interview,
  isOpen,
  onClose,
  loading = false,
  onReschedule,
  onCancel,
}: InterviewDetailsModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedLocation, setCopiedLocation] = useState(false);

  // Ensure URL has proper protocol
  const getProperUrl = (url: string): string => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url}`;
  };

  // Manage body overflow on mount/unmount
  useLayoutEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Copy helpers
  const handleCopy = async (
    text: string,
    setCopied: (val: boolean) => void
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!isOpen || !interview) return null;

  // Format date and time
  const scheduledDate = new Date(interview.scheduledAt);
  const formattedDate = scheduledDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  const formattedTime = scheduledDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });

  // Calculate initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // Meeting type config
  const getMeetingTypeDisplay = () => {
    const type = interview.meetingType?.toLowerCase() ?? "";
    if (type === "online") {
      const provider = detectMeetingProvider(interview.meetingLink);
      return {
        icon: <Video size={18} className="text-blue-600" />,
        label: `Online (${provider})`,
        providerName: provider,
        badgeBg: "bg-blue-50 text-blue-700 border-blue-200/80",
      };
    }
    if (type === "onsite") {
      return {
        icon: <MapPin size={18} className="text-purple-600" />,
        label: "On-Site Interview",
        providerName: "In-Person",
        badgeBg: "bg-purple-50 text-purple-700 border-purple-200/80",
      };
    }
    if (type === "phone") {
      return {
        icon: <Phone size={18} className="text-emerald-600" />,
        label: "Phone Call Interview",
        providerName: "Phone Call",
        badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      };
    }
    return {
      icon: <Video size={18} className="text-gray-600" />,
      label: interview.meetingType,
      providerName: interview.meetingType,
      badgeBg: "bg-gray-100 text-gray-700 border-gray-200",
    };
  };

  const meetingDisplay = getMeetingTypeDisplay();

  // Status badge config
  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SCHEDULED":
        return {
          label: "Scheduled",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dotClass: "bg-emerald-500",
        };
      case "COMPLETED":
        return {
          label: "Completed",
          className: "bg-blue-50 text-blue-700 border-blue-200",
          dotClass: "bg-blue-500",
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          className: "bg-red-50 text-red-700 border-red-200",
          dotClass: "bg-red-500",
        };
      default:
        return {
          label: status,
          className: "bg-gray-100 text-gray-700 border-gray-200",
          dotClass: "bg-gray-400",
        };
    }
  };

  const statusBadge = getStatusBadge(interview.status);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity duration-200 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <div
          className="bg-white border border-gray-100 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-200 pointer-events-auto animate-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white border-b border-gray-100 px-6 py-5 flex items-center justify-between sticky top-0 backdrop-blur-md z-10">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white shrink-0">
                <CalendarCheck size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                    Interview Details
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.className}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotClass}`} />
                    {statusBadge.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                  Position: <span className="text-gray-800 font-semibold">{interview.jobPost?.title}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100/80 border border-transparent hover:border-gray-200 transition-all cursor-pointer shrink-0 ml-2"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 size={36} className="text-indigo-600 animate-spin" />
              <span className="text-sm font-medium text-gray-500">Loading interview details...</span>
            </div>
          ) : (
            /* Modal Body */
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              
              {/* Rescheduled Notice (if applicable) */}
              {interview.rescheduledFromId && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center gap-3 text-xs text-amber-800">
                  <AlertCircle size={16} className="shrink-0 text-amber-600" />
                  <span>This interview was rescheduled from a previous appointment.</span>
                </div>
              )}

              {/* Date & Time Hero Box */}
              <div className="relative bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-white border border-indigo-100 rounded-2xl p-5 overflow-hidden shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      <Calendar size={14} className="text-indigo-600" />
                      Date & Schedule
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                      {formattedDate}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1.5 font-medium">
                      <Clock size={15} className="text-gray-400" />
                      {formattedTime} <span className="text-xs text-gray-400">(UTC Timezone)</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${meetingDisplay.badgeBg}`}>
                      {meetingDisplay.icon}
                      {meetingDisplay.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Meeting Action Box (Online / Onsite / Phone) */}
              {interview.meetingType === "ONLINE" && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-100 text-blue-600 border border-blue-200/60">
                        <Video size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">Online Meeting Details</h3>
                        <p className="text-xs text-gray-500">{meetingDisplay.providerName}</p>
                      </div>
                    </div>
                  </div>

                  {interview.meetingLink ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                      {/* Join Meeting Button */}
                      <a
                        href={getProperUrl(interview.meetingLink)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-indigo-500/20 px-4 py-2.5 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                      >
                        Join Meeting Now
                        <ArrowUpRight size={16} />
                      </a>

                      {/* Copy Link Button */}
                      <button
                        type="button"
                        onClick={() => handleCopy(getProperUrl(interview.meetingLink!), setCopiedLink)}
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium inline-flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98"
                        title="Copy meeting link"
                      >
                        {copiedLink ? (
                          <>
                            <Check size={16} className="text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={16} className="text-gray-400" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No meeting link provided.</p>
                  )}

                  {/* Google Calendar Link (if available) */}
                  {interview.googleCalendarLink && (
                    <div className="pt-2 border-t border-blue-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">Calendar Integration</span>
                      <a
                        href={interview.googleCalendarLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 font-semibold transition-colors"
                      >
                        Open Google Calendar
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Location Box (for Onsite) */}
              {interview.meetingType === "ONSITE" && interview.location && (
                <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-purple-100 text-purple-600 border border-purple-200/60">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">Interview Location</h3>
                        <p className="text-xs text-gray-500">On-Site Address</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(interview.location!, setCopiedLocation)}
                      className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors shadow-xs"
                      title="Copy Address"
                    >
                      {copiedLocation ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-gray-800 text-sm font-medium bg-white p-3 rounded-xl border border-gray-200/80">
                    {interview.location}
                  </p>
                </div>
              )}

              {/* Grid Section: Candidate & Job Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Candidate Info Card */}
                <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-5 space-y-4 hover:border-indigo-100 transition-colors">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200/60">
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      <User size={14} />
                      Candidate Profile
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200/50 flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                      {getInitials(interview.candidate?.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-gray-900 font-bold text-base truncate">
                        {interview.candidate?.name}
                      </h4>
                      {interview.candidate?.headline && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {interview.candidate.headline}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email with copy action */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      Contact Email
                    </p>
                    <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-gray-200/80 shadow-xs">
                      <a
                        href={`mailto:${interview.candidate?.email}`}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 truncate"
                      >
                        {interview.candidate?.email}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy(interview.candidate?.email, setCopiedEmail)}
                        className="text-gray-400 hover:text-gray-700 transition-colors shrink-0"
                        title="Copy Email"
                      >
                        {copiedEmail ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  
                </div>

                {/* Job Position & Employer Card */}
                <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-5 space-y-4 hover:border-indigo-100 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 mb-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                        <Briefcase size={14} />
                        Position & Company
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Job Role
                        </p>
                        <h4 className="text-gray-900 font-bold text-base">
                          {interview.jobPost?.title}
                        </h4>
                        <div className="mt-1">
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-white text-gray-700 border border-gray-200">
                            {interview.jobPost?.type || "Full-time"}
                          </span>
                        </div>
                      </div>

                      
                    </div>
                  </div>

                  {/* Recruiter Email */}
                  {interview.employer?.email && (
                    <div className="pt-3 border-t border-gray-200/60">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        Host Contact
                      </p>
                      <a
                        href={`mailto:${interview.employer.email}`}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium truncate flex items-center gap-1.5"
                      >
                        <Mail size={12} />
                        {interview.employer.email}
                      </a>
                    </div>
                  )}
                </div>

              </div>

              {/* Additional Information / Agenda (if available) */}
              {interview.additionalInfo && (
                <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                    <FileText size={14} />
                    Additional Notes & Agenda
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap pt-1 font-normal">
                    {interview.additionalInfo}
                  </p>
                </div>
              )}

            </div>
          )}

          {/* Modal Footer / Action Bar */}
          <div className="bg-gray-50/80 border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 backdrop-blur-md z-10">
            <div className="text-[11px] text-gray-400 space-y-0.5 text-center sm:text-left">
              <p>Created: {new Date(interview.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {/* Reschedule button */}
              {onReschedule && interview.status === "SCHEDULED" && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onReschedule(interview);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <RotateCcw size={14} className="text-indigo-600" />
                  Reschedule
                </button>
              )}

              {/* Cancel button */}
              {onCancel && interview.status === "SCHEDULED" && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onCancel(interview.id);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Trash2 size={14} />
                  Cancel
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20 cursor-pointer active:scale-98"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

