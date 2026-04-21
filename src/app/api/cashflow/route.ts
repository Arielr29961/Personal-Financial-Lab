import { NextResponse } from 'next/server';
import { getAllSnapshots } from '@/lib/redis';
import { computeCashFlow } from '@/lib/calculations';

export async function GET() {
  const snapshots = await getAllSnapshots();

  if (snapshots.length === 0) {
    return NextResponse.json({ months: [] });
  }

  const months = computeCashFlow(snapshots);
  return NextResponse.json({ months });
}
