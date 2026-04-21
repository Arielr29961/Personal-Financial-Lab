'use client';

import { useEffect, useState } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProductTrendLine } from '@/components/charts/ProductTrendLine';
import { PageSpinner } from '@/components/ui/Spinner';
import { formatILS, formatHebrewMonth } from '@/lib/formatters';
import { OWNER_LABELS } from '@/lib/constants';
import { useMonthFilter } from '@/contexts/MonthFilterContext';
import type { SnapshotWithSummary, HistoryEntry, PensionProduct, OwnerSummary } from '@/types/financial';

function emptyOwner(): OwnerSummary {
  return { owner: 'ariel', pensionTotal: 0, hishtalmutTotal: 0, hishtalmutLiquidTotal: 0, investmentsTotal: 0, bankTotal: 0, grandTotal: 0 };
}

export default function PensionPage() {
  const { yearMonth } = useMonthFilter();
  const [latest, setLatest] = useState<SnapshotWithSummary | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/snapshot/${yearMonth}`).then((r) => (r.ok ? r.json() : null)),
      fetch('/api/history').then((r) => r.json()),
    ]).then(([snap, hist]) => {
      setLatest(snap);
      setHistory(hist.months ?? []);
      setLoading(false);
    });
  }, [yearMonth]);

  if (loading) return <PageSpinner />;

  const pensions = latest?.snapshot?.pensions ?? [];
  const ariel: OwnerSummary = latest?.summary?.ariel ?? emptyOwner();
  const inbar: OwnerSummary = latest?.summary?.inbar ?? emptyOwner();
  const joint: OwnerSummary = latest?.summary?.joint ?? emptyOwner();
  const total = ariel.pensionTotal + inbar.pensionTotal + joint.pensionTotal;

  const trendData = history.map((e) => ({
    month: e.yearMonth,
    value: e.summary.ariel.pensionTotal + e.summary.inbar.pensionTotal + e.summary.joint.pensionTotal,
  }));

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <Card>
        <CardTitle>{'סה"כ קרן פנסיה'}</CardTitle>
        <div className="text-3xl font-bold text-slate-50 tabular mt-1">{formatILS(total)}</div>
        {latest?.snapshot && (
          <div className="text-sm text-slate-500 mt-1">
            {formatHebrewMonth(latest.snapshot.yearMonth)}
          </div>
        )}
        {!latest?.snapshot && (
          <div className="text-sm text-slate-500 mt-1">אין נתונים לחודש זה</div>
        )}
      </Card>

      {trendData.length >= 2 && (
        <Card>
          <CardTitle>מגמה לאורך זמן</CardTitle>
          <ProductTrendLine data={trendData} color="#6366f1" selectedMonth={yearMonth} />
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pensions.length === 0 ? (
          <p className="text-slate-500 col-span-full">אין קרנות פנסיה מוגדרות.</p>
        ) : (
          pensions.map((pension) => (
            <PensionProductCard key={pension.id} pension={pension} />
          ))
        )}
      </div>
    </div>
  );
}

function PensionProductCard({ pension }: { pension: PensionProduct }) {
  const ownerLabel = OWNER_LABELS[pension.owner];
  const totalMonthly = pension.monthlyEmployeeContribution + pension.monthlyEmployerContribution;

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-semibold text-slate-100">{pension.providerName}</div>
          <Badge variant={pension.owner === 'ariel' ? 'blue' : 'green'}>{ownerLabel}</Badge>
        </div>
        <div className="text-end">
          <div className="text-xs text-slate-500">שווי נוכחי</div>
          <div className="text-xl font-bold text-slate-50 tabular">{formatILS(pension.currentValue)}</div>
        </div>
      </div>
      <div className="border-t border-slate-700 pt-3 mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-slate-500 text-xs">הפרשה חודשית (עובד)</div>
          <div className="text-slate-200 tabular">{formatILS(pension.monthlyEmployeeContribution)}</div>
        </div>
        <div>
          <div className="text-slate-500 text-xs">הפרשה חודשית (מעסיק)</div>
          <div className="text-slate-200 tabular">{formatILS(pension.monthlyEmployerContribution)}</div>
        </div>
        <div>
          <div className="text-slate-500 text-xs">{'סה"כ חודשי'}</div>
          <div className="text-slate-200 tabular">{formatILS(totalMonthly)}</div>
        </div>
        <div>
          <div className="text-slate-500 text-xs">קצבה חזויה</div>
          <div className="text-slate-200 tabular">{formatILS(pension.expectedMonthlyPension)}</div>
        </div>
      </div>
      {pension.notes && (
        <div className="mt-3 text-xs text-slate-500 bg-slate-900/50 rounded-lg p-2">
          {pension.notes}
        </div>
      )}
    </Card>
  );
}
