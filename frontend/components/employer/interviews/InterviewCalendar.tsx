"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

interface InterviewCalendarProps {
  selectedDate: string;
  selectedTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

// Time slot options
const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30"
];

export default function InterviewCalendar({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}: InterviewCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 11)); // Dec 2025
  
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthName = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  
  // Get days in month
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  // Handle month navigation
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  
  // Format date for comparison
  const getDateString = (day: number) => {
    return `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };
  
  // Parse selected date
  const selectedDateObj = selectedDate ? new Date(selectedDate + "T00:00:00") : null;
  const isCurrentMonth = selectedDateObj && selectedDateObj.getMonth() === currentMonth.getMonth();
  
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Calendar Section */}
      <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">{monthName}</h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-xs font-semibold text-center text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty slots for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2" />
          ))}
          
          {/* Day buttons */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const dateStr = getDateString(day);
            const isSelected = selectedDate === dateStr;
            const hasInterviews = day === 24 || day === 26; // Mock data
            
            return (
              <button
                key={day}
                onClick={() => onDateChange(dateStr)}
                className={`
                  h-10 rounded-lg text-sm font-medium transition-all relative
                  ${isSelected 
                    ? "bg-indigo-600 text-white shadow-md" 
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                  }
                `}
              >
                {day}
                {hasInterviews && !isSelected && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400" />
                )}
                {hasInterviews && isSelected && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slot Section */}
      <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={20} className="text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-900">Select Time</h3>
        </div>
        
        {selectedDate ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {selectedDateObj?.toLocaleDateString("en-US", { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((time) => (
                <button
                  key={time}
                  onClick={() => onTimeChange(time)}
                  className={`
                    py-2.5 px-3 rounded-lg text-sm font-medium transition-all
                    ${selectedTime === time
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-50 text-gray-700 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                    }
                  `}
                >
                  {time}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-gray-500 mb-2">Please select a date first</p>
            <p className="text-xs text-gray-400">Choose a date from the calendar on the left</p>
          </div>
        )}
      </div>
    </div>
  );
}
