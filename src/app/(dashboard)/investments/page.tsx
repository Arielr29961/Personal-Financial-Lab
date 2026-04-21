'use client';

import { useEffect, useState } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProductTrendLine } from '@/components/charts/ProductTrendLine';
import { PageSpinner } from '@/components/ui/Spinner';
import { formatILS, formatHebrewMonth } from '@/lib/formatters';
import { OWNER_LABELS } from '@/lib/constants';
import type { SnapshotWithSummary, HistoryEntry, InvestmentPortfolio, OwnerSummary } from '@/types/financial';

function emptyOwner(): OwnerSummary {
  return { owner: 'ariel', pensionTotal: 0, hishtalmutTotal: 0, hishtalmutLiquidTotal: 0, investmentsTotal: 0, bankTotal: 0, grandTotal: 0 };
}

export default function InvestmentsPage() {
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

  const investments = latest?.snapshot?.investments ?? [];
  const ariel: OwnerSummary = latest?.summary?.ariel ?? emptyOwner();
  const inbar: OwnerSummary = latest?.summary?.inbar ?? emptyOwner();
  const joint: OwnerSummary = latest?.summary?.joint ?? emptyOwner();
  const total = ariel.investmentsTotal + inbar.investmentsTotal + joint.investmentsTotal;

  const trendData = history.map((e) => ({
    month: e.yearMonth,
    value: e.summary.ariel.investmentsTotal + e.summary.inbar.investmentsTotal + e.summary.joint.investmentsTotal,
  }));

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <Card>
        <CardTitle>{'סה"כ תיק השקעות'}</CardTitle>
        <div className="text-3xl font-bold text-slate-50 tabular mt-1">{formatILS(total)}</div>
        {latest?.snapshot && (
          <div className="text-sm text-slate-500 mt-1">{formatHebrewMonth(latest.snapshot.yearMonth)}</div>
        )}
      </Card>

      {trendData.length >= 2 && (
        <Card>
          <CardTitle>מגמה לאורך זמן</CardTitle>
          <ProductTrendLine data={trendData} color="#f59e0b" />
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {investments.length === 0 ? (
          <p className="text-slate-500">אין תיקי השקעות מוגדרים.</p>
        ) : (
          investments.map((inv) => <InvestmentCard key={inv.id} inv={inv} />)
        )}
      </div>
    </div>
  );
}

function InvestmentCard({ inv }: { inv: InvestmentPortfolio }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="font-semibold text-slate-100">{inv.brokerName}</div>
          <Badge variant={inv.owner === 'ariel' ? 'blue' : 'green'}>{OWNER_LABELS[inv.owner]}</Badge>
        </div>
        <div className="text-end">
          <div className="text-xs text-slate-500">שווי כולל</div>
          <div className="text-xl font-bold text-slate-50 tabular">{formatILS(inv.currentValue)}</div>
        </div>
      </div>
      {inv.notes && (
        <div className="mt-3 text-xs text-slate-500 bg-slate-900/50 rounded-lg p-2">{inv.notes}</div>
      )}
    </Card>
  );
}
