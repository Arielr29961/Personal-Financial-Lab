'use client';

import { useEffect, useState } from 'react';
import { NetWorthCard } from '@/components/summary/NetWorthCard';
import { ProductCard } from '@/components/summary/ProductCard';
import { IncomeCard } from '@/components/summary/IncomeCard';
import { AllocationPie } from '@/components/charts/AllocationPie';
import { PersonBar } from '@/components/charts/PersonBar';
import { Card, CardTitle } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { useMonthFilter } from '@/contexts/MonthFilterContext';
import type { SnapshotWithSummary } from '@/types/financial';
import Link from 'next/link';

export default function OverviewPage() {
  const { yearMonth } = useMonthFilter();
  const [data, setData] = useState<SnapshotWithSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/snapshot/${yearMonth}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [yearMonth]);

  if (loading) return <PageSpinner />;

  if (!data?.snapshot) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
        <div className="text-5xl">📊</div>
        <h2 className="text-xl font-semibold text-slate-200">אין נתונים לחודש זה</h2>
        <p className="text-slate-400 text-sm max-w-xs">
          עדכן את הנתונים הפיננסיים שלך כדי להתחיל לראות את לוח הבקרה.
        </p>
        <Link
          href="/update"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-medium transition"
        >
          הכנס נתונים ראשונים
        </Link>
      </div>
    );
  }

  const { summary } = data;
  const { ariel, inbar, joint } = summary;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Net Worth Hero */}
      <div className="grid grid-cols-1">
        <NetWorthCard summary={summary} />
      </div>

      {/* Product cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ProductCard
          title="קרן פנסיה"
          total={ariel.pensionTotal + inbar.pensionTotal + joint.pensionTotal}
          arielTotal={ariel.pensionTotal}
          inbarTotal={inbar.pensionTotal}
          jointTotal={joint.pensionTotal}
          href="/pension"
          icon="🏦"
        />
        <ProductCard
          title="קרן השתלמות"
          total={ariel.hishtalmutTotal + inbar.hishtalmutTotal + joint.hishtalmutTotal}
          arielTotal={ariel.hishtalmutTotal}
          inbarTotal={inbar.hishtalmutTotal}
          jointTotal={joint.hishtalmutTotal}
          href="/hishtalmut"
          icon="🎓"
        />
        <ProductCard
          title="תיק השקעות"
          total={ariel.investmentsTotal + inbar.investmentsTotal + joint.investmentsTotal}
          arielTotal={ariel.investmentsTotal}
          inbarTotal={inbar.investmentsTotal}
          jointTotal={joint.investmentsTotal}
          href="/investments"
          icon="📈"
        />
        <ProductCard
          title="בנקים ופיקדונות"
          total={ariel.bankTotal + inbar.bankTotal + joint.bankTotal}
          arielTotal={ariel.bankTotal}
          inbarTotal={inbar.bankTotal}
          jointTotal={joint.bankTotal}
          href="/bank"
          icon="🏛️"
        />
      </div>

      {/* Income */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <IncomeCard summary={summary} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardTitle>התפלגות נכסים</CardTitle>
          <AllocationPie summary={summary} />
        </Card>
        <Card>
          <CardTitle>אריאל מול ענבר</CardTitle>
          <PersonBar summary={summary} />
        </Card>
      </div>
    </div>
  );
}
