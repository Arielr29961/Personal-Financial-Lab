'use client';

import { useEffect, useState } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatHebrewDate } from '@/lib/formatters';

interface RecycleBinData {
  deletedAt: string;
  snapshots: unknown[];
  settings: unknown;
}

export default function SettingsPage() {
  const [recycleBin, setRecycleBin] = useState<RecycleBinData | null>(null);
  const [binLoading, setBinLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const [restoreMsg, setRestoreMsg] = useState('');

  useEffect(() => {
    fetch('/api/recycle-bin')
      .then((r) => r.json())
      .then((d) => setRecycleBin(d))
      .finally(() => setBinLoading(false));
  }, []);

  async function handleReset() {
    const confirmed = window.confirm(
      'האם למחוק את כל הנתונים? הנתונים יועברו לסל המחזור ויישמרו שם למשך 90 יום.'
    );
    if (!confirmed) return;

    setResetting(true);
    setResetMsg('');
    try {
      const res = await fetch('/api/recycle-bin', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setResetMsg(`הנתונים הועברו לסל המחזור (${data.monthsDeleted} חודשים)`);
        const binRes = await fetch('/api/recycle-bin');
        setRecycleBin(await binRes.json());
      } else {
        setResetMsg('שגיאה באיפוס. נסה שנית.');
      }
    } finally {
      setResetting(false);
    }
  }

  async function handleRestore() {
    const confirmed = window.confirm(
      'שחזור ידרוס את כל הנתונים הקיימים. להמשיך?'
    );
    if (!confirmed) return;

    setRestoring(true);
    setRestoreMsg('');
    try {
      const res = await fetch('/api/restore', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setRestoreMsg(`שוחזרו ${data.monthsRestored} חודשים בהצלחה`);
      } else {
        setRestoreMsg(data.error ?? 'שגיאה בשחזור');
      }
    } finally {
      setRestoring(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg pb-20 md:pb-0">
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

      {/* Reset Data */}
      <Card>
        <CardTitle>איפוס נתונים</CardTitle>
        <p className="text-slate-500 text-xs mt-1 mb-4">
          מחק את כל הנתונים הפיננסיים. הנתונים יועברו לסל המחזור ויישמרו שם למשך 90 יום.
        </p>
        <Button
          variant="danger"
          onClick={handleReset}
          loading={resetting}
        >
          🗑 איפוס כל הנתונים
        </Button>
        {resetMsg && (
          <p className={`text-sm mt-3 ${resetMsg.includes('שגיאה') ? 'text-red-400' : 'text-emerald-400'}`}>
            {resetMsg}
          </p>
        )}
      </Card>

      {/* Recycle Bin */}
      <Card>
        <CardTitle>סל מחזור</CardTitle>
        {binLoading ? (
          <p className="text-slate-500 text-sm mt-2">טוען...</p>
        ) : recycleBin ? (
          <div className="mt-2 space-y-3">
            <div className="text-sm text-slate-400 space-y-1">
              <div>
                <span className="text-slate-500">נמחק ב: </span>
                <span className="text-slate-200">{formatHebrewDate(recycleBin.deletedAt)}</span>
              </div>
              <div>
                <span className="text-slate-500">חודשים שנשמרו: </span>
                <span className="text-slate-200">{recycleBin.snapshots.length}</span>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={handleRestore}
              loading={restoring}
            >
              ♻️ שחזר נתונים
            </Button>
            {restoreMsg && (
              <p className={`text-sm ${restoreMsg.includes('שגיאה') ? 'text-red-400' : 'text-emerald-400'}`}>
                {restoreMsg}
              </p>
            )}
          </div>
        ) : (
          <p className="text-slate-500 text-sm mt-2">סל המחזור ריק.</p>
        )}
      </Card>
    </div>
  );
}
