"use client";

import { useEffect, useState } from "react";
import { Client, Expense } from "@prisma/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getRevenueForMonth, getLast6Months, getCurrentMonth } from "@/lib/revenue";
import { ExpenseManager } from "./ExpenseManager";

type Props = {
  clients: Client[];
  expenses: Expense[];
};

export function FinancialDashboard({ clients, expenses }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const currentMonth = getCurrentMonth();
  const last6 = getLast6Months();

  const monthRevenue = getRevenueForMonth(clients, currentMonth);
  const monthExpenses = expenses
    .filter((e) => e.month === currentMonth)
    .reduce((s, e) => s + e.amount, 0);
  const monthProfit = monthRevenue - monthExpenses;

  const chartData = last6.map((month) => {
    const revenue = getRevenueForMonth(clients, month);
    const exp = expenses
      .filter((e) => e.month === month)
      .reduce((s, e) => s + e.amount, 0);
    const label = month.slice(5); // "MM" from "YYYY-MM"
    return { month: label, revenue, expenses: exp, profit: revenue - exp };
  });

  const summaryCards = [
    {
      label: "Monthly Revenue",
      value: `$${monthRevenue.toLocaleString()}`,
      sub: "Derived from active retainers",
      loss: false,
    },
    {
      label: "Monthly Expenses",
      value: `$${monthExpenses.toLocaleString()}`,
      sub: "This month",
      loss: false,
    },
    {
      label: "Monthly Profit",
      value: `$${monthProfit.toLocaleString()}`,
      sub: monthProfit >= 0 ? "Net positive" : "Net loss",
      loss: monthProfit < 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl bg-slate/40 p-5 shadow-lg shadow-black/40 border border-white/5 border-t-[3px] border-t-accent/70"
          >
            <p className="text-[11px] uppercase tracking-[0.08em] text-white/50 font-medium">
              {card.label}
            </p>
            <p
              className={`mt-3 text-3xl font-bold mono-data ${
                card.loss ? "text-red-400" : "text-white"
              }`}
            >
              {card.value}
            </p>
            <p className="mt-1 text-xs text-white/50">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="rounded-3xl border border-white/5 bg-slate/60 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Last 6 Months</h2>
          <p className="text-sm text-white/60">
            Revenue auto-derived from active client retainers
          </p>
        </div>
        {mounted && (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
              >
                <XAxis
                  dataKey="month"
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                  }
                />
                <Tooltip
                  contentStyle={{
                    background: "#1C1F26",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                  formatter={(value: number) => [
                    `$${value.toLocaleString()}`,
                    "",
                  ]}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.6)",
                  }}
                />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#FFD23F"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="profit"
                  name="Profit"
                  fill="rgba(255,210,63,0.35)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Expense manager */}
      <div className="rounded-3xl border border-white/5 bg-slate/60 p-6">
        <p className="text-xs text-white/40 italic mb-4">
          Note: Monthly revenue is auto-derived from active client retainers.
          No manual revenue entry needed.
        </p>
        <ExpenseManager expenses={expenses} />
      </div>
    </div>
  );
}
