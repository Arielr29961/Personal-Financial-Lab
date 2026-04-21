import type { Owner } from '@/types/financial';

export const OWNER_LABELS: Record<Owner, string> = {
  ariel: 'אריאל',
  inbar: 'ענבר',
  joint: 'משותף',
};

export const PRODUCT_TYPE_LABELS = {
  pension: 'קרן פנסיה',
  hishtalmut: 'קרן השתלמות',
  investments: 'תיק השקעות',
  bank: 'בנקים ופיקדונות',
} as const;

export const BANK_ACCOUNT_TYPE_LABELS = {
  checking: 'עובר ושב',
  savings: 'חסכון',
  deposit: 'פיקדון',
} as const;

export const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

// Default expense categories (fixed + user can add custom)
export const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'housing',   name: 'שכירה / משכנתא' },
  { id: 'food',      name: 'מזון וסופר' },
  { id: 'transport', name: 'תחבורה' },
  { id: 'bills',     name: 'חשבונות ושירותים' },
  { id: 'leisure',   name: 'בילוי ופנאי' },
  { id: 'clothing',  name: 'ביגוד והנעלה' },
  { id: 'health',    name: 'טיפול רפואי' },
  { id: 'education', name: 'חינוך' },
  { id: 'other',     name: 'אחר' },
] as const;

// Redis key helpers
export const REDIS_KEYS = {
  snapshotIndex: 'snapshot:index',
  snapshot: (yearMonth: string) => `snapshot:${yearMonth}`,
  settings: 'settings',
} as const;
