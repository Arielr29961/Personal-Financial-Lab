'use client';

import { useEffect, useState } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import type { Settings } from '@/types/financial';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    arielMonthlyNetWage: 0,
    inbarMonthlyNetWage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError('');
    setSaved(false);
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError('שגיאה בשמירה');
    }
  }

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-6 max-w-lg pb-20 md:pb-0">
      {/* Wages */}
      <Card>
        <CardTitle>משכורות חודשיות (נטו)</CardTitle>
        <p className="text-slate-500 text-xs mb-4 mt-1">
          הכנסה לאחר מס — משמשת לחישוב הכנסת הבית החודשית בלוח הבקרה.
        </p>
        <div className="space-y-4">
          <Input
            label="משכורת אריאל (₪)"
            type="number"
            prefix="₪"
            value={settings.arielMonthlyNetWage}
            onChange={(e) =>
              setSettings((s) => ({ ...s, arielMonthlyNetWage: Number(e.target.value) }))
            }
          />
          <Input
            label="משכורת ענבר (₪)"
            type="number"
            prefix="₪"
            value={settings.inbarMonthlyNetWage}
            onChange={(e) =>
              setSettings((s) => ({ ...s, inbarMonthlyNetWage: Number(e.target.value) }))
            }
          />
        </div>
        <div className="mt-5 flex items-center gap-3">
          <Button onClick={handleSave} loading={saving}>
            שמור
          </Button>
          {saved && <span className="text-emerald-400 text-sm">✓ נשמר</span>}
          {error && <span className="text-red-400 text-sm">{error}</span>}
        </div>
      </Card>

      {/* Export */}
      <Card>
        <CardTitle>ייצוא נתונים</CardTitle>
        <p className="text-slate-500 text-xs mt-1 mb-4">
          הורד את כל הנתונים כקובץ JSON לגיבוי.
        </p>
        <a
          href="/api/export"
          download
          className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          📥 הורד JSON
        </a>
      </Card>
    </div>
  );
}
