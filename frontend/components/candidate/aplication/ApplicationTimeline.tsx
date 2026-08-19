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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Animated Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[40px] border border-white/30 bg-white/80 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.25)] backdrop-blur-2xl ring-1 ring-black/5"
        >
          {/* Decorative background element */}
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-[80px]" />
          <div className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />

          {/* Header Section */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/20 bg-white/30 px-8 py-7 backdrop-blur-md">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 opacity-20 blur transition duration-500 group-hover:opacity-40" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                  <Clock3 className="h-7 w-7 text-indigo-600" />
                </div>
              </div>
              <div className="space-y-0.5">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{applicationTitle}</h2>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Application Journey</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="group relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-100 transition-all hover:scale-105 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
              aria-label="Close timeline"
            >
              <X size={22} className="transition-transform duration-500 group-hover:rotate-180" />
            </button>
          </div>

          <div className="relative z-10 overflow-y-auto p-8 space-y-10 custom-scrollbar max-h-[calc(90vh-120px)]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <div className="relative">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-50 border-t-indigo-600" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-6 animate-pulse rounded-full bg-indigo-200" />
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-400 tracking-wide uppercase">Syncing your status...</p>
              </div>
            ) : isError ? (
              <div className="rounded-[32px] border border-red-100 bg-red-50/30 p-10 text-center backdrop-blur-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-inner mb-6">
                  <Info size={32} />
                </div>
                <h3 className="text-xl font-bold text-red-900">Sync Error</h3>
                <p className="mt-3 text-sm text-red-600/80 leading-relaxed max-w-xs mx-auto">
                  {error?.message || "We couldn't retrieve your timeline history at this moment."}
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-8 rounded-2xl bg-red-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 transition-all hover:bg-red-700 hover:-translate-y-1 active:translate-y-0"
                >
                  Reconnect Now
                </button>
              </div>
            ) : !data ? (
              <div className="rounded-[32px] border border-slate-100 bg-white/50 p-12 text-center backdrop-blur-sm">
                <p className="text-base font-bold text-slate-400">No journey records found.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Timeline Grid */}
                <div className="relative px-2">
                  <div className="relative">
                    {/* Background line with gradient */}
                    <div className="absolute left-6 top-6 bottom-6 w-[3px] rounded-full bg-slate-100" />
                    
                    {[
                      { id: 'applied', label: 'Applied', status: 'Applied', date: data.appliedAt, note: 'Your application has been received and added to the queue' },
                      { id: 'reviewed', label: 'Reviewed', status: 'Reviewed', date: data.statusHistory.find(h => h.status === 'REVIEWED')?.changedAt, note: 'The hiring team is evaluating your profile and experience' },
                      { id: 'shortlisted', label: 'Shortlisted', status: 'Shortlisted', date: data.statusHistory.find(h => h.status === 'SHORTLISTED' || h.status === 'HIRED')?.changedAt, note: 'Congratulations! You have been shortlisted for further steps' }
                    ].map((step, index) => {
                      const isDone = (step.label === 'Applied') || 
                                     (step.label === 'Reviewed' && (data.applicationStatus === 'REVIEWED' || data.applicationStatus === 'SHORTLISTED' || data.applicationStatus === 'HIRED' || data.applicationStatus === 'REJECTED')) ||
                                     (step.label === 'Shortlisted' && (data.applicationStatus === 'SHORTLISTED' || data.applicationStatus === 'HIRED'));
                      
                      const isCurrent = (step.label === 'Applied' && data.applicationStatus === 'PENDING') ||
                                        (step.label === 'Reviewed' && data.applicationStatus === 'REVIEWED') ||
                                        (step.label === 'Shortlisted' && (data.applicationStatus === 'SHORTLISTED' || data.applicationStatus === 'HIRED'));

                      const isRejected = data.applicationStatus === 'REJECTED' && step.label === 'Reviewed';

                      return (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.15, type: "spring" }}
                          key={step.id} 
                          className="relative pl-16 pb-12 last:pb-0"
                        >
                          {/* Advanced Dot Indicator */}
                          <div className="absolute left-[18px] top-1.5 flex h-7 w-7 items-center justify-center">
                            {isCurrent && (
                              <motion.div 
                                layoutId="active-glow"
                                className="absolute h-10 w-10 rounded-full bg-indigo-500/20 blur-md"
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                              />
                            )}
                            <div className={`z-10 h-3.5 w-3.5 rounded-full ring-[6px] ring-white transition-all duration-700 ${
                              isRejected ? "bg-red-500 ring-red-50" : 
                              isCurrent ? "bg-indigo-600 ring-indigo-50 scale-110" : 
                              isDone ? "bg-emerald-500 ring-emerald-50" : "bg-slate-200 ring-transparent"
                            }`} />
                          </div>

                          {/* Card Content */}
                          <div className={`group relative rounded-[28px] border-2 p-6 transition-all duration-500 ${
                            isCurrent 
                              ? "border-indigo-100 bg-white shadow-[0_20px_40px_-12px_rgba(79,70,229,0.08)] scale-[1.02]" 
                              : isRejected ? "border-red-50 bg-red-50/10" : 
                                isDone ? "border-emerald-50 bg-emerald-50/5 shadow-sm" : 
                                "border-transparent bg-slate-50/50 opacity-60"
                          }`}>
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <h4 className={`text-lg font-black tracking-tight ${isCurrent ? "text-indigo-950" : isRejected ? "text-red-950" : "text-slate-900"}`}>
                                    {step.label}
                                  </h4>
                                  {isDone && !isCurrent && !isRejected && (
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-200">
                                      <CheckCircle2 size={12} />
                                    </div>
                                  )}
                                  {isRejected && (
                                    <span className="rounded-lg bg-red-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm shadow-red-200">
                                      Closed
                                    </span>
                                  )}
                                </div>
                                <p className={`text-[13px] leading-relaxed font-medium max-w-sm ${isCurrent ? "text-slate-600" : "text-slate-400"}`}>
                                  {isRejected ? "The application process for this role has been concluded" : step.note}
                                </p>
                              </div>
                              {step.date && isDone && (
                                <div className="flex items-center gap-2.5 self-start rounded-2xl bg-white px-4 py-2 text-[11px] font-black text-slate-900 shadow-sm ring-1 ring-slate-100 transition-all group-hover:shadow-md group-hover:-translate-y-0.5">
                                  <Calendar size={14} className="text-slate-400" />
                                  {formatDate(step.date)}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Modern Info Footer */}
                <div className="group relative overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-xl shadow-slate-200 transition-all hover:scale-[1.01]">
                  <div className="absolute right-0 top-0 h-32 w-32 translate-x-12 -translate-y-12 rounded-full bg-indigo-500/10 blur-3xl" />
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 transition-transform group-hover:rotate-12">
                      <Info size={20} className="text-slate-100" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Live Updates</p>
                      <p className="text-[13px] font-medium leading-relaxed text-slate-200">
                        Stay tuned! Updates are reflected instantly as soon as the employer modifies your status in their dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

