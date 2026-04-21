// Interviews Dashboard Page
// Route: /users/employer/interviews
//
// Shows:
// - List of upcoming scheduled interviews (real data from API)
// - Interactive calendar with dots on days that have interviews
// - Clicking a date filters the interview list
// - Interview cards with options menu (Reschedule / Cancel)

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Video,
  MapPin,
  Phone,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Clock
} from "lucide-react";
import { getInterviews, getScheduledDates, getInterview } from "@/lib/employer/interviews.service";
import { InterviewDTO } from "@/types/employer/interview.types";
import InterviewDetailsModal from "@/components/employer/interviews/InterviewDetailsModal";
import InterviewCard from "@/components/employer/interviews/InterviewCard";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });
  } catch { return "—"; }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit",
      timeZone: "UTC",
    });
  } catch { return "—"; }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getTypeIcon(type: string) {
  const t = type?.toLowerCase() ?? "";
  if (t === "online")  return <Video   size={22} className="text-[#595781] shrink-0" />;
  if (t === "onsite") return <MapPin   size={22} className="text-[#595781] shrink-0" />;
  if (t === "phone")  return <Phone    size={22} className="text-[#595781] shrink-0" />;
  return <Video size={22} className="text-[#595781] shrink-0" />;
}

function getTypeLabel(type: string): string {
  const t = type?.toLowerCase() ?? "";
  if (t === "online") return "Google Meet";
  if (t === "onsite") return "On-Site";
  if (t === "phone")  return "Phone";
  return type;
}

