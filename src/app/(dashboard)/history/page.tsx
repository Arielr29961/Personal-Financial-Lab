'use client';

import { useEffect, useState } from 'react';
import { NetWorthChart } from '@/components/charts/NetWorthChart';
import { Card, CardTitle } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { formatILS, formatHebrewMonth, formatChangeILS, changeColor } from '@/lib/formatters';
import type { HistoryEntry } from '@/types/financial';

export default function HistoryPage() {
  const [data, setData] = useState<{ months: HistoryEntry[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/history')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  const months = data?.months ?? [];

  if (months.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
        <div className="text-4xl">📅</div>
        <p className="text-slate-400">אין היסטוריה עדיין. עדכן נתונים ראשונים.</p>
      </div>
    );
  }

  // Reverse for table (newest first)
  const tableMonths = [...months].reverse();

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Net worth trend chart */}
      <Card>
        <CardTitle>מגמת שווי נקי</CardTitle>
        <div className="mt-2">
          <NetWorthChart data={months} />
        </div>
      </Card>

      {/* Month-by-month table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-slate-700">
          <h3 className="font-semibold text-slate-200">נתונים חודשיים</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs border-b border-slate-700">
                <th className="text-start px-5 py-3 font-medium">חודש</th>
                <th className="text-start px-4 py-3 font-medium">שווי נקי</th>
                <th className="text-start px-4 py-3 font-medium">שינוי</th>
                <th className="text-start px-4 py-3 font-medium hidden md:table-cell">פנסיה</th>
                <th className="text-start px-4 py-3 font-medium hidden md:table-cell">השתלמות</th>
                <th className="text-start px-4 py-3 font-medium hidden lg:table-cell">השקעות</th>
                <th className="text-start px-4 py-3 font-medium hidden lg:table-cell">בנק</th>
              </tr>
            </thead>
            <tbody>
              {tableMonths.map((entry) => {
                const { yearMonth, summary } = entry;
                const { ariel, inbar, joint } = summary;
                return (
                  <tr
                    key={yearMonth}
                    className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-slate-300">
                      {formatHebrewMonth(yearMonth)}
                    </td>
                    <td className="px-4 py-3 tabular text-slate-50">
                      {formatILS(summary.netWorth)}
                    </td>
                    <td className="px-4 py-3 tabular">
                      {summary.monthlyNetWorthChange !== null ? (
                        <span className={changeColor(summary.monthlyNetWorthChange)}>
                          {formatChangeILS(summary.monthlyNetWorthChange)}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular text-slate-400 hidden md:table-cell">
                      {formatILS(ariel.pensionTotal + inbar.pensionTotal + joint.pensionTotal)}
                    </td>
                    <td className="px-4 py-3 tabular text-slate-400 hidden md:table-cell">
                      {formatILS(ariel.hishtalmutTotal + inbar.hishtalmutTotal + joint.hishtalmutTotal)}
                    </td>
                    <td className="px-4 py-3 tabular text-slate-400 hidden lg:table-cell">
                      {formatILS(ariel.investmentsTotal + inbar.investmentsTotal + joint.investmentsTotal)}
                    </td>
                    <td className="px-4 py-3 tabular text-slate-400 hidden lg:table-cell">
                      {formatILS(ariel.bankTotal + inbar.bankTotal + joint.bankTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
