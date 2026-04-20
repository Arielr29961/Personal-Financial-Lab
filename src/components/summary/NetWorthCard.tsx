import { formatILS, formatChangeILS, changeColor } from '@/lib/formatters';
import { Card, CardTitle } from '@/components/ui/Card';
import type { MonthSummary } from '@/types/financial';
import { formatHebrewMonth } from '@/lib/formatters';

interface NetWorthCardProps {
  summary: MonthSummary;
}

export function NetWorthCard({ summary }: NetWorthCardProps) {
  const { netWorth, liquidNetWorth, monthlyNetWorthChange, yearMonth } = summary;

  return (
    <Card className="col-span-full">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <CardTitle>שווי נקי כולל</CardTitle>
          <div className="text-4xl font-bold text-slate-50 tabular mt-1">
            {formatILS(netWorth)}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            {formatHebrewMonth(yearMonth)}
          </div>
        </div>

        <div className="flex gap-6 sm:gap-8">
          {monthlyNetWorthChange !== null && (
            <div className="text-start sm:text-end">
              <div className="text-xs text-slate-500 mb-0.5">שינוי חודשי</div>
              <div className={`text-lg font-semibold tabular ${changeColor(monthlyNetWorthChange)}`}>
                {formatChangeILS(monthlyNetWorthChange)}
              </div>
            </div>
          )}
          <div className="text-start sm:text-end">
            <div className="text-xs text-slate-500 mb-0.5">נזיל</div>
            <div className="text-lg font-semibold text-slate-300 tabular">
              {formatILS(liquidNetWorth)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
