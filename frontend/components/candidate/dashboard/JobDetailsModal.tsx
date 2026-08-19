import { Briefcase, CalendarDays, Clock3, DollarSign, Globe2, X } from "lucide-react";
import React from "react";
import { DashboardJob } from "./RecommendationRow";

interface JobDetailsModalProps {
  selectedJob: DashboardJob;
  isSelectedJobApplied: boolean;
  closeModals: () => void;
  openApplyForm: (jobId: string) => void;
  APPLY_MODAL_CONTENT: {
    about: string;
    responsibilities: string[];
    requirements: string[];
    companyAbout: string;
  };
}

export default function JobDetailsModal({
  selectedJob,
  isSelectedJobApplied,
  closeModals,
  openApplyForm,
  APPLY_MODAL_CONTENT,
}: JobDetailsModalProps) {
  return (
    <div className="space-y-3">
      <button
        onClick={closeModals}
        className="absolute right-3 top-3 rounded-lg border border-slate-300 bg-white px-2 py-0.5 text-lg leading-none text-slate-500 hover:text-slate-700"
      >
        ×
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-[#F4F7FF] overflow-hidden">
              {selectedJob.companyLogoUrl ? (
                <img src={selectedJob.companyLogoUrl} alt={selectedJob.company} className="h-full w-full object-cover" />
              ) : (
                <span className="text-base font-bold text-indigo-600">{selectedJob.company.charAt(0)}</span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold leading-tight text-slate-800">{selectedJob.title}</h3>
              <p className="text-sm font-semibold text-indigo-500">{selectedJob.company} - {selectedJob.location}</p>
            </div>
          </div>

          {isSelectedJobApplied ? (
            <button disabled className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700">Applied</button>
          ) : (
            <button onClick={() => openApplyForm(selectedJob.id)} className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">Apply now</button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {selectedJob.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">{tag}</span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h4 className="text-lg font-semibold text-slate-800">Job Overview</h4>
          <div className="mt-3 space-y-2 text-xs text-slate-600 sm:text-sm">
            <p className="flex items-center gap-2"><Briefcase size={16} className="text-slate-400" />Role: <span className="font-semibold text-slate-700">{selectedJob.title}</span></p>
            <p className="flex items-center gap-2"><Clock3 size={16} className="text-slate-400" />Duration: <span className="font-semibold text-slate-700">3 months</span></p>
            <p className="flex items-center gap-2"><DollarSign size={16} className="text-slate-400" />Stipend: <span className="font-semibold text-slate-700">Paid</span></p>
            <p className="flex items-center gap-2"><Globe2 size={16} className="text-slate-400" />Work Mode: <span className="font-semibold text-slate-700">Remote</span></p>
            <p className="flex items-center gap-2"><CalendarDays size={16} className="text-slate-400" />Posted: <span className="font-semibold text-slate-700">{selectedJob.postedAgo}</span></p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h4 className="text-lg font-semibold text-slate-800">Company</h4>
          <div className="mt-2 flex items-center h-10">
            {selectedJob.companyLogoUrl ? (
              <img src={selectedJob.companyLogoUrl} alt={selectedJob.company} className="max-h-full max-w-[120px] object-contain" />
            ) : (
              <p className="text-2xl font-bold text-indigo-600 truncate">{selectedJob.company}</p>
            )}
          </div>
          <p className="mt-2 text-xs leading-6 text-slate-600 sm:text-sm">{APPLY_MODAL_CONTENT.companyAbout}</p>
          <button className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700">Visit company profile</button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h4 className="text-lg font-semibold text-slate-800">About the Role</h4>
        <p className="mt-3 text-xs leading-6 text-slate-600 sm:text-sm">{APPLY_MODAL_CONTENT.about}</p>

        <h5 className="mt-4 text-base font-semibold text-slate-800">Responsibilities</h5>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs text-slate-600 sm:text-sm">
          {APPLY_MODAL_CONTENT.responsibilities.map((item) => (<li key={item}>{item}</li>))}
        </ul>

        <h5 className="mt-4 text-base font-semibold text-slate-800">Requirements</h5>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs text-slate-600 sm:text-sm">
          {APPLY_MODAL_CONTENT.requirements.map((item) => (<li key={item}>{item}</li>))}
        </ul>
      </div>
    </div>
  );
}
