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
import { useRouter } from "next/navigation";
import { ChevronLeft, UserSquare } from "lucide-react";

import JobPostPanel       from "@/components/employer/interviews/JobPostPanel";
import ApplicantPanel     from "@/components/employer/interviews/ApplicantPanel";
import ScheduleForm       from "@/components/employer/interviews/ScheduleForm";
import EmailPreviewPanel  from "@/components/employer/interviews/EmailPreviewPanel";
import ReadyToScheduleBar from "@/components/employer/interviews/ReadyToScheduleBar";
import ConfirmationModal  from "@/components/employer/interviews/ConfirmationModel";
import SuccessModal       from "@/components/employer/interviews/SuccessModal";

import {
  createInterview,
  generateEmailPreview,
  saveEmailBody,
  scheduleAndSend,
  cancelInterview,
  updateInterview,
} from "@/lib/employer/interviews.service";
import { getCandidateById } from "@/lib/employer/candidates.service";

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

  // ── Form state ──
  const [date, setDate]                     = useState("");
  const [time, setTime]                     = useState("");
  const [meetingType, setMeetingType]       = useState<MeetingType>("ONLINE");
  const [location, setLocation]             = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  // ── Draft state — InterviewDTO (same name as backend) ──
  const [draft, setDraft]   = useState<InterviewDTO | null>(null);
  const draftRef            = useRef<InterviewDTO | null>(null);
  draftRef.current          = draft;

  // ── Email preview state ──
  const [emailSubject, setEmailSubject]         = useState("");
  const [emailBody, setEmailBody]               = useState("");
  const [showEmailPreview, setShowEmailPreview] = useState(false);  // controls panel visibility

  // ── Candidate info for modals ──
  const [candidate, setCandidate] = useState<CandidateInfo | null>(null);

  // ── UI loading flags ──
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [isSavingDraft, setIsSavingDraft]         = useState(false);
  const [isSavingEmail, setIsSavingEmail]         = useState(false);
  const [showConfirm, setShowConfirm]             = useState(false);
  const [isScheduling, setIsScheduling]           = useState(false);
  const [showSuccess, setShowSuccess]             = useState(false);
  const [error, setError]                         = useState<string | null>(null);

  // ── Load candidate info on mount ──
  useEffect(() => {
    getCandidateById(candidateId).then((c) => { if (c) setCandidate(c); });
  }, [candidateId]);

  // ── Build ISO scheduledAt from separate date + time fields ──
  function buildScheduledAt(d: string, t: string): string {
    return `${d}T${t}:00.000Z`;
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
      if (!currentDraft) {
        currentDraft = await createInterview({
          jobPostId:          postId,
          candidateProfileId: candidateId,
          scheduledAt,
          meetingType,
          location:       meetingType === "ONSITE" ? location : undefined,
          additionalInfo: additionalInfo || undefined,
        });
        setDraft(currentDraft);
      } else {
        currentDraft = await updateInterview(currentDraft.id, {
          scheduledAt,
          meetingType,
          location:       meetingType === "ONSITE" ? location : undefined,
          additionalInfo: additionalInfo || undefined,
        });
        setDraft(currentDraft);
      }

      // Generate email preview — returns EmailPreviewDTO { subject, body }
      const preview = await generateEmailPreview({
        jobPostId:          postId,
        candidateProfileId: candidateId,
        scheduledAt,
        meetingType,
        location:       meetingType === "ONSITE" ? location : undefined,
        meetingLink:    currentDraft.meetingLink ?? undefined,
        additionalInfo: additionalInfo || undefined,
      });

      setEmailSubject(preview.subject);
      setEmailBody(preview.body);
      setShowEmailPreview(true);
    } catch (err) {
      setError((err as Error).message ?? "Failed to generate email preview.");
    } finally {
      setIsGeneratingEmail(false);
    }
  }, [date, time, meetingType, location, additionalInfo, postId, candidateId]);

  // ── Save custom email body edits ────────────────────────────────────────────
  const handleEmailBodyChange = useCallback(async (newBody: string) => {
    setEmailBody(newBody);
    const currentDraft = draftRef.current;
    if (!currentDraft) return;

    setIsSavingEmail(true);
    try {
      await saveEmailBody(currentDraft.id, newBody);
    } catch (err) {
      console.error("Failed to save email body:", err);
    } finally {
      setIsSavingEmail(false);
    }
  }, []);

  // ── Save as Draft ───────────────────────────────────────────────────────────
  const handleSaveDraft = useCallback(async () => {
    if (!date || !time) { setError("Please select a date and time."); return; }

    setError(null);
    setIsSavingDraft(true);
    try {
      const scheduledAt = buildScheduledAt(date, time);
      const currentDraft = draftRef.current;

      if (!currentDraft) {
        const created = await createInterview({
          jobPostId:          postId,
          candidateProfileId: candidateId,
          scheduledAt,
          meetingType,
          location:       meetingType === "ONSITE" ? location : undefined,
          additionalInfo: additionalInfo || undefined,
          emailBody:      emailBody || undefined,
        });
        setDraft(created);
      } else {
        const updated = await updateInterview(currentDraft.id, {
          scheduledAt,
          meetingType,
          location:       meetingType === "ONSITE" ? location : undefined,
          additionalInfo: additionalInfo || undefined,
          emailBody:      emailBody || undefined,
        });
        setDraft(updated);
      }
    } catch (err) {
      setError((err as Error).message ?? "Failed to save draft.");
    } finally {
      setIsSavingDraft(false);
    }
  }, [date, time, meetingType, location, additionalInfo, emailBody, postId, candidateId]);

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
    if (!currentDraft) { setError("No draft found. Please save as draft first."); return; }

    setIsScheduling(true);
    try {
      // Persist any final email body edits before sending
      if (emailBody && emailBody !== currentDraft.emailBody) {
        await saveEmailBody(currentDraft.id, emailBody);
      }
      // Send email — returns InterviewDTO with status=SCHEDULED
      const scheduled = await scheduleAndSend(currentDraft.id);
      setDraft(scheduled);
      setShowConfirm(false);
      setShowSuccess(true);
    } catch (err) {
      setError((err as Error).message ?? "Failed to send email.");
      setShowConfirm(false);
    } finally {
      setIsScheduling(false);
    }
  }, [emailBody]);

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
              <h1 className="text-2xl font-bold text-indigo-600">Schedule Interview</h1>
            </div>
            <p className="ml-12 text-sm text-gray-500">
              Set up an interview for this candidate and send them an invitation email.
            </p>
          </div>
          <button
            onClick={() => router.push(`/users/employer/job-posts/${postId}/candidates`)}
            className="flex items-center self-end gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 sm:self-auto transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Candidates
          </button>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-4">✕</button>
          </div>
        )}

        {/* ── Draft saved indicator ── */}
        {draft && draft.status === "DRAFT" && (
          <div className="mb-4 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-600 font-medium">
            ✅ Draft saved · ID: {draft.id.slice(0, 8)}…
          </div>
        )}

        {/* ── Job Post + Applicant panels ── */}
        <div className="grid grid-cols-1 gap-5 mb-5 lg:grid-cols-2">
          <div>
            <h2 className="mb-2.5 text-sm font-semibold text-gray-700 uppercase tracking-wide">Job Post</h2>
            <JobPostPanel postId={postId} />
          </div>
          <div>
            <h2 className="mb-2.5 text-sm font-semibold text-gray-700 uppercase tracking-wide">Applicant</h2>
            <ApplicantPanel candidateProfileId={candidateId} />
          </div>
        </div>

        {/* ── Schedule Form ── */}
        <ScheduleForm
          date={date}
          setDate={setDate}
          time={time}
          setTime={setTime}
          meetingType={meetingType}
          setMeetingType={setMeetingType}
          location={location}
          setLocation={setLocation}
          additionalInfo={additionalInfo}
          setAdditionalInfo={setAdditionalInfo}
          meetingLink={draft?.meetingLink}
          onGenerateEmail={handleGenerateEmail}
          isGeneratingEmail={isGeneratingEmail}
        />

        {/* ── Email Preview Panel — shown after Generate Email clicked ── */}
        {showEmailPreview && emailBody && (
          <EmailPreviewPanel
            subject={emailSubject}
            body={emailBody}
            onBodyChange={handleEmailBodyChange}
            isSaving={isSavingEmail}
          />
        )}

        {/* ── Ready to Schedule bar ── */}
        <ReadyToScheduleBar
          date={date}
          time={time}
          meetingType={meetingType}
          location={location}
          meetingLink={draft?.meetingLink}
          candidateEmail={candidate?.email ?? draft?.candidateEmail}
          onSaveDraft={handleSaveDraft}
          onRemove={handleRemove}
          onSchedule={handleScheduleClick}
          isSavingDraft={isSavingDraft}
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
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
        isLoading={isScheduling}
      />

      {/* ── Success Modal ── */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        candidateName={candidate?.name ?? draft?.candidate?.name}
        candidateEmail={candidate?.email ?? draft?.candidateEmail}
        jobTitle={draft?.jobPost?.title}
        scheduledAt={draft?.scheduledAt}
        meetingType={draft?.meetingType ?? meetingType}
        meetingLink={draft?.meetingLink}
        location={draft?.location}
      />
    </div>
  );
}