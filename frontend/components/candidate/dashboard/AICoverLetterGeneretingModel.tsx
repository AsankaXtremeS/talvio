"use client";

import { useState, useEffect, useCallback } from "react";
import { X, RefreshCw, Check, Sparkles, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

interface AICoverLetterModalProps {
  jobId: string;
  jobTitle: string;
  candidateName?: string;
  onDone: (coverLetterText: string) => void;
  onClose: () => void;
}

export default function AICoverLetterModal({
  jobId,
  jobTitle,
  candidateName = "Your Name",
  onDone,
  onClose,
}: AICoverLetterModalProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoverLetter = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await apiClient<{ coverLetter: string }>(`/api/ai/generate-cover-letter/${jobId}`, {
        method: "POST"
      });
      setCoverLetter(response.coverLetter);
    } catch (err: unknown) {
      console.error("Failed to generate cover letter:", err);
      const message = err instanceof Error ? err.message : "Failed to generate cover letter. Please try again.";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchCoverLetter();
  }, [fetchCoverLetter]);

  const handleRegenerate = () => {
    fetchCoverLetter();
  };

  const handleDone = () => {
    if (!coverLetter || isGenerating) return;
    onDone(coverLetter);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-95 overflow-hidden">
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />

      <div className="relative z-10 mx-auto flex h-full max-w-305 items-center justify-center px-4">
        <div className="relative w-full max-w-155 animate-in fade-in zoom-in duration-300">

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Main card */}
          <div className="relative w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">

            {/* Header */}
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                <Sparkles size={18} className="text-indigo-600" />
              </div>
              <h1 className="text-[22px] font-bold text-slate-900">
                AI Cover Letter Generator
              </h1>
            </div>
            <p className="text-[14px] text-slate-500 mb-6 font-medium">
              Writing for:{" "}
              <span className="font-bold text-indigo-700">{jobTitle}</span>
              <span className="text-slate-400"> ({candidateName})</span>
            </p>

            {/* Text area area */}
            <div className="relative bg-slate-50 border border-slate-200 rounded-xl p-5 mb-5 min-h-75 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">
                  Generated Draft
                </p>
                {isGenerating && (
                  <span className="flex items-center gap-1.5 text-[12px] text-indigo-600 font-bold animate-pulse">
                    <Loader2 size={14} className="animate-spin" />
                    AI is writing...
                  </span>
                )}
              </div>

              {error ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center p-6 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-sm text-red-600 font-medium mb-3">{error}</p>
                  <button 
                    onClick={handleRegenerate}
                    className="text-xs font-bold text-red-700 underline uppercase hover:text-red-800"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  disabled={isGenerating}
                  placeholder={isGenerating ? "" : "Your AI generated cover letter will appear here..."}
                  className={`w-full flex-1 min-h-62.5 border border-slate-200 rounded-lg p-5 text-[14px] leading-relaxed resize-none bg-white font-serif outline-none transition shadow-inner ${
                    isGenerating
                      ? "text-slate-300 cursor-wait opacity-60"
                      : "text-slate-700 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  }`}
                />
              )}

              {!isGenerating && !error && (
                <p className="text-[11px] text-slate-400 mt-3 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full inline-block" />
                  You can personalize the AI&apos;s draft above before using it.
                </p>
              )}
            </div>

            {/* Success banner */}
            {!isGenerating && !error && coverLetter && (
              <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-6">
                <Check size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-[12px] text-emerald-700 font-medium leading-relaxed">
                  Tailored based on your default CV and specific job requirements.
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-4 mt-2">
              <button
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 h-11 px-5 border border-slate-200 bg-white rounded-xl text-[14px] font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={isGenerating ? "animate-spin" : ""}
                />
                Regenerate
              </button>

              <button
                onClick={handleDone}
                disabled={isGenerating || !coverLetter}
                className="flex flex-1 items-center justify-center gap-2 h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[15px] font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
              >
                <Check size={18} strokeWidth={3} />
                Use this Letter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
