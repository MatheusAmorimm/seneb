"use client";

import { useCallback, useEffect, useState } from "react";
import { useWorkspaceContext } from "../context/workspace_context";
import { todayYMD } from "../lib/dates";
import { fetchBreakdown, fetchMonthlyTrend, fetchSummary, fetchUpcomingDue } from "../services/analytics";
import type { AnalyticsQuery, AnalyticsSummary, Breakdown, MonthlyPoint, UpcomingDue } from "../types/analytics";

export interface AnalyticsData {
  summary: AnalyticsSummary;
  byCategory: Breakdown;
  bySubcategory: Breakdown;
  byPayment: Breakdown;
  trend: MonthlyPoint[];
  upcoming: UpcomingDue;
}

const TREND_MONTHS = 12;
const UPCOMING_DAYS = 30;

export function useAnalytics(query: AnalyticsQuery) {
  // Entra nas dependências para refazer a busca quando o workspace muda;
  // o group_id em si é injetado pelo interceptor do api.ts.
  const { activeGroupId } = useWorkspaceContext();
  const { from, to, includeDrafts } = query;

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const q: AnalyticsQuery = { from, to, includeDrafts };
    try {
      const [summary, byCategory, bySubcategory, byPayment, trend, upcoming] = await Promise.all([
        fetchSummary(q),
        fetchBreakdown(q, "category", "expense", 12),
        fetchBreakdown(q, "subcategory", "expense", 10),
        fetchBreakdown(q, "payment_method", "expense", 8),
        fetchMonthlyTrend(to, TREND_MONTHS, includeDrafts),
        fetchUpcomingDue(todayYMD(), UPCOMING_DAYS),
      ]);
      setData({ summary, byCategory, bySubcategory, byPayment, trend, upcoming });
    } catch (err) {
      console.error("Erro ao carregar análises", err);
      setError("Não foi possível carregar as análises. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, includeDrafts, activeGroupId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, refetch: load };
}
