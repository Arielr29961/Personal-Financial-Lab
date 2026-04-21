import { NextRequest, NextResponse } from 'next/server';
import {
  getLatestSnapshot,
  getSnapshot,
  saveSnapshot,
} from '@/lib/redis';
import { computeMonthSummary } from '@/lib/calculations';
import { previousYearMonth } from '@/lib/formatters';
import type { MonthlySnapshot } from '@/types/financial';

const DEFAULT_WAGES = {
  ariel: { amount: 0, bankAccountId: '' },
  inbar:  { amount: 0, bankAccountId: '' },
};

const DEFAULT_EXPENSES = {
  ariel: { mode: 'total' as const, totalOverride: 0, categories: [], bankAccountId: '' },
  inbar:  { mode: 'total' as const, totalOverride: 0, categories: [], bankAccountId: '' },
};

// GET /api/snapshot — returns latest snapshot + summary
export async function GET() {
  const snapshot = await getLatestSnapshot();

  if (!snapshot) {
    return NextResponse.json({ snapshot: null, summary: null });
  }

  const prevYM = previousYearMonth(snapshot.yearMonth);
  const previousSnapshot = await getSnapshot(prevYM);

  const summary = computeMonthSummary(snapshot, previousSnapshot);
  return NextResponse.json({ snapshot, summary });
}

// POST /api/snapshot — save a new or updated snapshot
export async function POST(request: NextRequest) {
  const body: Partial<MonthlySnapshot> = await request.json();

  if (!body.yearMonth || !/^\d{4}-\d{2}$/.test(body.yearMonth)) {
    return NextResponse.json({ error: 'yearMonth חסר או לא תקין' }, { status: 400 });
  }

  const existing = await getSnapshot(body.yearMonth);
  const now = new Date().toISOString();

  const snapshot: MonthlySnapshot = {
    yearMonth: body.yearMonth,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    pensions: body.pensions ?? [],
    hishtalmuts: body.hishtalmuts ?? [],
    investments: body.investments ?? [],
    bankAccounts: body.bankAccounts ?? [],
    wages: body.wages ?? DEFAULT_WAGES,
    expenses: body.expenses ?? DEFAULT_EXPENSES,
  };

  await saveSnapshot(snapshot);

  return NextResponse.json({ ok: true, yearMonth: snapshot.yearMonth });
}
