'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { currentYearMonth } from '@/lib/formatters';
import { HEBREW_MONTHS, DEFAULT_EXPENSE_CATEGORIES } from '@/lib/constants';
import type { MonthlySnapshot, Owner, BankAccount, ExpenseCategory } from '@/types/financial';

type FormValues = Omit<MonthlySnapshot, 'createdAt' | 'updatedAt'>;

const OWNER_OPTIONS = [
  { value: 'ariel', label: 'אריאל' },
  { value: 'inbar', label: 'ענבר' },
  { value: 'joint', label: 'משותף' },
];

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'checking', label: 'עובר ושב' },
  { value: 'savings', label: 'חסכון' },
  { value: 'deposit', label: 'פיקדון' },
];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

const DEFAULT_OWNER: Owner = 'ariel';

function emptyPension() {
  return { id: generateId(), owner: DEFAULT_OWNER, providerName: '', currentValue: 0, monthlyEmployeeContribution: 0, monthlyEmployerContribution: 0, expectedMonthlyPension: 0, notes: '' };
}
function emptyHishtalmut() {
  return { id: generateId(), owner: DEFAULT_OWNER, providerName: '', currentValue: 0, isLiquid: false, notes: '' };
}
function emptyInvestment() {
  return { id: generateId(), owner: DEFAULT_OWNER, brokerName: '', currentValue: 0, notes: '' };
}
function emptyBank() {
  return { id: generateId(), owner: DEFAULT_OWNER, bankName: '', accountType: 'checking' as const, currentBalance: 0, notes: '' };
}
function emptyExpenseCategories(): ExpenseCategory[] {
  return DEFAULT_EXPENSE_CATEGORIES.map((c) => ({ ...c, amount: 0, isCustom: false }));
}
function emptyPersonExpenses() {
  return { mode: 'total' as const, totalOverride: 0, categories: emptyExpenseCategories(), bankAccountId: '' };
}
function emptyWages() {
  return { ariel: { amount: 0, bankAccountId: '' }, inbar: { amount: 0, bankAccountId: '' } };
}
function emptyExpenses() {
  return { ariel: emptyPersonExpenses(), inbar: emptyPersonExpenses() };
}

type TabId = 'pension' | 'hishtalmut' | 'investments' | 'bank' | 'wages' | 'expenses';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'pension',    label: 'קרן פנסיה',       icon: '🏦' },
  { id: 'hishtalmut', label: 'קרן השתלמות',     icon: '🎓' },
  { id: 'investments',label: 'תיק השקעות',      icon: '📈' },
  { id: 'bank',       label: 'בנקים',           icon: '🏛️' },
  { id: 'wages',      label: 'שכר חודשי',       icon: '💼' },
  { id: 'expenses',   label: 'הוצאות חודשיות',  icon: '💸' },
];

// Build bank-account dropdown options from current form values
function bankOptions(accounts: BankAccount[]) {
  const opts = [{ value: '', label: '— ללא חיבור לחשבון —' }];
  for (const acc of accounts) {
    if (acc.bankName) {
      opts.push({ value: acc.id, label: `${acc.bankName} (${acc.owner === 'ariel' ? 'אריאל' : acc.owner === 'inbar' ? 'ענבר' : 'משותף'})` });
    }
  }
  return opts;
}

