import { User } from "lucide-react";

interface Job {
	title: string;
	dept: string;
	status: string;
	type: string;
	location: string;
	salary: string;
	applicants: number;
	posted: string;
}

const jobs: Job[] = [
	{
		title: "UX/UI Designer",
		dept: "Software",
		status: "Active",
		type: "Full-time",
		location: "On site",
		salary: "$1000 - $1100",
		applicants: 24,
		posted: "5 days ago",
	},
];

export default function JobsPreviewWidget() {
	return (
		<div className="bg-white rounded-2xl p-5 shadow-sm">
			<div className="flex items-center justify-between mb-4">
				<h2 className="font-semibold text-gray-800">Jobs</h2>
				<button className="text-sm text-indigo-600 font-medium hover:underline">View all</button>
			</div>
			{jobs.map((job, index) => (
				<div key={index} className="border border-gray-100 rounded-xl p-4">
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-3">
							<div className="w-9 h-9 rounded-lg bg-gray-800 text-white flex items-center justify-center text-sm font-bold">
								R
							</div>
							<div>
								<p className="text-sm font-semibold text-gray-800">{job.title}</p>
								<p className="text-xs text-indigo-500">{job.dept}</p>
							</div>
						</div>
						<span className="bg-emerald-100 text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full">
							{job.status}
						</span>
					</div>
					<div className="flex items-center gap-2 flex-wrap mb-3">
						<span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">{job.type}</span>
						<span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">{job.location}</span>
						<span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full flex items-center gap-1">
							<User size={10} /> {job.salary}
						</span>
					</div>
					<div className="flex items-center justify-between text-xs text-gray-500">
						<span className="flex items-center gap-1.5">
							<User size={12} />
							{job.applicants} Applicants
						</span>
						<span className="flex items-center gap-1">
							<span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
							Posted {job.posted}
						</span>
					</div>
				</div>
			))}
		</div>
	);
}
