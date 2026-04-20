"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateCalendarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function DateCalendar({
  selectedDate,
  onDateChange,
}: DateCalendarProps) {
  // Set default selected date to today if not set
  useEffect(() => {
    if (!selectedDate) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      onDateChange(`${yyyy}-${mm}-${dd}`);
    }
  }, [selectedDate, onDateChange]);

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) {
      const [yyyy, mm] = selectedDate.split("-");
      return new Date(Number(yyyy), Number(mm) - 1);
    }
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth());
  });
  
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
  
  return (
    <div className="p-8 bg-white border border-gray-200 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-5">
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
          <div key={day} className="text-xs font-semibold text-center text-gray-500 py-1.5">
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
          const today = new Date();
          const thisDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const isPast = thisDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          return (
            <button
              key={day}
              onClick={() => !isPast && onDateChange(dateStr)}
              disabled={isPast}
              className={`
                h-9 rounded-lg text-sm font-medium transition-all relative
                ${isSelected 
                  ? "bg-indigo-600 text-white shadow-md" 
                  : isPast
                    ? "text-gray-300 bg-gray-50 cursor-not-allowed"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }
              `}
            >
              {day}
              {hasInterviews && !isSelected && !isPast && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400" />
              )}
              {hasInterviews && isSelected && !isPast && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Display */}
      {selectedDate && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Selected: <span className="font-semibold text-gray-900">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
