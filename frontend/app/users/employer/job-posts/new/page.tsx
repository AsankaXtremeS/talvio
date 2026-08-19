import { Plus } from "lucide-react";
import JobPostForm from "@/components/employer/job-posts/JobPostForm";

export default function NewJobPostPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#EEF4FB] p-8">
      <div className="mb-6 flex shrink-0 items-center gap-3">
        <Plus size={30} className="text-indigo-600" />
        <h1 className="text-3xl font-bold text-indigo-600">Post New Job</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <JobPostForm />
      </div>
    </div>
  );
}