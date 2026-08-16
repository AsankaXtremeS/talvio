'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Calendar, User, Building2, Briefcase, Tag, FileText } from 'lucide-react';
import type { Candidate } from '@/types/admin/candidate.types';
import type { Company, JobPost } from '@/types/admin/company.types';

interface DetailFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | undefined;
}

function DetailField({ icon, label, value }: DetailFieldProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50 border border-gray-100/50 transition-all hover:bg-white hover:shadow-sm hover:border-indigo-100 group">
      <div className="mt-0.5 text-indigo-500 group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-sm font-semibold text-gray-800 break-all">{value || 'N/A'}</p>
      </div>
    </div>
  );
}

type BaseAdminDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isLoading?: boolean;
};

type CandidateDetailModalProps = BaseAdminDetailModalProps & {
  type: 'candidate';
  data: Candidate | null;
};

type CompanyDetailModalProps = BaseAdminDetailModalProps & {
  type: 'company';
  data: Company | null;
};

type JobPostDetailModalProps = BaseAdminDetailModalProps & {
  type: 'jobPost';
  data: JobPost | null;
};

type AdminDetailModalProps = CandidateDetailModalProps | CompanyDetailModalProps | JobPostDetailModalProps;

export default function AdminDetailModal(props: AdminDetailModalProps) {
  const { isOpen, onClose, title, isLoading } = props;

  if (!isOpen) return null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-gray-500">Fetching details...</p>
        </div>
      );
    }

    if (!props.data) {
      return (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500 font-medium">No details available.</p>
        </div>
      );
    }

    if (props.type === 'candidate') {
      const data = props.data;

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailField icon={<User size={18} />} label="Full Name" value={data.name} />
          <DetailField icon={<Mail size={18} />} label="Email Address" value={data.email} />
          <DetailField icon={<Briefcase size={18} />} label="Role" value={data.role} />
          <DetailField icon={<Tag size={18} />} label="Candidate Type" value={data.type} />
          <DetailField icon={<Calendar size={18} />} label="Joined Date" value={data.joinedAt} />
        </div>
      );
    }

    if (props.type === 'company') {
      const data = props.data;

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">Company Logo</p>
            {data.companyLogoUrl ? (
              <div className="h-24 w-24 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                <img
                  src={data.companyLogoUrl}
                  alt={`${data.name || 'Company'} logo`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                    const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div
                  className="hidden h-full w-full items-center justify-center bg-indigo-600 text-xs font-bold text-white"
                  aria-hidden="true"
                >
                  {(data.name || 'CO').slice(0, 2).toUpperCase()}
                </div>
              </div>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-gray-200 bg-indigo-600 text-xs font-bold text-white">
                {(data.name || 'CO').slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <DetailField icon={<Building2 size={18} />} label="Company Name" value={data.name} />
          <DetailField icon={<Mail size={18} />} label="Admin Email" value={data.email} />
          <DetailField icon={<FileText size={18} />} label="Active Posts" value={data.postCount} />
          <DetailField icon={<Calendar size={18} />} label="Joined Date" value={data.joinedAt} />
          {data.category && <DetailField icon={<Tag size={18} />} label="Category" value={data.category} />}
        </div>
      );
    }

    if (props.type === 'jobPost') {
      const data = props.data;

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <DetailField icon={<Briefcase size={18} />} label="Job Title" value={data.jobTitle} />
          </div>
          {data.companyLogoUrl && (
            <div className="md:col-span-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">Company Logo</p>
              <div className="h-16 w-16 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                <img
                  src={data.companyLogoUrl}
                  alt={`${data.companyName} logo`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
          <DetailField icon={<Building2 size={18} />} label="Company" value={data.companyName} />
          <DetailField icon={<Mail size={18} />} label="Company Email" value={data.companyEmail} />
          <DetailField icon={<Tag size={18} />} label="Job Type" value={data.type} />
          <DetailField icon={<Tag size={18} />} label="Category" value={data.category} />
          <DetailField icon={<Calendar size={18} />} label="Status" value={data.isClosed ? 'Closed' : 'Active'} />
          <DetailField icon={<User size={18} />} label="Total Applications" value={data.closedApplications} />
          {data.description && (
            <div className="md:col-span-2 space-y-2 mt-2">
              <div className="flex items-center gap-2 text-indigo-500">
                <FileText size={18} />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Job Description</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto admin-scroll">
                {data.description}
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0.3 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="px-5 sm:px-8 py-4 sm:py-6 border-b border-gray-50 flex items-center justify-between bg-linear-to-r from-white to-indigo-50/30">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">{title}</h3>
              <p className="text-[10px] sm:text-xs font-semibold text-indigo-500 uppercase tracking-widest mt-0.5 sm:mt-1">Detailed Profile View</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-8 max-h-[70vh] overflow-y-auto admin-scroll">
            {renderContent()}
          </div>

          {/* Footer */}
          <div className="px-5 sm:px-8 py-3.5 sm:py-4 bg-gray-50/80 border-t border-gray-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm font-bold text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 active:scale-95"
            >
              Close Details
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
