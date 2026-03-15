'use client';

import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import type { Company } from '@/types/admin/company.types';

interface CompaniesTableProps {
  companies: Company[];
  onView?: (company: Company) => void;
  onRemove?: (id: string) => void;
}

export default function CompaniesTable({ companies, onView, onRemove }: CompaniesTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Recent Companies</h2>
        <button className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-indigo-300 transition-all">
          <SlidersHorizontal size={14} />
          View
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="text-left text-xs font-medium text-gray-400 px-6 py-3">Company</th>
              <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">
                <div className="flex items-center gap-1">Post count <ChevronDown size={12} /></div>
              </th>
              <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">Joined</th>
              <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">Email</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                      style={{ backgroundColor: company.logoColor || '#1e3a8a' }}
                    >
                      {company.logoText?.slice(0, 2) || company.name.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{company.name}</p>
                      <p className="text-xs text-gray-400">{company.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-600">{company.postCount}</td>
                <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-pre-line">{company.joinedAt.replace(' ', '\n')}</td>
                <td className="px-4 py-3.5 text-sm text-gray-600">{company.email}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => onView?.(company)}
                      className="px-4 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onRemove?.(company.id)}
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
