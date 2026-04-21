"use client";

import { useEffect } from "react";
import { X, User, Clock, DollarSign, Globe, Calendar } from "lucide-react";

interface JobDetail {
  id: string;
  title: string;
  company: string;
  location: string;
  tags: string[];
  companyLogoUrl?: string;
  companyDescription: string;
  companyProfileUrl?: string;
  aboutRole: string;
  responsibilities: string[];
  requirements: string[];
  role: string;
  duration: string;
  stipend: string;
  workMode: string;
  postedAgo: string;
}

interface JobViewModalProps {
  job: JobDetail;
  isApplied?: boolean;
  onClose: () => void;
  onApply: (id: string) => void;
}

// Google logo SVG inline
function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export default function JobViewModal({ job, isApplied, onClose, onApply }: JobViewModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const overviewItems = [
    { icon: <User size={15} />, label: "Role", value: job.role },
    { icon: <Clock size={15} />, label: "Duration", value: job.duration },
    { icon: <DollarSign size={15} />, label: "Stipend", value: job.stipend },
    { icon: <Globe size={15} />, label: "Work Mode", value: job.workMode },
    { icon: <Calendar size={15} />, label: "Posted", value: job.postedAgo },
  ];

  return (
    /* Backdrop with blur */
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 pb-10"
      style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.25)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors shadow-sm"
        >
          <X size={16} />
        </button>

        {/* Main container for all job details */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 flex flex-col gap-6 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="rounded-xl border border-[#E3EAF3] bg-[#F7FAFC] p-5 mb-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                  {job.companyLogoUrl === "google" ? (
                    <div className="w-8 h-8"><GoogleLogo /></div>
                  ) : job.companyLogoUrl ? (
                    <img src={job.companyLogoUrl} alt={job.company} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-indigo-600">{job.company.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900">{job.title}</p>
                  <p className="text-sm text-indigo-500 font-medium">
                    {job.company} - {job.location}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onApply(job.id)}
                disabled={isApplied}
                className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                  isApplied
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {isApplied ? "Applied" : "Apply now"}
              </button>
            </div>
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag) => (
                <span key={tag} className="px-4 py-1.5 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-medium rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Overview + Company */}
          <div className="grid grid-cols-2 gap-4">
            {/* Job Overview */}
            <div className="rounded-xl border border-[#E3EAF3] bg-[#F7FAFC] p-5">
              <h3 className="font-bold text-gray-800 mb-4">Job Overview</h3>
              <div className="flex flex-col gap-3">
                {overviewItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400 shrink-0">{item.icon}</span>
                    <span className="text-gray-500">{item.label}:</span>
                    <span className="font-semibold text-gray-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Company */}
            <div className="rounded-xl border border-[#E3EAF3] bg-[#F7FAFC] p-5">
              <h3 className="font-bold text-gray-800 mb-4">Company</h3>
              <div className="w-24 h-10 mb-3 flex items-center">
                {job.companyLogoUrl === "google" ? (
                  <GoogleLogo />
                ) : job.companyLogoUrl ? (
                  <img src={job.companyLogoUrl} alt={job.company} className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-2xl font-bold text-indigo-600 truncate">{job.company}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                {job.companyDescription}
              </p>
              <a
                href={job.companyProfileUrl ?? "#"}
                className="text-sm text-indigo-500 font-semibold hover:underline flex items-center gap-1"
              >
                Visit Company profile →
              </a>
            </div>
          </div>

          {/* About the Role, Responsibilities, Requirements */}
          <div className="rounded-xl border border-[#E3EAF3] bg-[#F7FAFC] p-5">
            <h3 className="font-bold text-gray-800 mb-3">About the Role</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">{job.aboutRole}</p>

            <h4 className="font-bold text-gray-800 mb-3">Responsibilities</h4>
            <ul className="space-y-2 mb-5">
              {job.responsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-1.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>

            <h4 className="font-bold text-gray-800 mb-3">Requirements</h4>
            <ul className="space-y-2">
              {job.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-1.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}