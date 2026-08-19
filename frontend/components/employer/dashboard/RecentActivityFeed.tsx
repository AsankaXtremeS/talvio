"use client";

import { FileText } from "lucide-react";

export interface RecentActivityFeedActivityItem {
  id: string;
  text: string;
  time: string;
}

interface RecentActivityFeedProps {
  activities: RecentActivityFeedActivityItem[];
  onViewAll?: () => void;
  onViewItem?: (activity: RecentActivityFeedActivityItem) => void;
}

export default function RecentActivityFeed({ activities, onViewAll, onViewItem }: RecentActivityFeedProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-slate-200/70">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-gray-900">Recent Activities</h2>
          <p className="text-xs text-slate-500">Updates from your roles and applicants</p>
        </div>
        <button
          type="button"
          className="rounded-full border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
          onClick={onViewAll}
        >
          View all
        </button>
      </div>
      <div className="space-y-3">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <FileText size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-900 leading-snug">{activity.text}</p>
                <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
              </div>
              <button
                type="button"
                onClick={() => onViewItem?.(activity)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
              >
                View
              </button>
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No recent activity to display.</div>
        )}
      </div>
    </div>
  );
}
