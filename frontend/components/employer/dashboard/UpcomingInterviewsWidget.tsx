import { CalendarDays, MapPin, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Interview {
	name: string;
	role: string;
	time: string;
	icon: React.ReactNode;
}

const interviews: Interview[] = [
	{
		name: "John Deb",
		role: "Software Engineer",
		time: "Today - 2:00 PM",
		icon: <MapPin size={16} className="text-gray-400" />,
	},
	{
		name: "John Deb",
		role: "Software Engineer",
		time: "Today - 2:00 PM",
		icon: <User size={16} className="text-gray-400" />,
	},
];

function Avatar() {
       return (
	       <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center shrink-0">
		       <img
			       src="https://api.dicebear.com/7.x/personas/svg?seed=JohnDeb"
			       alt="avatar"
			       className="w-full h-full object-cover"
		       />
	       </div>
       );
}

export default function UpcomingInterviewsWidget() {
       // Calendar popup state and logic
       const [showCalendar, setShowCalendar] = useState(false);
       const calendarRef = useRef<HTMLDivElement>(null);
       useEffect(() => {
	       const handler = (e: MouseEvent) => {
		       if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) setShowCalendar(false);
	       };
	       if (showCalendar) document.addEventListener("mousedown", handler);
	       return () => document.removeEventListener("mousedown", handler);
       }, [showCalendar]);

       // Calendar logic
       const today = new Date();
       const year = today.getFullYear();
       const month = today.getMonth();
       const date = today.getDate();
       const firstDay = new Date(year, month, 1).getDay();
       const daysInMonth = new Date(year, month + 1, 0).getDate();
       const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
       const calendarRows = [];
       let day = 1 - firstDay;
       for (let i = 0; i < 6; i++) {
	       const row = [];
	       for (let j = 0; j < 7; j++, day++) {
		       if (day < 1 || day > daysInMonth) {
			       row.push(null);
		       } else {
			       row.push(day);
		       }
	       }
	       calendarRows.push(row);
       }

       return (
	       <div className="bg-white rounded-2xl p-5 shadow-sm">
		       <div className="flex items-center justify-between mb-4">
			       <h2 className="font-semibold text-gray-800">Upcoming Interviews</h2>
			       <div className="relative">
				       <div
					       className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
					       onClick={() => setShowCalendar((v) => !v)}
				       >
					       <CalendarDays size={16} className="text-gray-500" />
				       </div>
				       {showCalendar && (
					       <div ref={calendarRef} className="absolute right-0 z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-64 select-none">
						       <div className="flex items-center justify-between mb-2">
							       <span className="font-semibold text-gray-700">{today.toLocaleString('default', { month: 'long' })} {year}</span>
						       </div>
						       <div className="grid grid-cols-7 gap-1 mb-1">
							       {weekDays.map((d) => (
								       <div key={d} className="text-xs text-gray-400 text-center font-medium">{d}</div>
							       ))}
						       </div>
						       <div className="grid grid-cols-7 gap-1">
							       {calendarRows.flat().map((d, idx) => (
								       d ? (
									       <div
										       key={idx}
										       className={`text-sm text-center rounded-lg py-1.5 cursor-pointer transition-colors
											       ${d === date ? "bg-indigo-500 text-white font-bold" : "text-gray-700 hover:bg-indigo-50"}`}
									       >
										       {d}
									       </div>
								       ) : (
									       <div key={idx} />
								       )
							       ))}
						       </div>
					       </div>
				       )}
			       </div>
		       </div>
		       <div className="space-y-3">
			       {interviews.map((interview, index) => (
				       <div key={index} className="border border-gray-100 rounded-xl p-3.5">
					       <div className="flex items-start justify-between">
						       <div className="flex items-center gap-3">
							       <Avatar />
							       <div>
								       <p className="text-sm font-semibold text-gray-800">{interview.name}</p>
								       <p className="text-xs text-indigo-500 font-medium">{interview.role}</p>
							       </div>
						       </div>
						       <div className="text-gray-400">{interview.icon}</div>
					       </div>
					       <div className="flex items-center justify-between mt-3">
						       <span className="text-xs text-gray-500 flex items-center gap-1.5">
							       <CalendarDays size={12} />
							       {interview.time}
						       </span>
						       <button className="text-xs border border-gray-200 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors">
							       Reschedule
						       </button>
					       </div>
				       </div>
			       ))}
		       </div>
	       </div>
       );
}
