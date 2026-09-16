export interface AnalyticsTotals {
  income: number;
  expense: number;
  goal_saved: number;
  balance: number;
  savings_rate: number; // 0..1
  transaction_count: number;
}

export interface PeriodRange {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
}

export interface AnalyticsDelta {
  income: number | null;
  expense: number | null;
  goal_saved: number | null;
  balance: number | null;
}

export interface AnalyticsSummary {
  period: PeriodRange;
  previous_period: PeriodRange;
  include_drafts: boolean;
  current: AnalyticsTotals;
  previous: AnalyticsTotals;
  delta_pct: AnalyticsDelta;
}

export type BreakdownDimension = "category" | "subcategory" | "payment_method" | "bank";
export type BreakdownKind = "expense" | "income";

export interface BreakdownItem {
  label: string;
  total: number;
  count: number;
  share: number; // 0..1
}

export interface Breakdown {
  dimension: BreakdownDimension;
  kind: BreakdownKind;
  total: number;
  items: BreakdownItem[];
}

export interface MonthlyPoint {
  month: string; // YYYY-MM
  income: number;
  expense: number;
  goal_saved: number;
  balance: number;
}

export interface UpcomingDueItem {
  transaction_id: string;
  description?: string | null;
  category: string;
  subcategory?: string | null;
  amount: number;
  due_date: string;
  days_left: number;
  payment_method?: string | null;
  bank?: string | null;
}

export interface UpcomingDue {
  total: number;
  items: UpcomingDueItem[];
}

export interface AnalyticsQuery {
  from: string;
  to: string;
  includeDrafts: boolean;
}
