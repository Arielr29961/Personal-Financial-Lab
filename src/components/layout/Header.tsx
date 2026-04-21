'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import { useMonthFilter } from '@/contexts/MonthFilterContext';
import { HEBREW_MONTHS } from '@/lib/constants';

const PAGE_TITLES: Record<string, string> = {
  '/': 'סקירה כללית',
  '/pension': 'קרן פנסיה',
  '/hishtalmut': 'קרן השתלמות',
  '/investments': 'תיק השקעות',
  '/bank': 'בנקים ופיקדונות',
  '/history': 'מאזן לאורך זמן',
  '/shotef': 'שוטף — הכנסות והוצאות',
  '/update': 'עדכון חודשי',
  '/settings': 'הגדרות',
};

function buildMonthOptions() {
  return Array.from({ length: 24 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const ym = `${year}-${String(month).padStart(2, '0')}`;
    return { value: ym, label: `${HEBREW_MONTHS[month - 1]} ${year}` };
  });
}

const MONTH_OPTIONS = buildMonthOptions();

export default function Header() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? 'מעבדה פיננסית';
  const { toggle } = useSidebar();
  const { yearMonth, setYearMonth } = useMonthFilter();

  const hideMonthFilter = pathname === '/settings' || pathname === '/update';

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-3 flex items-center gap-3">
      {/* Sidebar toggle */}
      <button
        onClick={toggle}
        className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition shrink-0"
        aria-label="הצג/הסתר תפריט"
      >
        <span className="text-base">☰</span>
      </button>

      {/* Page title */}
      <h1 className="text-base font-semibold text-slate-50 flex-1 truncate">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Global month filter */}
        {!hideMonthFilter && (
          <select
            value={yearMonth}
            onChange={(e) => setYearMonth(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[140px]"
            dir="rtl"
          >
            {MONTH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {/* Update button */}
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
