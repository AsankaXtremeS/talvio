'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { CompanyRatingDistribution } from '@/types/admin/dashboard.types';

interface CompanyRatingsChartProps {
  data: CompanyRatingDistribution[];
}

export default function CompanyRatingsChart({ data }: CompanyRatingsChartProps) {
  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={200} height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            dataKey="count"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
            formatter={(value) => [
  value ? Number(value).toLocaleString() : '0',
  'Users'
]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-1.5">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
