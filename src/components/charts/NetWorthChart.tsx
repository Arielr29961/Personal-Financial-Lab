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
import type { HistoryEntry } from '@/types/financial';

interface NetWorthChartProps {
  data: HistoryEntry[];
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

// Generate a full range of months between first and last data point,
// filling gaps with null so Recharts renders visible gaps
function buildChartData(entries: HistoryEntry[]) {
  if (entries.length === 0) return [];

  const dataMap = new Map(entries.map((e) => [e.yearMonth, e.summary.netWorth]));
  const sorted = [...entries].sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
  const first = sorted[0].yearMonth;
  const last = sorted[sorted.length - 1].yearMonth;

  const result: { month: string; netWorth: number | null }[] = [];
  let [y, m] = first.split('-').map(Number);
  const [endY, endM] = last.split('-').map(Number);

  while (y < endY || (y === endY && m <= endM)) {
    const ym = `${y}-${String(m).padStart(2, '0')}`;
    result.push({ month: ym, netWorth: dataMap.get(ym) ?? null });
    m++;
    if (m > 12) { m = 1; y++; }
  }

  return result;
}

export function NetWorthChart({ data, selectedMonth }: NetWorthChartProps) {
  const chartData = buildChartData(data);

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
          dataKey="netWorth"
          stroke="#6366f1"
          strokeWidth={2.5}
          dot={{ fill: '#6366f1', r: 4 }}
          activeDot={{ r: 6, fill: '#818cf8' }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
