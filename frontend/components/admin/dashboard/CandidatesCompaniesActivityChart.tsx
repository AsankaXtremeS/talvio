'use client';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { CandidatesCompaniesActivityDataPoint } from '@/types/admin/dashboard.types';

interface CandidatesCompaniesActivityChartProps {
  data: CandidatesCompaniesActivityDataPoint[];
}

function CandidatesCompaniesActivityChart({ data }: CandidatesCompaniesActivityChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} width={40} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
        />
        <Bar dataKey="candidates" name="Candidates" fill="#93c5fd" radius={[3, 3, 0, 0]} />
        <Bar dataKey="companies" name="Companies" fill="#38bdf8" radius={[3, 3, 0, 0]} />
        <Line type="monotone" dataKey="companies" stroke="#6366f1" strokeWidth={2} dot={false} legendType="none" tooltipType="none" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export { CandidatesCompaniesActivityChart };
export default CandidatesCompaniesActivityChart;
