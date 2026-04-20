'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { currentYearMonth } from '@/lib/formatters';
import { HEBREW_MONTHS } from '@/lib/constants';
import type { MonthlySnapshot, Owner } from '@/types/financial';

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
  return { id: generateId(), owner: DEFAULT_OWNER, providerName: '', currentValue: 0, isLiquid: false, monthlyEmployeeContribution: 0, monthlyEmployerContribution: 0, notes: '' };
}
function emptyInvestment() {
  return { id: generateId(), owner: DEFAULT_OWNER, brokerName: '', currentValue: 0, cashComponent: 0, notes: '' };
}
function emptyBank() {
  return { id: generateId(), owner: DEFAULT_OWNER, bankName: '', accountType: 'checking' as const, currentBalance: 0, interestRate: undefined, maturityDate: '', notes: '' };
}

type TabId = 'pension' | 'hishtalmut' | 'investments' | 'bank';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'pension', label: 'קרן פנסיה', icon: '🏦' },
  { id: 'hishtalmut', label: 'קרן השתלמות', icon: '🎓' },
  { id: 'investments', label: 'תיק השקעות', icon: '📈' },
  { id: 'bank', label: 'בנקים', icon: '🏛️' },
];

export default function UpdatePage() {
  const [activeTab, setActiveTab] = useState<TabId>('pension');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(currentYearMonth());

  const { control, register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      yearMonth: currentYearMonth(),
      pensions: [],
      hishtalmuts: [],
      investments: [],
      bankAccounts: [],
    },
  });

  const pensionsArray = useFieldArray({ control, name: 'pensions' });
  const hishtalmutArray = useFieldArray({ control, name: 'hishtalmuts' });
  const investmentsArray = useFieldArray({ control, name: 'investments' });
  const bankArray = useFieldArray({ control, name: 'bankAccounts' });

  // Load existing snapshot for the selected month (or prior month as template)
  useEffect(() => {
    setLoading(true);
    fetch(`/api/snapshot/${selectedMonth}`)
      .then(async (r) => {
        if (r.ok) {
          const { snapshot } = await r.json();
          reset({ yearMonth: selectedMonth, ...snapshot });
        } else {
          // Try previous month as template
          const [year, month] = selectedMonth.split('-').map(Number);
          const prevMonth = month === 1
            ? `${year - 1}-12`
            : `${year}-${String(month - 1).padStart(2, '0')}`;
          const prevRes = await fetch(`/api/snapshot/${prevMonth}`);
          if (prevRes.ok) {
            const { snapshot } = await prevRes.json();
            // Pre-populate from prior month but with new month key
            reset({ yearMonth: selectedMonth, pensions: snapshot.pensions, hishtalmuts: snapshot.hishtalmuts, investments: snapshot.investments, bankAccounts: snapshot.bankAccounts });
          } else {
            reset({ yearMonth: selectedMonth, pensions: [], hishtalmuts: [], investments: [], bankAccounts: [] });
          }
        }
      })
      .finally(() => setLoading(false));
  }, [selectedMonth, reset]);

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

  // Build month selector options (last 24 months)
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
          {saved && (
            <Badge variant="green">✓ נשמר בהצלחה</Badge>
          )}
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

          {/* Pension Tab */}
          {activeTab === 'pension' && (
            <div className="space-y-4">
              {pensionsArray.fields.map((field, index) => (
                <Card key={field.id}>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-slate-200">קרן פנסיה #{index + 1}</h4>
                    <Button type="button" variant="danger" size="sm" onClick={() => pensionsArray.remove(index)}>
                      הסר
                    </Button>
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

          {/* Hishtalmut Tab */}
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
                    <Input label="הפרשת עובד/חודש (₪)" type="number" {...register(`hishtalmuts.${index}.monthlyEmployeeContribution`, { valueAsNumber: true })} prefix="₪" />
                    <Input label="הפרשת מעסיק/חודש (₪)" type="number" {...register(`hishtalmuts.${index}.monthlyEmployerContribution`, { valueAsNumber: true })} prefix="₪" />
                    <div className="flex items-center gap-3 mt-1">
                      <Controller
                        control={control}
                        name={`hishtalmuts.${index}.isLiquid`}
                        render={({ field }) => (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="w-4 h-4 rounded accent-indigo-500"
                            />
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

          {/* Investments Tab */}
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
                    <Input label="מזומן בתיק (₪)" type="number" {...register(`investments.${index}.cashComponent`, { valueAsNumber: true })} prefix="₪" />
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

          {/* Bank Tab */}
          {activeTab === 'bank' && (
            <div className="space-y-4">
              {bankArray.fields.map((field, index) => (
                <Card key={field.id}>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-slate-200">חשבון בנק #{index + 1}</h4>
                    <Button type="button" variant="danger" size="sm" onClick={() => bankArray.remove(index)}>הסר</Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="שם הבנק" {...register(`bankAccounts.${index}.bankName`)} placeholder="בנק הפועלים" />
                    <Select label="בעלים" options={OWNER_OPTIONS} {...register(`bankAccounts.${index}.owner`)} />
                    <Select label="סוג חשבון" options={ACCOUNT_TYPE_OPTIONS} {...register(`bankAccounts.${index}.accountType`)} />
                    <Input label="יתרה (₪)" type="number" {...register(`bankAccounts.${index}.currentBalance`, { valueAsNumber: true })} prefix="₪" />
                    <Input label="ריבית שנתית (%) — לפיקדון" type="number" step="0.01" {...register(`bankAccounts.${index}.interestRate`, { valueAsNumber: true })} prefix="%" />
                    <Input label="מועד פירעון — לפיקדון" type="date" {...register(`bankAccounts.${index}.maturityDate`)} />
                    <div className="sm:col-span-2">
                      <Input label="הערות" {...register(`bankAccounts.${index}.notes`)} placeholder="הערות..." />
                    </div>
                  </div>
                </Card>
              ))}
              <Button type="button" variant="secondary" onClick={() => bankArray.append(emptyBank())}>
                + הוסף חשבון בנק
              </Button>
            </div>
          )}

          {/* Save button */}
          <div className="mt-6 flex items-center gap-4">
            <Button type="submit" loading={saving} size="lg">
              שמור נתונים
            </Button>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {saved && <p className="text-emerald-400 text-sm">✓ נשמר בהצלחה</p>}
          </div>
        </form>
      )}
    </div>
  );
}
