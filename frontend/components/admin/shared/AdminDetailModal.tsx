'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Calendar, User, Building2, Briefcase, Tag, FileText } from 'lucide-react';

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

interface AdminDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'candidate' | 'company' | 'jobPost';
  data: any;
  isLoading?: boolean;
}

export default function AdminDetailModal({ isOpen, onClose, title, type, data, isLoading }: AdminDetailModalProps) {
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

    if (!data) {
      return (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500 font-medium">No details available.</p>
        </div>
      );
    }

    if (type === 'candidate') {
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

    if (type === 'company') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailField icon={<Building2 size={18} />} label="Company Name" value={data.name} />
          <DetailField icon={<Mail size={18} />} label="Admin Email" value={data.email} />
          <DetailField icon={<FileText size={18} />} label="Active Posts" value={data.postCount} />
          <DetailField icon={<Calendar size={18} />} label="Joined Date" value={data.joinedAt} />
          {data.category && <DetailField icon={<Tag size={18} />} label="Category" value={data.category} />}
        </div>
      );
    }

    if (type === 'jobPost') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <DetailField icon={<Briefcase size={18} />} label="Job Title" value={data.jobTitle} />
          </div>
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
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-white to-indigo-50/30">
            <div>
              <h3 className="text-xl font-bold text-gray-900 leading-tight">{title}</h3>
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mt-1">Detailed Profile View</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 max-h-[70vh] overflow-y-auto admin-scroll">
            {renderContent()}
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50/80 border-t border-gray-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 active:scale-95"
            >
              Close Details
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
