'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, ReferenceLine,
} from 'recharts';
import { Card, CardTitle } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { formatILS, formatHebrewMonth, changeColor, formatChangeILS } from '@/lib/formatters';
import type { CashFlowEntry } from '@/types/financial';

interface TooltipProps { active?: boolean; payload?: { value: number; name?: string }[]; label?: string; }

function LineTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl text-sm">
      {label && <div className="text-slate-400 mb-1">{formatHebrewMonth(label)}</div>}
      <div className={`font-semibold tabular ${changeColor(payload[0].value)}`}>
        {formatChangeILS(payload[0].value)}
      </div>
    </div>
  );
}

function BarTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl text-sm space-y-1">
      <div className="text-slate-400 mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="text-slate-200 tabular">
          {p.name}: {formatILS(p.value ?? 0)}
        </div>
      ))}
    </div>
  );
}

export default function ShotefPage() {
  const [data, setData] = useState<CashFlowEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cashflow')
      .then((r) => r.json())
      .then((d) => setData(d.months ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
        <div className="text-4xl">💸</div>
        <p className="text-slate-400 text-sm max-w-xs">
          אין נתוני שכר והוצאות עדיין. עדכן את הנתונים בטאבים &quot;שכר חודשי&quot; ו&quot;הוצאות חודשיות&quot; בעמוד העדכון החודשי.
        </p>
      </div>
    );
  }

  const latest = data[data.length - 1];
  const lastCumulative = data[data.length - 1]?.cumulative ?? 0;

  // Reverse for table (newest first)
  const tableRows = [...data].reverse();

  // Category breakdown for latest month
  const categoryData = latest.expensesByCategory.filter((c) => c.total > 0);

  return (
    <div className="space-y-6 pb-20 md:pb-0">

      {/* ── This month summary ── */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardTitle>הכנסות החודש</CardTitle>
          <div className="text-2xl font-bold text-emerald-400 tabular mt-1">
            {formatILS(latest.income)}
          </div>
          <div className="text-xs text-slate-500 mt-1">{formatHebrewMonth(latest.yearMonth)}</div>
        </Card>
        <Card>
          <CardTitle>הוצאות החודש</CardTitle>
          <div className="text-2xl font-bold text-red-400 tabular mt-1">
            {formatILS(latest.expenses)}
          </div>
          <div className="text-xs text-slate-500 mt-1">{formatHebrewMonth(latest.yearMonth)}</div>
        </Card>
        <Card>
          <CardTitle>מאזן חודשי</CardTitle>
          <div className={`text-2xl font-bold tabular mt-1 ${changeColor(latest.net)}`}>
            {formatChangeILS(latest.net)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            מצטבר: <span className={changeColor(lastCumulative)}>{formatChangeILS(lastCumulative)}</span>
          </div>
        </Card>
      </div>

      {/* ── Running balance chart ── */}
      {data.length >= 2 && (
        <Card>
          <CardTitle>מאזן מצטבר לאורך זמן</CardTitle>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="yearMonth"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(v) => {
                  const [year, month] = v.split('-');
                  return `${month}/${year.slice(2)}`;
                }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(v) => `₪${(v / 1000).toFixed(0)}K`}
                axisLine={false} tickLine={false} width={55}
              />
              <Tooltip content={<LineTooltip />} />
              <ReferenceLine y={0} stroke="#475569" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke={lastCumulative >= 0 ? '#10b981' : '#ef4444'}
                strokeWidth={2.5}
                dot={{ fill: lastCumulative >= 0 ? '#10b981' : '#ef4444', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* ── Monthly table ── */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-slate-700">
          <h3 className="font-semibold text-slate-200">נתונים חודשיים</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs border-b border-slate-700">
                <th className="text-start px-5 py-3 font-medium">חודש</th>
                <th className="text-start px-4 py-3 font-medium">הכנסות</th>
                <th className="text-start px-4 py-3 font-medium">הוצאות</th>
                <th className="text-start px-4 py-3 font-medium">מאזן חודשי</th>
                <th className="text-start px-4 py-3 font-medium">מאזן מצטבר</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.yearMonth} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-300">{formatHebrewMonth(row.yearMonth)}</td>
                  <td className="px-4 py-3 tabular text-emerald-400">{formatILS(row.income)}</td>
                  <td className="px-4 py-3 tabular text-red-400">{formatILS(row.expenses)}</td>
                  <td className={`px-4 py-3 tabular font-medium ${changeColor(row.net)}`}>
                    {formatChangeILS(row.net)}
                  </td>
                  <td className={`px-4 py-3 tabular ${changeColor(row.cumulative)}`}>
                    {formatChangeILS(row.cumulative)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Expense breakdown by category (latest month) ── */}
      {categoryData.length > 0 && (
        <Card>
          <CardTitle>פירוט הוצאות לפי קטגוריה — {formatHebrewMonth(latest.yearMonth)}</CardTitle>
          <ResponsiveContainer width="100%" height={Math.max(200, categoryData.length * 45)}>
            <BarChart
              data={categoryData}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(v) => `₪${(v / 1000).toFixed(0)}K`}
                axisLine={false} tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={false} tickLine={false}
                width={120}
              />
              <Tooltip content={<BarTooltip />} />
              <Legend
                formatter={(value) => (
                  <span className="text-slate-400 text-sm">{value}</span>
                )}
              />
              <Bar dataKey="ariel" name="אריאל" fill="#6366f1" radius={[0, 4, 4, 0]} />
              <Bar dataKey="inbar"  name="ענבר"  fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Fallback if no category breakdown available */}
      {categoryData.length === 0 && latest.expenses > 0 && (
        <Card>
          <CardTitle>פירוט הוצאות לפי קטגוריה</CardTitle>
          <p className="text-slate-500 text-sm mt-2">
            כדי לראות פירוט לפי קטגוריה, בחר &quot;פירוט לפי קטגוריה&quot; בטאב הוצאות חודשיות.
          </p>
        </Card>
      )}
    </div>
  );
}
