import type {
  MonthlySnapshot,
  MonthSummary,
  OwnerSummary,
  Owner,
  PersonExpenses,
  CashFlowEntry,
} from '@/types/financial';

// ── Owner summary ──────────────────────────────────────────────────────────────

function emptyOwnerSummary(owner: Owner): OwnerSummary {
  return {
    owner,
    pensionTotal: 0,
    hishtalmutTotal: 0,
    hishtalmutLiquidTotal: 0,
    investmentsTotal: 0,
    bankTotal: 0,
    grandTotal: 0,
  };
}

function computeOwnerSummary(
  owner: Owner,
  snapshot: MonthlySnapshot
): OwnerSummary {
  const summary = emptyOwnerSummary(owner);

  for (const p of snapshot.pensions) {
    if (p.owner === owner) summary.pensionTotal += p.currentValue;
  }

  for (const h of snapshot.hishtalmuts) {
    if (h.owner === owner) {
      summary.hishtalmutTotal += h.currentValue;
      if (h.isLiquid) summary.hishtalmutLiquidTotal += h.currentValue;
    }
  }

  for (const i of snapshot.investments) {
    if (i.owner === owner) summary.investmentsTotal += i.currentValue;
  }

  for (const b of snapshot.bankAccounts) {
    if (b.owner === owner) summary.bankTotal += b.currentBalance;
  }

  summary.grandTotal =
    summary.pensionTotal +
    summary.hishtalmutTotal +
    summary.investmentsTotal +
    summary.bankTotal;

  return summary;
}

// ── Expense helpers ────────────────────────────────────────────────────────────

export function personExpenseTotal(e: PersonExpenses): number {
  if (!e) return 0;
  if (e.mode === 'total') return e.totalOverride ?? 0;
  return e.categories.reduce((sum, c) => sum + c.amount, 0);
}

/** Merge expense categories from two people for display */
export function mergedCategoryTotals(
  arielExpenses: PersonExpenses | undefined,
  inbarExpenses: PersonExpenses | undefined
): { name: string; ariel: number; inbar: number; total: number }[] {
  const map = new Map<string, { name: string; ariel: number; inbar: number }>();

  const addCategories = (expenses: PersonExpenses | undefined, person: 'ariel' | 'inbar') => {
    if (!expenses || expenses.mode !== 'breakdown') return;
    for (const cat of expenses.categories) {
      const existing = map.get(cat.id) ?? { name: cat.name, ariel: 0, inbar: 0 };
      existing[person] += cat.amount;
      map.set(cat.id, existing);
    }
  };

  addCategories(arielExpenses, 'ariel');
  addCategories(inbarExpenses, 'inbar');

  return Array.from(map.values()).map((v) => ({
    ...v,
    total: v.ariel + v.inbar,
  }));
}

// ── Month summary ──────────────────────────────────────────────────────────────

