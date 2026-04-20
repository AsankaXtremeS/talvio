import { Mail } from 'lucide-react';

interface ReadyToScheduleBarProps {
  date: string;
  time: string;
  onSchedule: () => void;
}

export default function ReadyToScheduleBar({ date, time, onSchedule }: ReadyToScheduleBarProps) {
  // Format the date for display if exists, otherwise show placeholder
  const displayDate = date || '...';
  const displayTime = time || '...';

  return (
    <div className="flex flex-col items-center justify-between gap-4 p-6 mt-6 bg-white border border-gray-100 shadow-sm rounded-xl md:flex-row">
      <div>
        <h3 className="mb-1 text-lg font-semibold text-gray-900">Ready to Schedule</h3>
        <p className="text-sm text-gray-600">
          Interview scheduled for {displayDate} at {displayTime}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Email notification will be sent to example@example.com
        </p>
      </div>
      
      <button 
        onClick={onSchedule}
        className="flex items-center justify-center w-full gap-2 px-6 py-3 font-medium text-indigo-600 transition-colors border border-indigo-600 rounded-lg hover:bg-indigo-50 md:w-auto"
      >
        <Mail size={18} />
        Schedule & Send Email
      </button>
    </div>
  );
}