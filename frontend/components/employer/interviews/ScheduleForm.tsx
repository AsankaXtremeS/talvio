import { useRef } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface ScheduleFormProps {
  date: string;
  setDate: (date: string) => void;
  time: string;
  setTime: (time: string) => void;
}

function ScheduleForm({ date, setDate, time, setTime }: ScheduleFormProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="p-6 mt-6 bg-white border border-gray-100 shadow-sm rounded-xl">
      <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
        {/* Date Field */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Date</label>
          <div className="relative">
            <input
              ref={dateInputRef}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full py-2 pl-4 pr-10 text-gray-600 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-indigo-500 focus:outline-none"
              onClick={() => dateInputRef.current && dateInputRef.current.showPicker && dateInputRef.current.showPicker()}
              aria-label="Open date picker"
            >
              <Calendar size={18} />
            </button>
          </div>
        </div>

        {/* Time Field */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Time</label>
          <div className="relative">
            <input
              ref={timeInputRef}
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full py-2 pl-4 pr-10 text-gray-600 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-indigo-500 focus:outline-none"
              onClick={() => timeInputRef.current && timeInputRef.current.showPicker && timeInputRef.current.showPicker()}
              aria-label="Open time picker"
            >
              <Clock size={18} />
            </button>
          </div>
        </div>

        {/* Meeting Type */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Meeting Type</label>
          <div className="relative">
            <select
              defaultValue="On-site"
              className="w-full py-2 pl-4 pr-10 text-gray-600 transition-all border border-gray-200 rounded-lg outline-none appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="On-site">On-site</option>
              <option value="Online">Online</option>
              <option value="Phone">Phone</option>
            </select>
            {/* Dropdown arrow icon */}
            <svg className="pointer-events-none absolute right-3 top-2.5 text-gray-400" width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Location</label>
          <div className="relative">
            <input
              type="text"
              defaultValue="Galle"
              className="w-full py-2 pl-4 pr-10 text-base text-gray-700 transition-all border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <MapPin className="absolute right-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <textarea
          rows={3}
          placeholder="Any additional information for the candidate"
          className="w-full px-4 py-3 text-base text-gray-700 transition-all border border-gray-200 rounded-lg outline-none resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        ></textarea>
      </div>
    </div>
  );

}

export default ScheduleForm




  
