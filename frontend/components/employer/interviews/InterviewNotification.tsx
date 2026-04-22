"use client";

import { Clock, ArrowLeft } from "lucide-react";
import { InterviewDTO } from "@/types/employer/interview.types";

interface RescheduleInterviewNotificationProps {
  interviews: InterviewDTO[];
  cancelledInterviews: InterviewDTO[];
  oldInterviews: Map<string, InterviewDTO>;
  onOpenDetails: (interview: InterviewDTO) => void;
  formatDate: (iso: string) => string;
  formatTime: (iso: string) => string;
  getInitials: (name: string) => string;
  getTypeLabel: (type: string) => string;
  onBack?: () => void;
}

export default function RescheduleInterviewNotification({
  interviews,
  cancelledInterviews,
  oldInterviews,
  onOpenDetails,
  formatDate,
  formatTime,
  getInitials,
  getTypeLabel,
  onBack,
}: RescheduleInterviewNotificationProps) {
  // 1. Reschedule actions: Any interview created from a reschedule represents a Reschedule action.
  // We look at BOTH scheduled and cancelled interviews, because an interview might have been rescheduled,
  // and then later cancelled. The reschedule action still happened and should remain in history!
  const allKnownInterviews = [...interviews, ...cancelledInterviews];
  const uniqueAllInterviews = Array.from(
    new Map(allKnownInterviews.map((iv) => [iv.id, iv])).values()
  );
  const rescheduleList = uniqueAllInterviews.filter((iv) => iv.rescheduledFromId);

  // 2. Cancel actions: Any interview in `cancelledInterviews` represents a Cancel action,
  // EXCEPT if it was cancelled because it was rescheduled.
  // We check !iv.rescheduledToId, and ALSO ensure its ID is not referenced as a rescheduledFromId.
  const rescheduledFromIds = new Set(
    allKnownInterviews.map((iv) => iv.rescheduledFromId).filter(Boolean)
  );
  const pureCancelledInterviews = cancelledInterviews.filter(
    (iv) => !iv.rescheduledToId && !rescheduledFromIds.has(iv.id)
  );
  const cancelList = Array.from(
    new Map(pureCancelledInterviews.map((iv) => [iv.id, iv])).values()
  );

  // 3. Combine and sort
  const allNotifications = [
    ...rescheduleList.map(iv => ({
      type: 'RESCHEDULE' as const,
      data: iv,
      sortDate: new Date(iv.createdAt).getTime(), // Reschedule action happened at creation
      uniqueKey: `RESCHEDULE-${iv.id}`
    })),
    ...cancelList.map(iv => ({
      type: 'CANCEL' as const,
      data: iv,
      sortDate: new Date(iv.updatedAt || iv.createdAt).getTime(), // Cancel action happened at update
      uniqueKey: `CANCEL-${iv.id}`
    }))
  ].sort((a, b) => b.sortDate - a.sortDate);

  const rescheduledCount = rescheduleList.length;
  const cancelledCount = cancelList.length;
  const totalCount = rescheduledCount + cancelledCount;

  return (
    <div className="rounded-2xl border border-[#dbe7ff] bg-white p-5 relative">
      <div className="flex items-center gap-2 mb-4">
        {onBack && (
          <button
            type="button"
            className="mr-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none"
            aria-label="Back"
            onClick={onBack}
          >
            <ArrowLeft size={18} className="text-gray-400" />
          </button>
        )}

        <h3 className="text-sm font-bold text-gray-900 -ml-1.5">Interview Notifications</h3>
      </div>

      {totalCount > 0 ? (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-2 relative">
          {/* Scroll indicator when content overflows */}
          {totalCount > 3 && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-indigo-400 animate-bounce text-xs">↓</div>
          )}

          {/* All Notifications Sorted Chronologically */}
          {allNotifications.map(({ type, data: iv, uniqueKey }) => {
            if (type === 'RESCHEDULE') {
              const oldIv = iv.rescheduledFromId ? oldInterviews.get(iv.rescheduledFromId) : null;
              return (
                <div
                  key={uniqueKey}
                  onClick={() => onOpenDetails(iv)}
                  className="group cursor-pointer p-3 rounded-lg bg-indigo-50 border border-indigo-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-200 text-[8px] font-bold text-indigo-700 shrink-0">
                        {getInitials(iv.candidate?.name ?? "?")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {iv.candidate?.name ?? "—"}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {iv.jobPost?.title ?? "—"}
                        </p>
                      </div>
                      <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded text-[8px] font-semibold shrink-0 whitespace-nowrap">
                        Rescheduled
                      </span>
                    </div>

                    <div className="space-y-1.5 ml-9">
                      {oldIv ? (
                        <>
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-gray-600 font-medium">
                              {formatDate(oldIv.scheduledAt)}, {formatTime(oldIv.scheduledAt)}
                            </span>
                            <span className="text-indigo-400 font-bold">→</span>
                            <span className="text-indigo-600 font-medium">
                              {formatDate(iv.scheduledAt)}, {formatTime(iv.scheduledAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[9px]">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">
                              {getTypeLabel(oldIv.meetingType)}
                            </span>
                            <span className="px-2 py-0.5 ml-9.5 bg-indigo-100 text-indigo-600 rounded font-medium">
                              {getTypeLabel(iv.meetingType)}
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
            }

            // Cancel notification
            return (
              <div
                key={uniqueKey}
                onClick={() => onOpenDetails(iv)}
                className="group cursor-pointer p-3 rounded-lg bg-red-50 border border-red-200 shadow-sm hover:shadow-md hover:border-red-300 transition-all duration-200"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-200 text-[8px] font-bold text-red-700 shrink-0">
                      {getInitials(iv.candidate?.name ?? "?")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {iv.candidate?.name ?? "—"}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {iv.jobPost?.title ?? "—"}
                      </p>
                    </div>
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[8px] font-semibold shrink-0 whitespace-nowrap">
                      Cancelled
                    </span>
                  </div>

                  <div className="space-y-1.5 ml-9">
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-gray-600 font-medium line-through">
                        {formatDate(iv.scheduledAt)}, {formatTime(iv.scheduledAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px]">
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded font-medium line-through opacity-75">
                        {getTypeLabel(iv.meetingType)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-gray-400 gap-2">
          <Clock size={24} className="opacity-30" />
          <p className="text-xs text-center">No interview notifications</p>
        </div>
      )}
    </div>
  );
}
