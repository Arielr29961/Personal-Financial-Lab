import { NextResponse } from 'next/server';
import { getRecycleBin, saveSnapshot } from '@/lib/redis';

// POST /api/restore — restores all snapshots from recycle bin
export async function POST() {
  const bin = await getRecycleBin();

  if (!bin) {
    return NextResponse.json({ error: 'סל המחזור ריק' }, { status: 404 });
  }

  // Re-save all snapshots (saveSnapshot rebuilds the index automatically)
  await Promise.all(bin.snapshots.map((snapshot) => saveSnapshot(snapshot)));

  return NextResponse.json({
    ok: true,
    monthsRestored: bin.snapshots.length,
  });
}
