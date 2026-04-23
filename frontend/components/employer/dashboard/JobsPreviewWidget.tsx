import { User, Briefcase, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getJobPosts } from "@/lib/employer/jobPosts.service";
import { useRouter } from "next/navigation";

export default function JobsPreviewWidget() {
	const router = useRouter();
	const { data: posts, isLoading } = useQuery({
		queryKey: ["employer-job-posts-preview"],
		queryFn: getJobPosts,
		staleTime: 1000 * 60 * 5,
	});

	const displayPosts = posts?.slice(0, 3) || [];

	return (
		<div className="bg-white rounded-2xl p-5 shadow-sm h-full">
			<div className="flex items-center justify-between mb-4">
				<h2 className="font-semibold text-gray-800">Jobs</h2>
				<button 
					onClick={() => router.push("/users/employer/job-posts")}
					className="text-sm text-indigo-600 font-medium hover:underline"
				>
					View all
				</button>
			</div>
			
			<div className="space-y-3">
				{isLoading ? (
					<div className="py-10 text-center text-sm text-gray-400">Loading...</div>
				) : displayPosts.length === 0 ? (
					<div className="py-10 text-center text-sm text-gray-400 italic">No job posts yet</div>
				) : (
					displayPosts.map((job) => (
						<div key={job.id} className="border border-gray-100 rounded-xl p-4 hover:border-indigo-100 transition-colors">
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center gap-3">
									<div className="w-9 h-9 rounded-lg bg-gray-800 text-white flex items-center justify-center text-sm font-bold">
										{job.title[0]}
									</div>
									<div>
										<p className="text-sm font-semibold text-gray-800">{job.title}</p>
										<p className="text-xs text-indigo-500 capitalize">{job.type}</p>
									</div>
								</div>
								<span className={`text-xs font-semibold px-3 py-1 rounded-full ${
									job.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 
									job.status === 'Closed' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
								}`}>
									{job.status}
								</span>
							</div>
							<div className="flex items-center gap-2 flex-wrap mb-3">
								<span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">{job.employmentType}</span>
								<span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full flex items-center gap-1">
									<MapPin size={10} /> {job.workMode}
								</span>
							</div>
							<div className="flex items-center justify-between text-xs text-gray-500">
								<span className="flex items-center gap-1.5">
									<User size={12} />
									{job.applicantsCount || 0} Applicants
								</span>
								<span className="flex items-center gap-1">
									<span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
									Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Recently"}
								</span>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}
