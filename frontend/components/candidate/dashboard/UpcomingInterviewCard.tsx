import { CalendarFold, Clock3 } from "lucide-react";

interface UpcomingInterviewCardProps {
  nearestInterviewDateLabel: string;
  nearestInterviewTimeLabel: string;
}

export default function UpcomingInterviewCard({ nearestInterviewDateLabel, nearestInterviewTimeLabel }: UpcomingInterviewCardProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900">Upcoming interview</h2>
      <div className="mt-5 flex items-start gap-3 text-gray-600">
        <CalendarFold size={36} className="text-gray-400" />
        <div>
          <p className="text-lg font-semibold text-gray-700">{nearestInterviewDateLabel}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-gray-600">
            <Clock3 size={14} className="text-gray-500" />
            {nearestInterviewTimeLabel}
          </p>
        </div>
      </div>
    </section>
  );
}
