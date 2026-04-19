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
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { getInterviews, cancelInterview, getScheduledDates } from "@/lib/employer/interviews.service";
import { InterviewDTO } from "@/types/employer/interview.types";
import InterviewDetailsModal from "@/components/employer/interviews/InterviewDetailsModal";

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
  const [scheduledDates, setScheduledDates]   = useState<Set<string>>(new Set());
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);

  // ── UI state ──
  const [openMenuId, setOpenMenuId]     = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
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
    } catch (err) {
      setError("Failed to load interviews. Please refresh.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [calYear, calMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
    ? interviews.filter((iv) => {
        const d = new Date(iv.scheduledAt);
        return (
          d.getUTCFullYear() === calYear &&
          d.getUTCMonth()    === calMonth &&
          d.getUTCDate()     === selectedDay
        );
      })
    : interviews;

  // ── Cancel interview ──────────────────────────────────────────────────────
  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this interview?")) return;
    setCancellingId(id);
    try {
      await cancelInterview(id);
      setInterviews((prev) => prev.filter((iv) => iv.id !== id));
    } catch (err) {
      alert("Failed to cancel: " + (err as Error).message);
    } finally {
      setCancellingId(null);
      setOpenMenuId(null);
    }
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
    <div className="flex-1 min-h-screen bg-[#F7F9FC] font-sans">
      <div className="max-w-5xl px-4 py-8 mx-auto pt-4">

        {/* ── Header ── */}
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
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

        {/* ── Error ── */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertTriangle size={20}/> {error}
          </div>
        )}

        {/* ── Main grid: interviews list + calendar ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* LEFT: Interview list */}
          <div className="lg:col-span-2 space-y-4 relative">

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
              <div
                key={iv.id}
                onClick={() => handleOpenDetails(iv)}
                className="relative flex flex-col gap-3 rounded-2xl border border-[#dbe7ff] bg-white p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-indigo-400 hover:-translate-y-0.5 group"
              >
                {/* Options menu button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === iv.id ? null : iv.id);
                  }}
                  className={`absolute p-1.5 rounded-lg top-4 right-4 z-20 transition-colors
                    ${openMenuId === iv.id ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"}`}
                >
                  <MoreVertical size={18} />
                </button>

                {/* Dropdown */}
                {openMenuId === iv.id && (
                  <div className="absolute right-4 top-12 z-30 w-44 rounded-xl border border-[#dbe7ff] bg-white py-1.5 shadow-lg animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                        router.push(`/users/employer/job-posts/${iv.jobPost.id}/candidates/${iv.candidate.id}/schedule`);
                      }}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Reschedule
                    </button>
                    <div className="my-1 border-t border-gray-100" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancel(iv.id);
                      }}
                      disabled={cancellingId === iv.id}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {cancellingId === iv.id ? "Cancelling…" : "Cancel Interview"}
                    </button>
                  </div>
                )}

                {/* Date/time + icon */}
                <div className="flex items-center gap-3 pr-10">
                  {getTypeIcon(iv.meetingType)}
                  <span className="text-lg font-bold text-gray-800 tracking-tight">
                    {formatDate(iv.scheduledAt)}, {formatTime(iv.scheduledAt)}
                  </span>
                </div>

                <div className="my-0.5 border-t border-gray-100" />

                {/* Candidate pill */}
                <div className="flex items-center gap-2 w-fit px-3 py-1.5 bg-[#F5F6F8] rounded-xl">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-100 to-purple-100 text-[10px] font-bold text-indigo-700">
                    {getInitials(iv.candidate?.name ?? "?")}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{iv.candidate?.name ?? "—"}</span>
                </div>

                {/* Role + type pill */}
                <div className="flex items-center gap-2 w-fit px-3 py-1.5 bg-[#F5F6F8] rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  <span className="text-sm font-medium text-gray-600">
                    {iv.jobPost?.title ?? "—"} · {getTypeLabel(iv.meetingType)} Interview
                  </span>
                </div>

                {/* Meet link if online */}
                {iv.meetingType === "ONLINE" && iv.meetingLink && (
                  <a
                    href={iv.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-500 underline ml-1 hover:text-indigo-700 truncate"
                  >
                    {iv.meetingLink}
                  </a>
                )}
                {iv.meetingType === "ONSITE" && iv.location && (
                  <p className="text-xs text-gray-400 ml-1">📍 {iv.location}</p>
                )}
              </div>
            ))}
          </div>

          {/* RIGHT: Calendar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-[#dbe7ff] bg-white p-5 sticky top-4">

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