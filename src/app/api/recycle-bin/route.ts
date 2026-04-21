import { NextResponse } from 'next/server';
import {
  getAllSnapshots,
  getSettings,
  getRecycleBin,
  saveRecycleBin,
  clearAllData,
} from '@/lib/redis';

// GET /api/recycle-bin — returns current recycle bin data
export async function GET() {
  const bin = await getRecycleBin();
  return NextResponse.json(bin ?? null);
}

// POST /api/recycle-bin — moves all data to recycle bin and clears
export async function POST() {
  const [snapshots, settings] = await Promise.all([
    getAllSnapshots(),
    getSettings(),
  ]);

  const bin = {
    deletedAt: new Date().toISOString(),
    snapshots,
    settings,
  };

  await saveRecycleBin(bin);
  await clearAllData();

  return NextResponse.json({ ok: true, monthsDeleted: snapshots.length });
}
