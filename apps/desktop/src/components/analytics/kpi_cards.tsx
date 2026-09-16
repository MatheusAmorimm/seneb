"use client";

import { ArrowDownCircle, ArrowUpCircle, DollarSign, PiggyBank, Target, TrendingDown, TrendingUp } from "lucide-react";
import type { AnalyticsSummary } from "../../types/analytics";
import { formatBRL, formatShare, formatSignedPct, useChartTheme } from "./chart_theme";

interface DeltaChipProps {
  value: number | null;
  /** Para despesas, subir é ruim. */
  upIsGood: boolean;
}

function DeltaChip({ value, upIsGood }: DeltaChipProps) {
  const t = useChartTheme();
  if (value === null) {
    return <span className="text-[11px] text-slate-400 dark:text-slate-500">sem base anterior</span>;
  }
  const isUp = value > 0;
  const isFlat = value === 0;
  const good = isFlat ? null : isUp === upIsGood;
  const color = good === null ? t.inkMuted : good ? t.deltaGood : t.deltaBad;
  const Icon = isUp ? TrendingUp : TrendingDown;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color }}>
      {!isFlat && <Icon size={12} strokeWidth={2.5} />}
      {formatSignedPct(value)}
      <span className="font-normal text-slate-400 dark:text-slate-500">vs. anterior</span>
    </span>
  );
}

interface TileProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  accentClass: string;
  children?: React.ReactNode;
}

function Tile({ label, value, icon, accentClass, children }: TileProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#012a3d]">
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded-lg p-1.5 text-white ${accentClass}`}>{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-800 dark:text-slate-50">{value}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export function KpiCards({ summary }: { summary: AnalyticsSummary }) {
  const t = useChartTheme();
  const { current, delta_pct } = summary;
  const rate = Math.max(0, Math.min(current.savings_rate, 1));

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <Tile label="Receitas" value={formatBRL(current.income)} icon={<ArrowUpCircle size={16} />} accentClass="bg-[#10b981]">
        <DeltaChip value={delta_pct.income} upIsGood />
      </Tile>
      <Tile label="Despesas" value={formatBRL(current.expense)} icon={<ArrowDownCircle size={16} />} accentClass="bg-[#ff9966]">
        <DeltaChip value={delta_pct.expense} upIsGood={false} />
      </Tile>
      <Tile label="Guardado em metas" value={formatBRL(current.goal_saved)} icon={<Target size={16} />} accentClass="bg-[#f59e0b]">
        <DeltaChip value={delta_pct.goal_saved} upIsGood />
      </Tile>
      <Tile label="Saldo" value={formatBRL(current.balance)} icon={<DollarSign size={16} />} accentClass="bg-[#2C6B74]">
        <DeltaChip value={delta_pct.balance} upIsGood />
      </Tile>
      <Tile label="Taxa de poupança" value={formatShare(rate)} icon={<PiggyBank size={16} />} accentClass="bg-[#013750]">
        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full"
          style={{ background: t.meterTrack }}
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(rate * 100)}
          aria-label="Taxa de poupança"
        >
          <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${rate * 100}%`, background: t.meterFill }} />
        </div>
        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">do que entrou sobrou no período</p>
      </Tile>
    </div>
  );
}
