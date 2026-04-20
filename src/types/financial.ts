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
  providerName: string;           // e.g. "פסגות"
  currentValue: number;
  isLiquid: boolean;              // true if 6-year lock-up has passed
  monthlyEmployeeContribution: number;
  monthlyEmployerContribution: number;
  notes?: string;
}

export interface InvestmentPortfolio {
  id: string;
  owner: Owner;
  brokerName: string;             // e.g. "אינטראקטיב ברוקרס", "מיטב"
  currentValue: number;
  cashComponent: number;          // cash portion within portfolio
  notes?: string;
}

export interface BankAccount {
  id: string;
  owner: Owner;
  bankName: string;               // e.g. "בנק הפועלים", "בנק לאומי"
  accountType: 'checking' | 'savings' | 'deposit';
  currentBalance: number;
  interestRate?: number;          // annual % for deposits
  maturityDate?: string;          // ISO date string for term deposits (YYYY-MM-DD)
  notes?: string;
}

// ── Monthly Snapshot (stored in Redis) ─────────────────────────────────────────
export interface MonthlySnapshot {
  yearMonth: string;              // "2025-01" — primary key
  createdAt: string;              // ISO datetime
  updatedAt: string;              // ISO datetime
  pensions: PensionProduct[];
  hishtalmuts: HishtalmutProduct[];
  investments: InvestmentPortfolio[];
  bankAccounts: BankAccount[];
}

// ── Settings (stored in Redis under key "settings") ────────────────────────────
export interface Settings {
  arielMonthlyNetWage: number;    // ₪ take-home after tax
  inbarMonthlyNetWage: number;
}

// ── Index (stored in Redis under key "snapshot:index") ────────────────────────
export interface SnapshotIndex {
  months: string[];               // sorted array: ["2024-11", "2024-12", "2025-01"]
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
  netWorth: number;               // sum of all owners
  liquidNetWorth: number;         // excludes locked hishtalmut
  // wage-based metrics (null if settings not configured)
  totalHouseholdMonthlyIncome: number | null;
  monthlyNetWorthChange: number | null;   // vs prior month's snapshot
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
