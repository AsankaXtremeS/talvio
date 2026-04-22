"use client";

import { useQuery } from "@tanstack/react-query";
import { X, Clock3, ChevronLeft, Calendar, Info, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getApplicationWithHistory, ApplicationWithHistory } from "@/lib/candidate/applications.service";
import { useEffect } from "react";

interface ApplicationTimelineProps {
  applicationId: string;
  applicationTitle: string;
  onClose: () => void;
}

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function ApplicationTimeline({
  applicationId,
  applicationTitle,
  onClose,
}: ApplicationTimelineProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const { data, isLoading, isError, error } = useQuery<ApplicationWithHistory, Error>({
    queryKey: ["application-history", applicationId],
    queryFn: () => getApplicationWithHistory(applicationId),
    enabled: !!applicationId,
    staleTime: 1000 * 60 * 2,
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop with blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[32px] border border-white/20 bg-white/95 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] backdrop-blur-xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/50 p-6 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm">
                <Clock3 size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 leading-tight">{applicationTitle}</h2>
                <div className="flex items-center gap-2 mt-0.5 text-slate-500">
                  <span className="text-xs font-medium uppercase tracking-wider">Application Journey</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="group flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 active:scale-95"
              aria-label="Close timeline"
            >
              <X size={20} className="transition-transform group-hover:rotate-90" />
            </button>
          </div>

          <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar max-h-[calc(90vh-100px)]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
                <p className="text-sm font-medium text-slate-500">Syncing your application status...</p>
              </div>
            ) : isError ? (
              <div className="rounded-2xl border border-red-100 bg-red-50/50 p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
                  <Info size={24} />
                </div>
                <h3 className="text-base font-semibold text-red-900">Oops! Something went wrong</h3>
                <p className="mt-2 text-sm text-red-600/80">
                  {error?.message || "We couldn't retrieve the timeline history at this moment."}
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-6 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : !data ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-8 text-center">
                <p className="text-sm font-medium text-slate-500">No timeline information found.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Summary Card */}
                <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-xl">
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl" />
                  <div className="relative z-10 grid gap-6 sm:grid-cols-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Current Standing</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-400" />
                        <span className="text-lg font-bold">{data.applicationStatus}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Company</span>
                      <p className="text-sm font-medium text-slate-200 line-clamp-1">
                        {data.jobPost.employer.companyName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="relative">
                  {data.statusHistory.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-slate-100 p-10 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-300 mb-3">
                        <Clock3 size={24} />
                      </div>
                      <p className="font-bold text-slate-900">No history yet</p>
                      <p className="mt-1 text-sm text-slate-500 max-w-[240px] mx-auto">
                        Your application is waiting for the first update from the employer.
                      </p>
                    </div>
                  ) : (
                    <div className="relative space-y-2 ml-4">
                      {/* Vertical line connector */}
                      <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-500 via-indigo-200 to-transparent" />
                      
                      {data.statusHistory.map((step, index) => (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          key={step.id} 
                          className="relative pl-10 pb-8 last:pb-0"
                        >
                          {/* Dot indicator */}
                          <div className={`absolute left-[-5px] top-1.5 h-3 w-3 rounded-full border-2 border-white shadow-sm ring-4 ring-white ${
                            index === 0 ? "bg-indigo-600 scale-125" : "bg-slate-300"
                          }`} />

                          <div className={`group relative rounded-2xl border p-5 transition-all hover:shadow-md ${
                            index === 0 
                              ? "border-indigo-100 bg-indigo-50/30 ring-1 ring-indigo-50" 
                              : "border-slate-100 bg-white"
                          }`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1">
                                <h4 className={`text-sm font-bold ${index === 0 ? "text-indigo-900" : "text-slate-900"}`}>
                                  {step.status}
                                </h4>
                                {step.note && (
                                  <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                                    {step.note}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 self-start rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">
                                <Calendar size={12} className="text-slate-400" />
                                {formatDate(step.changedAt)}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info Footer */}
                <div className="flex items-start gap-3 rounded-2xl bg-amber-50/50 p-4 border border-amber-100/50">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <ChevronLeft size={14} className="rotate-180" />
                  </div>
                  <p className="text-xs font-medium leading-relaxed text-amber-800/80">
                    Updates are reflected automatically when the employer modifies your application status in their dashboard.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

