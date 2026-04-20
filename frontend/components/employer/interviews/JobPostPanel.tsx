import { Users } from 'lucide-react';

export default function JobPostPanel() {
  return (
    <div className="flex flex-col min-h-0 p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 font-bold text-white bg-gray-900 rounded-md">
            R
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">UX/UI Designer</h3>
            <p className="text-sm text-blue-500">Software</p>
          </div>
        </div>
        <span className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
          Active
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <span className="px-3 py-1 text-xs text-blue-600 rounded-full bg-blue-50">Full-time</span>
        <span className="px-3 py-1 text-xs text-blue-600 rounded-full bg-blue-50">On site</span>
        <span className="flex items-center gap-1 px-3 py-1 text-xs text-orange-700 bg-orange-100 rounded-full">
          $1000 - $1100
        </span>
      </div>

      <div className="flex items-center gap-4 pb-4 mb-6 text-sm text-gray-500 border-b border-gray-100">
        <div className="flex items-center gap-1 font-medium text-green-600">
          <Users size={16} />
          <span>24 Applicants</span>
        </div>
        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
        <span>Posted 5 days ago</span>
      </div>

      <div className="flex justify-end mt-auto">
        <button className="w-full px-6 py-2 font-medium text-indigo-600 transition-colors border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 sm:w-auto">
          View Post
        </button>
      </div>
    </div>
  );
}