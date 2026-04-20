import { formatILS } from '@/lib/formatters';
import { Card, CardTitle } from '@/components/ui/Card';
import type { MonthSummary } from '@/types/financial';
import Link from 'next/link';

interface IncomeCardProps {
  summary: MonthSummary;
}

export function IncomeCard({ summary }: IncomeCardProps) {
  const { totalHouseholdMonthlyIncome } = summary;

  if (totalHouseholdMonthlyIncome === null) {
    return (
      <Card>
        <CardTitle>הכנסה חודשית</CardTitle>
        <div className="text-slate-500 text-sm mt-2">
          לא הוגדר.{' '}
          <Link href="/settings" className="text-indigo-400 underline">
            הגדר משכורות
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>הכנסה חודשית (נטו)</CardTitle>
      <div className="text-2xl font-bold text-slate-50 tabular mt-1">
        {formatILS(totalHouseholdMonthlyIncome)}
      </div>
      <div className="text-xs text-slate-500 mt-1">אריאל + ענבר ביחד</div>
    </Card>
  );
}
