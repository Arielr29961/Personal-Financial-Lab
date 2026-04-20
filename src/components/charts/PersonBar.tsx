'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatILS } from '@/lib/formatters';
import type { MonthSummary } from '@/types/financial';

interface PersonBarProps {
  summary: MonthSummary;
}

interface BarPayloadItem { name: string; value: number; fill: string; }
interface TooltipProps { active?: boolean; payload?: BarPayloadItem[]; label?: string; }
function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl text-sm space-y-1">
      <div className="text-slate-400 mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-slate-50 tabular">{formatILS(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function PersonBar({ summary }: PersonBarProps) {
  const { ariel, inbar } = summary;

  const data = [
    {
      category: 'פנסיה',
      אריאל: ariel.pensionTotal,
      ענבר: inbar.pensionTotal,
    },
    {
      category: 'השתלמות',
      אריאל: ariel.hishtalmutTotal,
      ענבר: inbar.hishtalmutTotal,
    },
    {
      category: 'השקעות',
      אריאל: ariel.investmentsTotal,
      ענבר: inbar.investmentsTotal,
    },
    {
      category: 'בנק',
      אריאל: ariel.bankTotal,
      ענבר: inbar.bankTotal,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="category"
          tick={{ fill: '#64748b', fontSize: 12 }}
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
        <Legend
          formatter={(value) => (
            <span className="text-slate-400 text-sm">{value}</span>
          )}
        />
        <Bar dataKey="אריאל" fill="#6366f1" radius={[4, 4, 0, 0]} />
        <Bar dataKey="ענבר" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
