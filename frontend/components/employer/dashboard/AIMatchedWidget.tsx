import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Candidate {
	name: string;
	role: string;
	score: number;
}

const candidates: Candidate[] = [
	{ name: "John Deb", role: "Software Engineer", score: 78 },
	{ name: "Jane Smith", role: "Product Manager", score: 85 },
	{ name: "Alice Lee", role: "Software Engineer", score: 92 },
	{ name: "Bob Brown", role: "Designer", score: 80 },
];

function Avatar() {
	return (
		<div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center shrink-0">
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src="https://api.dicebear.com/7.x/personas/svg?seed=JohnDeb"
				alt="avatar"
				className="w-full h-full object-cover"
			/>
		</div>
	);
}

export default function AIMatchedWidget() {
       // Extract unique roles
	       const roles = ["Show All", ...Array.from(new Set(candidates.map((c) => c.role)))];
	       const [selectedRole, setSelectedRole] = useState("Show All");
		       // Filter and sort candidates based on selected role
		       const filteredCandidates =
			       selectedRole === "Show All"
				       ? [...candidates].sort((a, b) => b.score - a.score)
				       : candidates
					       .filter(c => c.role === selectedRole)
					       .sort((a, b) => b.score - a.score);

	       // Custom dropdown for roles (like FilterBar)
	       const [dropdownOpen, setDropdownOpen] = useState(false);
	       const dropdownRef = useRef<HTMLDivElement>(null);
	       useEffect(() => {
		       const handler = (e: MouseEvent) => {
			       if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
		       };
		       document.addEventListener("mousedown", handler);
		       return () => document.removeEventListener("mousedown", handler);
	       }, []);

	       return (
		       <div className="bg-white rounded-2xl p-5 shadow-sm">
			       <div className="flex items-center justify-between mb-4">
				       <h2 className="font-semibold text-gray-800">Top AI-Matched Candidates</h2>
				       <div ref={dropdownRef} className="relative">
					       <button
						       type="button"
						       onClick={() => setDropdownOpen((o) => !o)}
						       className="flex items-center gap-1.5 text-sm text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors pr-6 focus:outline-none focus:ring-2 focus:ring-indigo-200 min-w-[120px]"
						       style={{ background: 'white' }}
					       >
						       {selectedRole}
						       <ChevronDown size={14} className={`ml-1 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
					       </button>
					       {dropdownOpen && (
						       <div className="absolute left-0 z-50 mt-1.5 min-w-[120px] bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
							       {roles.map((role) => (
								       <button
									       key={role}
									       type="button"
									       onClick={() => { setSelectedRole(role); setDropdownOpen(false); }}
									       className={`w-full text-left px-4 py-2.5 text-sm transition-colors
									       ${selectedRole === role
										       ? "text-indigo-700 font-semibold bg-indigo-50"
										       : "text-gray-700 hover:text-gray-900 hover:bg-white focus:text-gray-900"}
									       `}
									       style={{ background: 'white' }}
								       >
									       {role}
								       </button>
							       ))}
						       </div>
					       )}
				       </div>
			       </div>
			       <div className="space-y-4">
				       {filteredCandidates.length > 0 ? (
					       filteredCandidates.map((candidate, index) => (
						       <div key={index} className="flex items-center gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
							       <Avatar />
							       <div className="flex-1">
								       <p className="text-sm font-semibold text-gray-800">{candidate.name}</p>
								       <p className="text-xs text-gray-400">{candidate.role}</p>
							       </div>
							       <div className="text-right min-w-[120px]">
								       <p className="text-xs text-gray-500 mb-1">AI match score</p>
								       <div className="flex items-center gap-2">
									       <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
										       <div
											       className="h-full bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full"
											       style={{ width: `${candidate.score}%` }}
										       />
									       </div>
									       <span className="text-sm font-bold text-gray-700">{candidate.score}%</span>
								       </div>
							       </div>
						       </div>
					       ))
				       ) : (
					       <div className="text-gray-400 text-sm">No candidates found for this role.</div>
				       )}
			       </div>
		       </div>
	       );
}
