import { Upload, Pencil, X, Sparkles, Check, Loader2 } from "lucide-react";
import React, { RefObject } from "react";
import { DashboardJob } from "./RecommendationRow";

interface JobApplyModalProps {
  selectedJob: DashboardJob;
  resumeFileName: string;
  setResumeFileName: (name: string) => void;
  resumeInputRef: RefObject<HTMLInputElement | null>;
  coverLetter: string;
  setCoverLetter: (text: string) => void;
  showAIModal: boolean;
  setShowAIModal: (show: boolean) => void;
  closeModals: () => void;
  openJobDetails: (jobId: string) => void;
  handleApplySubmission: () => void;
  isAiRecommended?: boolean;
  isLoading?: boolean;
}

export default function JobApplyModal({
  selectedJob,
  resumeFileName,
  setResumeFileName,
  resumeInputRef,
  coverLetter,
  setCoverLetter,
  showAIModal,
  setShowAIModal,
  closeModals,
  openJobDetails,
  handleApplySubmission,
  isAiRecommended,
  isLoading,
}: JobApplyModalProps) {
  return (
    <div className="space-y-5 p-6">
      <button onClick={closeModals} className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:text-gray-600 transition-colors"><X size={14} strokeWidth={2.5} /></button>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
          {selectedJob.companyLogoUrl ? (
            <img src={selectedJob.companyLogoUrl} alt={selectedJob.company} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-sm font-semibold text-indigo-600">
              {selectedJob.company?.slice(0, 3)}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-400">Applying for</p>
          <h3 className="text-[17px] font-semibold text-indigo-600">{selectedJob.title}</h3>
        </div>
      </div>

      {!isAiRecommended ? (
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Resume</p>
          <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setResumeFileName(e.target.files?.[0]?.name ?? "")} />
          <button onClick={() => resumeInputRef.current?.click()} className="w-full rounded-2xl border-2 border-dashed border-indigo-300 bg-violet-50/50 px-4 py-5 text-center transition-colors hover:bg-violet-50">
            <Upload size={22} className="mx-auto mb-1.5 text-indigo-300" />
            <p className="text-sm font-medium text-slate-500">{resumeFileName ? resumeFileName : "Drag and drop resume"}</p>
            <p className="mt-1 text-sm font-semibold text-indigo-600">Browse CV</p>
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <Check size={18} strokeWidth={3} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Resume already on file</p>
              <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                Since this is a recommended job, we will automatically use the <span className="font-semibold text-indigo-600">Default Resume</span> from your profile.
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-700">Cover letter</p>
          <button 
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <Sparkles size={14} />
            Generate with AI
          </button>
        </div>
        <textarea
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Paste or type your cover letter here..."
          className="w-full min-h-[160px] rounded-2xl border border-gray-200 bg-slate-50/30 p-4 text-sm text-slate-600 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition-all resize-none"
        />
      </div>


      <div className="flex items-center justify-between gap-3 pt-1">
        <button onClick={() => openJobDetails(selectedJob.id)} className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-5 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50"><Pencil size={13} strokeWidth={2.2} />Edit</button>
        <button 
          onClick={handleApplySubmission} 
          disabled={isLoading || (!isAiRecommended && !resumeFileName)} 
          className="relative flex items-center justify-center min-w-[120px] rounded-xl px-6 py-2 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70" 
          style={{ background: "linear-gradient(90deg, #5F33E2 0%, #7C3AED 100%)", boxShadow: "0 4px 14px rgba(95,51,226,0.3)" }}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Applying...
            </span>
          ) : (
            "Apply now"
          )}
        </button>
      </div>
    </div>
  );
}
