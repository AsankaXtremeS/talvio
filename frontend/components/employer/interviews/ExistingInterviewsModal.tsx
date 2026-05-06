"use client";

import { X, Calendar, Clock, User, Briefcase } from "lucide-react";
import { InterviewDTO } from "@/types/employer/interview.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  interviews: InterviewDTO[];
}

export default function ExistingInterviewsModal({
  isOpen,
  onClose,
  date,
  interviews,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Existing Schedules</h3>
              <p className="text-xs text-gray-500 font-medium">
                {new Date(date + "T00:00:00").toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            {interviews.map((iv) => (
              <div 
                key={iv.id} 
                className="group flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-white hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col items-center justify-center min-w-[70px] py-2 bg-white rounded-lg border border-gray-200 group-hover:border-indigo-100 group-hover:bg-indigo-50/30 transition-colors shadow-sm">
                  <Clock size={14} className="text-indigo-400 mb-1" />
                  <span className="text-sm font-bold text-indigo-600">
                    {new Date(iv.scheduledAt).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit', 
                      hour12: true 
                    })}
                  </span>
                </div>
                
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-blue-50 text-blue-600 rounded">
                      <User size={14} />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {iv.candidate.name}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-amber-50 text-amber-600 rounded">
                      <Briefcase size={14} />
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {iv.jobPost.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
                      ${iv.meetingType === 'ONLINE' ? 'bg-green-100 text-green-700' : 
                        iv.meetingType === 'ONSITE' ? 'bg-purple-100 text-purple-700' : 
                        'bg-blue-100 text-blue-700'}
                    `}>
                      {iv.meetingType}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
