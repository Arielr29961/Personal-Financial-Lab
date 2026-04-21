'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/': 'סקירה כללית',
  '/pension': 'קרן פנסיה',
  '/hishtalmut': 'קרן השתלמות',
  '/investments': 'תיק השקעות',
  '/bank': 'בנקים ופיקדונות',
  '/history': 'היסטוריה',
  '/shotef': 'שוטף — הכנסות והוצאות',
  '/update': 'עדכון חודשי',
  '/settings': 'הגדרות',
};

export default function Header() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? 'מעבדה פיננסית';

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-4 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-slate-50">{title}</h1>
      <div className="flex items-center gap-3">
        <Link
          href="/update"
          className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition"
        >
          <span>✏️</span>
          עדכון חודשי
        </Link>
      </div>
    </header>
  );
}