export function computeMonthSummary(
  snapshot: MonthlySnapshot,
  previousSnapshot: MonthlySnapshot | null
): MonthSummary {
  const ariel = computeOwnerSummary('ariel', snapshot);
  const inbar = computeOwnerSummary('inbar', snapshot);
  const joint = computeOwnerSummary('joint', snapshot);

  const netWorth = ariel.grandTotal + inbar.grandTotal + joint.grandTotal;

  const liquidNetWorth =
    ariel.bankTotal +
    inbar.bankTotal +
    joint.bankTotal +
    ariel.investmentsTotal +
    inbar.investmentsTotal +
    joint.investmentsTotal +
    ariel.hishtalmutLiquidTotal +
    inbar.hishtalmutLiquidTotal +
    joint.hishtalmutLiquidTotal;

  // Wages
  const arielWage = snapshot.wages?.ariel?.amount ?? 0;
  const inbarWage = snapshot.wages?.inbar?.amount ?? 0;
  const totalHouseholdMonthlyIncome = arielWage + inbarWage;

  // Expenses
  const arielExpenses = personExpenseTotal(snapshot.expenses?.ariel);
  const inbarExpenses = personExpenseTotal(snapshot.expenses?.inbar);

  // One-time items
  const oneTimeIncome = (snapshot.oneTimeItems ?? [])
    .filter((i) => i.type === 'income')
    .reduce((s, i) => s + i.amount, 0);
  const oneTimeExpense = (snapshot.oneTimeItems ?? [])
    .filter((i) => i.type === 'expense')
    .reduce((s, i) => s + i.amount, 0);

  const householdNetCashFlow =
    totalHouseholdMonthlyIncome + oneTimeIncome - arielExpenses - inbarExpenses - oneTimeExpense;

  // Net worth change vs prior month
  let monthlyNetWorthChange: number | null = null;
  if (previousSnapshot) {
    const prevAriel = computeOwnerSummary('ariel', previousSnapshot);
    const prevInbar = computeOwnerSummary('inbar', previousSnapshot);
    const prevJoint = computeOwnerSummary('joint', previousSnapshot);
    const prevNetWorth = prevAriel.grandTotal + prevInbar.grandTotal + prevJoint.grandTotal;
    monthlyNetWorthChange = netWorth - prevNetWorth;
  }

  return {
    yearMonth: snapshot.yearMonth,
    ariel,
    inbar,
    joint,
    netWorth,
    liquidNetWorth,
    arielWage,
    inbarWage,
    arielExpenses,
    inbarExpenses,
    householdNetCashFlow,
    totalHouseholdMonthlyIncome,
    monthlyNetWorthChange,
  };
}

// ── Cash flow history ──────────────────────────────────────────────────────────

export function computeCashFlow(snapshots: MonthlySnapshot[]): CashFlowEntry[] {
  // Snapshots should already be sorted chronologically
  let cumulative = 0;

  return snapshots.map((snapshot) => {
    const arielWage = snapshot.wages?.ariel?.amount ?? 0;
    const inbarWage = snapshot.wages?.inbar?.amount ?? 0;
    const incomeExOneTime = arielWage + inbarWage;

    const arielExp = personExpenseTotal(snapshot.expenses?.ariel);
    const inbarExp = personExpenseTotal(snapshot.expenses?.inbar);
    const expensesExOneTime = arielExp + inbarExp;

    // One-time items
    const oneTimeIncome = (snapshot.oneTimeItems ?? [])
      .filter((i) => i.type === 'income')
      .reduce((s, i) => s + i.amount, 0);
    const oneTimeExpense = (snapshot.oneTimeItems ?? [])
      .filter((i) => i.type === 'expense')
      .reduce((s, i) => s + i.amount, 0);

    const income = incomeExOneTime + oneTimeIncome;
    const expenses = expensesExOneTime + oneTimeExpense;
    const net = income - expenses;
    const netExOneTime = incomeExOneTime - expensesExOneTime;
    cumulative += net;

    const expensesByCategory = mergedCategoryTotals(
      snapshot.expenses?.ariel,
      snapshot.expenses?.inbar
    );

    return {
      yearMonth: snapshot.yearMonth,
      income,
      expenses,
      net,
      cumulative,
      arielIncome: arielWage,
      inbarIncome: inbarWage,
      arielExpenses: arielExp,
      inbarExpenses: inbarExp,
      incomeExOneTime,
      expensesExOneTime,
      netExOneTime,
      expensesByCategory,
    };
  });
}

/** Lightweight net worth (no settings needed) */
export function computeNetWorth(snapshot: MonthlySnapshot): number {
  let total = 0;
  for (const p of snapshot.pensions) total += p.currentValue;
  for (const h of snapshot.hishtalmuts) total += h.currentValue;
  for (const i of snapshot.investments) total += i.currentValue;
  for (const b of snapshot.bankAccounts) total += b.currentBalance;
  return total;
}
