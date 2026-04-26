"use client";

import { useState, useEffect, useCallback } from "react";
import { X, RefreshCw, Check, Sparkles, Loader2 } from "lucide-react";
import { candidateJobService } from "@/lib/candidate/job.service";

interface AICoverLetterModalProps {
  jobId: string;
  jobTitle: string;
  candidateName?: string;
  onDone: (coverLetterText: string) => void;
  onClose: () => void;
  isAiRecommended?: boolean;
  matchScore?: number;
  customCvUrl?: string;
}

import { AIJobAnalysis } from "@/lib/candidate/job.service";

export default function AICoverLetterModal({
  jobId,
  jobTitle,
  candidateName = "Your Name",
  onDone,
  onClose,
  isAiRecommended,
  matchScore,
  customCvUrl,
}: AICoverLetterModalProps) {
  const [analysis, setAnalysis] = useState<AIJobAnalysis | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    try {
      setIsGenerating(true);
      setError(null);
      const result = await candidateJobService.generateCoverLetter(jobId, customCvUrl);
      setAnalysis(result);
      setCoverLetter(result.coverLetter);
    } catch (err: any) {
      console.error("Failed to generate analysis:", err);
      const message = err instanceof Error ? err.message : "Failed to generate analysis. Please try again.";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  }, [jobId, customCvUrl]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const handleRegenerate = () => {
    fetchAnalysis();
  };

  const handleDone = () => {
    if (!coverLetter || isGenerating) return;
    onDone(coverLetter);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-95 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center justify-center px-4">
        <div className="relative w-full animate-in fade-in zoom-in duration-300">
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
          >
            <X size={20} />
          </button>

          <div className="relative w-full rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] max-h-[90vh]">
            
            {/* Left Column: Analysis */}
            <div className="w-full md:w-2/5 bg-slate-50 p-8 border-r border-slate-100 overflow-y-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-100">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 leading-tight">AI Matching Insights</h1>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Personalized Analysis</p>
                </div>
              </div>

              {isGenerating ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-32 bg-slate-200 rounded-2xl" />
                  <div className="h-48 bg-slate-200 rounded-2xl" />
                </div>
              ) : analysis ? (
                <div className="space-y-8">
                  {/* Single AI Score Gauge */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-slate-700">AI Match Score</span>
                      <span className={`text-lg font-black ${analysis.overallScore >= 80 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                        {analysis.overallScore}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out ${analysis.overallScore >= 80 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${analysis.overallScore}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-3 font-medium">
                      Deep analysis based on your stored CV and full job requirements.
                    </p>
                  </div>

                  {/* Suggestions */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <Check size={14} className="text-indigo-500" />
                      Key Suggestions
                    </h3>
                    <div className="space-y-3">
                      {analysis.suggestions.map((suggestion, idx) => (
                        <div key={idx} className="flex gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm transition-hover hover:border-indigo-200">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600 border border-indigo-100">
                            {idx + 1}
                          </span>
                          <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                            {suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Right Column: Cover Letter Editor */}
            <div className="flex-1 p-8 flex flex-col bg-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Tailored Cover Letter</h2>
                  <p className="text-[13px] text-slate-500 font-medium">
                    For <span className="text-indigo-600 font-bold">{jobTitle}</span>
                  </p>
                </div>
                {isGenerating && (
                  <span className="flex items-center gap-1.5 text-[12px] text-indigo-600 font-bold animate-pulse">
                    <Loader2 size={14} className="animate-spin" />
                    AI is writing...
                  </span>
                )}
              </div>

              <div className="flex-1 relative mb-6">
                {error ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-red-50 rounded-2xl border border-red-100">
                    <p className="text-sm text-red-600 font-medium mb-3">{error}</p>
                    <button 
                      onClick={handleRegenerate}
                      className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    disabled={isGenerating}
                    placeholder={isGenerating ? "" : "AI is preparing your personalized cover letter..."}
                    className={`w-full h-full border border-slate-200 rounded-2xl p-6 text-[14px] leading-relaxed resize-none bg-slate-50/50 font-serif outline-none transition-all shadow-inner ${
                      isGenerating
                        ? "text-slate-300 cursor-wait opacity-60"
                        : "text-slate-700 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                    }`}
                  />
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-2 h-12 px-6 border border-slate-200 bg-white rounded-xl text-[14px] font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={isGenerating ? "animate-spin" : ""} />
                  Regenerate
                </button>

                <button
                  onClick={handleDone}
                  disabled={isGenerating || !coverLetter}
                  className="flex flex-1 items-center justify-center gap-2 h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[15px] font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
                >
                  <Check size={18} strokeWidth={3} />
                  Confirm and Apply
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
