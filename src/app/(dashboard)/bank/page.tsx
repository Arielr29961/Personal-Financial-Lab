'use client';

import { useEffect, useState } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProductTrendLine } from '@/components/charts/ProductTrendLine';
import { PageSpinner } from '@/components/ui/Spinner';
import { formatILS, formatHebrewMonth, formatPercent, daysUntil } from '@/lib/formatters';
import { OWNER_LABELS, BANK_ACCOUNT_TYPE_LABELS } from '@/lib/constants';
import type { SnapshotWithSummary, HistoryEntry, BankAccount, OwnerSummary } from '@/types/financial';

function emptyOwner(): OwnerSummary {
  return { owner: 'ariel', pensionTotal: 0, hishtalmutTotal: 0, hishtalmutLiquidTotal: 0, investmentsTotal: 0, bankTotal: 0, grandTotal: 0 };
}

export default function BankPage() {
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

  const accounts = latest?.snapshot?.bankAccounts ?? [];
  const ariel: OwnerSummary = latest?.summary?.ariel ?? emptyOwner();
  const inbar: OwnerSummary = latest?.summary?.inbar ?? emptyOwner();
  const joint: OwnerSummary = latest?.summary?.joint ?? emptyOwner();
  const total = ariel.bankTotal + inbar.bankTotal + joint.bankTotal;

  const trendData = history.map((e) => ({
    month: e.yearMonth,
    value: e.summary.ariel.bankTotal + e.summary.inbar.bankTotal + e.summary.joint.bankTotal,
  }));

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <Card>
        <CardTitle>{'סה"כ בנקים ופיקדונות'}</CardTitle>
        <div className="text-3xl font-bold text-slate-50 tabular mt-1">{formatILS(total)}</div>
        {latest?.snapshot && (
          <div className="text-sm text-slate-500 mt-1">{formatHebrewMonth(latest.snapshot.yearMonth)}</div>
        )}
      </Card>

      {trendData.length >= 2 && (
        <Card>
          <CardTitle>מגמה לאורך זמן</CardTitle>
          <ProductTrendLine data={trendData} color="#3b82f6" />
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.length === 0 ? (
          <p className="text-slate-500">אין חשבונות מוגדרים.</p>
        ) : (
          accounts.map((acc) => <BankAccountCard key={acc.id} acc={acc} />)
        )}
      </div>
    </div>
  );
}

function BankAccountCard({ acc }: { acc: BankAccount }) {
  const typeLabel = BANK_ACCOUNT_TYPE_LABELS[acc.accountType];
  const days = acc.maturityDate ? daysUntil(acc.maturityDate) : null;

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-1">
          <div className="font-semibold text-slate-100">{acc.bankName}</div>
          <div className="flex gap-1.5">
            <Badge variant={acc.owner === 'ariel' ? 'blue' : acc.owner === 'inbar' ? 'green' : 'gray'}>
              {OWNER_LABELS[acc.owner]}
            </Badge>
            <Badge variant="gray">{typeLabel}</Badge>
          </div>
        </div>
        <div className="text-end">
          <div className="text-xs text-slate-500">יתרה</div>
          <div className="text-xl font-bold text-slate-50 tabular">{formatILS(acc.currentBalance)}</div>
        </div>
      </div>

      {(acc.interestRate !== undefined || acc.maturityDate) && (
        <div className="border-t border-slate-700 pt-3 mt-3 grid grid-cols-2 gap-3 text-sm">
          {acc.interestRate !== undefined && (
            <div>
              <div className="text-slate-500 text-xs">ריבית שנתית</div>
              <div className="text-slate-200">{formatPercent(acc.interestRate * 100)}</div>
            </div>
          )}
          {acc.maturityDate && days !== null && (
            <div>
              <div className="text-slate-500 text-xs">מועד פירעון</div>
              <div className={`text-sm font-medium ${days < 30 ? 'text-yellow-400' : 'text-slate-200'}`}>
                {days > 0 ? `בעוד ${days} ימים` : days === 0 ? 'היום' : `לפני ${Math.abs(days)} ימים`}
              </div>
            </div>
          )}
        </div>
      )}
      {acc.notes && (
        <div className="mt-3 text-xs text-slate-500 bg-slate-900/50 rounded-lg p-2">{acc.notes}</div>
      )}
    </Card>
  );
}
