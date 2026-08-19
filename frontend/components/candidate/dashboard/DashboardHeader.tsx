"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export interface DashboardNotification {
  id: string;
  title: string;
  timeLabel: string;
  isNew: boolean;
  href: string;
}

interface DashboardHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  currentDateLabel: string;
  nearestInterviewDateLabel?: string;
  nearestInterviewTimeLabel?: string;
  notifications?: DashboardNotification[];
  onNotificationClick?: (notification: DashboardNotification) => void;
}

export default function DashboardHeader({
  search,
  onSearchChange,
  nearestInterviewDateLabel,
  nearestInterviewTimeLabel,
  notifications = [],
  onNotificationClick,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const newNotifications = useMemo(
    () => notifications.filter((notification) => notification.isNew),
    [notifications],
  );

  const olderNotifications = useMemo(
    () => notifications.filter((notification) => !notification.isNew),
    [notifications],
  );

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="sticky top-0 z-20 -mx-1 w-full px-1 pb-2 pt-1">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-70 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search candidates, jobs, ..."
            className="h-11 w-full rounded-full border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-indigo-300"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="inline-flex h-11 min-w-65 items-center justify-between gap-3 rounded-full border border-gray-200 bg-white px-4 text-sm text-gray-600">
            {nearestInterviewDateLabel && nearestInterviewTimeLabel ? (
              <>
                <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-600">
                  <span>Upcoming Interview</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs text-blue-600">
                  <span>{nearestInterviewDateLabel}</span>
                  <span>|</span>
                  <span>{nearestInterviewTimeLabel}</span>
                </div>
              </>
            ) : (
              <span className="text-xs text-gray-500">No upcoming interview</span>
            )}
          </div>

          <div className="relative" ref={panelRef}>
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className={`relative inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                isOpen
                  ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                  : "border-gray-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
              aria-label="Open notifications"
            >
              <Bell className="h-5 w-5" />
              {newNotifications.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {newNotifications.length}
                </span>
              )}
            </button>

            {isOpen && (
              <div className="absolute right-0 z-40 mt-2 w-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">Interview Notifications</p>
                  <p className="text-xs text-slate-500">New schedules appear at the top.</p>
                </div>

                <div className="max-h-96 overflow-y-auto p-3">
                  {notifications.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
                      No notifications yet.
                    </p>
                  ) : (
                    <>
                      {newNotifications.length > 0 && (
                        <div>
                          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                            New
                          </p>
                          <div className="space-y-2">
                            {newNotifications.map((notification) => (
                              <button
                                key={notification.id}
                                type="button"
                                onClick={() => {
                                  onNotificationClick?.(notification);
                                  setIsOpen(false);
                                }}
                                className="w-full rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-left transition-colors hover:bg-emerald-100"
                              >
                                <p className="text-xs font-semibold text-slate-800">{notification.title}</p>
                                <p className="mt-0.5 text-[11px] text-slate-600">{notification.timeLabel}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className={newNotifications.length > 0 ? "mt-4 border-t border-slate-100 pt-3" : ""}>
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Older
                        </p>
                        {olderNotifications.length === 0 ? (
                          <p className="text-xs text-slate-500">No older notifications.</p>
                        ) : (
                          <div className="space-y-2">
                            {olderNotifications.map((notification) => (
                              <button
                                key={notification.id}
                                type="button"
                                onClick={() => {
                                  onNotificationClick?.(notification);
                                  setIsOpen(false);
                                }}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition-colors hover:bg-slate-100"
                              >
                                <p className="text-xs font-semibold text-slate-700">{notification.title}</p>
                                <p className="mt-0.5 text-[11px] text-slate-500">{notification.timeLabel}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
