// ── Owners ────────────────────────────────────────────────────────────────────
export type Owner = 'ariel' | 'inbar' | 'joint';

// ── Product Types ──────────────────────────────────────────────────────────────
export interface PensionProduct {
  id: string;
  owner: Owner;
  providerName: string;           // e.g. "מנורה מבטחים"
  currentValue: number;           // ₪ accumulated value
  monthlyEmployeeContribution: number;
  monthlyEmployerContribution: number;
  expectedMonthlyPension: number; // projected monthly pension at retirement
  notes?: string;
}

export interface HishtalmutProduct {
  id: string;
  owner: Owner;
  providerName: string;
  currentValue: number;
  isLiquid: boolean;              // true if 6-year lock-up has passed
  notes?: string;
}

export interface InvestmentPortfolio {
  id: string;
  owner: Owner;
  brokerName: string;
  currentValue: number;
  notes?: string;
}

export interface BankAccount {
  id: string;
  owner: Owner;
  bankName: string;
  accountType: 'checking' | 'savings' | 'deposit';
  currentBalance: number;
  notes?: string;
}

// ── Wages & Expenses ───────────────────────────────────────────────────────────
export interface WageEntry {
  amount: number;
  bankAccountId: string;          // id of the BankAccount that receives the wage
}

export interface ExpenseCategory {
  id: string;
  name: string;                   // Hebrew label
  amount: number;
  isCustom: boolean;
}

export interface PersonExpenses {
  mode: 'total' | 'breakdown';
  totalOverride?: number;         // used when mode === 'total'
  categories: ExpenseCategory[];  // used when mode === 'breakdown'
  bankAccountId: string;          // id of the BankAccount that is debited
}

export interface MonthlyWages {
  ariel: WageEntry;
  inbar: WageEntry;
}

export interface MonthlyExpenses {
  ariel: PersonExpenses;
  inbar: PersonExpenses;
}

// ── Monthly Snapshot (stored in Redis) ─────────────────────────────────────────
export interface MonthlySnapshot {
  yearMonth: string;              // "2025-01" — primary key
  createdAt: string;
  updatedAt: string;
  pensions: PensionProduct[];
  hishtalmuts: HishtalmutProduct[];
  investments: InvestmentPortfolio[];
  bankAccounts: BankAccount[];
  wages: MonthlyWages;
  expenses: MonthlyExpenses;
}

// ── Settings (kept for future use) ────────────────────────────────────────────
export interface Settings {
  [key: string]: unknown;
}

// ── Index ──────────────────────────────────────────────────────────────────────
export interface SnapshotIndex {
  months: string[];
  latestMonth: string;
}

// ── Computed Summaries (never stored — always derived) ─────────────────────────
export interface OwnerSummary {
  owner: Owner;
  pensionTotal: number;
  hishtalmutTotal: number;
  hishtalmutLiquidTotal: number;
  investmentsTotal: number;
  bankTotal: number;
  grandTotal: number;
}

export interface MonthSummary {
  yearMonth: string;
  ariel: OwnerSummary;
  inbar: OwnerSummary;
  joint: OwnerSummary;
  netWorth: number;
  liquidNetWorth: number;
  // Cash flow fields
  arielWage: number;
  inbarWage: number;
  arielExpenses: number;
  inbarExpenses: number;
  householdNetCashFlow: number;   // (wages) – (expenses)
  // Net worth change vs prior month
  monthlyNetWorthChange: number | null;
  // Wage-based total income (for overview card)
  totalHouseholdMonthlyIncome: number;
}

// ── Cash Flow (for שוטף page) ─────────────────────────────────────────────────
export interface CashFlowEntry {
  yearMonth: string;
  income: number;                 // arielWage + inbarWage
  expenses: number;               // arielExpenses + inbarExpenses
  net: number;                    // income – expenses
  cumulative: number;             // running total across all months
  expensesByCategory: { name: string; ariel: number; inbar: number; total: number }[];
}

// ── API response shapes ────────────────────────────────────────────────────────
export interface SnapshotWithSummary {
  snapshot: MonthlySnapshot;
  summary: MonthSummary;
}

export interface HistoryEntry {
  yearMonth: string;
  summary: MonthSummary;
}
