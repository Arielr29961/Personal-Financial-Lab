'use client';

import { Card, CardTitle } from '@/components/ui/Card';

export default function SettingsPage() {
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
    </div>
  );
}
