"use client";

import { useState } from "react";
import { Table2, BarChart3 } from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyPoint } from "../../types/analytics";
import { formatMonthLabel } from "../../lib/dates";
import { formatBRL, formatBRLCompact, useChartTheme } from "./chart_theme";
import { EmptyState } from "./empty_state";

const SERIES = [
  { key: "income", label: "Receitas", kind: "bar" },
  { key: "expense", label: "Despesas", kind: "bar" },
  { key: "balance", label: "Saldo", kind: "line" },
] as const;

type SeriesKey = (typeof SERIES)[number]["key"];

interface TooltipPayloadItem {
  dataKey?: string | number;
  value?: number | string;
  color?: string;
}

interface TrendTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<TooltipPayloadItem>;
}

function TrendTooltip({ active, label, payload }: TrendTooltipProps) {
  const t = useChartTheme();
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs shadow-lg"
      style={{ background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, color: t.ink }}
    >
      <p className="mb-1 font-semibold" style={{ color: t.inkSecondary }}>
        {formatMonthLabel(String(label ?? ""))}
      </p>
      <ul className="space-y-0.5">
        {SERIES.map((s) => {
          const item = payload.find((p) => p.dataKey === s.key);
          if (!item) return null;
          return (
            <li key={s.key} className="flex items-center gap-2">
              <span className="inline-block h-0.5 w-3 rounded" style={{ background: item.color }} />
              <strong className="tabular-nums">{formatBRL(Number(item.value ?? 0))}</strong>
              <span style={{ color: t.inkSecondary }}>{s.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function MonthlyTrendChart({ points }: { points: MonthlyPoint[] }) {
  const t = useChartTheme();
  const [showTable, setShowTable] = useState(false);

  const hasData = points.some((p) => p.income || p.expense || p.goal_saved);
  if (!hasData) return <EmptyState text="Ainda não há lançamentos nos últimos 12 meses." />;

  const colorOf: Record<SeriesKey, string> = { income: t.income, expense: t.expense, balance: t.balance };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
          {SERIES.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5">
              {s.kind === "bar" ? (
                <span className="inline-block h-3 w-3 rounded-[3px]" style={{ background: colorOf[s.key] }} />
              ) : (
                <span className="inline-block h-0.5 w-4 rounded" style={{ background: colorOf[s.key] }} />
              )}
              {s.label}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
        >
          {showTable ? <BarChart3 size={14} /> : <Table2 size={14} />}
          {showTable ? "Ver gráfico" : "Ver tabela"}
        </button>
      </div>

      {showTable ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-2 pr-4 font-semibold">Mês</th>
                <th className="py-2 pr-4 text-right font-semibold">Receitas</th>
                <th className="py-2 pr-4 text-right font-semibold">Despesas</th>
                <th className="py-2 pr-4 text-right font-semibold">Metas</th>
                <th className="py-2 text-right font-semibold">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 tabular-nums">
              {points.map((p) => (
                <tr key={p.month} className="text-slate-700 dark:text-slate-200">
                  <td className="py-2 pr-4">{formatMonthLabel(p.month)}</td>
                  <td className="py-2 pr-4 text-right">{formatBRL(p.income)}</td>
                  <td className="py-2 pr-4 text-right">{formatBRL(p.expense)}</td>
                  <td className="py-2 pr-4 text-right">{formatBRL(p.goal_saved)}</td>
                  <td className="py-2 text-right font-semibold">{formatBRL(p.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={points} barGap={2} barCategoryGap="30%" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={t.grid} strokeWidth={1} />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonthLabel}
                tick={{ fill: t.inkMuted, fontSize: 11 }}
                axisLine={{ stroke: t.axis }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => formatBRLCompact(v)}
                tick={{ fill: t.inkMuted, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={72}
              />
              <Tooltip content={<TrendTooltip />} cursor={{ fill: t.grid, opacity: 0.5 }} />
              <Bar dataKey="income" name="Receitas" fill={t.income} barSize={14} radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Despesas" fill={t.expense} barSize={14} radius={[4, 4, 0, 0]} />
              <Line
                type="monotone"
                dataKey="balance"
                name="Saldo"
                stroke={t.balance}
                strokeWidth={2}
                dot={{ r: 4, fill: t.balance, stroke: t.surface, strokeWidth: 2 }}
                activeDot={{ r: 6, stroke: t.surface, strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
