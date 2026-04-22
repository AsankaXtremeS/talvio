"use client";

import { CheckCircle } from "lucide-react";

// Google logo SVG inline (reuse from JobViewModal)
function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  postedAgo: string;
  matchPercent: number;
  tags: string[];
  companyLogoUrl?: string;
  isApplied?: boolean;
  onView: (id: string) => void;
  onApply: (id: string) => void;
}

export default function JobCard({
  id,
  title,
  company,
  location,
  postedAgo,
  matchPercent,
  tags,
  companyLogoUrl,
  isApplied,
  onView,
  onApply,
}: JobCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Company logo/icon */}
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
            {companyLogoUrl && companyLogoUrl !== "null" && companyLogoUrl !== "undefined" ? (
              companyLogoUrl === "google" ? (
                <div className="w-8 h-8"><GoogleLogo /></div>
              ) : (
                <img src={companyLogoUrl} alt={company} className="h-full w-full object-cover" onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-lg font-bold text-indigo-600">${company.charAt(0)}</span>`;
                }} />
              )
            ) : (
              <span className="text-lg font-bold text-indigo-600">{company?.charAt(0) || "?"}</span>
            )}
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">{title}</p>
            <p className="text-sm text-indigo-500 font-medium">
              {company} - {location}
            </p>
          </div>
        </div>

        {/* Match badge */}
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-600 text-xs font-semibold px-3 py-1.5 rounded-full shrink-0">
          <CheckCircle size={13} className="text-green-500" />
          {matchPercent}% Match
        </div>
      </div>

      {/* Posted time */}
      <p className="text-xs text-gray-400">{postedAgo}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-sky-100 text-sky-700 text-xs font-medium rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-1">
        <button
          onClick={() => onView(id)}
          className="px-6 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
        >
          View
        </button>
        {isApplied ? (
          <button
            onClick={() => onView(id)}
            className="px-6 py-2 border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-xl"
          >
            Applied
          </button>
        ) : (
          <button
            onClick={() => onApply(id)}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Apply now
          </button>
        )}
      </div>
    </div>
  );
}