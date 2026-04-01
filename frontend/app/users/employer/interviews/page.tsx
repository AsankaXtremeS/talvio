"use client";

import { useState } from "react";
import { CalendarDays, Video, MapPin, Phone, MoreVertical } from "lucide-react";

// --- Mock Data ---
const scheduledInterviews = [
  {
    id: 1,
    candidateName: "Sarah Johnson",
    role: "Senior Frontend Developer",
    date: "24 Dec 25",
    time: "10:00 AM - 11:00 AM",
    type: "Google Meet",
    status: "Upcoming",
    initials: "SJ",
  },
  {
    id: 2,
    candidateName: "James Perera",
    role: "UI/UX Designer",
    date: "24 Dec 25",
    time: "14:30 PM - 15:15 PM",
    type: "Phone",
    status: "Upcoming",
    initials: "JP",
  },
  {
    id: 3,
    candidateName: "Tharaka Mendis",
    role: "DevOps Engineer",
    date: "26 Dec 25",
    time: "11:00 AM - 12:00 PM",
    type: "On-site",
    status: "Upcoming",
    initials: "TM",
  },
];

const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const monthDays = Array.from({ length: 31 }, (_, i) => i + 1); 

export default function InterviewsDashboardPage() {
  const [selectedDate, setSelectedDate] = useState(24);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null); // State for the 3-dots menu

  const getInterviewIcon = (type: string) => {
    const typeLower = type.toLowerCase();
    if (typeLower.includes("on-site") || typeLower.includes("onsite")) {
      return <MapPin size={24} className="text-[#595781] shrink-0" />;
    }
    if (typeLower.includes("phone")) {
      return <Phone size={24} className="text-[#595781] shrink-0" />;
    }
    return <Video size={24} className="text-[#595781] shrink-0" />;
  };

  return (
    <div className="flex-1 min-h-screen bg-[#F7F9FC] p-0 font-sans">
      <div className="max-w-6xl px-4 py-8 mx-auto pt-2">
        
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 text-indigo-700 rounded-lg bg-indigo-50">
                <CalendarDays size={28} />
              </div>
              <h1 className="text-3xl font-bold text-indigo-500">Interviews</h1>
            </div>
            <p className="ml-12 text-base text-gray-600">
              Manage your schedule and upcoming candidate interviews
            </p>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* LEFT COLUMN: Upcoming Interviews List */}
          <div className="lg:col-span-2 space-y-4 relative">
            
            {/* Invisible overlay to close the dropdown when clicking outside */}
            {openMenuId && (
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setOpenMenuId(null)}
              ></div>
            )}

            <h2 className="mb-4 text-lg font-bold text-gray-900">Upcoming Interviews</h2>
            
            {scheduledInterviews.map((interview) => (
              <div 
                key={interview.id} 
                className="relative flex flex-col gap-3 p-5 transition-shadow bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md"
              >
                {/* Options Menu Button */}
                <button 
                  onClick={() => setOpenMenuId(openMenuId === interview.id ? null : interview.id)}
                  className={`absolute p-1.5 transition-colors rounded-lg top-4 right-4 z-20 
                    ${openMenuId === interview.id ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"}`}
                >
                  <MoreVertical size={20} />
                </button>

                {/* Dropdown Menu */}
                {openMenuId === interview.id && (
                  <div className="absolute right-4 top-14 z-30 w-48 py-2 bg-white rounded-xl shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-100">
                    <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      View Candidate
                    </button>
                    <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      Reschedule
                    </button>
                    <div className="my-1 border-t border-gray-100"></div>
                    <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                      Cancel Interview
                    </button>
                  </div>
                )}

                {/* Top: Dynamic Icon + Date & Time */}
                <div className="flex items-center gap-3 pr-8">
                  {getInterviewIcon(interview.type)}
                  <span className="text-[18px] sm:text-xl font-bold text-gray-800 tracking-tight">
                    {interview.date}, {interview.time}
                  </span>
                </div>

                {/* Faint Divider */}
                <div className="my-1 border-t border-gray-100"></div>

                {/* Middle: Candidate Pill */}
                <div className="flex items-center gap-2.5 w-fit px-3 py-1.5 bg-[#F5F6F8] rounded-xl">
                  {/* Avatar Circle */}
                  <div className="flex items-center justify-center shrink-0 w-6 h-6 text-[10px] font-bold text-indigo-700 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full">
                    {interview.initials}
                  </div>
                  <span className="text-[15px] font-medium text-gray-900">
                    {interview.candidateName}
                  </span>
                </div>

                {/* Bottom: Status & Role Pill */}
                <div className="flex items-center gap-2.5 w-fit px-3 py-1.5 bg-[#F5F6F8] rounded-xl">
                  {/* Green Status Dot */}
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0"></div>
                  <span className="text-[14.5px] font-medium text-gray-600">
                    {interview.role} • {interview.type} Interview
                  </span>
                </div>

              </div>
            ))}
          </div>

          {/* RIGHT COLUMN: Calendar View */}
          <div className="lg:col-span-1">
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
              
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">December 2025</h2>
                <div className="flex gap-2">
                  <button className="p-1.5 text-gray-400 hover:text-gray-900 rounded hover:bg-gray-50 transition-colors">
                     &lt;
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-gray-900 rounded hover:bg-gray-50 transition-colors">
                     &gt;
                  </button>
                </div>
              </div>

              {/* Days of week */}
              <div className="grid grid-cols-7 mb-4">
                {weekDays.map((day) => (
                  <div key={day} className="text-xs font-semibold text-center text-gray-400">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-x-1 gap-y-2">
                <div className="p-2"></div>
                {monthDays.map((day) => {
                  const isSelected = day === selectedDate;
                  const hasInterview = day === 24 || day === 26; 
                  
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm font-medium relative transition-colors
                        ${isSelected ? "bg-indigo-600 text-white shadow-sm" : "text-gray-700 hover:bg-gray-100"}
                      `}
                    >
                      {day}
                      
                      {/* 🚀 Updated: Green Line Indicator instead of Blue Dot */}
                      {hasInterview && (
                        <span 
                          className={`absolute w-3.5 h-[3px] rounded-full bottom-0.5 
                            ${isSelected ? "bg-white/90" : "bg-indigo-500"}
                          `}
                        ></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick Stats below calendar */}
              <div className="pt-6 mt-8 space-y-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Interviews this week</span>
                  <span className="font-bold text-gray-900">5</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Pending feedback</span>
                  <span className="font-bold text-amber-600">2</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}