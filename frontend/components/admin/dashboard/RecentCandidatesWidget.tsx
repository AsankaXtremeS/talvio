import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { RecentCandidate } from '@/types/admin/dashboard.types';

interface RecentCandidatesWidgetProps {
  candidates: RecentCandidate[];
  newCount: number;
}

const avatarColors = ['#f9a8d4', '#86efac', '#93c5fd', '#fcd34d', '#c4b5fd'];

export default function RecentCandidatesWidget({ candidates, newCount }: RecentCandidatesWidgetProps) {
  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="text-sm text-gray-700 mb-3">
        <span className="text-2xl font-bold text-gray-900">{newCount}</span>{' '}
        new candidates have joined today!
      </p>
      <div className="flex items-center gap-3">
        {candidates.map((c, i) => (
          <div key={c.id} className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: avatarColors[i % avatarColors.length] }}
            >
              {c.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-800 leading-tight">{c.name}</p>
              <p className="text-[10px] text-gray-500">{c.role}</p>
            </div>
          </div>
        ))}
        <Link
          href="/users/admin/candidates"
          className="ml-auto w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-indigo-300 hover:bg-indigo-50 transition-all"
        >
          <ArrowRight size={14} className="text-gray-500" />
        </Link>
      </div>
    </div>
  );
}
