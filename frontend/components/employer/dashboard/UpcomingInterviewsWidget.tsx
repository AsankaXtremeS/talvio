import { CalendarDays, MapPin, User } from "lucide-react";
import type { InterviewDTO } from "@/types/employer/interview.types";

interface UpcomingInterviewsWidgetProps {
  interviews: InterviewDTO[];
  isLoading?: boolean;
  onViewAll?: () => void;
  onViewInterview?: (interview: InterviewDTO) => void;
}

function Avatar({ seed }: { seed: string }) {
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(seed)}`}
        alt="avatar"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function formatInterviewTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Scheduled";
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function UpcomingInterviewsWidget({ interviews, isLoading, onViewAll, onViewInterview }: UpcomingInterviewsWidgetProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-slate-200/70">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-gray-900">Upcoming Interviews</h2>
          <p className="text-xs text-slate-500">Keep track of your next two scheduled meetings</p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
        >
          View all
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Loading upcoming interviews…</div>
      ) : interviews.length > 0 ? (
        <div className="space-y-3">
          {interviews.map((interview) => (
            <div key={interview.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar seed={interview.candidate.name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{interview.candidate.name}</p>
                    <p className="truncate text-xs text-indigo-600">{interview.jobPost.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  {interview.meetingType === "ONLINE" ? <User size={16} /> : <MapPin size={16} />}
                  <span className="text-xs uppercase tracking-[0.15em]">{interview.meetingType.toLowerCase()}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={12} />
                  {formatInterviewTime(interview.scheduledAt)}
                </span>
                <button
                  type="button"
                  onClick={() => onViewInterview?.(interview)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  View details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No scheduled interviews found.</div>
      )}
    </div>
  );
}
