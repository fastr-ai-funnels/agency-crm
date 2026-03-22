"use client";

import { useEffect, useState, useTransition } from "react";
import { Expense, MonthlyRevenue } from "@prisma/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { upsertMonthlyRevenue } from "@/lib/actions";

type Props = {
  expenses: Expense[];
  revenues: MonthlyRevenue[];
};

export function FinancialDetail({ expenses, revenues }: Props) {
  const [mounted, setMounted] = useState(false);
  const [editRevenue, setEditRevenue] = useState<Record<string, string>>({});
  const [, startTransition] = useTransition();

  useEffect(() => setMounted(true), []);

  const months = Array.from(
    new Set([...revenues.map((r) => r.month), ...expenses.map((e) => e.month)])
  ).sort();

  const data = months.map((month) => {
    const rev = revenues.find((r) => r.month === month)?.revenue ?? 0;
    const exp = expenses.filter((e) => e.month === month).reduce((s, e) => s + e.amount, 0);
    return { month, revenue: rev, expenses: exp, profit: rev - exp };
  });

  function saveRevenue(month: string) {
    const raw = editRevenue[month];
    if (raw === undefined) return;
    const val = Number(raw);
    if (isNaN(val)) return;
    startTransition(() => upsertMonthlyRevenue(month, val));
  }

  return (
    <div className="space-y-6">
      {mounted && data.length > 0 && (
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#1C1F26", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }} />
              <Bar dataKey="revenue" name="Revenue" fill="#FFD23F" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="Profit" fill="rgba(255,210,63,0.35)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">Monthly Breakdown</p>
        {data.length === 0 && <p className="text-sm text-white/40">No data yet — add revenue or expenses below.</p>}
        {data.map((row) => (
          <div key={row.month} className="grid grid-cols-4 gap-3 items-center text-sm py-2 border-b border-white/5">
            <span className="text-white/60">{row.month}</span>
            <input
              type="number"
              className="input text-xs py-1"
              value={editRevenue[row.month] ?? row.revenue}
              onChange={(e) => setEditRevenue((p) => ({ ...p, [row.month]: e.target.value }))}
              onBlur={() => saveRevenue(row.month)}
              onKeyDown={(e) => { if (e.key === "Enter") saveRevenue(row.month); }}
              placeholder="Revenue"
            />
            <span className="text-white/60 text-xs">${row.expenses.toLocaleString()} exp</span>
            <span className={`font-semibold ${row.profit >= 0 ? "text-accent" : "text-red-400"}`}>${row.profit.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Month (2026-04)"
          id="newMonth"
          className="input text-sm flex-1"
        />
        <input
          type="number"
          placeholder="Revenue"
          id="newRevenue"
          className="input text-sm flex-1"
        />
        <button
          onClick={() => {
            const m = (document.getElementById("newMonth") as HTMLInputElement)?.value.trim();
            const r = Number((document.getElementById("newRevenue") as HTMLInputElement)?.value);
            if (!m || isNaN(r)) return;
            startTransition(() => upsertMonthlyRevenue(m, r));
            (document.getElementById("newMonth") as HTMLInputElement).value = "";
            (document.getElementById("newRevenue") as HTMLInputElement).value = "";
          }}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-white active:scale-95 transition-transform whitespace-nowrap"
        >
          + Month
        </button>
      </div>
    </div>
  );
}
