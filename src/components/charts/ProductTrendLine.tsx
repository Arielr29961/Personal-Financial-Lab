'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatILS, formatHebrewMonth } from '@/lib/formatters';

interface DataPoint {
  month: string;
  value: number | null;
}

interface ProductTrendLineProps {
  data: DataPoint[];
  color?: string;
  selectedMonth?: string;
}

interface TooltipProps { active?: boolean; payload?: { value: number }[]; label?: string; }
function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl text-sm">
      {label && <div className="text-slate-400 mb-1">{formatHebrewMonth(label)}</div>}
      <div className="text-slate-50 font-semibold tabular">
        {formatILS(payload[0].value ?? 0)}
      </div>
    </div>
  );
}

export function ProductTrendLine({ data, color = '#6366f1', selectedMonth }: ProductTrendLineProps) {
  if (data.length < 2) return null;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="month"
          tick={{ fill: '#64748b', fontSize: 11 }}
          tickFormatter={(v) => {
            const [year, month] = v.split('-');
            return `${month}/${year.slice(2)}`;
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 11 }}
          tickFormatter={(v) => `₪${(v / 1000).toFixed(0)}K`}
          axisLine={false}
          tickLine={false}
          width={55}
        />
        <Tooltip content={<CustomTooltip />} />
        {selectedMonth && (
          <ReferenceLine
            x={selectedMonth}
            stroke="#6366f1"
            strokeDasharray="4 4"
            strokeOpacity={0.7}
          />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, r: 3 }}
          activeDot={{ r: 5 }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
