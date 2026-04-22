"use client";

import { use, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronLeft, Hourglass, XCircle } from "lucide-react";
import JobPostPanel from "@/components/employer/interviews/JobPostPanel";
import ApplicantPanel from "@/components/employer/interviews/ApplicantPanel";
import SuccessModal from "@/components/employer/interviews/SuccessModal";
import { InterviewDTO } from "@/types/employer/interview.types";
import {
  getInterview,
  cancelAndSendEmail,
  generateCancelEmailPreview,
} from "@/lib/employer/interviews.service";

interface Props {
  params: Promise<{ interviewId: string }>;
}

export default function CancelInterviewPage({ params }: Props) {
  const { interviewId } = use(params);
  const router = useRouter();

  console.log("[CancelInterviewPage] Mounted with interviewId:", interviewId);

  // State for interview data
  const [interview, setInterview] = useState<InterviewDTO | null>(null);
  const [loadingInterview, setLoadingInterview] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // State for cancellation reason
  const [cancellationReason, setCancellationReason] = useState("");

  // State for email preview
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);
  const [customEmailBody, setCustomEmailBody] = useState<string | null>(null);
  const [emailPreviewError, setEmailPreviewError] = useState<string | null>(null);

  // State for UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelledInterview, setCancelledInterview] = useState<InterviewDTO | null>(null);

  // Fetch interview on mount
  useEffect(() => {
    if (!interviewId) {
      setLoadError("Interview ID not found in URL");
      setLoadingInterview(false);
      return;
    }

    const fetchInterview = async () => {
      try {
        setLoadingInterview(true);
        setLoadError(null);
        console.log("[CancelInterview] Fetching interview:", interviewId);
        
        // Add timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 10000)
        );
        
        const data = await Promise.race([
          getInterview(interviewId),
          timeoutPromise,
        ]) as InterviewDTO;
        
        console.log("[CancelInterview] Interview fetched:", data);
        setInterview(data);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load interview details";
        setLoadError(errorMsg);
        console.error("[CancelInterview] Failed to fetch interview:", err);
      } finally {
        setLoadingInterview(false);
      }
    };

    fetchInterview();
  }, [interviewId]);

  // Generate email preview
  const handleGenerateEmail = useCallback(async () => {
    if (!cancellationReason.trim()) {
      setEmailPreviewError("Please provide a cancellation reason.");
      return;
    }

    if (!interview) {
      setEmailPreviewError("Interview data not loaded.");
      return;
    }

    setEmailPreviewError(null);
    setIsGeneratingEmail(true);

    try {
      // Generate the email preview with cancellation reason
      const preview = await generateCancelEmailPreview(interviewId, cancellationReason);
      console.log("[CancelInterview] Email preview generated:", preview);
      
      setShowEmailPreview(true);
      setCustomEmailBody(preview.body || null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to generate email preview";
      setEmailPreviewError(errorMsg);
      console.error("[CancelInterview] Generate email error:", err);
    } finally {
      setIsGeneratingEmail(false);
    }
  }, [interviewId, cancellationReason, interview]);

  // Handle email confirmation
  const handleEmailConfirm = useCallback((emailContent: string) => {
    setCustomEmailBody(emailContent);
    setIsEmailConfirmed(true);
  }, []);

  // Handle cancel and send email
  const handleCancelAndSend = useCallback(async () => {
    if (!interview) {
      setCancelError("Interview data not found.");
      return;
    }

    if (!isEmailConfirmed) {
      setCancelError("Please generate and confirm the email first.");
      return;
    }

    setIsCancelling(true);
    setCancelError(null);

    try {
      // Call backend to cancel interview and send email
      const result = await cancelAndSendEmail(interviewId, {
        reason: cancellationReason,
        emailBody: customEmailBody || "",
      });

      console.log("[CancelInterview] Interview cancelled successfully:", result);

      setCancelledInterview(result);
      setIsModalOpen(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to cancel interview";
      setCancelError(errorMsg);
      console.error("[CancelInterview] Cancel error:", err);
    } finally {
      setIsCancelling(false);
    }
  }, [interview, interviewId, cancellationReason, customEmailBody, isEmailConfirmed, router]);

  if (loadingInterview) {
    return (
      <div className="flex-1 min-h-screen bg-[#F7F9FC] p-0 font-sans">
        <div className="max-w-6xl px-4 py-8 mx-auto pt-2">
          <div className="flex items-center justify-center h-96">
            <div className="flex items-center gap-2 text-gray-500">
              <Hourglass size={20} className="animate-spin" />
              <span>Loading interview details...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !interview) {
    return (
      <div className="flex-1 min-h-screen bg-[#F7F9FC] p-0 font-sans">
        <div className="max-w-6xl px-4 py-8 mx-auto pt-2">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} />
              <div>
                <p className="font-semibold">Error Loading Interview</p>
                <p className="text-sm">{loadError || "Interview not found"}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ChevronLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const candidateId = interview.candidate?.id || "";
  const jobPostId = interview.jobPost?.id || "";

  return (
    <div className="flex-1 min-h-screen bg-[#F7F9FC] p-0 font-sans">
      <div className="max-w-6xl px-4 py-8 mx-auto pt-2">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 text-red-700 rounded-lg bg-red-50">
                <XCircle size={28} />
              </div>
              <h1 className="text-3xl font-bold text-red-600">Cancel Interview</h1>
            </div>
            <p className="ml-12 text-base text-gray-600">
              Candidate: {interview.candidate?.name || "Unknown"}
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="flex items-center self-end gap-2 px-5 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 sm:self-auto"
          >
            <ChevronLeft size={18} />
            Go Back
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
          <div className="space-y-4 flex flex-col h-full min-h-full">
            <div>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Applicant & Job Post</h2>
            </div>
            <JobPostPanel jobPostId={jobPostId} />
            <ApplicantPanel candidateId={candidateId} />
          </div>

          <div className="flex flex-col h-full min-h-full">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Cancellation Details</h2>

            {/* Cancellation Reason Textarea */}
            <div className="flex-1 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Cancellation *
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Please explain why this interview is being cancelled. This will be included in the email sent to the candidate."
                className="w-full h-32 p-3 border border-gray-200 rounded-lg text-sm font-sans text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              />
              <p className="text-xs text-gray-700 mt-2">
                {cancellationReason.length} characters
              </p>

              {/* Generate Email Button */}
              <button
                onClick={handleGenerateEmail}
                disabled={!cancellationReason.trim() || isGeneratingEmail}
                className="mt-4 w-full px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {isGeneratingEmail ? "Generating Email..." : "Generate Email"}
              </button>
            </div>
          </div>
        </div>

        {/* Email Preview Section */}
        {showEmailPreview && interview && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Email Preview</h2>
            <CancelEmailPreviewSection
              interview={interview}
              cancellationReason={cancellationReason}
              onEmailConfirm={handleEmailConfirm}
              initialEmailBody={customEmailBody}
            />
          </div>
        )}

        {/* Error Alert */}
        {emailPreviewError && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
            <AlertTriangle size={20} className="inline mr-2" />
            {emailPreviewError}
          </div>
        )}

        {cancelError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertTriangle size={20} className="inline mr-2" />
            {cancelError}
          </div>
        )}

        {/* Cancel & Send Email Button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Keep Interview
          </button>
          <button
            onClick={handleCancelAndSend}
            disabled={!isEmailConfirmed || isCancelling}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isCancelling ? (
              <>
                <Hourglass size={16} className="animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <XCircle size={16} />
                Cancel & Send Email
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {cancelledInterview && (
        <SuccessModal
          isOpen={true}
          type="cancelled"
          onClose={() => setIsModalOpen(false)}
          candidateName={cancelledInterview.candidate?.name}
          jobTitle={cancelledInterview.jobPost?.title}
        />
      )}
    </div>
  );
}

// Cancel Email Preview Section Component
function CancelEmailPreviewSection({
  interview,
  cancellationReason,
  onEmailConfirm,
  initialEmailBody,
}: {
  interview: InterviewDTO;
  cancellationReason: string;
  onEmailConfirm: (emailContent: string) => void;
  initialEmailBody: string | null;
}) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [editedEmail, setEditedEmail] = useState(() => {
    if (initialEmailBody) return initialEmailBody;

    // Build email content
    const scheduledDate = new Date(interview.scheduledAt);
    const formattedDate = scheduledDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = scheduledDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const emailContent = `Dear ${interview.candidate?.name || "Candidate"},

We regret to inform you that we need to cancel the interview that was scheduled for ${formattedDate} at ${formattedTime}.

Cancellation Reason:
${cancellationReason}

We sincerely apologize for any inconvenience this may cause. We remain interested in your profile and may reach out in the future with other opportunities that align with your background and experience.

If you have any questions or concerns, please don't hesitate to contact us.

Best regards,
${interview.jobPost?.companyName || "Hiring Team"}`;

    return emailContent;
  });

  const handleConfirm = () => {
    setIsConfirmed(true);
    onEmailConfirm(editedEmail);
  };

  return (
    <div className="p-6 bg-linear-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <XCircle size={20} className="text-red-600" />
          Cancellation Email
        </h3>
        {isConfirmed && (
          <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg">
            <span>✓ Confirmed</span>
          </div>
        )}
      </div>

      {/* Email Content - Editable Textarea */}
      <textarea
        value={editedEmail}
        onChange={(e) => setEditedEmail(e.target.value)}
        disabled={isConfirmed}
        className="w-full bg-white border border-red-100 rounded-lg p-6 text-sm text-gray-700 font-mono max-h-96 overflow-y-auto disabled:bg-gray-50 disabled:opacity-75 resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
        rows={15}
      />

      {/* Quick Info Summary */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white border border-red-100 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">To</p>
          <p className="text-sm font-medium text-gray-800 truncate">{interview.candidate?.email}</p>
        </div>
        <div className="bg-white border border-red-100 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Date</p>
          <p className="text-sm font-medium text-gray-800">
            {new Date(interview.scheduledAt).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-white border border-red-100 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Type</p>
          <p className="text-sm font-medium text-gray-800 capitalize">{interview.meetingType}</p>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleConfirm}
          disabled={isConfirmed}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {isConfirmed ? "✓ Email Confirmed" : "Confirm Email"}
        </button>
      </div>
    </div>
  );
}
