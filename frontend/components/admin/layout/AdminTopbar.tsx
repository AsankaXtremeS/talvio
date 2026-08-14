"use client";

import { Search, ChevronDown } from 'lucide-react';

interface AdminTopbarProps {
	searchPlaceholder?: string;
	searchValue?: string;
	onSearchChange?: (value: string) => void;
	filters?: React.ReactNode;
	rightControl?: React.ReactNode;
	showSearch?: boolean;
}

export default function AdminTopbar({
	searchPlaceholder = 'Search',
	searchValue,
	onSearchChange,
	filters,
	rightControl,
	showSearch = true,
}: AdminTopbarProps) {
	return (
		<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5">
			<div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
				{showSearch && (
					<div className="relative w-full max-w-none sm:max-w-md">
						<Search
							size={16}
							className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
						/>
						<input
							type="text"
							placeholder={searchPlaceholder}
							value={searchValue}
							onChange={(event) => onSearchChange?.(event.target.value)}
							className="w-full rounded-xl border border-gray-200 bg-white py-2 sm:py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-300"
						/>
					</div>
				)}
				{filters}
			</div>

			{rightControl ? (
				<div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 shrink-0">
					{rightControl}
				</div>
			) : (
				<div className="relative shrink-0">
					<select
						defaultValue="this-week"
						className="appearance-none rounded-lg border border-gray-300 bg-white py-2 sm:py-2.5 pl-4 pr-9 text-sm font-medium text-gray-600 shadow-sm outline-none transition-colors hover:border-indigo-400 hover:text-indigo-600 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
					>
						<option value="this-week">This Week</option>
						<option value="this-month">This Month</option>
						<option value="this-year">This Year</option>
					</select>
					<ChevronDown
						size={16}
						className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
					/>
				</div>
			)}
		</div>
	);
}
