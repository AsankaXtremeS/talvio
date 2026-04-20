"use client";

import { Mail, Check } from "lucide-react";
import { useState } from "react";
import { MeetingType } from "@/types/employer/interview.types";

interface Props {
  candidateName: string;
  candidateEmail: string;
  date: string;
  time: string;
  meetingType: MeetingType;
  location?: string;
  meetingLink?: string | null;
  additionalInfo?: string;
  employerCompany?: string;
  employerName?: string;
  employerEmail?: string;
  isReschedule?: boolean;
  onConfirm?: (emailContent: string) => void;
}

export default function GeneratedEmailPreview({
  candidateName,
  candidateEmail,
  date,
  time,
  meetingType,
  location,
  meetingLink,
  additionalInfo,
  employerCompany = "Talvio Tech",
  employerName = "Hiring Team",
  employerEmail = "recruitment@talvio.com",
  isReschedule = false,
  onConfirm,
}: Props) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Format date
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Build email content
  const greeting = isReschedule
    ? `Dear ${candidateName},

We hope this message finds you well. We would like to reschedule your upcoming interview due to unforeseen circumstances. We sincerely apologize for any inconvenience this may cause.

Please see the updated interview details below:

📅 Date: ${formattedDate}
⏰ Time: ${time}`
    : `Dear ${candidateName},

Congratulations on your application! We are excited to move forward with you in our interview process.

We would like to schedule an interview with you at the following details:

📅 Date: ${formattedDate}
⏰ Time: ${time}`;

  const emailContent = greeting;

  let meetingDetails = "";
  if (meetingType === "ONLINE" && meetingLink) {
    meetingDetails = `🔗 Meeting Link: ${meetingLink}
   Please join the Google Meet call using this link at the scheduled time.`;
  } else if (meetingType === "ONSITE" && location) {
    meetingDetails = `📍 Location: ${location}
   Please arrive 10 minutes early.`;
  } else if (meetingType === "PHONE") {
    meetingDetails = `☎️ Call Type: Phone Interview
   We will call you at your registered phone number.`;
  }

  const closingMessage = isReschedule
    ? "If you have any questions or concerns regarding the rescheduled time, please don't hesitate to reach out."
    : "We look forward to hearing from you. If you have any questions or need to reschedule, please feel free to reach out.";

  const fullEmail = `${emailContent}
${meetingDetails}

${additionalInfo ? `Additional Information:\n${additionalInfo}\n` : ""}
${closingMessage}

Best regards,
${employerName}
${employerCompany}
${employerEmail}`;

  const [editedEmail, setEditedEmail] = useState(fullEmail);

  const handleConfirm = () => {
    setIsConfirmed(true);
    if (onConfirm) {
      onConfirm(editedEmail);
    }
  };

  return (
    <div className="mt-6 p-6 bg-linear-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Mail size={20} className="text-indigo-600" />
          Generated Email Preview
        </h3>
        {isConfirmed && (
          <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg">
            <Check size={16} />
            <span>Confirmed</span>
          </div>
        )}
      </div>

      {/* Email Content - Editable Textarea */}
      <textarea
        value={editedEmail}
        onChange={(e) => setEditedEmail(e.target.value)}
        disabled={isConfirmed}
        className="w-full bg-white border border-indigo-100 rounded-lg p-6 text-sm text-gray-700 font-mono max-h-96 overflow-y-auto disabled:bg-gray-50 disabled:opacity-75 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        rows={15}
      />

      {/* Quick Info Summary */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-indigo-100 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">To</p>
          <p className="text-sm font-medium text-gray-800 truncate">{candidateEmail}</p>
        </div>
        <div className="bg-white border border-indigo-100 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Date</p>
          <p className="text-sm font-medium text-gray-800">{formattedDate}</p>
        </div>
        <div className="bg-white border border-indigo-100 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Time</p>
          <p className="text-sm font-medium text-gray-800">{time}</p>
        </div>
        <div className="bg-white border border-indigo-100 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Type</p>
          <p className="text-sm font-medium text-gray-800 capitalize">{meetingType}</p>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleConfirm}
          disabled={isConfirmed}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {isConfirmed ? (
            <>
              <Check size={16} />
              Email Confirmed
            </>
          ) : (
            <>
              <Check size={16} />
              Confirm Email
            </>
          )}
        </button>
      </div>
    </div>
  );
}
