// ScheduleForm.tsx
// Full interview scheduling form.
// Handles: date/time picker, meeting type toggle (ONLINE/ONSITE/PHONE),
// conditional location or Meet-link display, additional info textarea,
// and the "Generate Email" button that triggers email preview below.

"use client";

import { useRef } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  Building2,
  Link2,
  Mail,
  Info,
} from "lucide-react";
import { MeetingType } from "@/types/employer/interview.types";

interface Props {
  date: string;
  setDate: (v: string) => void;
  time: string;
  setTime: (v: string) => void;
  meetingType: MeetingType;
  setMeetingType: (v: MeetingType) => void;
  location: string;
  setLocation: (v: string) => void;
  additionalInfo: string;
  setAdditionalInfo: (v: string) => void;
  meetingLink?: string | null;   // returned from backend for ONLINE
  onGenerateEmail: () => void;   // trigger email preview
  isGeneratingEmail?: boolean;
}

const MEETING_TYPES: { value: MeetingType; label: string; icon: React.ReactNode }[] = [
  { value: "ONLINE",  label: "Online",   icon: <Video   size={15} /> },
  { value: "ONSITE",  label: "On-Site",  icon: <Building2 size={15} /> },
  { value: "PHONE",   label: "Phone",    icon: <Phone   size={15} /> },
];

export default function ScheduleForm({
  date,
  setDate,
  time,
  setTime,
  meetingType,
  setMeetingType,
  location,
  setLocation,
  additionalInfo,
  setAdditionalInfo,
  meetingLink,
  onGenerateEmail,
  isGeneratingEmail = false,
}: Props) {
  const dateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);

  // Minimum date = today (no past scheduling)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="p-6 mt-6 bg-white border border-gray-100 shadow-sm rounded-xl">
      <h2 className="mb-5 text-base font-semibold text-gray-900">Schedule Details</h2>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        {/* ── Date ── */}
        <div>
          <label className="block mb-1.5 text-sm font-medium text-gray-700">
            Interview Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              ref={dateRef}
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full py-2.5 pl-4 pr-10 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => dateRef.current?.showPicker?.()}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-indigo-500"
            >
              <Calendar size={17} />
            </button>
          </div>
        </div>

        {/* ── Time ── */}
        <div>
          <label className="block mb-1.5 text-sm font-medium text-gray-700">
            Interview Time <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              ref={timeRef}
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full py-2.5 pl-4 pr-10 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => timeRef.current?.showPicker?.()}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-indigo-500"
            >
              <Clock size={17} />
            </button>
          </div>
        </div>

        {/* ── Meeting Type Toggle ── */}
        <div className="md:col-span-2">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Meeting Type <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {MEETING_TYPES.map(({ value, label, icon }) => {
              const active = meetingType === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMeetingType(value)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-150
                    ${active
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200"
                      : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                    }
                  `}
                >
                  {icon}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Location (ONSITE only) ── */}
        {meetingType === "ONSITE" && (
          <div className="md:col-span-2">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">
              Location <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. 42 Galle Road, Colombo 03, Sri Lanka"
                className="w-full py-2.5 pl-4 pr-10 text-sm text-gray-700 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
              <MapPin className="absolute right-3 top-2.5 text-gray-400" size={17} />
            </div>
          </div>
        )}

        {/* ── Google Meet link (ONLINE — shown after draft created) ── */}
        {meetingType === "ONLINE" && meetingLink && (
          <div className="md:col-span-2">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">
              Google Meet Link
            </label>
            <div className="flex items-center gap-3 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg">
              <Video size={16} className="text-green-600 shrink-0" />
              <a
                href={meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-700 font-medium underline truncate hover:text-green-900"
              >
                {meetingLink}
              </a>
            </div>
            <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
              <Info size={11} /> Generated automatically via Google Calendar
            </p>
          </div>
        )}

        {/* ── ONLINE — note before draft created ── */}
        {meetingType === "ONLINE" && !meetingLink && (
          <div className="md:col-span-2">
            <div className="flex items-start gap-2.5 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-lg">
              <Link2 size={15} className="text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-sm text-indigo-700">
                A Google Meet link will be generated automatically when you save this interview.
              </p>
            </div>
          </div>
        )}

        {/* ── PHONE — info note ── */}
        {meetingType === "PHONE" && (
          <div className="md:col-span-2">
            <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-100 rounded-lg">
              <Phone size={15} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                The candidate will be called at their registered phone number. Include any dial-in instructions in the additional information below.
              </p>
            </div>
          </div>
        )}

        {/* ── Additional Information ── */}
        <div className="md:col-span-2">
          <label className="block mb-1.5 text-sm font-medium text-gray-700">
            Additional Information
          </label>
          <textarea
            rows={3}
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="E.g. Please bring your portfolio, dress code is business casual, parking is available..."
            className="w-full px-4 py-3 text-sm text-gray-700 border border-gray-200 rounded-lg outline-none resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>

      </div>

      {/* ── Generate Email Button ── */}
      <div className="flex justify-end mt-5">
        <button
          type="button"
          onClick={onGenerateEmail}
          disabled={isGeneratingEmail || !date || !time}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {isGeneratingEmail ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Mail size={16} /> Generate Email
            </>
          )}
        </button>
      </div>
    </div>
  );
}