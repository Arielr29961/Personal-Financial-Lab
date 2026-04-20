import { NextRequest, NextResponse } from 'next/server';
import { getSnapshot, getSettings } from '@/lib/redis';
import { computeMonthSummary } from '@/lib/calculations';
import { previousYearMonth } from '@/lib/formatters';

export async function GET(
  _request: NextRequest,
  { params }: { params: { yearMonth: string } }
) {
  const { yearMonth } = params;

  if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
    return NextResponse.json({ error: 'פורמט תאריך לא תקין' }, { status: 400 });
  }

  const [snapshot, settings] = await Promise.all([
    getSnapshot(yearMonth),
    getSettings(),
  ]);

  if (!snapshot) {
    return NextResponse.json({ error: 'חודש לא נמצא' }, { status: 404 });
  }

  const prevYM = previousYearMonth(yearMonth);
  const previousSnapshot = await getSnapshot(prevYM);

  const summary = computeMonthSummary(snapshot, settings, previousSnapshot);
  return NextResponse.json({ snapshot, summary });
}
