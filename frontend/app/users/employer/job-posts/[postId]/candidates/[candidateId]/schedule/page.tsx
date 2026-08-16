// Schedule Interview Page
// Route: /users/employer/job-posts/[postId]/candidates/[candidateId]/schedule
//
// Full flow:
// 1. Employer fills in date, time, meeting type, location/notes
// 2. Clicks "Generate Email" → calls backend preview endpoint → shows email
// 3. Employer can edit the email in the EmailPreviewPanel
// 4. "Save as Draft" → saves current state to DB without sending
// 5. "Remove" → deletes the draft and goes back
// 6. "Schedule & Send Email" → shows ConfirmationModal
// 7. Confirm → sends email, shows SuccessModal
// 8. Calendar on interviews page shows the newly scheduled date

"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, UserSquare } from "lucide-react";

import JobPostPanel from "@/components/employer/interviews/JobPostPanel";
import ApplicantPanel from "@/components/employer/interviews/ApplicantPanel";
import DateCalendar from "@/components/employer/interviews/DateCalendar";
import ScheduleForm from "@/components/employer/interviews/ScheduleForm";
import GeneratedEmailPreview from "@/components/employer/interviews/GeneratedEmailPreview";
import ReadyToScheduleBar from "@/components/employer/interviews/ReadyToScheduleBar";
import ConfirmationModal from "@/components/employer/interviews/ConfirmationModel";
import SuccessModal from "@/components/employer/interviews/SuccessModal";
import ExistingInterviewsModal from "@/components/employer/interviews/ExistingInterviewsModal";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import {
  createInterview,
  saveEmailBody,
  scheduleAndSend,
  cancelInterview,
  updateInterview,
  generateEmailPreview,
  getInterviews,
  getScheduledDates,
} from "@/lib/employer/interviews.service";
import { getCandidateById, saveInterviewScheduledCandidateId } from "@/lib/employer/candidates.service";

