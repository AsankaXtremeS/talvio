import { CalendarDays, ClipboardList, Sparkles, Dock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getJobPostStats } from "@/lib/employer/jobPosts.service";
import { getInterviews } from "@/lib/employer/interviews.service";

export default function StatsRow() {
	const { data: jobStats } = useQuery({
		queryKey: ["employer-job-posts-stats"],
		queryFn: getJobPostStats,
		staleTime: 1000 * 60 * 5,
	});

	const { data: interviewStats } = useQuery({
		queryKey: ["employer-interviews-stats"],
		queryFn: async () => {
			const res = await getInterviews({ status: "SCHEDULED" });
			return res.data.length;
		},
		staleTime: 1000 * 60 * 5,
	});

	const statCards = [
		{
			label: "Active Job Posts",
			value: jobStats?.active?.toString().padStart(2, "0") || "00",
			icon: <ClipboardList size={22} className="text-indigo-500" />,
			bg: "bg-indigo-200",
		},
		{
			label: "Interview Schedule",
			value: interviewStats?.toString().padStart(2, "0") || "00",
			icon: <CalendarDays size={22} className="text-indigo-500" />,
			bg: "bg-indigo-300",
		},
		{
			label: "Applications",
			value: jobStats?.applications?.toString().padStart(2, "0") || "00",
			icon: <Dock size={22} className="text-indigo-200" />,
			bg: "bg-indigo-500",
		},
		{
			label: "AI Matched Candidates",
			value: "04", // Placeholder as AI matching is not fully implemented in stats yet
			icon: <Sparkles size={22} className="text-indigo-200" />,
			bg: "bg-indigo-700",
		},
	];

	return (
		<div className="grid grid-cols-4 gap-4 mb-6">
			{statCards.map((card, index) => (
				<div key={index} className={`${card.bg} rounded-2xl p-5 flex items-center justify-between`}>
					<div>
						<p className={`text-xs font-medium mb-1 ${index >= 2 ? "text-indigo-100" : "text-indigo-700"}`}>
							{card.label}
						</p>
						<p className={`text-4xl font-bold ${index >= 2 ? "text-white" : "text-indigo-900"}`}>
							{card.value}
						</p>
					</div>
					<div className="opacity-70">{card.icon}</div>
				</div>
			))}
		</div>
	);
}
