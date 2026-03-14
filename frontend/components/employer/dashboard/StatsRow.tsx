import { CalendarDays, ClipboardList, Briefcase, Sparkles, Dock } from "lucide-react";

interface StatCard {
	label: string;
	value: string;
	icon: React.ReactNode;
	bg: string;
}

const statCards: StatCard[] = [
	{
		label: "Active Job Posts",
		value: "32",
		icon: <ClipboardList size={22} className="text-indigo-500" />,
		bg: "bg-indigo-200",
	},
	{
		label: "Interview Schedule",
		value: "08",
		icon: <CalendarDays size={22} className="text-indigo-500" />,
		bg: "bg-indigo-300",
	},
	{
		label: "Applications",
		value: "20",
		icon: <Dock size={22} className="text-indigo-200" />,
		bg: "bg-indigo-500",
	},
	{
		label: "AI Matched Candidates",
		value: "04",
		icon: <Sparkles size={22} className="text-indigo-200" />,
		bg: "bg-indigo-700",
	},
];

export default function StatsRow() {
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