// Use the SAME type names as backend: InterviewDTO, EmailPreviewDTO
import { MeetingType, InterviewDTO } from "@/types/employer/interview.types";
import { CandidateInfo } from "@/types/candidate/candidate.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ postId: string; candidateId: string }>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScheduleInterviewPage({ params }: Props) {
  const { postId, candidateId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const interviewId = searchParams?.get("interviewId");
  const isReschedule = !!interviewId;

  // ── Form state ──
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [meetingType, setMeetingType] = useState<MeetingType>("ONLINE");
  const [onlineOption, setOnlineOption] = useState<"GENERATE" | "CUSTOM">("GENERATE");
  const [customLink, setCustomLink] = useState("");
  const [location, setLocation] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  // ── Draft state — InterviewDTO (same name as backend) ──
  const [draft, setDraft] = useState<InterviewDTO | null>(null);
  const draftRef = useRef<InterviewDTO | null>(null);
  draftRef.current = draft;

  // ── Email preview state ──
  const [showEmailPreview, setShowEmailPreview] = useState(false);  // controls panel visibility
  const [backendEmailBody, setBackendEmailBody] = useState<string | null>(null);

  // ── Candidate info for modals ──
  const [candidate, setCandidate] = useState<CandidateInfo | null>(null);

  // ── UI loading flags ──
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isScheduling, setIsScheduling]           = useState(false);
  const [showSuccess, setShowSuccess]             = useState(false);
  const [error, setError]                         = useState<string | null>(null);
  const [emailRefreshKey, setEmailRefreshKey]     = useState(0);

  // -- Existing interviews state --
  const [scheduledDates, setScheduledDates] = useState<string[]>([]);
  const [existingInterviews, setExistingInterviews] = useState<InterviewDTO[]>([]);
  const [isExistingInterviewsModalOpen, setIsExistingInterviewsModalOpen] = useState(false);
  const [loadingInterviews, setLoadingInterviews] = useState(false);

  // Reset email confirmation if form fields change
  useEffect(() => {
    setShowEmailPreview(false);
  }, [date, time, meetingType, onlineOption, customLink, location, additionalInfo]);

  // ── Load candidate info on mount ──
  useEffect(() => {
    getCandidateById(candidateId).then((c) => { if (c) setCandidate(c); });
  }, [candidateId]);

  // ── Load existing interview for reschedule ──
  const [isLoadingRescheduleData, setIsLoadingRescheduleData] = useState(false);

  useEffect(() => {
    if (!isReschedule || !interviewId) return;

    const loadInterview = async () => {
      try {
        setIsLoadingRescheduleData(true);
        const { getInterview } = await import("@/lib/employer/interviews.service");
        const interview = await getInterview(interviewId);

        // Pre-fill form fields only — don't set as draft
        // (the loaded interview is SCHEDULED, we'll create a new DRAFT for reschedule)
        const scheduledDate = new Date(interview.scheduledAt);
        
        // Convert UTC ISO string to local date in YYYY-MM-DD format
        // Using toLocaleDateString('en-CA') which returns YYYY-MM-DD in local timezone
        const dateStr = scheduledDate.toLocaleDateString('en-CA');
        
        // Get local time in HH:MM format
        const hours = String(scheduledDate.getHours()).padStart(2, '0');
        const minutes = String(scheduledDate.getMinutes()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;

        setDate(dateStr);
        setTime(timeStr);
        setMeetingType(interview.meetingType);
        if (interview.meetingType === "ONLINE" && interview.meetingLink) {
          setOnlineOption("CUSTOM");
          setCustomLink(interview.meetingLink);
        }
        setLocation(interview.location || "");
        setAdditionalInfo(interview.additionalInfo || "");
      } catch (err) {
        setError((err as Error).message ?? "Failed to load interview details.");
      } finally {
        setIsLoadingRescheduleData(false);
      }
    };

    loadInterview();
  }, [isReschedule, interviewId]);

  // Fetch scheduled dates for the month (for calendar underlines)
  const handleMonthChange = useCallback(async (year: number, month: number) => {
    try {
      const dates = await getScheduledDates(year, month);
      setScheduledDates(dates);
    } catch (err) {
      console.error("[ScheduleInterview] Failed to fetch scheduled dates:", err);
    }
  }, []);

  // Handle date change: fetch existing interviews for that date
  const handleDateChange = useCallback(async (newDate: string) => {
    setDate(newDate);
    if (!newDate) return;

    try {
      setLoadingInterviews(true);
      // Fetch interviews for the newly selected date
      const response = await getInterviews({ date: newDate, status: "SCHEDULED" });
      setExistingInterviews(response.data);

      // If interviews exist, show the modal
      if (response.data.length > 0) {
        setIsExistingInterviewsModalOpen(true);
      }
    } catch (err) {
      console.error("[ScheduleInterview] Failed to fetch existing interviews:", err);
    } finally {
      setLoadingInterviews(false);
    }
  }, []);

  // ── Build ISO scheduledAt from separate date + time fields ──
  function buildScheduledAt(d: string, t: string): string {
    const localDateTime = new Date(`${d}T${t}:00`);
    return localDateTime.toISOString();
  }

  // ── Generate email preview ──────────────────────────────────────────────────
  const handleGenerateEmail = useCallback(async () => {
    if (!date || !time) { setError("Please select a date and time first."); return; }
    if (meetingType === "ONSITE" && !location.trim()) {
      setError("Please enter a location for on-site interview.");
      return;
    }

    setError(null);
    setIsGeneratingEmail(true);

    try {
      const scheduledAt = buildScheduledAt(date, time);

      // Create or update draft to get meetingLink (for ONLINE Meet link)
      let currentDraft = draftRef.current;

      if (isReschedule) {
        // In reschedule mode: always create a NEW draft (don't update scheduled interview)
        console.log("Creating NEW reschedule draft with rescheduledFromId:", interviewId);
        currentDraft = await createInterview({
          jobPostId: postId,
          candidateProfileId: candidateId,
          scheduledAt,
          meetingType,
          meetingLink: meetingType === "ONLINE" && onlineOption === "CUSTOM" ? customLink : undefined,
          location: meetingType === "ONSITE" ? location : undefined,
          additionalInfo: additionalInfo || undefined,
          isReschedule: true,
          rescheduledFromId: interviewId || undefined,
        });
        console.log("Reschedule draft created:", { id: currentDraft.id, rescheduledFromId: currentDraft.rescheduledFromId });
        setDraft(currentDraft);
      } else if (!currentDraft) {
        // New schedule: create draft
        currentDraft = await createInterview({
          jobPostId: postId,
          candidateProfileId: candidateId,
          scheduledAt,
          meetingType,
          meetingLink: meetingType === "ONLINE" && onlineOption === "CUSTOM" ? customLink : undefined,
          location: meetingType === "ONSITE" ? location : undefined,
          additionalInfo: additionalInfo || undefined,
        });
        setDraft(currentDraft);
      } else {
        // Update existing draft
        currentDraft = await updateInterview(currentDraft.id, {
          scheduledAt,
          meetingType,
          meetingLink: meetingType === "ONLINE" && onlineOption === "CUSTOM" ? customLink : undefined,
          location: meetingType === "ONSITE" ? location : undefined,
          additionalInfo: additionalInfo || undefined,
        });
        setDraft(currentDraft);
      }

      // ── Fetch "Official" backend email preview ───────────────────────────────
      const preview = await generateEmailPreview({
        jobPostId: postId,
        candidateProfileId: candidateId,
        scheduledAt,
        meetingType,
        meetingLink: currentDraft.meetingLink || undefined,
        location: meetingType === "ONSITE" ? location : undefined,
        additionalInfo: additionalInfo || undefined,
        isReschedule,
      });

      setBackendEmailBody(preview.body);
      setShowEmailPreview(true);
      setEmailRefreshKey(prev => prev + 1);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to generate email preview.";
      console.error("Generate email error:", err);
      setError(errorMsg);
    } finally {
      setIsGeneratingEmail(false);
    }
  }, [date, time, meetingType, onlineOption, customLink, location, additionalInfo, postId, candidateId, isReschedule, interviewId]);

  // ── Handle email confirmation ───────────────────────────────────────────────
  const handleEmailConfirm = useCallback(async (emailContent: string) => {
    const currentDraft = draftRef.current;
    if (!currentDraft) return;

    try {
      await saveEmailBody(currentDraft.id, emailContent);
    } catch (err) {
      console.error("Failed to save email body:", err);
      setError("Failed to save email. Please try again.");
    }
  }, []);


  // ── Remove / Cancel ─────────────────────────────────────────────────────────
  const handleRemove = useCallback(async () => {
    const currentDraft = draftRef.current;
    if (currentDraft) {
      try { await cancelInterview(currentDraft.id); } catch { /* ignore */ }
    }
    router.push(`/users/employer/job-posts/${postId}/candidates`);
  }, [postId, router]);

  // ── Open confirmation modal ─────────────────────────────────────────────────
  const handleScheduleClick = useCallback(() => {
    if (!showEmailPreview) { setError("Please generate the email preview first."); return; }
    setError(null);
    setShowConfirm(true);
  }, [showEmailPreview]);

  // ── Confirm — actually send email ───────────────────────────────────────────
  const handleConfirm = useCallback(async () => {
    const currentDraft = draftRef.current;
    if (!currentDraft) {
      setError("No draft found. Please generate email preview first.");
      return;
    }

    console.log("Confirming interview:", { id: currentDraft.id, isReschedule, rescheduledFromId: currentDraft.rescheduledFromId });

    setIsScheduling(true);
    try {
      // Send email — returns InterviewDTO with status=SCHEDULED
      const scheduled = await scheduleAndSend(currentDraft.id);
      console.log("Interview scheduled successfully:", { id: scheduled.id, rescheduledFromId: scheduled.rescheduledFromId });
      setDraft(scheduled);
      
      // Save to local storage for instant sync in applicants list
      saveInterviewScheduledCandidateId(postId, candidateId);

      // Invalidate React Query cache to ensure automatic update on dashboard
      queryClient.invalidateQueries({ queryKey: ["employer-interviews"] });

      setShowConfirm(false);
      setShowSuccess(true);

      // After success, delete the old interview if reschedule
      if (isReschedule && interviewId) {
        console.log("Cancelling old interview after scheduling new one:", interviewId);
        try {
          await cancelInterview(interviewId);
          console.log("Old interview cancelled successfully");
        } catch (err) {
          console.error("Error cancelling old interview:", err);
          // Don't fail the reschedule if cancellation fails
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to send email.";
      console.error("Schedule send error:", err);
      setError(errorMsg);
      setShowConfirm(false);
    } finally {
      setIsScheduling(false);
    }
  }, [isReschedule, interviewId]);

  // ── Derived value for modals ────────────────────────────────────────────────
  const scheduledAtISO = date && time ? buildScheduledAt(date, time) : "";

  return (
    <div className="flex-1 min-h-screen bg-[#F7F9FC] font-sans">
      <div className="max-w-5xl px-4 py-8 mx-auto">

        {/* ── Page Header ── */}
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 text-indigo-700 rounded-lg bg-indigo-50">
                <UserSquare size={26} />
              </div>
              <h1 className="text-2xl font-bold text-indigo-600">
                {isReschedule ? "Reschedule Interview" : "Schedule Interview"}
                {candidate?.name ? ` for ${candidate.name}` : ""}
              </h1>
            </div>
            <p className="ml-12 text-sm text-gray-500">
              {isReschedule
                ? `Update the interview details and send a reschedule notification to ${candidate?.name || "the candidate"}.`
                : `Set up an interview for ${candidate?.name || "this candidate"} and send them an invitation email.`}
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center self-end gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 sm:self-auto transition-colors"
          >
            <ChevronLeft size={16} />
            Go Back
          </button>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center justify-between">
            <span> {error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-4">✕</button>
          </div>
        )}

        {/* ── Draft saved indicator ── */}
        {draft && draft.status === "DRAFT" && (
          <div className="mb-4 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-600 font-medium">
            ✅ Draft saved · ID: {draft.id.slice(0, 8)}…
          </div>
        )}

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2 min-h-95">
          <div className="space-y-4 flex flex-col h-full min-h-full">
            <div>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Job Post & Applicant</h2>
            </div>
            
            <ApplicantPanel candidateProfileId={candidateId} jobPostId={postId} />
            <JobPostPanel postId={postId} />
          </div>


          <div className="flex flex-col h-full min-h-full justify-stretch">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Select Interview Date</h2>
            <DateCalendar
              selectedDate={date}
              onDateChange={handleDateChange}
              scheduledDates={scheduledDates}
              onMonthChange={handleMonthChange}
            />
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Meeting Details</h2>
            <ScheduleForm
              date={date}
              setDate={setDate}
              time={time}
              setTime={setTime}
              meetingType={meetingType}
              setMeetingType={setMeetingType}
              onlineOption={onlineOption}
              setOnlineOption={setOnlineOption}
              customLink={customLink}
              setCustomLink={setCustomLink}
              location={location}
              setLocation={setLocation}
              additionalInfo={additionalInfo}
              setAdditionalInfo={setAdditionalInfo}
              meetingLink={draft?.meetingLink}
              onGenerateEmail={handleGenerateEmail}
              isGeneratingEmail={isGeneratingEmail}
              isReschedule={isReschedule}
            />

            {/* ── Email Preview Panel — shown after Generate Email clicked ── */}
            {showEmailPreview && (
              <GeneratedEmailPreview
                candidateName={candidate?.name ?? draft?.candidate?.name ?? "Candidate"}
                candidateEmail={candidate?.email ?? draft?.candidateEmail ?? ""}
                date={date}
                time={time}
                meetingType={meetingType}
                location={location}
                meetingLink={draft?.meetingLink}
                additionalInfo={additionalInfo}
                isReschedule={isReschedule}
                initialBody={backendEmailBody || undefined}
                refreshKey={emailRefreshKey}
                onConfirm={handleEmailConfirm}
              />
            )}
          </div>
        </div>

        {/* ── Ready to Schedule bar ── */}
        <ReadyToScheduleBar
          date={date}
          time={time}
          meetingType={meetingType}
          location={location}
          meetingLink={draft?.meetingLink}
          candidateEmail={candidate?.email ?? draft?.candidateEmail}
          onRemove={handleRemove}
          onSchedule={handleScheduleClick}
          isScheduling={isScheduling}
          hasEmailPreview={showEmailPreview}
        />
      </div>

      {/* ── Confirmation Modal ── */}
      <ConfirmationModal
        isOpen={showConfirm}
        candidateName={candidate?.name ?? draft?.candidate?.name ?? "Candidate"}
        candidateEmail={candidate?.email ?? draft?.candidateEmail ?? ""}
        jobTitle={draft?.jobPost?.title ?? ""}
        scheduledAt={scheduledAtISO}
        meetingType={meetingType}
        meetingLink={draft?.meetingLink || undefined}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
        isLoading={isScheduling}
      />

      {/* ── Success Modal ── */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          // After reschedule, navigate to interviews dashboard to see the reschedule notification
          if (isReschedule) {
            router.push("/users/employer/interviews");
          } else {
            router.push(`/users/employer/job-posts/${postId}/candidates?status=Interview Scheduled`);
          }
        }}
        candidateName={candidate?.name ?? draft?.candidate?.name}
        candidateEmail={candidate?.email ?? draft?.candidateEmail}
        jobTitle={draft?.jobPost?.title}
        scheduledAt={draft?.scheduledAt}
        meetingType={draft?.meetingType ?? meetingType}
        meetingLink={draft?.meetingLink}
        location={draft?.location}
        emailSentAt={draft?.emailSentAt}
      />

      <ExistingInterviewsModal
        isOpen={isExistingInterviewsModalOpen}
        onClose={() => setIsExistingInterviewsModalOpen(false)}
        date={date}
        interviews={existingInterviews}
      />

      {/* Loading Overlay for fetching interviews */}
      {loadingInterviews && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold text-gray-700">Checking schedule...</p>
          </div>
        </div>
      )}
    </div>
  );
}