import { NextResponse } from 'next/server';
import { getAllSnapshots, getSettings } from '@/lib/redis';
import { computeMonthSummary } from '@/lib/calculations';
import { previousYearMonth } from '@/lib/formatters';
import type { HistoryEntry } from '@/types/financial';

export async function GET() {
  const [snapshots, settings] = await Promise.all([
    getAllSnapshots(),
    getSettings(),
  ]);

  if (snapshots.length === 0) {
    return NextResponse.json({ months: [] });
  }

  // Build a map for quick previous-month lookup
  const snapshotMap = new Map(snapshots.map((s) => [s.yearMonth, s]));

  const months: HistoryEntry[] = snapshots.map((snapshot) => {
    const prevYM = previousYearMonth(snapshot.yearMonth);
    const previousSnapshot = snapshotMap.get(prevYM) ?? null;
    const summary = computeMonthSummary(snapshot, settings, previousSnapshot);
    return { yearMonth: snapshot.yearMonth, summary };
  });

  return NextResponse.json({ months });
}
