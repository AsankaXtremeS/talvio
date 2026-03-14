import { FileText } from "lucide-react";

interface Activity {
	text: string;
	time: string;
}

const activities: Activity[] = [
	{ text: "John Deb applied for senior software engineer", time: "2 hours ago" },
	{ text: "John Deb applied for senior software engineer", time: "2 hours ago" },
];

export default function RecentActivityFeed() {
	return (
		<div className="bg-white rounded-2xl p-5 shadow-sm">
			<div className="flex items-center justify-between mb-4">
				<h2 className="font-semibold text-gray-800">Recent Activities</h2>
				<button className="text-sm text-indigo-600 font-medium hover:underline">View all</button>
			</div>
			<div className="space-y-3">
				{activities.map((activity, index) => (
					<div key={index} className="flex items-start gap-3 border border-gray-100 rounded-xl p-3.5">
						<div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
							<FileText size={15} className="text-indigo-500" />
						</div>
						<div className="flex-1">
							<p className="text-sm text-gray-700 leading-snug">{activity.text}</p>
							<p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
						</div>
						<button className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg whitespace-nowrap hover:bg-gray-50 transition-colors">
							View application
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