export default function UpdatePage() {
  const [activeTab, setActiveTab] = useState<TabId>('pension');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(currentYearMonth());
  const [prevSnapshot, setPrevSnapshot] = useState<MonthlySnapshot | null>(null);

  const { control, register, handleSubmit, reset, setValue } = useForm<FormValues>({
    defaultValues: {
      yearMonth: currentYearMonth(),
      pensions: [],
      hishtalmuts: [],
      investments: [],
      bankAccounts: [],
      wages: emptyWages(),
      expenses: emptyExpenses(),
    },
  });

  const pensionsArray = useFieldArray({ control, name: 'pensions' });
  const hishtalmutArray = useFieldArray({ control, name: 'hishtalmuts' });
  const investmentsArray = useFieldArray({ control, name: 'investments' });
  const bankArray = useFieldArray({ control, name: 'bankAccounts' });

  // Watch wages, expenses, and bank accounts for auto-compute
  const watchedWages = useWatch({ control, name: 'wages' });
  const watchedExpenses = useWatch({ control, name: 'expenses' });
  const watchedBankAccounts = useWatch({ control, name: 'bankAccounts' });

  // Load snapshot for selected month
  useEffect(() => {
    setLoading(true);
    setPrevSnapshot(null);

    const [year, month] = selectedMonth.split('-').map(Number);
    const prevYM = month === 1
      ? `${year - 1}-12`
      : `${year}-${String(month - 1).padStart(2, '0')}`;

    Promise.all([
      fetch(`/api/snapshot/${selectedMonth}`),
      fetch(`/api/snapshot/${prevYM}`),
    ]).then(async ([curRes, prevRes]) => {
      let prev: MonthlySnapshot | null = null;
      if (prevRes.ok) {
        const { snapshot } = await prevRes.json();
        prev = snapshot ?? null;
      }
      setPrevSnapshot(prev);

      if (curRes.ok) {
        const { snapshot } = await curRes.json();
        reset({
          yearMonth: selectedMonth,
          pensions: snapshot.pensions ?? [],
          hishtalmuts: snapshot.hishtalmuts ?? [],
          investments: snapshot.investments ?? [],
          bankAccounts: snapshot.bankAccounts ?? [],
          wages: snapshot.wages ?? emptyWages(),
          expenses: snapshot.expenses ?? emptyExpenses(),
        });
      } else if (prev) {
        // Pre-fill from previous month but don't carry wages/expenses
        reset({
          yearMonth: selectedMonth,
          pensions: prev.pensions ?? [],
          hishtalmuts: prev.hishtalmuts ?? [],
          investments: prev.investments ?? [],
          bankAccounts: prev.bankAccounts ?? [],
          wages: emptyWages(),
          expenses: emptyExpenses(),
        });
      } else {
        reset({
          yearMonth: selectedMonth,
          pensions: [], hishtalmuts: [], investments: [], bankAccounts: [],
          wages: emptyWages(), expenses: emptyExpenses(),
        });
      }
      setLoading(false);
    });
  }, [selectedMonth, reset]);

  // Auto-compute bank balances when wages/expenses change
  const autoComputeBankBalances = useCallback(() => {
    if (!watchedBankAccounts) return;

    watchedBankAccounts.forEach((acc, index) => {
      if (!acc.id) return;

      // Find linked wages
      let linkedIncome = 0;
      if (watchedWages?.ariel?.bankAccountId === acc.id) {
        linkedIncome += watchedWages.ariel.amount ?? 0;
      }
      if (watchedWages?.inbar?.bankAccountId === acc.id) {
        linkedIncome += watchedWages.inbar.amount ?? 0;
      }

      // Find linked expenses
      let linkedExpenses = 0;
      if (watchedExpenses?.ariel?.bankAccountId === acc.id) {
        const e = watchedExpenses.ariel;
        linkedExpenses += e.mode === 'total'
          ? (e.totalOverride ?? 0)
          : (e.categories ?? []).reduce((s: number, c: ExpenseCategory) => s + (c.amount ?? 0), 0);
      }
      if (watchedExpenses?.inbar?.bankAccountId === acc.id) {
        const e = watchedExpenses.inbar;
        linkedExpenses += e.mode === 'total'
          ? (e.totalOverride ?? 0)
          : (e.categories ?? []).reduce((s: number, c: ExpenseCategory) => s + (c.amount ?? 0), 0);
      }

      const isLinked = linkedIncome > 0 || linkedExpenses > 0;
      if (!isLinked) return;

      // Find prev snapshot's matching account by id
      const prevAcc = prevSnapshot?.bankAccounts?.find((b) => b.id === acc.id);
      const prevBalance = prevAcc?.currentBalance ?? 0;
      const computed = prevBalance + linkedIncome - linkedExpenses;
      setValue(`bankAccounts.${index}.currentBalance`, computed);
    });
  }, [watchedWages, watchedExpenses, watchedBankAccounts, prevSnapshot, setValue]);

  useEffect(() => {
    if (!loading) autoComputeBankBalances();
  }, [watchedWages, watchedExpenses, loading, autoComputeBankBalances]);

  async function onSubmit(values: FormValues) {
    setSaving(true);
    setError('');
    setSaved(false);
    const res = await fetch('/api/snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError('שגיאה בשמירה. נסה שנית.');
    }
  }

  const monthOptions = Array.from({ length: 24 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const ym = `${year}-${String(month).padStart(2, '0')}`;
    return { value: ym, label: `${HEBREW_MONTHS[month - 1]} ${year}` };
  });

  return (
    <div className="space-y-5 pb-20 md:pb-0 max-w-3xl">
      {/* Month selector */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Select
              label="חודש לעדכון"
              options={monthOptions}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
          {saved && <Badge variant="green">✓ נשמר בהצלחה</Badge>}
        </div>
      </Card>

      {loading ? <PageSpinner /> : (
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Tab navigation */}
          <div className="flex gap-1 bg-slate-900 p-1 rounded-xl mb-4 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── קרן פנסיה ── */}
          {activeTab === 'pension' && (
            <div className="space-y-4">
              {pensionsArray.fields.map((field, index) => (
                <Card key={field.id}>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-slate-200">קרן פנסיה #{index + 1}</h4>
                    <Button type="button" variant="danger" size="sm" onClick={() => pensionsArray.remove(index)}>הסר</Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="שם הקרן / חברה" {...register(`pensions.${index}.providerName`)} placeholder="מנורה מבטחים" />
                    <Select label="בעלים" options={OWNER_OPTIONS} {...register(`pensions.${index}.owner`)} />
                    <Input label="שווי נוכחי (₪)" type="number" {...register(`pensions.${index}.currentValue`, { valueAsNumber: true })} prefix="₪" />
                    <Input label="הפרשת עובד/חודש (₪)" type="number" {...register(`pensions.${index}.monthlyEmployeeContribution`, { valueAsNumber: true })} prefix="₪" />
                    <Input label="הפרשת מעסיק/חודש (₪)" type="number" {...register(`pensions.${index}.monthlyEmployerContribution`, { valueAsNumber: true })} prefix="₪" />
                    <Input label="קצבה חזויה/חודש (₪)" type="number" {...register(`pensions.${index}.expectedMonthlyPension`, { valueAsNumber: true })} prefix="₪" />
                    <div className="sm:col-span-2">
                      <Input label="הערות (אופציונלי)" {...register(`pensions.${index}.notes`)} placeholder="הערות..." />
                    </div>
                  </div>
                </Card>
              ))}
              <Button type="button" variant="secondary" onClick={() => pensionsArray.append(emptyPension())}>
                + הוסף קרן פנסיה
              </Button>
            </div>
          )}

          {/* ── קרן השתלמות ── */}
          {activeTab === 'hishtalmut' && (
            <div className="space-y-4">
              {hishtalmutArray.fields.map((field, index) => (
                <Card key={field.id}>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-slate-200">קרן השתלמות #{index + 1}</h4>
                    <Button type="button" variant="danger" size="sm" onClick={() => hishtalmutArray.remove(index)}>הסר</Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="שם הקרן / חברה" {...register(`hishtalmuts.${index}.providerName`)} placeholder="פסגות" />
                    <Select label="בעלים" options={OWNER_OPTIONS} {...register(`hishtalmuts.${index}.owner`)} />
                    <Input label="שווי נוכחי (₪)" type="number" {...register(`hishtalmuts.${index}.currentValue`, { valueAsNumber: true })} prefix="₪" />
                    <div className="flex items-center gap-3 pt-5">
                      <Controller
                        control={control}
                        name={`hishtalmuts.${index}.isLiquid`}
                        render={({ field }) => (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={field.value} onChange={field.onChange} className="w-4 h-4 rounded accent-indigo-500" />
                            <span className="text-sm text-slate-300">הקרן נזילה (עברו 6 שנים)</span>
                          </label>
                        )}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input label="הערות" {...register(`hishtalmuts.${index}.notes`)} placeholder="הערות..." />
                    </div>
                  </div>
                </Card>
              ))}
              <Button type="button" variant="secondary" onClick={() => hishtalmutArray.append(emptyHishtalmut())}>
                + הוסף קרן השתלמות
              </Button>
            </div>
          )}

          {/* ── תיק השקעות ── */}
          {activeTab === 'investments' && (
            <div className="space-y-4">
              {investmentsArray.fields.map((field, index) => (
                <Card key={field.id}>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-slate-200">תיק השקעות #{index + 1}</h4>
                    <Button type="button" variant="danger" size="sm" onClick={() => investmentsArray.remove(index)}>הסר</Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="שם הברוקר" {...register(`investments.${index}.brokerName`)} placeholder="אינטראקטיב ברוקרס" />
                    <Select label="בעלים" options={OWNER_OPTIONS} {...register(`investments.${index}.owner`)} />
                    <Input label="שווי כולל (₪)" type="number" {...register(`investments.${index}.currentValue`, { valueAsNumber: true })} prefix="₪" />
                    <div className="sm:col-span-2">
                      <Input label="הערות" {...register(`investments.${index}.notes`)} placeholder="הערות..." />
                    </div>
                  </div>
                </Card>
              ))}
              <Button type="button" variant="secondary" onClick={() => investmentsArray.append(emptyInvestment())}>
                + הוסף תיק השקעות
              </Button>
            </div>
          )}

          {/* ── בנקים ── */}
          {activeTab === 'bank' && (
            <div className="space-y-4">
              {bankArray.fields.map((field, index) => {
                const isLinked =
                  watchedWages?.ariel?.bankAccountId === field.id ||
                  watchedWages?.inbar?.bankAccountId === field.id ||
                  watchedExpenses?.ariel?.bankAccountId === field.id ||
                  watchedExpenses?.inbar?.bankAccountId === field.id;

                return (
                  <Card key={field.id}>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-200">חשבון בנק #{index + 1}</h4>
                        {isLinked && (
                          <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                            חושב אוטומטית מיתרה קודמת + שכר – הוצאות
                          </span>
                        )}
                      </div>
                      <Button type="button" variant="danger" size="sm" onClick={() => bankArray.remove(index)}>הסר</Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="שם הבנק" {...register(`bankAccounts.${index}.bankName`)} placeholder="בנק הפועלים" />
                      <Select label="בעלים" options={OWNER_OPTIONS} {...register(`bankAccounts.${index}.owner`)} />
                      <Select label="סוג חשבון" options={ACCOUNT_TYPE_OPTIONS} {...register(`bankAccounts.${index}.accountType`)} />
                      <Input label="יתרה (₪)" type="number" {...register(`bankAccounts.${index}.currentBalance`, { valueAsNumber: true })} prefix="₪" />
                      <div className="sm:col-span-2">
                        <Input label="הערות" {...register(`bankAccounts.${index}.notes`)} placeholder="הערות..." />
                      </div>
                    </div>
                  </Card>
                );
              })}
              <Button type="button" variant="secondary" onClick={() => bankArray.append(emptyBank())}>
                + הוסף חשבון בנק
              </Button>
            </div>
          )}

          {/* ── שכר חודשי ── */}
          {activeTab === 'wages' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['ariel', 'inbar'] as const).map((person) => (
                <Card key={person}>
                  <h4 className="font-semibold text-slate-200 mb-4">
                    {person === 'ariel' ? 'אריאל' : 'ענבר'}
                  </h4>
                  <div className="space-y-4">
                    <Input
                      label="שכר חודשי נטו (₪)"
                      type="number"
                      prefix="₪"
                      {...register(`wages.${person}.amount`, { valueAsNumber: true })}
                    />
                    <Controller
                      control={control}
                      name={`wages.${person}.bankAccountId`}
                      render={({ field }) => (
                        <Select
                          label="חשבון בנק שמקבל את השכר"
                          options={bankOptions(watchedBankAccounts ?? [])}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </Card>
              ))}
              <p className="col-span-full text-xs text-slate-500">
                כשתחזרו לטאב &quot;בנקים&quot;, היתרה של החשבון המחובר תחושב אוטומטית: יתרה קודמת + שכר – הוצאות.
              </p>
            </div>
          )}

          {/* ── הוצאות חודשיות ── */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              {(['ariel', 'inbar'] as const).map((person) => (
                <ExpensePersonCard
                  key={person}
                  person={person}
                  control={control}
                  register={register}
                  bankAccounts={watchedBankAccounts ?? []}
                />
              ))}
            </div>
          )}

          {/* Save */}
          <div className="mt-6 flex items-center gap-4">
            <Button type="submit" loading={saving} size="lg">שמור נתונים</Button>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {saved && <p className="text-emerald-400 text-sm">✓ נשמר בהצלחה</p>}
          </div>
        </form>
      )}
    </div>
  );
}

