import { CheckCircle2 } from 'lucide-react';

export default function ApplicantPanel() {
  return (
    <div className="flex flex-col min-h-0 p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img 
            src="https://i.pravatar.cc/150?u=sarah" 
            alt="Sarah Johnson" 
            className="object-cover w-12 h-12 rounded-full"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Sarah Johnson</h3>
            <p className="text-sm text-blue-500">Senior Frontend Developer</p>
          </div>
        </div>
        <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-green-600 border border-green-200 rounded-full bg-green-50">
          <CheckCircle2 size={14} />
          92% Match
        </span>
      </div>

      <p className="mb-4 text-sm text-gray-500">
        5 years experience · Applied 2 days ago
      </p>

      <div className="flex flex-wrap gap-2 pb-6 mb-6 border-b border-gray-100">
        <span className="px-3 py-1 text-xs text-blue-700 bg-blue-100 rounded-full">React</span>
        <span className="px-3 py-1 text-xs text-blue-700 bg-blue-100 rounded-full">TypeScript</span>
        <span className="px-3 py-1 text-xs text-blue-700 bg-blue-100 rounded-full">Node.js</span>
        <span className="px-3 py-1 text-xs text-blue-700 bg-blue-100 rounded-full">UI/UX</span>
      </div>

      <div className="flex justify-end mt-auto">
        <button className="w-full px-6 py-2 font-medium text-indigo-600 transition-colors border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 sm:w-auto">
          View Profile
        </button>
      </div>
    </div>
  );
}