"use client";

import { useState } from "react";
import { Expense, MonthlyRevenue } from "@prisma/client";
import { FinancialDetail } from "./FinancialDetail";
import { ExpenseManager } from "./ExpenseManager";

type Props = {
  expenses: Expense[];
  revenues: MonthlyRevenue[];
};

export function FinancialSummary({ expenses, revenues }: Props) {
  const [showDetail, setShowDetail] = useState(false);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthRevenue = revenues.find((r) => r.month === currentMonth)?.revenue ?? 0;
  const monthExpenses = expenses.filter((e) => e.month === currentMonth).reduce((s, e) => s + e.amount, 0);
  const monthProfit = monthRevenue - monthExpenses;

  const cards = [
    { label: "Monthly Revenue", value: `$${monthRevenue.toLocaleString()}`, sub: "This month" },
    { label: "Expenses", value: `$${monthExpenses.toLocaleString()}`, sub: "This month" },
    { label: "Profit", value: `$${monthProfit.toLocaleString()}`, sub: monthProfit >= 0 ? "Net positive" : "Net loss", loss: monthProfit < 0 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.label}
            onClick={() => setShowDetail((v) => !v)}
            className="rounded-2xl border border-white/5 bg-slate/40 p-4 shadow-lg shadow-black/40 text-left hover:border-accent/30 transition-colors active:scale-[0.98]"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">{card.label}</p>
            <p className={`mt-2 text-2xl font-semibold ${card.loss ? "text-red-400" : "text-white"}`}>{card.value}</p>
            <p className="text-sm text-white/60">{card.sub}</p>
          </button>
        ))}
      </div>

      {showDetail && (
        <div className="rounded-3xl border border-white/5 bg-slate/60 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">P&amp;L Overview</h2>
              <p className="text-sm text-white/60">Month-by-month breakdown</p>
            </div>
            <button onClick={() => setShowDetail(false)} className="text-white/40 hover:text-white text-2xl leading-none">×</button>
          </div>
          <FinancialDetail expenses={expenses} revenues={revenues} />
          <div className="border-t border-white/5 pt-4">
            <ExpenseManager expenses={expenses} />
          </div>
        </div>
      )}
    </div>
  );
}