// ── Expense person card ───────────────────────────────────────────────────────

interface ExpensePersonCardProps {
  person: 'ariel' | 'inbar';
  control: ReturnType<typeof useForm<FormValues>>['control'];
  register: ReturnType<typeof useForm<FormValues>>['register'];
  bankAccounts: BankAccount[];
}

function ExpensePersonCard({ person, control, register, bankAccounts }: ExpensePersonCardProps) {
  const personLabel = person === 'ariel' ? 'אריאל' : 'ענבר';
  const mode = useWatch({ control, name: `expenses.${person}.mode` });
  const categories = useWatch({ control, name: `expenses.${person}.categories` }) ?? [];
  const catArray = useFieldArray({ control, name: `expenses.${person}.categories` });

  const total = mode === 'total'
    ? undefined
    : categories.reduce((s: number, c: ExpenseCategory) => s + (c.amount ?? 0), 0);

  function addCustomCategory() {
    catArray.append({ id: generateId(), name: '', amount: 0, isCustom: true });
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-slate-200">{personLabel}</h4>
        {mode === 'breakdown' && total !== undefined && (
          <span className="text-sm text-slate-400">
            {'סה"כ: '}
            <span className="text-slate-200 font-semibold">
              ₪{total.toLocaleString()}
            </span>
          </span>
        )}
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-4">
        <Controller
          control={control}
          name={`expenses.${person}.mode`}
          render={({ field }) => (
            <>
              <button
                type="button"
                onClick={() => field.onChange('total')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition border ${
                  field.value === 'total'
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-slate-600 text-slate-400 hover:text-slate-200'
                }`}
              >
                {'סה"כ'}
              </button>
              <button
                type="button"
                onClick={() => field.onChange('breakdown')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition border ${
                  field.value === 'breakdown'
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-slate-600 text-slate-400 hover:text-slate-200'
                }`}
              >
                פירוט לפי קטגוריה
              </button>
            </>
          )}
        />
      </div>

      {/* Total mode */}
      {mode === 'total' && (
        <Input
          label="סך הוצאות חודשיות (₪)"
          type="number"
          prefix="₪"
          {...register(`expenses.${person}.totalOverride`, { valueAsNumber: true })}
        />
      )}

      {/* Breakdown mode */}
      {mode === 'breakdown' && (
        <div className="space-y-2">
          {catArray.fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              {field.isCustom ? (
                <input
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="שם קטגוריה"
                  {...register(`expenses.${person}.categories.${index}.name`)}
                />
              ) : (
                <span className="flex-1 text-sm text-slate-300 px-1">{field.name}</span>
              )}
              <div className="w-32">
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                  {...register(`expenses.${person}.categories.${index}.amount`, { valueAsNumber: true })}
                />
              </div>
              {field.isCustom && (
                <button
                  type="button"
                  onClick={() => catArray.remove(index)}
                  className="text-red-400 hover:text-red-300 text-sm px-1"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addCustomCategory}
            className="text-sm text-indigo-400 hover:text-indigo-300 mt-2"
          >
            + הוסף קטגוריה מותאמת אישית
          </button>
        </div>
      )}

      {/* Linked bank account */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <Controller
          control={control}
          name={`expenses.${person}.bankAccountId`}
          render={({ field }) => (
            <Select
              label="חשבון בנק לחיוב הוצאות"
              options={bankOptions(bankAccounts)}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>
    </Card>
  );
}
