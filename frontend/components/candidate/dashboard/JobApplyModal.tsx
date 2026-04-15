import { Upload, Pencil, X, Sparkles } from "lucide-react";
import React, { RefObject } from "react";
import { DashboardJob } from "./RecommendationRow";

interface JobApplyModalProps {
  selectedJob: DashboardJob;
  resumeFileName: string;
  setResumeFileName: (name: string) => void;
  resumeInputRef: RefObject<HTMLInputElement | null>;
  coverLetter: string;
  setCoverLetter: (text: string) => void;
  coverLetterFileName: string;
  setCoverLetterFileName: (name: string) => void;
  coverLetterInputRef: RefObject<HTMLInputElement | null>;
  showAIModal: boolean;
  setShowAIModal: (show: boolean) => void;
  closeModals: () => void;
  openJobDetails: (jobId: string) => void;
  handleApplySubmission: () => void;
}

export default function JobApplyModal({
  selectedJob,
  resumeFileName,
  setResumeFileName,
  resumeInputRef,
  coverLetter,
  setCoverLetter,
  coverLetterFileName,
  setCoverLetterFileName,
  coverLetterInputRef,
  showAIModal,
  setShowAIModal,
  closeModals,
  openJobDetails,
  handleApplySubmission,
}: JobApplyModalProps) {
  return (
    <div className="space-y-5 p-6">
      <button onClick={closeModals} className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:text-gray-600 transition-colors"><X size={14} strokeWidth={2.5} /></button>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white overflow-hidden">
          {/* Optionally show logo or initials */}
          <div className="flex h-full w-full items-center justify-center rounded-xl bg-indigo-100 text-sm font-semibold text-indigo-600">{selectedJob.company?.slice(0, 3)}</div>
        </div>
        <div>
          <p className="text-xs text-gray-400">Applying for</p>
          <h3 className="text-[17px] font-semibold text-indigo-600">{selectedJob.title}</h3>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Resume</p>
        <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setResumeFileName(e.target.files?.[0]?.name ?? "")} />
        <button onClick={() => resumeInputRef.current?.click()} className="w-full rounded-2xl border-2 border-dashed border-indigo-300 bg-violet-50/50 px-4 py-5 text-center transition-colors hover:bg-violet-50">
          <Upload size={22} className="mx-auto mb-1.5 text-indigo-300" />
          <p className="text-sm font-medium text-slate-500">{resumeFileName ? resumeFileName : "Drag and drop resume"}</p>
          <p className="mt-1 text-sm font-semibold text-indigo-600">Browse CV</p>
        </button>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Cover letter</p>
        <input ref={coverLetterInputRef} type="file" accept=".txt,.doc,.docx,.pdf" className="hidden" onChange={(e) => setCoverLetterFileName(e.target.files?.[0]?.name ?? "")} />
        <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-gray-200">
          <button onClick={() => coverLetterInputRef.current?.click()} className="flex flex-col items-center justify-center gap-1.5 border-r border-gray-200 px-4 py-5 text-center transition-colors hover:bg-slate-50">
            <Upload size={20} className="text-indigo-300" />
            <p className="text-xs text-gray-400">Drag and drop</p>
            <p className="text-sm font-semibold text-indigo-600">Browse</p>
          </button>
          <button onClick={() => setShowAIModal(true)} className="flex flex-col items-center justify-center gap-1.5 bg-violet-50/50 px-4 py-5 text-center transition-colors hover:bg-violet-50">
            <Sparkles size={20} className="text-indigo-300" />
            <p className="text-xs text-gray-400">Skip the writing</p>
            <p className="text-sm font-semibold text-indigo-600">Generate with AI</p>
          </button>
        </div>
        {coverLetterFileName && <p className="mt-2 text-xs text-gray-400">Uploaded: {coverLetterFileName}</p>}
        {coverLetter && <p className="mt-2 text-xs text-slate-600 whitespace-pre-wrap">{coverLetter}</p>}
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <button onClick={() => openJobDetails(selectedJob.id)} className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-5 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50"><Pencil size={13} strokeWidth={2.2} />Edit</button>
        <button onClick={handleApplySubmission} disabled={!resumeFileName} className="rounded-xl px-6 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50" style={{ background: "linear-gradient(90deg, #5F33E2 0%, #7C3AED 100%)", boxShadow: "0 4px 14px rgba(95,51,226,0.3)" }}>Apply now</button>
      </div>
    </div>
  );
}
