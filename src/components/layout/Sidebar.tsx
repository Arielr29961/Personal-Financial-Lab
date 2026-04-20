'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'סקירה כללית', icon: '📊' },
  { href: '/pension', label: 'קרן פנסיה', icon: '🏦' },
  { href: '/hishtalmut', label: 'קרן השתלמות', icon: '🎓' },
  { href: '/investments', label: 'תיק השקעות', icon: '📈' },
  { href: '/bank', label: 'בנקים ופיקדונות', icon: '🏛️' },
  { href: '/history', label: 'היסטוריה', icon: '📅' },
  { href: '/update', label: 'עדכון חודשי', icon: '✏️' },
  { href: '/settings', label: 'הגדרות', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-slate-900 border-l border-slate-800 shrink-0">
        {/* Brand */}
        <div className="px-5 py-6 border-b border-slate-800">
          <div className="text-lg font-bold text-slate-50">מעבדה פיננסית</div>
          <div className="text-xs text-slate-500 mt-0.5">אריאל וענבר</div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-50 hover:bg-slate-800'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-slate-900 border-t border-slate-800 flex">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2 text-xs gap-0.5 transition-colors ${
                isActive ? 'text-indigo-400' : 'text-slate-500'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="hidden xs:block truncate max-w-[60px] text-center">
                {item.label.split(' ')[0]}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
