import { NextRequest, NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/redis';
import type { Settings } from '@/types/financial';

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings ?? { arielMonthlyNetWage: 0, inbarMonthlyNetWage: 0 });
}

export async function PUT(request: NextRequest) {
  const body: Partial<Settings> = await request.json();

  if (
    typeof body.arielMonthlyNetWage !== 'number' ||
    typeof body.inbarMonthlyNetWage !== 'number'
  ) {
    return NextResponse.json({ error: 'נתונים חסרים' }, { status: 400 });
  }

  const settings: Settings = {
    arielMonthlyNetWage: body.arielMonthlyNetWage,
    inbarMonthlyNetWage: body.inbarMonthlyNetWage,
  };

  await saveSettings(settings);
  return NextResponse.json({ ok: true });
}
