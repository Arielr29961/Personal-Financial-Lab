import Link from 'next/link';
import { formatILS } from '@/lib/formatters';
import { Card, CardTitle } from '@/components/ui/Card';

interface ProductCardProps {
  title: string;
  total: number;
  href: string;
  icon: string;
  arielTotal: number;
  inbarTotal: number;
  jointTotal?: number;
}

export function ProductCard({
  title,
  total,
  href,
  icon,
  arielTotal,
  inbarTotal,
  jointTotal = 0,
}: ProductCardProps) {
  return (
    <Link href={href} className="block group">
      <Card className="hover:border-slate-600 transition-colors cursor-pointer h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="text-2xl">{icon}</div>
        </div>
        <CardTitle>{title}</CardTitle>
        <div className="text-2xl font-bold text-slate-50 tabular">
          {formatILS(total)}
        </div>
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>אריאל</span>
            <span className="tabular">{formatILS(arielTotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>ענבר</span>
            <span className="tabular">{formatILS(inbarTotal)}</span>
          </div>
          {jointTotal > 0 && (
            <div className="flex justify-between text-xs text-slate-500">
              <span>משותף</span>
              <span className="tabular">{formatILS(jointTotal)}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
