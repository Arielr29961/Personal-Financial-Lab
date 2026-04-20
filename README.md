# Personal-Financial-Lab

A private decision-support web app to manage and analyze our household financial data.

## 🎯 Purpose
This app helps us:
- Track our full financial picture in one place
- Monitor trends over time
- Make better financial decisions using structured data

## 🧱 Core Features

### 📊 Current Financial Status (סטטוס פיננסי נוכחי)
- Consolidated view of all financial products
- Net worth calculation
- Breakdown by person (Ariel / Inbar / Joint)

### 📈 Financial Timeline (ציר זמן פיננסי)
- Historical tracking of financial data
- Trends and changes over time

### 🔄 Monthly Updates
- Manual data input (once per month)
- Supports:
  - Balance updates
  - New / removed financial products
  - Adjustments (gifts, transfers, etc.)

### 💼 Supported Financial Products
- Pension (קרן פנסיה)
- Hishtalmut (קרן השתלמות)
- Investment portfolios (תיק השקעות)
- Bank accounts & deposits (חשבון / פיקדון)

### 💰 Income Handling
- Monthly net salaries (Ariel + Inbar)
- Used to explain changes in net worth

## 🧩 Tech Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Upstash Redis (via Vercel)
- Recharts

## 🧠 Design Principles
- Clean, modern dashboard UI
- Hebrew (RTL) support
- Modular and extensible architecture
- No fake data — missing data is explicitly shown
- All insights traceable to real inputs

## 🔐 Access
- Private app (password protected)
- Intended for personal use only

## 🚀 Deployment
- Hosted on Vercel
- Connected to GitHub (private repo)

## 🛠️ Future Plans
- Simulations (mortgage, investments)
- Financial scenario modeling
- Macro data integration
- AI-based financial insights
