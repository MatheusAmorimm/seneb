"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BarChart3, RefreshCw } from "lucide-react";
import { WorkspaceTabs } from "../../../../components/workspace_tabs";
import { PeriodSelector, presetToRange, type PeriodPreset } from "../../../../components/analytics/period_selector";
import { KpiCards } from "../../../../components/analytics/kpi_cards";
import { BarList } from "../../../../components/analytics/bar_list";
import { MonthlyTrendChart } from "../../../../components/analytics/monthly_trend_chart";
import { UpcomingDueList } from "../../../../components/analytics/upcoming_due_list";
import { PAYMENT_LABELS } from "../../../../components/analytics/chart_theme";
import { useAnalytics } from "../../../../hooks/use_analytics";
import type { AnalyticsQuery } from "../../../../types/analytics";

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#012a3d]">
      <h2 className="font-serif text-lg font-bold text-[#013750] dark:text-slate-100">{title}</h2>
      {subtitle && <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      {children}
    </section>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [preset, setPreset] = useState<PeriodPreset>("month");
  const [query, setQuery] = useState<AnalyticsQuery>({ ...presetToRange("month"), includeDrafts: true });
  const { data, isLoading, error, refetch } = useAnalytics(query);

  const isFirstLoad = isLoading && !data;

  return (
    <div className="space-y-6 pb-16">
      <WorkspaceTabs />

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#013750] dark:hover:bg-slate-800 dark:hover:text-slate-100"
            title="Voltar para Home"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="flex items-center gap-3 font-serif text-3xl font-bold text-[#013750] dark:text-slate-50">
              <BarChart3 className="text-[#00988D]" size={30} /> Análises
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Para onde o seu dinheiro está indo e como isso evolui mês a mês.
            </p>
          </div>
        </div>
        <button
          onClick={refetch}
          disabled={isLoading}
          className="flex cursor-pointer items-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 md:self-auto"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Atualizar
        </button>
      </div>

      <PeriodSelector
        value={query}
        preset={preset}
        onChange={(next, p) => {
          setQuery(next);
          setPreset(p);
        }}
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      )}

      {isFirstLoad && (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#00988D]" />
        </div>
      )}

      {data && (
        <div className={`space-y-6 transition-opacity duration-200 ${isLoading ? "pointer-events-none opacity-60" : "opacity-100"}`}>
          <KpiCards summary={data.summary} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card title="Despesas por categoria" subtitle="Onde está a maior fatia do período">
              <BarList items={data.byCategory.items} total={data.byCategory.total} maxItems={8} />
            </Card>
            <Card title="Maiores subcategorias" subtitle="As 10 subcategorias que mais pesaram">
              <BarList items={data.bySubcategory.items} total={data.bySubcategory.total} maxItems={10} />
            </Card>
          </div>

          <Card title="Evolução mensal" subtitle="Receitas, despesas e saldo nos últimos 12 meses">
            <MonthlyTrendChart points={data.trend} />
          </Card>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card title="Por meio de pagamento" subtitle="Como as despesas foram pagas">
              <BarList
                items={data.byPayment.items}
                total={data.byPayment.total}
                maxItems={6}
                labelMap={PAYMENT_LABELS}
                emptyText="Sem despesas com meio de pagamento informado."
              />
            </Card>
            <Card title="Próximos vencimentos" subtitle="Contas em aberto nos próximos 30 dias">
              <UpcomingDueList data={data.upcoming} />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
