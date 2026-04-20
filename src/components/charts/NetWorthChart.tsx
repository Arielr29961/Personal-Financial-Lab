'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatILS, formatHebrewMonth } from '@/lib/formatters';
import type { HistoryEntry } from '@/types/financial';

interface NetWorthChartProps {
  data: HistoryEntry[];
}

interface TooltipProps { active?: boolean; payload?: { value: number }[]; label?: string; }
function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl text-sm">
      {label && <div className="text-slate-400 mb-1">{formatHebrewMonth(label)}</div>}
      <div className="text-slate-50 font-semibold tabular">
        {formatILS(payload[0].value)}
      </div>
    </div>
  );
}

export function NetWorthChart({ data }: NetWorthChartProps) {
  const chartData = data.map((entry) => ({
    month: entry.yearMonth,
    netWorth: entry.summary.netWorth,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="month"
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickFormatter={(v) => {
            const [year, month] = v.split('-');
            return `${month}/${year.slice(2)}`;
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickFormatter={(v) => `₪${(v / 1000).toFixed(0)}K`}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="netWorth"
          stroke="#6366f1"
          strokeWidth={2.5}
          dot={{ fill: '#6366f1', r: 4 }}
          activeDot={{ r: 6, fill: '#818cf8' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
