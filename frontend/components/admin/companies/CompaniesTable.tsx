'use client';

import { ExternalLink, X } from 'lucide-react';
import type { Company } from '@/types/admin/company.types';

interface CompaniesTableProps {
  companies: Company[];
  onView?: (company: Company) => void;
  onRemove?: (id: string) => void;
}

export default function CompaniesTable({ companies, onView, onRemove }: CompaniesTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-800">Recent Companies</h2>
        
      </div>

      <div className="overflow-x-auto admin-scroll">
        <table className="w-full min-w-140">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-400 uppercase">Company</th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-400 uppercase">
                <div className="flex items-center gap-1">Post count</div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-400 uppercase">Joined</th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-400 uppercase">Email</th>
              <th className="px-4 py-3 text-center text-xs font-medium tracking-wide text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {companies.map((company) => (
              <tr key={company.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg text-xs font-bold text-white"
                      style={{ backgroundColor: company.logoColor || '#1e3a8a' }}
                    >
                      <span>{company.logoText?.slice(0, 2) || company.name.slice(0, 2)}</span>
                      {company.companyLogoUrl ? (
                        <img
                          src={company.companyLogoUrl}
                          alt={`${company.name} logo`}
                          className="absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
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
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onView?.(company)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-300 text-indigo-600 text-xs font-semibold hover:bg-indigo-50 transition-colors duration-150 whitespace-nowrap"
                    >
                      <ExternalLink size={12} />
                      View
                    </button>
                    <button
                      onClick={() => onRemove?.(company.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-300 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors duration-150 whitespace-nowrap"
                    >
                      <X size={12} />
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
