'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatILS } from '@/lib/formatters';
import type { MonthSummary } from '@/types/financial';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6'];

interface AllocationPieProps {
  summary: MonthSummary;
}

interface TooltipProps { active?: boolean; payload?: { name: string; value: number }[]; }
function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl text-sm">
      <div className="text-slate-400 mb-0.5">{item.name}</div>
      <div className="text-slate-50 font-semibold tabular">{formatILS(item.value)}</div>
    </div>
  );
}

export function AllocationPie({ summary }: AllocationPieProps) {
  const { ariel, inbar, joint } = summary;

  const data = [
    {
      name: 'קרן פנסיה',
      value: ariel.pensionTotal + inbar.pensionTotal + joint.pensionTotal,
    },
    {
      name: 'קרן השתלמות',
      value: ariel.hishtalmutTotal + inbar.hishtalmutTotal + joint.hishtalmutTotal,
    },
    {
      name: 'תיק השקעות',
      value: ariel.investmentsTotal + inbar.investmentsTotal + joint.investmentsTotal,
    },
    {
      name: 'בנקים',
      value: ariel.bankTotal + inbar.bankTotal + joint.bankTotal,
    },
  ].filter((d) => d.value > 0);

  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-slate-400 text-sm">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
