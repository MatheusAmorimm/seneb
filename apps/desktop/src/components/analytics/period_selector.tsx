"use client";

import { useState } from "react";
import { CalendarRange } from "lucide-react";
import { AppDateInput } from "../ui/app_date_input";
import type { AnalyticsQuery } from "../../types/analytics";
import { monthsAgoStartYMD, startOfMonthYMD, todayYMD } from "../../lib/dates";

export type PeriodPreset = "month" | "3m" | "6m" | "12m" | "custom";

const PRESETS: { key: PeriodPreset; label: string }[] = [
  { key: "month", label: "Este mês" },
  { key: "3m", label: "3 meses" },
  { key: "6m", label: "6 meses" },
  { key: "12m", label: "12 meses" },
  { key: "custom", label: "Personalizado" },
];

export function presetToRange(preset: PeriodPreset): { from: string; to: string } {
  const to = todayYMD();
  switch (preset) {
    case "3m":
      return { from: monthsAgoStartYMD(3), to };
    case "6m":
      return { from: monthsAgoStartYMD(6), to };
    case "12m":
      return { from: monthsAgoStartYMD(12), to };
    default:
      return { from: startOfMonthYMD(), to };
  }
}

interface PeriodSelectorProps {
  value: AnalyticsQuery;
  preset: PeriodPreset;
  onChange: (next: AnalyticsQuery, preset: PeriodPreset) => void;
}

/** Linha única de filtros acima de todos os gráficos: período primeiro, depois o toggle. */
export function PeriodSelector({ value, preset, onChange }: PeriodSelectorProps) {
  const [customFrom, setCustomFrom] = useState(value.from);
  const [customTo, setCustomTo] = useState(value.to);

  const selectPreset = (key: PeriodPreset) => {
    if (key === "custom") {
      onChange({ ...value, from: customFrom, to: customTo }, "custom");
      return;
    }
    onChange({ ...value, ...presetToRange(key) }, key);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#012a3d]">
      <CalendarRange size={18} className="text-[#00988D]" />
      <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => selectPreset(p.key)}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              preset === p.key
                ? "bg-white text-[#013750] shadow-sm dark:bg-slate-800 dark:text-slate-100"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="w-40">
            <AppDateInput
              value={customFrom}
              max={customTo}
              onChange={(v) => {
                setCustomFrom(v);
                if (v && customTo) onChange({ ...value, from: v, to: customTo }, "custom");
              }}
            />
          </div>
          <span className="text-xs text-slate-400">até</span>
          <div className="w-40">
            <AppDateInput
              value={customTo}
              min={customFrom}
              onChange={(v) => {
                setCustomTo(v);
                if (customFrom && v) onChange({ ...value, from: customFrom, to: v }, "custom");
              }}
            />
          </div>
        </div>
      )}

      <label className="ml-auto flex cursor-pointer select-none items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
        <input
          type="checkbox"
          checked={value.includeDrafts}
          onChange={(e) => onChange({ ...value, includeDrafts: e.target.checked }, preset)}
          className="h-4 w-4 accent-[#00988D]"
        />
        Incluir mês em aberto
      </label>
    </div>
  );
}
