import { Plus } from "lucide-react";
import JobPostForm from "@/components/employer/job-posts/JobPostForm";

export default function NewJobPostPage() {
  return (
    <div className="p-8 bg-[#F4F6FB] min-h-screen">
      <div className="flex items-center gap-2.5 mb-6">
        <Plus size={22} className="text-indigo-500" />
        <h1 className="text-2xl font-bold text-indigo-600">Post New Job</h1>
      </div>
      <JobPostForm />
    </div>
  );
}