// Build first-day-of-month offset for calendar grid
function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();   // 0=Sun
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InterviewsDashboardPage() {
  const router = useRouter();

  // ── Calendar state ──
  const today = new Date();
  const [calYear, setCalYear]   = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());  // 0-based
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  // ── Data state ──
  const [interviews, setInterviews]           = useState<InterviewDTO[]>([]);
  const [oldInterviews, setOldInterviews]     = useState<Map<string, InterviewDTO>>(new Map());
  const [scheduledDates, setScheduledDates]   = useState<Set<string>>(new Set());
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);

  // ── UI state ──
  const [openMenuId, setOpenMenuId]     = useState<string | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<InterviewDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Fetch interviews + calendar dates ──────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [result, dates] = await Promise.all([
        getInterviews({ status: "SCHEDULED", limit: 100 }),
        getScheduledDates(calYear, calMonth + 1),   // API uses 1-based month
      ]);
      setInterviews(result.data);
      setScheduledDates(new Set(dates));
      console.log("Fetched interviews:", result.data);
      console.log("Rescheduled count:", result.data.filter(iv => iv.rescheduledFromId).length);

      // Fetch old interview details for rescheduled ones
      const rescheduledInterviews = result.data.filter(iv => iv.rescheduledFromId);
      if (rescheduledInterviews.length > 0) {
        const oldInterviewMap = new Map<string, InterviewDTO>();
        for (const iv of rescheduledInterviews) {
          if (iv.rescheduledFromId && !oldInterviewMap.has(iv.rescheduledFromId)) {
            try {
              console.log(`[Fetching old interview] ${iv.rescheduledFromId} for new interview ${iv.id}`);
              const oldData = await getInterview(iv.rescheduledFromId);
              oldInterviewMap.set(iv.rescheduledFromId, oldData);
              console.log(`[Old interview loaded] ${iv.rescheduledFromId}:`, oldData);
            } catch (err) {
              console.error(`[Failed to fetch old interview ${iv.rescheduledFromId}]:`, err instanceof Error ? err.message : err);
              // Old interview might be cancelled - try to continue anyway
            }
          }
        }
        setOldInterviews(oldInterviewMap);
        console.log(`[Reschedule data loaded] ${rescheduledInterviews.length} rescheduled, ${oldInterviewMap.size} old interviews fetched`);
      }
    } catch (err) {
      setError("Failed to load interviews. Please refresh.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [calYear, calMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Auto-refresh when page becomes visible (after reschedule) ──
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Page became visible - refreshing interviews");
        fetchData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchData]);

  // ── Calendar navigation ────────────────────────────────────────────────────
  const prevMonth = () => {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else                { setCalMonth((m) => m - 1); }
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else                 { setCalMonth((m) => m + 1); }
    setSelectedDay(null);
  };

  // ── Filter interviews by selected day ─────────────────────────────────────
  const visibleInterviews = selectedDay
    ? interviews
        .filter((iv) => iv.status !== "CANCELLED") // Hide cancelled interviews
        .filter((iv) => {
          const d = new Date(iv.scheduledAt);
          return (
            d.getUTCFullYear() === calYear &&
            d.getUTCMonth()    === calMonth &&
            d.getUTCDate()     === selectedDay
          );
        })
    : interviews.filter((iv) => iv.status !== "CANCELLED"); // Hide cancelled interviews

  // ── Cancel interview ──────────────────────────────────────────────────────
  const handleCancel = (id: string) => {
    // Navigate to cancel page instead of directly cancelling
    console.log("[handleCancel] Navigating to cancel page for interview:", id);
    router.push(`/users/employer/interviews/${id}/cancel`);
  };
  // ── Open interview details modal ────────────────────────────────────────
  const handleOpenDetails = (interview: InterviewDTO) => {
    setSelectedInterview(interview);
    setIsModalOpen(true);
  };

  // ── Close interview details modal ──────────────────────────────────────
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedInterview(null), 200); // Wait for animation
  };
  // ── Calendar cell helpers ──────────────────────────────────────────────────
  const firstDow  = getFirstDayOfWeek(calYear, calMonth);
  const daysInMon = getDaysInMonth(calYear, calMonth);

  function hasScheduled(day: number): boolean {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return scheduledDates.has(dateStr);
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 min-h-screen bg-[#F7F9FC] font-sans flex flex-col">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-40 bg-[#F7F9FC] backdrop-blur border-b ">
        <div className="max-w-7xl px-4 py-6 mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 text-indigo-700 rounded-lg bg-indigo-50">
                  <CalendarDays size={26} />
                </div>
                <h1 className="text-2xl font-bold text-indigo-500">Interviews</h1>
              </div>
              <p className="ml-11 text-sm text-gray-500">
                Manage your schedule and upcoming candidate interviews
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 max-w-7xl w-full px-4 py-8 mx-auto">

        {/* ── Error ── */}
        {error && (
          <div className="mb-4 px-3 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertTriangle size={20}/> {error}
          </div>
        )}

        {/* ── Main grid: interviews list + calendar ── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">

          {/* LEFT: Interview list */}
          <div className="lg:col-span-3 space-y-4 relative">

            {/* Close menu on outside click */}
            {openMenuId && (
              <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
            )}

            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-gray-900">
                {selectedDay
                  ? `Interviews on ${MONTH_NAMES[calMonth]} ${selectedDay}`
                  : "Upcoming Interviews"}
              </h2>
              {selectedDay && (
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-xs text-indigo-500 underline hover:text-indigo-700"
                >
                  Show all
                </button>
              )}
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center h-40 text-gray-400 gap-2">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">Loading interviews…</span>
              </div>
            )}

            {/* Empty state */}
            {!loading && visibleInterviews.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2 rounded-2xl border border-dashed border-gray-200 bg-white">
                <CalendarDays size={28} className="opacity-40" />
                <p className="text-sm">
                  {selectedDay ? "No interviews on this day." : "No scheduled interviews yet."}
                </p>
              </div>
            )}

            {/* Interview cards */}
            {!loading && visibleInterviews.map((iv) => (
              <InterviewCard
                key={iv.id}
                interview={iv}
                openMenuId={openMenuId}
                onMenuClick={(id) => setOpenMenuId(id === openMenuId ? null : id)}
                onCardClick={handleOpenDetails}
                onReschedule={(interview) => {
                  console.log("[onReschedule] Handler called with interview:", interview.id);
                  
                  if (!interview.jobPost?.id || !interview.candidate?.id || !interview.id) {
                    console.error("[onReschedule] Missing required data:", {
                      interviewId: interview.id,
                      jobPostId: interview.jobPost?.id,
                      candidateId: interview.candidate?.id,
                    });
                    alert("Interview data is incomplete. Please refresh and try again.");
                    return;
                  }
                  
                  try {
                    setOpenMenuId(null);
                    const rescheduleUrl = `/users/employer/job-posts/${interview.jobPost.id}/candidates/${interview.candidate.id}/schedule?interviewId=${interview.id}`;
                    console.log("[onReschedule] Navigating to:", rescheduleUrl);
                    console.log("[onReschedule] Full interview data:", {
                      interviewId: interview.id,
                      jobPostId: interview.jobPost.id,
                      jobPostTitle: interview.jobPost.title,
                      candidateId: interview.candidate.id,
                      candidateName: interview.candidate.name,
                    });
                    
                    // Use setTimeout to ensure menu closes before navigation
                    setTimeout(() => {
                      router.push(rescheduleUrl);
                    }, 100);
                  } catch (error) {
                    console.error("[onReschedule] Error:", error);
                    alert("Failed to navigate to reschedule page. Please try again.");
                  }
                }}
                onCancel={handleCancel}
                getTypeIcon={getTypeIcon}
                getTypeLabel={getTypeLabel}
                getInitials={getInitials}
                formatDate={formatDate}
                formatTime={formatTime}
              />
            ))}
          </div>

          {/* RIGHT: Calendar + Notifications */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-[#dbe7ff] bg-white p-5">

              {/* Calendar header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-gray-900">
                  {MONTH_NAMES[calMonth]} {calYear}
                </h2>
                <div className="flex gap-1">
                  <button
                    onClick={prevMonth}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Day labels */}
              <div className="grid grid-cols-7 mb-3">
                {WEEK_DAYS.map((d) => (
                  <div key={d} className="text-[10px] font-semibold text-center text-gray-400 uppercase">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-y-1">
                {/* Leading empty cells */}
                {Array.from({ length: firstDow }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMon }, (_, i) => i + 1).map((day) => {
                  const isSelected = day === selectedDay;
                  const isToday    = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
                  const hasIv      = hasScheduled(day);

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                      className={`
                        relative mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors
                        ${isSelected
                          ? "bg-indigo-600 text-white"
                          : isToday
                          ? "bg-indigo-50 text-indigo-700 font-bold"
                          : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      {day}
                      {/* Interview dot indicator */}
                      {hasIv && (
                        <span
                          className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-3.5 rounded-full
                            ${isSelected ? "bg-white/90" : "bg-indigo-500"}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Stats below calendar */}
              <div className="pt-5 mt-5 space-y-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Scheduled this month</span>
                  <span className="font-bold text-gray-900">{scheduledDates.size}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total upcoming</span>
                  <span className="font-bold text-indigo-600">{interviews.length}</span>
                </div>
              </div>
            </div>

            {/* Reschedule Interview Notifications Card */}
            <div className="rounded-2xl border border-[#dbe7ff] bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 text-indigo-600 rounded-lg bg-indigo-50">
                  <Clock size={18} />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Interview Notifications</h3>
                <span className="ml-auto px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                  {interviews.filter(iv => iv.rescheduledFromId).length}
                </span>
              </div>

              {interviews.filter(iv => iv.rescheduledFromId).length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2 relative">
                  {/* Scroll indicator when content overflows */}
                  {interviews.filter(iv => iv.rescheduledFromId).length > 3 && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-indigo-400 animate-bounce text-xs">↓</div>
                  )}
                  {interviews
                    .filter(iv => iv.rescheduledFromId)
                    .map((newIv) => {
                      const oldIv = newIv.rescheduledFromId ? oldInterviews.get(newIv.rescheduledFromId) : null;
                      console.log(`[Reschedule notification] newIv: ${newIv.id}, rescheduledFromId: ${newIv.rescheduledFromId}, oldIv loaded: ${!!oldIv}`);
                      return (
                        <div
                          key={newIv.id}
                          onClick={() => handleOpenDetails(newIv)}
                          className="group cursor-pointer p-3 rounded-lg bg-indigo-50 border border-indigo-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200"
                        >
                          {/* Horizontal compact layout */}
                          <div className="space-y-2">
                            {/* First row: Candidate + Job Title */}
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-200 text-[8px] font-bold text-indigo-700 shrink-0">
                                {getInitials(newIv.candidate?.name ?? "?")}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-gray-800 truncate">
                                  {newIv.candidate?.name ?? "—"}
                                </p>
                                <p className="text-[10px] text-gray-500 truncate">
                                  {newIv.jobPost?.title ?? "—"}
                                </p>
                              </div>
                            </div>

                            {/* Second row: Date/Time and Meeting Type */}
                            <div className="space-y-1.5 ml-9">
                              {oldIv ? (
                                <>
                                  {/* Date and Time row */}
                                  <div className="flex items-center gap-2 text-[10px]">
                                    <span className="text-gray-600 font-medium">
                                      {formatDate(oldIv.scheduledAt)}, {formatTime(oldIv.scheduledAt)}
                                    </span>
                                    <span className="text-indigo-400 font-bold">→</span>
                                    <span className="text-indigo-600 font-medium">
                                      {formatDate(newIv.scheduledAt)}, {formatTime(newIv.scheduledAt)}
                                    </span>
                                  </div>
                                  
                                  {/* Meeting Type row */}
                                  <div className="flex items-center gap-2 text-[9px]">
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">
                                      {getTypeLabel(oldIv.meetingType)}
                                    </span>
                                    
                                    <span className="px-2 py-0.5 ml-9.5 bg-indigo-100 text-indigo-600 rounded font-medium">
                                      {getTypeLabel(newIv.meetingType)}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <span className="text-gray-400 text-[10px]">Loading...</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-gray-400 gap-2">
                  <Clock size={24} className="opacity-30" />
                  <p className="text-xs text-center">No rescheduled interviews yet</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Interview Details Modal */}
      <InterviewDetailsModal
        interview={selectedInterview}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}