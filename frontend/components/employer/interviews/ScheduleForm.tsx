import { MapPin } from 'lucide-react';

interface ScheduleFormProps {
  date: string;
  setDate: (date: string) => void;
}

function ScheduleForm({ date, setDate }: ScheduleFormProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

      {/* Additional Information */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Additional Information</label>
        <textarea
          rows={4}
          placeholder="Any additional information for the candidate"
          className="w-full px-4 py-3 text-base text-gray-700 transition-all border border-gray-200 rounded-lg outline-none resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        ></textarea>
      </div>
    </div>
  );
}

export default ScheduleForm




  
