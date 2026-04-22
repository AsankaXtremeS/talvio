import { Upload, Pencil, X, Sparkles, Check, Loader2, FileText } from "lucide-react";
import React, { useState } from "react";
import { DashboardJob } from "./RecommendationRow";
import { UploadButton } from "@/lib/uploadthing";

interface JobApplyModalProps {
  selectedJob: DashboardJob;
  resumeFileName: string;
  setResumeFileName: (name: string) => void;
  cvUrl?: string;
  setCvUrl: (url: string) => void;
  coverLetter: string;
  setCoverLetter: (text: string) => void;
  showAIModal: boolean;
  setShowAIModal: (show: boolean) => void;
  closeModals: () => void;
  openJobDetails: (jobId: string) => void;
  handleApplySubmission: (useDefaultCv: boolean) => void;
  isLoading?: boolean;
}

export default function JobApplyModal({
  selectedJob,
  resumeFileName,
  setResumeFileName,
  cvUrl,
  setCvUrl,
  coverLetter,
  setCoverLetter,
  showAIModal,
  setShowAIModal,
  closeModals,
  openJobDetails,
  handleApplySubmission,
  isLoading,
}: JobApplyModalProps) {
  const [cvOption, setCvOption] = useState<"default" | "custom">("default");

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

      <div>
        <p className="mb-3 text-sm font-semibold text-slate-700 font-urbanist">Select Resume</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setCvOption("default")}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
              cvOption === "default"
                ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                : "border-gray-100 bg-slate-50/50 hover:border-indigo-200"
            }`}
          >
            <div className={`p-2 rounded-xl ${cvOption === "default" ? "bg-indigo-600 text-white" : "bg-white text-slate-400"}`}>
              <Check size={16} strokeWidth={3} />
            </div>
            <span className={`text-xs font-bold ${cvOption === "default" ? "text-indigo-700" : "text-slate-500"}`}>Use Default CV</span>
          </button>
          <button
            onClick={() => setCvOption("custom")}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
              cvOption === "custom"
                ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                : "border-gray-100 bg-slate-50/50 hover:border-indigo-200"
            }`}
          >
            <div className={`p-2 rounded-xl ${cvOption === "custom" ? "bg-indigo-600 text-white" : "bg-white text-slate-400"}`}>
              <Upload size={16} strokeWidth={3} />
            </div>
            <span className={`text-xs font-bold ${cvOption === "custom" ? "text-indigo-700" : "text-slate-500"}`}>Upload Custom CV</span>
          </button>
        </div>

        {cvOption === "default" ? (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4 border-dashed animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <FileText size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">Default Profile CV</p>
                <p className="text-xs text-slate-500">We'll use your current profile resume</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-slate-50/50 p-6 text-center animate-in zoom-in-95 duration-300">
            {cvUrl ? (
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="bg-green-100 p-1.5 rounded-lg text-green-600">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <p className="text-sm font-bold text-slate-700 truncate">{resumeFileName}</p>
                </div>
                <button onClick={() => { setCvUrl(""); setResumeFileName(""); }} className="text-slate-400 hover:text-red-500 transition-colors">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <UploadButton
                  endpoint="pdfUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res[0]) {
                      setCvUrl(res[0].url);
                      setResumeFileName(res[0].name);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    alert(`ERROR! ${error.message}`);
                  }}
                  appearance={{
                    button: "bg-indigo-600 rounded-xl px-4 py-2 text-sm font-bold shadow-md shadow-indigo-100 hover:bg-indigo-700 h-10 w-full",
                    allowedContent: "text-[10px] text-slate-400 mt-2"
                  }}
                />
              </>
            )}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-slate-700 font-urbanist">Cover Letter</p>
          <button 
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 px-3 py-1 rounded-full"
          >
            <Sparkles size={12} />
            AI Generate
          </button>
        </div>
        <textarea
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Why are you a good fit for this role?"
          className="w-full min-h-[140px] rounded-2xl border border-gray-200 bg-slate-50/30 p-4 text-sm text-slate-600 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition-all resize-none shadow-inner"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button 
          onClick={() => handleApplySubmission(cvOption === "default")} 
          disabled={isLoading || (cvOption === "custom" && !cvUrl)} 
          className="relative flex items-center justify-center min-w-[140px] rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 group overflow-hidden" 
          style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)", boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)" }}
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Processing AI...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Apply Now
              <X size={14} className="rotate-45" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
