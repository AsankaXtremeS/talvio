"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Edit, 
  Bot
} from "lucide-react";

// ── Mock Data for the Job Details ──
const MOCK_JOB_DETAILS = {
  title: "Frontend Developer",
  department: "Engineering",
  type: "Full-time",
  location: "Remote / Hybrid",
  salary: "$120,000 - $140,000",
  postedDate: "Oct 24, 2024",
  status: "Active",
  applicantsCount: 42,
  shortlistedCount: 8,
  description: "We are looking for an experienced Frontend Developer to join our core product team. You will be responsible for building modern, responsive, and high-performance user interfaces using React and Next.js.",
  requirements: [
    "3+ years of experience with React.js and modern JavaScript (ES6+).",
    "Strong understanding of Next.js, Server Components, and App Router.",
    "Experience with Tailwind CSS and responsive design principles.",
    "Familiarity with RESTful APIs and GraphQL.",
    "Excellent problem-solving skills and attention to detail."
  ]
};

interface Props {
  params: Promise<{ postId: string }>;
}

export default function JobPostDetailsPage({ params }: Props) {
  const router = useRouter();
  
  // Unwrap the params Promise safely (Next.js 15 requirement)
  const { postId } = use(params);

  // In a real app, you would fetch the data based on the postId:
  // const job = await getJobPostById(postId);
  const job = MOCK_JOB_DETAILS;

  return (
    <div className="flex-1 min-h-screen bg-[#F4F6FB] p-8 overflow-auto">
      
      {/* ── Top Navigation ── */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Back to Job Posts
      </button>

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              job.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
              job.status === 'Draft' ? 'bg-gray-50 text-gray-600 border-gray-200' : 
              'bg-red-50 text-red-600 border-red-200'
            }`}>
              {job.status}
            </span>
          </div>
          <p className="text-gray-500 text-sm flex items-center gap-2">
            Post ID: {postId} • Posted on {job.postedDate}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push(`/users/employer/job-posts/${postId}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold shadow-sm"
          >
            <Edit size={16} /> Edit Job
          </button>
          <button 
            onClick={() => router.push(`/users/employer/job-posts/${postId}/candidates`)}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-sm"
          >
            <Bot size={16} /> View AI Matches
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Column: Job Content (Takes up 2/3 width) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Job Description</h2>
            <p className="text-gray-600 leading-relaxed text-sm mb-6">
              {job.description}
            </p>

            <h2 className="text-lg font-bold text-gray-900 mb-4">Requirements</h2>
            <ul className="space-y-3">
              {job.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Right Column: Metadata & Stats (Takes up 1/3 width) ── */}
        <div className="space-y-6">
          
          {/* Quick Info Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-5">At a Glance</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Briefcase size={16} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Department</p>
                  <p className="font-semibold text-gray-900">{job.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Employment Type</p>
                  <p className="font-semibold text-gray-900">{job.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Location</p>
                  <p className="font-semibold text-gray-900">{job.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <DollarSign size={16} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Salary Range</p>
                  <p className="font-semibold text-gray-900">{job.salary}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Applicant Stats Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            {/* Background decorative element */}
            <Users size={120} className="absolute -bottom-6 -right-6 text-white/10" />
            
            <h3 className="font-bold text-indigo-100 mb-6 relative z-10">Candidate Pipeline</h3>
            
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div>
                <p className="text-indigo-200 text-xs font-medium mb-1">Total Applicants</p>
                <p className="text-3xl font-bold">{job.applicantsCount}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-medium mb-1">AI Shortlisted</p>
                <p className="text-3xl font-bold">{job.shortlistedCount}</p>
              </div>
            </div>

            <button 
              onClick={() => router.push(`/users/employer/job-posts/${postId}/candidates`)}
              className="w-full mt-6 py-2.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl transition-colors backdrop-blur-sm"
            >
              Review Pipeline →
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}