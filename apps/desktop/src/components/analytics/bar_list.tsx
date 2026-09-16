"use client";

import type { BreakdownItem } from "../../types/analytics";
import { formatBRL, formatShare, useChartTheme } from "./chart_theme";
import { EmptyState } from "./empty_state";

interface BarListProps {
  items: BreakdownItem[];
  total: number;
  /** Acima disso, o restante é agrupado em "Outros". */
  maxItems?: number;
  labelMap?: Record<string, string>;
  emptyText?: string;
}

/**
 * Barras horizontais de série única, com valor e participação visíveis.
 * Por ser HTML, também serve como a "visão em tabela" do gráfico.
 */
export function BarList({
  items,
  total,
  maxItems = 8,
  labelMap,
  emptyText = "Sem dados no período.",
}: BarListProps) {
  const t = useChartTheme();

  if (!items.length || total <= 0) return <EmptyState text={emptyText} />;

  const head = items.slice(0, maxItems);
  const tail = items.slice(maxItems);
  const rows: BreakdownItem[] = tail.length
    ? [
        ...head,
        {
          label: "Outros",
          total: tail.reduce((s, i) => s + i.total, 0),
          count: tail.reduce((s, i) => s + i.count, 0),
          share: tail.reduce((s, i) => s + i.share, 0),
        },
      ]
    : head;

  const max = Math.max(...rows.map((r) => r.total), 0);

  return (
    <ul role="list" className="space-y-2.5">
      {rows.map((row) => {
        const label = labelMap?.[row.label] ?? row.label;
        const width = max > 0 ? (row.total / max) * 100 : 0;
        const plural = row.count === 1 ? "lançamento" : "lançamentos";
        return (
          <li
            key={row.label}
            title={`${label}: ${formatBRL(row.total)} (${formatShare(row.share)}) · ${row.count} ${plural}`}
            className="group grid grid-cols-[minmax(0,9.5rem)_1fr_auto] items-center gap-3 text-sm"
          >
            <span className="truncate text-slate-700 dark:text-slate-200">{label}</span>
            <div className="flex h-6 items-center">
              <div
                className="h-3 rounded-r-[4px] transition-[width,filter] duration-300 group-hover:brightness-110"
                style={{ width: `${width}%`, minWidth: row.total > 0 ? 4 : 0, background: t.bar }}
              />
            </div>
            <span className="whitespace-nowrap text-right tabular-nums">
              <strong className="font-semibold text-slate-800 dark:text-slate-100">{formatBRL(row.total)}</strong>
              <span className="ml-2 inline-block w-12 text-xs text-slate-400 dark:text-slate-500">
                {formatShare(row.share)}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
