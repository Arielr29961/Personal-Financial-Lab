import { NextResponse } from 'next/server';
import { getAllSnapshots, getSettings } from '@/lib/redis';

export async function GET() {
  const [snapshots, settings] = await Promise.all([
    getAllSnapshots(),
    getSettings(),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    settings,
    snapshots,
  };

  const date = new Date().toISOString().split('T')[0];
  const filename = `financial-data-${date}.json`;

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
