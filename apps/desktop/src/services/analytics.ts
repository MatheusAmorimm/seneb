import api from "./api";
import type {
  AnalyticsQuery,
  AnalyticsSummary,
  Breakdown,
  BreakdownDimension,
  BreakdownKind,
  MonthlyPoint,
  UpcomingDue,
} from "../types/analytics";

// O `group_id` do workspace ativo é injetado pelo interceptor em api.ts.

const periodParams = (q: AnalyticsQuery) => ({
  from: q.from,
  to: q.to,
  include_drafts: q.includeDrafts,
});

export async function fetchSummary(q: AnalyticsQuery): Promise<AnalyticsSummary> {
  const { data } = await api.get<AnalyticsSummary>("/analytics/summary", { params: periodParams(q) });
  return data;
}

export async function fetchBreakdown(
  q: AnalyticsQuery,
  dimension: BreakdownDimension,
  kind: BreakdownKind = "expense",
  limit = 10,
): Promise<Breakdown> {
  const { data } = await api.get<Breakdown>("/analytics/breakdown", {
    params: { ...periodParams(q), dimension, kind, limit },
  });
  return data;
}

export async function fetchMonthlyTrend(
  end: string,
  months: number,
  includeDrafts: boolean,
): Promise<MonthlyPoint[]> {
  const { data } = await api.get<{ points: MonthlyPoint[] }>("/analytics/monthly-trend", {
    params: { end, months, include_drafts: includeDrafts },
  });
  return data.points;
}

export async function fetchUpcomingDue(from: string, days = 30): Promise<UpcomingDue> {
  const { data } = await api.get<UpcomingDue>("/analytics/upcoming-due", { params: { from, days } });
  return data;
}
