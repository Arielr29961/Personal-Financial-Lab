import { NextRequest, NextResponse } from 'next/server';
import {
  getLatestSnapshot,
  getSnapshot,
  saveSnapshot,
  getSettings,
} from '@/lib/redis';
import { computeMonthSummary } from '@/lib/calculations';
import { previousYearMonth } from '@/lib/formatters';
import type { MonthlySnapshot } from '@/types/financial';

// GET /api/snapshot — returns latest snapshot + summary
export async function GET() {
  const [snapshot, settings] = await Promise.all([
    getLatestSnapshot(),
    getSettings(),
  ]);

  if (!snapshot) {
    return NextResponse.json({ snapshot: null, summary: null });
  }

  // Fetch prior month for change calculation
  const prevYM = previousYearMonth(snapshot.yearMonth);
  const previousSnapshot = await getSnapshot(prevYM);

  const summary = computeMonthSummary(snapshot, settings, previousSnapshot);
  return NextResponse.json({ snapshot, summary });
}

// POST /api/snapshot — save a new or updated snapshot
export async function POST(request: NextRequest) {
  const body: Partial<MonthlySnapshot> = await request.json();

  if (!body.yearMonth || !/^\d{4}-\d{2}$/.test(body.yearMonth)) {
    return NextResponse.json({ error: 'yearMonth חסר או לא תקין' }, { status: 400 });
  }

  // Check for existing snapshot and preserve createdAt
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
  };

  await saveSnapshot(snapshot);

  return NextResponse.json({ ok: true, yearMonth: snapshot.yearMonth });
}
