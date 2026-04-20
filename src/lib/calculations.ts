import type {
  MonthlySnapshot,
  MonthSummary,
  OwnerSummary,
  Owner,
  Settings,
} from '@/types/financial';

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

export function computeMonthSummary(
  snapshot: MonthlySnapshot,
  settings: Settings | null,
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

  const totalHouseholdMonthlyIncome = settings
    ? settings.arielMonthlyNetWage + settings.inbarMonthlyNetWage
    : null;

  let monthlyNetWorthChange: number | null = null;
  if (previousSnapshot) {
    const prevAriel = computeOwnerSummary('ariel', previousSnapshot);
    const prevInbar = computeOwnerSummary('inbar', previousSnapshot);
    const prevJoint = computeOwnerSummary('joint', previousSnapshot);
    const prevNetWorth =
      prevAriel.grandTotal + prevInbar.grandTotal + prevJoint.grandTotal;
    monthlyNetWorthChange = netWorth - prevNetWorth;
  }

  return {
    yearMonth: snapshot.yearMonth,
    ariel,
    inbar,
    joint,
    netWorth,
    liquidNetWorth,
    totalHouseholdMonthlyIncome,
    monthlyNetWorthChange,
  };
}

/** Compute a lightweight net worth for a snapshot (no settings needed) */
export function computeNetWorth(snapshot: MonthlySnapshot): number {
  let total = 0;
  for (const p of snapshot.pensions) total += p.currentValue;
  for (const h of snapshot.hishtalmuts) total += h.currentValue;
  for (const i of snapshot.investments) total += i.currentValue;
  for (const b of snapshot.bankAccounts) total += b.currentBalance;
  return total;
}
