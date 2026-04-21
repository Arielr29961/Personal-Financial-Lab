import { formatILS, formatChangeILS, changeColor } from '@/lib/formatters';
import { Card, CardTitle } from '@/components/ui/Card';
import type { MonthSummary } from '@/types/financial';
import Link from 'next/link';

interface IncomeCardProps {
  summary: MonthSummary;
}

export function IncomeCard({ summary }: IncomeCardProps) {
  const { totalHouseholdMonthlyIncome, householdNetCashFlow, arielExpenses, inbarExpenses } = summary;
  const totalExpenses = arielExpenses + inbarExpenses;
  const hasData = totalHouseholdMonthlyIncome > 0;

  if (!hasData) {
    return (
      <Card>
        <CardTitle>הכנסה חודשית</CardTitle>
        <div className="text-slate-500 text-sm mt-2">
          לא הוגדר.{' '}
          <Link href="/update" className="text-indigo-400 underline">
            עדכן שכר חודשי
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>תזרים חודשי</CardTitle>
      <div className="mt-2 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">הכנסות</span>
          <span className="text-emerald-400 tabular font-medium">{formatILS(totalHouseholdMonthlyIncome)}</span>
        </div>
        {totalExpenses > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">הוצאות</span>
            <span className="text-red-400 tabular font-medium">{formatILS(totalExpenses)}</span>
          </div>
        )}
        {totalExpenses > 0 && (
          <div className="flex justify-between text-sm border-t border-slate-700 pt-2 mt-1">
            <span className="text-slate-400">מאזן</span>
            <span className={`tabular font-semibold ${changeColor(householdNetCashFlow)}`}>
              {formatChangeILS(householdNetCashFlow)}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
