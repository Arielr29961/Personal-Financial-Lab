import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div
      className={`bg-slate-800 border border-slate-700 rounded-xl shadow-sm ${
        padding ? 'p-5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={`text-sm font-medium text-slate-400 mb-1 ${className}`}>
      {children}
    </h3>
  );
}
