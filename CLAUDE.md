# מעבדה פיננסית — Financial Dashboard

## What This Is
A personal financial tracking dashboard for Ariel (אריאל) and Inbar (ענבר), an Israeli couple.
Tracks pension (קרן פנסיה), hishtalmut (קרן השתלמות), investment portfolios (תיק השקעות), and bank accounts/deposits.
Updated monthly via in-app form. Deployed to Vercel. Accessed by both via shared URL + single password.

## Stack
- **Next.js 14** (App Router) — frontend + API routes in one codebase
- **Tailwind CSS 3** — styling, RTL via `dir="rtl"` on `<html>`
- **Recharts 2** — financial charts
- **React Hook Form 7** — monthly update form with dynamic field arrays
- **Upstash Redis** via `@upstash/redis` — JSON data storage
- **jose 5** — JWT authentication (single shared password)

## Critical Rules

### Hebrew UI
- ALL UI text must be in Hebrew. Never add English strings to the UI.
- The HTML root has `dir="rtl"` and `lang="he"`. Layout is RTL.
- Always use `ms-` (margin-start) and `me-` (margin-end) instead of `ml-`/`mr-` for RTL-safe spacing.
- Currency: always use `formatILS()` from `src/lib/formatters.ts`.

### Data Storage
- Data is stored in **Upstash Redis** as JSON objects.
- Key schema: `snapshot:index` (list of months), `snapshot:YYYY-MM` (monthly data), `settings` (wages).
- All Redis access goes through helpers in `src/lib/redis.ts`.
- Never use Vercel filesystem for data — it's ephemeral/read-only in production.
- Computed summaries (`MonthSummary`, `OwnerSummary`) are NEVER stored — always derived from snapshots via `computeMonthSummary()` in `src/lib/calculations.ts`.

### Auth
- Single shared password in env var `DASHBOARD_PASSWORD`.
- JWT signed with `JWT_SECRET`. Cookie `auth_token`, 30-day expiry, httpOnly.
- Auth guard in `src/middleware.ts` — intercepts all routes except `/login` and `/api/auth`.
- Do NOT use NextAuth or any user-account system.

## Israeli Financial Products
- **קרן פנסיה (Pension):** Has employer + employee contributions and `expectedMonthlyPension` (a projection, not guaranteed).
- **קרן השתלמות (Hishtalmut):** Tax-advantaged savings. `isLiquid: boolean` = whether the 6-year lock-up has passed. Locked funds are excluded from `liquidNetWorth`.
- **תיק השקעות (Investment Portfolio):** Track total value + cash component separately.
- **Bank accounts:** Include deposits (פיקדון) with `maturityDate` and `interestRate`.

## File Map
```
src/
  types/financial.ts    — all TypeScript interfaces
  lib/
    redis.ts            — Upstash Redis helpers
    auth.ts             — JWT sign/verify, password check
    calculations.ts     — computeMonthSummary(), computeOwnerSummary()
    formatters.ts       — formatILS(), formatHebrewMonth(), etc.
    constants.ts        — Hebrew labels, OWNER_LABELS, REDIS_KEYS
  middleware.ts         — JWT auth guard
  app/
    layout.tsx          — root layout: RTL, Heebo font, dark bg
    login/page.tsx      — password entry
    (dashboard)/        — protected route group
      layout.tsx        — Sidebar + Header shell
      page.tsx          — overview (net worth, charts)
      pension/          — pension detail
      hishtalmut/       — hishtalmut detail
      investments/      — investments detail
      bank/             — bank accounts detail
      update/           — monthly update form
      history/          — historical table + net worth chart
      settings/         — wages + JSON export
    api/
      auth/             — POST: validate password, set cookie
      snapshot/         — GET latest, POST save
      snapshot/[ym]/    — GET specific month
      history/          — GET all months summaries
      settings/         — GET/PUT wages
      export/           — GET: download all data as JSON
  components/
    ui/                 — Card, Button, Input, Select, Badge, Spinner
    layout/             — Sidebar, Header
    charts/             — NetWorthChart, AllocationPie, PersonBar, ProductTrendLine
    summary/            — NetWorthCard, ProductCard, IncomeCard
```

## Running Locally
1. Copy env vars from Vercel: `vercel env pull .env.local`
2. `npm run dev` → runs on localhost:3000

## Deploy
Push to `main` → Vercel auto-deploys. No manual step needed.

## Monthly Update Workflow
1. Ariel extracts data from each financial product website
2. Opens `/update`, selects current month (previous month's data is pre-populated)
3. Updates the balance for each product
4. Clicks "שמור נתונים"
5. Data appears immediately on the dashboard

## Env Vars Required
- `UPSTASH_REDIS_REST_URL` — from Upstash dashboard
- `UPSTASH_REDIS_REST_TOKEN` — from Upstash dashboard
- `DASHBOARD_PASSWORD` — shared password for Ariel + Inbar
- `JWT_SECRET` — 32+ char random string
