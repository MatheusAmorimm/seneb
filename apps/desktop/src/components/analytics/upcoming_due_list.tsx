"use client";

import { CalendarClock } from "lucide-react";
import type { UpcomingDue } from "../../types/analytics";
import { formatDateBR } from "../../lib/dates";
import { PAYMENT_LABELS, formatBRL } from "./chart_theme";
import { EmptyState } from "./empty_state";

function daysChip(days: number) {
  if (days <= 0) return { text: "hoje", cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" };
  if (days <= 3) return { text: `${days}d`, cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" };
  if (days <= 7) return { text: `${days}d`, cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" };
  return { text: `${days}d`, cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" };
}

export function UpcomingDueList({ data }: { data: UpcomingDue }) {
  if (!data.items.length) return <EmptyState text="Nenhum vencimento nos próximos 30 dias." />;

  return (
    <div>
      <ul role="list" className="divide-y divide-slate-100 dark:divide-slate-800">
        {data.items.map((item) => {
          const chip = daysChip(item.days_left);
          const title = item.description || item.subcategory || item.category;
          const meta = [item.category, item.payment_method ? PAYMENT_LABELS[item.payment_method] ?? item.payment_method : null, item.bank]
            .filter(Boolean)
            .join(" · ");
          return (
            <li key={item.transaction_id} className="flex items-center gap-3 py-2.5 text-sm">
              <span className={`w-12 shrink-0 rounded-md px-2 py-0.5 text-center text-[11px] font-bold ${chip.cls}`}>{chip.text}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-800 dark:text-slate-100">{title}</p>
                <p className="truncate text-xs text-slate-400 dark:text-slate-500">{meta}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-semibold tabular-nums text-slate-800 dark:text-slate-100">{formatBRL(item.amount)}</p>
                <p className="flex items-center justify-end gap-1 text-xs text-slate-400 dark:text-slate-500">
                  <CalendarClock size={11} /> {formatDateBR(item.due_date)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
        <span className="text-slate-500 dark:text-slate-400">Total a vencer</span>
        <strong className="tabular-nums text-slate-800 dark:text-slate-100">{formatBRL(data.total)}</strong>
      </div>
    </div>
  );
}
