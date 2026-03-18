"use client";

import { Plus, CalendarDays , LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import StatsRow from "@/components/employer/dashboard/StatsRow";
import AIMatchedWidget from "@/components/employer/dashboard/AIMatchedWidget";
import UpcomingInterviewsWidget from "@/components/employer/dashboard/UpcomingInterviewsWidget";
import JobsPreviewWidget from "@/components/employer/dashboard/JobsPreviewWidget";
import RecentActivityFeed from "@/components/employer/dashboard/RecentActivityFeed";

export default function DashboardPage() {
       return (
	       <div className="flex-1 bg-[#E9F3FD] min-h-screen p-7 overflow-auto">
		       <div className="sticky top-0 z-30 bg-[#E9F3FD] pt-0 -mt-7 pb-2">
			       <div className="bg-white rounded-2xl px-7 py-5 mb-3 flex items-center justify-between shadow-sm">
				       <div>
					       <h1 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
						       <span className="text-2xl">< LayoutDashboard /></span> Dashboard
					       </h1>
					       <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
						       <CalendarDays size={14} />
						       Wednesday, December 20, 2025
					       </p>
				       </div>
				       <button className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"

					   >
					       <Plus size={16} />
					       Post New Job
				       </button>
			       </div>
			       <div className="sticky top-[88px] z-20 bg-[#E9F3FD] pb-2">
				       <StatsRow />
			       </div>
		       </div>

				       <div className="grid grid-cols-2 gap-7 mt-6 px-2 pb-4">
					       <div className="h-full flex flex-col flex-1">
						       <AIMatchedWidget />
					       </div>
					       <div className="h-full flex flex-col flex-1">
						       <UpcomingInterviewsWidget />
					       </div>
					       <div className="h-full flex flex-col flex-1">
						       <JobsPreviewWidget />
					       </div>
					       <div className="h-full flex flex-col flex-1">
						       <RecentActivityFeed />
					       </div>
				       </div>
	       </div>
       );
}
