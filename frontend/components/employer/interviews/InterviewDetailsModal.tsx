"use client";

import { X, Calendar, Clock, MapPin, Video, User, Briefcase, Building2, FileText, ExternalLink, Loader2, Copy, Check } from "lucide-react";
import { InterviewDTO } from "@/types/employer/interview.types";
import { useLayoutEffect, useState } from "react";

interface InterviewDetailsModalProps {
  interview: InterviewDTO | null;
  isOpen: boolean;
  onClose: () => void;
  loading?: boolean;
}

export default function InterviewDetailsModal({
  interview,
  isOpen,
  onClose,
  loading = false,
}: InterviewDetailsModalProps) {
  const [copied, setCopied] = useState(false);

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

  // Copy link to clipboard
  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(getProperUrl(link));
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

  // Get meeting type icon and label
  const getMeetingTypeDisplay = () => {
    const type = interview.meetingType?.toLowerCase() ?? "";
    if (type === "online") {
      return {
        icon: <Video size={20} className="text-blue-500" />,
        label: "Online (Google Meet)",
        color: "bg-blue-50",
      };
    }
    if (type === "onsite") {
      return {
        icon: <MapPin size={20} className="text-purple-500" />,
        label: "On-Site",
        color: "bg-purple-50",
      };
    }
    if (type === "phone") {
      return {
        icon: <Clock size={20} className="text-green-500" />,
        label: "Phone Call",
        color: "bg-green-50",
      };
    }
    return {
      icon: <Video size={20} className="text-gray-500" />,
      label: interview.meetingType,
      color: "bg-gray-50",
    };
  };

  const meetingDisplay = getMeetingTypeDisplay();

  return (
    <>
      {/* Backdrop - DOES NOT close modal when clicked */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 pointer-events-none ${
          isOpen ? "pointer-events-auto" : ""
        }`}
      >
        <div
          className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-200 pointer-events-auto ${
            isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-linear-to-r from-indigo-50 to-purple-50 border-b border-indigo-100 px-6 py-4 flex items-center justify-between pointer-events-auto">
            <h2 className="text-xl font-bold text-gray-900">Interview Details</h2>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-gray-600 transition-colors cursor-pointer pointer-events-auto z-50"
            >
              <X size={24} />
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="text-indigo-600 animate-spin" />
            </div>
          )}

          {!loading && (
            <div className="p-6 space-y-6 pointer-events-auto">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
                  {interview.status === "SCHEDULED" ? "✓ Scheduled" : interview.status}
                </span>
              </div>

              {/* Interview DateTime Card */}
              <div className={`${meetingDisplay.color} border-l-4 border-indigo-600 rounded-lg p-4`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Calendar size={18} className="text-indigo-600" />
                      Date & Time
                    </div>
                    <p className="text-lg font-bold text-gray-900">{formattedDate}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock size={16} /> {formattedTime} (UTC)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {meetingDisplay.icon}
                    <span className="font-medium text-sm text-gray-700">{meetingDisplay.label}</span>
                  </div>
                </div>
              </div>

              {/* Meeting Link (for Online) */}
              {interview.meetingType === "ONLINE" && interview.meetingLink && (
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Video size={18} className="text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Meeting Link</h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={getProperUrl(interview.meetingLink)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="flex-1 text-blue-600 hover:text-blue-800 font-medium break-all underline hover:underline decoration-2 hover:decoration-blue-700 transition-colors pointer-events-auto cursor-pointer"
                      >
                        {interview.meetingLink}
                      </a>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (interview.meetingLink) {
                            handleCopyLink(interview.meetingLink);
                          }
                        }}
                        className="shrink-0 p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all pointer-events-auto cursor-pointer"
                        title="Copy meeting link"
                      >
                        {copied ? (
                          <Check size={18} className="text-green-600" />
                        ) : (
                          <Copy size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Location (for Onsite) */}
              {interview.meetingType === "ONSITE" && interview.location && (
                <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={18} className="text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Location</h3>
                  </div>
                  <p className="text-gray-700 font-medium">{interview.location}</p>
                </div>
              )}

              {/* Additional Info */}
              {interview.additionalInfo && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={18} className="text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Additional Information</h3>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{interview.additionalInfo}</p>
                </div>
              )}

              {/* Candidate Info */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <User size={18} className="text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">Candidate</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Name</p>
                    <p className="text-gray-900 font-semibold">{interview.candidate.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                    <a
                      href={`mailto:${interview.candidate.email}`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      {interview.candidate.email}
                    </a>
                  </div>
                  {interview.candidate.headline && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Headline</p>
                      <p className="text-gray-700 text-sm">{interview.candidate.headline}</p>
                    </div>
                  )}
                  {interview.candidate.skills && interview.candidate.skills.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {interview.candidate.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Post Info */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase size={18} className="text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">Job Position</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Title</p>
                    <p className="text-gray-900 font-semibold">{interview.jobPost.title}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Type</p>
                    <p className="text-gray-700 text-sm">{interview.jobPost.type}</p>
                  </div>
                </div>
              </div>

              {/* Company Info */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 size={18} className="text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">Company</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Name</p>
                    <p className="text-gray-900 font-semibold">{interview.employer.companyName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Contact Email</p>
                    <a
                      href={`mailto:${interview.employer.email}`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      {interview.employer.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Calendar Link (if available) */}
              {interview.googleCalendarLink && (
                <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                  <a
                    href={interview.googleCalendarLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 font-medium text-sm"
                  >
                    View on Google Calendar
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

              {/* Footer Info */}
              <div className="text-xs text-gray-400 pt-4 border-t border-gray-200">
                <p>Interview ID: {interview.id}</p>
                <p>Created: {new Date(interview.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
