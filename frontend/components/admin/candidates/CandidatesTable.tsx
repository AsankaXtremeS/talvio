'use client';

import { SlidersHorizontal } from 'lucide-react';
import type { Candidate } from '@/types/admin/candidate.types';

interface CandidatesTableProps {
  candidates: Candidate[];
  onView?: (candidate: Candidate) => void;
  onRemove?: (id: string) => void;
}

const avatarColors = [
  'bg-blue-200', 'bg-pink-200', 'bg-green-200', 'bg-yellow-200',
  'bg-purple-200', 'bg-orange-200',
];

export default function CandidatesTable({ candidates, onView, onRemove }: CandidatesTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Recent Candidates</h2>
        <button className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-indigo-300 transition-all">
          <SlidersHorizontal size={14} />
          View
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="text-left text-xs font-medium text-gray-400 px-6 py-3">Candidate</th>
              <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">Type</th>
              <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">Joined</th>
              <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">Email</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {candidates.map((candidate, i) => (
              <tr key={candidate.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0`}>
                      {candidate.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                      <p className="text-xs text-indigo-500">{candidate.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-600">{candidate.type}</td>
                <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-pre-line">{candidate.joinedAt.replace(' ', '\n')}</td>
                <td className="px-4 py-3.5 text-sm text-gray-600">{candidate.email}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => onView?.(candidate)}
                      className="px-4 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onRemove?.(candidate.id)}
                      className="px-4 py-1.5 text-xs font-medium text-red-500 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
