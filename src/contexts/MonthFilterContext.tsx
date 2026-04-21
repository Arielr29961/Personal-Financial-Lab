'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { currentYearMonth } from '@/lib/formatters';

interface MonthFilterContextValue {
  yearMonth: string;
  setYearMonth: (ym: string) => void;
}

const MonthFilterContext = createContext<MonthFilterContextValue>({
  yearMonth: currentYearMonth(),
  setYearMonth: () => {},
});

export function MonthFilterProvider({ children }: { children: ReactNode }) {
  const [yearMonth, setYearMonth] = useState(currentYearMonth());

  return (
    <MonthFilterContext.Provider value={{ yearMonth, setYearMonth }}>
      {children}
    </MonthFilterContext.Provider>
  );
}

export function useMonthFilter() {
  return useContext(MonthFilterContext);
}
