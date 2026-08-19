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
  onlineOption: "GENERATE" | "CUSTOM";
  setOnlineOption: (v: "GENERATE" | "CUSTOM") => void;
  customLink: string;
  setCustomLink: (v: string) => void;
  meetingLink?: string | null;   // returned from backend for ONLINE
  onGenerateEmail: () => void;   // trigger email preview
  isGeneratingEmail?: boolean;
  isReschedule?: boolean;        // if true, allows more flexible date constraints
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
  onlineOption,
  setOnlineOption,
  customLink,
  setCustomLink,
  location,
  setLocation,
  additionalInfo,
  setAdditionalInfo,
  meetingLink,
  onGenerateEmail,
  isGeneratingEmail = false,
  isReschedule = false,
}: Props) {
  const dateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);

  // For reschedule, allow selecting dates from the currently loaded date
  // For new schedule, only allow future dates from today
  let minDate = new Date().toISOString().split("T")[0];
  if (isReschedule && date) {
    // In reschedule mode, allow the current selected date or later
    minDate = date < new Date().toISOString().split("T")[0] 
      ? date 
      : new Date().toISOString().split("T")[0];
  }

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
              min={minDate}
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

        {/* ── ONLINE Options ── */}
        {meetingType === "ONLINE" && (
          <div className="md:col-span-2 space-y-4">
            <div className="flex flex-col gap-3 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
              <label className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                <Video size={16} /> Online Meeting Option
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setOnlineOption("GENERATE")}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    onlineOption === "GENERATE"
                      ? "bg-white text-indigo-600 border-2 border-indigo-500 shadow-sm"
                      : "bg-indigo-50 text-indigo-400 border-2 border-transparent hover:bg-indigo-100"
                  }`}
                >
                  Generate Link
                </button>
                <button
                  type="button"
                  onClick={() => setOnlineOption("CUSTOM")}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    onlineOption === "CUSTOM"
                      ? "bg-white text-indigo-600 border-2 border-indigo-500 shadow-sm"
                      : "bg-indigo-50 text-indigo-400 border-2 border-transparent hover:bg-indigo-100"
                  }`}
                >
                  Custom Link
                </button>
              </div>
              
              {onlineOption === "GENERATE" ? (
                <div className="flex items-start gap-2 text-xs text-indigo-600">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <p>A unique Google Meet link will be created automatically via Google Calendar.</p>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-xs text-indigo-600">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <p>Provide your own meeting link (Zoom, Microsoft Teams, etc.)</p>
                </div>
              )}
            </div>

            {onlineOption === "CUSTOM" && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <label className="block text-sm font-medium text-gray-700">
                  Custom Meeting Link <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={customLink}
                    onChange={(e) => setCustomLink(e.target.value)}
                    placeholder="https://zoom.us/j/123456789"
                    className="w-full py-2.5 pl-4 pr-10 text-sm text-gray-700 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                  <Link2 className="absolute right-3 top-2.5 text-gray-400" size={17} />
                </div>
              </div>
            )}

            {onlineOption === "GENERATE" && meetingLink && (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg animate-in fade-in duration-300">
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
            )}
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
            rows={6}
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