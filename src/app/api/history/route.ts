import { NextResponse } from 'next/server';
import { getAllSnapshots } from '@/lib/redis';
import { computeMonthSummary } from '@/lib/calculations';
import { previousYearMonth } from '@/lib/formatters';
import type { HistoryEntry } from '@/types/financial';

export async function GET() {
  const snapshots = await getAllSnapshots();

  if (snapshots.length === 0) {
    return NextResponse.json({ months: [] });
  }

  const snapshotMap = new Map(snapshots.map((s) => [s.yearMonth, s]));

  const months: HistoryEntry[] = snapshots.map((snapshot) => {
    const prevYM = previousYearMonth(snapshot.yearMonth);
    const previousSnapshot = snapshotMap.get(prevYM) ?? null;
    const summary = computeMonthSummary(snapshot, previousSnapshot);
    return { yearMonth: snapshot.yearMonth, summary };
  });

  return NextResponse.json({ months });
}
