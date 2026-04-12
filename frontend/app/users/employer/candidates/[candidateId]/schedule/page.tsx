"use client";

import { use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, UserSquare } from "lucide-react";
import JobPostPanel from "@/components/employer/interviews/JobPostPanel";
import ApplicantPanel from "@/components/employer/interviews/ApplicantPanel";
import DateCalendar from "@/components/employer/interviews/DateCalendar";
import ScheduleForm from "@/components/employer/interviews/ScheduleForm";
import ReadyToScheduleBar from "@/components/employer/interviews/ReadyToScheduleBar";
import SuccessModal from "@/components/employer/interviews/SuccessModal";

interface Props {
  params: Promise<{ candidateId: string }>;
}

export default function ScheduleInterviewPage({ params }: Props) {
  const { candidateId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("postId");

  const [date, setDate] = useState("2025-12-24");
  const [time, setTime] = useState("11:30");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex-1 min-h-screen bg-[#F7F9FC] p-0 font-sans">
      <div className="max-w-6xl px-4 py-8 mx-auto pt-2">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 text-indigo-700 rounded-lg bg-indigo-50">
                <UserSquare size={28} />
              </div>
              <h1 className="text-3xl font-bold text-indigo-500">Schedule Interview</h1>
            </div>
            <p className="ml-12 text-base text-gray-600">
              Scheduling for Candidate ID: {candidateId}
            </p>
          </div>
          
          <button 
            onClick={() => {
              if (postId) {
                router.push(`/users/employer/job-posts/${postId}/candidates`);
                return;
              }

              router.back();
            }} 
            className="flex items-center self-end gap-2 px-5 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 sm:self-auto"
          >
            <ChevronLeft size={18} />
            Back To Candidate
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Job Post & Applicant</h2>
            </div>
            <JobPostPanel />
            <ApplicantPanel candidateId={candidateId} />
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Select Interview Date</h2>
            <DateCalendar 
              selectedDate={date} 
              onDateChange={setDate}
            />
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Meeting Details</h2>
            <ScheduleForm date={date} setDate={setDate} />
          </div>
        </div>

        <ReadyToScheduleBar 
          date={date} 
          time={time} 
          onSchedule={() => setIsModalOpen(true)} 
        />

        {/* Footer Actions */}
        <div className="flex justify-end gap-4 mt-8">
          <button className="py-2 font-semibold text-white transition-colors bg-indigo-600 rounded-lg shadow-sm px-7 hover:bg-indigo-700">
            Save as Draft
          </button>
          <button className="py-2 font-semibold text-red-600 transition-colors bg-red-100 border border-red-200 rounded-lg shadow-sm px-7 hover:bg-red-200">
            Remove
          </button>
        </div>
      </div>

      <SuccessModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}