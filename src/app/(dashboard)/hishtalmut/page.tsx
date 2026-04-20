'use client';

import { useEffect, useState } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProductTrendLine } from '@/components/charts/ProductTrendLine';
import { PageSpinner } from '@/components/ui/Spinner';
import { formatILS, formatHebrewMonth } from '@/lib/formatters';
import { OWNER_LABELS } from '@/lib/constants';
import type { SnapshotWithSummary, HistoryEntry, HishtalmutProduct, OwnerSummary } from '@/types/financial';

function emptyOwner(): OwnerSummary {
  return { owner: 'ariel', pensionTotal: 0, hishtalmutTotal: 0, hishtalmutLiquidTotal: 0, investmentsTotal: 0, bankTotal: 0, grandTotal: 0 };
}

export default function HishtalmutPage() {
  const [latest, setLatest] = useState<SnapshotWithSummary | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/snapshot').then((r) => r.json()),
      fetch('/api/history').then((r) => r.json()),
    ]).then(([snap, hist]) => {
      setLatest(snap);
      setHistory(hist.months ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) return <PageSpinner />;

  const hishtalmuts = latest?.snapshot?.hishtalmuts ?? [];
  const ariel: OwnerSummary = latest?.summary?.ariel ?? emptyOwner();
  const inbar: OwnerSummary = latest?.summary?.inbar ?? emptyOwner();
  const joint: OwnerSummary = latest?.summary?.joint ?? emptyOwner();
  const total = ariel.hishtalmutTotal + inbar.hishtalmutTotal + joint.hishtalmutTotal;
  const liquidTotal = ariel.hishtalmutLiquidTotal + inbar.hishtalmutLiquidTotal + joint.hishtalmutLiquidTotal;

  const trendData = history.map((e) => ({
    month: e.yearMonth,
    value: e.summary.ariel.hishtalmutTotal + e.summary.inbar.hishtalmutTotal + e.summary.joint.hishtalmutTotal,
  }));

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardTitle>{'סה"כ קרן השתלמות'}</CardTitle>
          <div className="text-3xl font-bold text-slate-50 tabular mt-1">{formatILS(total)}</div>
          {latest?.snapshot && (
            <div className="text-sm text-slate-500 mt-1">{formatHebrewMonth(latest.snapshot.yearMonth)}</div>
          )}
        </Card>
        <Card>
          <CardTitle>סכום נזיל</CardTitle>
          <div className="text-3xl font-bold text-emerald-400 tabular mt-1">{formatILS(liquidTotal)}</div>
          <div className="text-xs text-slate-500 mt-1">ניתן למשיכה</div>
        </Card>
      </div>

      {trendData.length >= 2 && (
        <Card>
          <CardTitle>מגמה לאורך זמן</CardTitle>
          <ProductTrendLine data={trendData} color="#10b981" />
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hishtalmuts.length === 0 ? (
          <p className="text-slate-500">אין קרנות השתלמות מוגדרות.</p>
        ) : (
          hishtalmuts.map((h) => <HishtalmutCard key={h.id} h={h} />)
        )}
      </div>
    </div>
  );
}

function HishtalmutCard({ h }: { h: HishtalmutProduct }) {
  const totalMonthly = h.monthlyEmployeeContribution + h.monthlyEmployerContribution;
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-1">
          <div className="font-semibold text-slate-100">{h.providerName}</div>
          <div className="flex gap-1.5">
            <Badge variant={h.owner === 'ariel' ? 'blue' : 'green'}>{OWNER_LABELS[h.owner]}</Badge>
            <Badge variant={h.isLiquid ? 'green' : 'yellow'}>
              {h.isLiquid ? 'נזיל' : 'לא נזיל'}
            </Badge>
          </div>
        </div>
        <div className="text-end">
          <div className="text-xs text-slate-500">שווי נוכחי</div>
          <div className="text-xl font-bold text-slate-50 tabular">{formatILS(h.currentValue)}</div>
        </div>
      </div>
      <div className="border-t border-slate-700 pt-3 mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-slate-500 text-xs">הפרשה עובד/חודש</div>
          <div className="text-slate-200 tabular">{formatILS(h.monthlyEmployeeContribution)}</div>
        </div>
        <div>
          <div className="text-slate-500 text-xs">הפרשת מעסיק/חודש</div>
          <div className="text-slate-200 tabular">{formatILS(h.monthlyEmployerContribution)}</div>
        </div>
        <div>
          <div className="text-slate-500 text-xs">{'סה"כ חודשי'}</div>
          <div className="text-slate-200 tabular">{formatILS(totalMonthly)}</div>
        </div>
      </div>
      {h.notes && (
        <div className="mt-3 text-xs text-slate-500 bg-slate-900/50 rounded-lg p-2">{h.notes}</div>
      )}
    </Card>
  );
}
