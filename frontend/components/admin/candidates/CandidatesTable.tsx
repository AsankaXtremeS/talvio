'use client';

import { ExternalLink, X } from 'lucide-react';
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
    <div className="flex h-full min-h-0 flex-col bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-800">Recent Candidates</h2>
        
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-160 table-fixed">
          <colgroup>
            <col className="w-[30%]" />
            <col className="w-[16%]" />
            <col className="w-[14%]" />
            <col className="w-[24%]" />
            <col className="w-[16%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-400 uppercase">Candidate</th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-400 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-400 uppercase">Joined</th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-400 uppercase">Email</th>
              <th className="px-4 py-3 text-center text-xs font-medium tracking-wide text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
        </table>
      </div>

      <div className="admin-scroll min-h-0 flex-1 overflow-y-auto overflow-x-auto">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-[30%]" />
            <col className="w-[16%]" />
            <col className="w-[14%]" />
            <col className="w-[24%]" />
            <col className="w-[16%]" />
          </colgroup>
          <tbody className="divide-y divide-gray-50">
            {candidates.map((candidate, i) => (
              <tr key={candidate.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors">
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
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onView?.(candidate)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-300 text-indigo-600 text-xs font-semibold hover:bg-indigo-50 transition-colors duration-150 whitespace-nowrap"
                    >
                      <ExternalLink size={12} />
                      View
                    </button>
                    <button
                      onClick={() => onRemove?.(candidate.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-300 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors duration-150 whitespace-nowrap"
                    >
                      <X size={12} />
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {candidates.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                  No candidates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
