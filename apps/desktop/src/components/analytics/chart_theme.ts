"use client";

import { useTheme } from "../theme_provider";

// Cores de série validadas com o validador de paleta (faixa de luminosidade,
// croma, separação para daltonismo e contraste) nas superfícies reais dos
// cards: #ffffff (claro) e #012a3d (escuro). As cores da marca Seneb ficam no
// chrome (títulos, chips); as séries usam estes valores.
export interface ChartTheme {
  dark: boolean;
  surface: string;
  ink: string;
  inkSecondary: string;
  inkMuted: string;
  grid: string;
  axis: string;
  tooltipBg: string;
  tooltipBorder: string;
  /** Série única (barras de categoria, subcategoria, pagamento). */
  bar: string;
  income: string;
  expense: string;
  balance: string;
  meterFill: string;
  meterTrack: string;
  deltaGood: string;
  deltaBad: string;
}

export const LIGHT_THEME: ChartTheme = {
  dark: false,
  surface: "#ffffff",
  ink: "#013750",
  inkSecondary: "#475569",
  inkMuted: "#94a3b8",
  grid: "#e2e8f0",
  axis: "#cbd5e1",
  tooltipBg: "#ffffff",
  tooltipBorder: "#e2e8f0",
  bar: "#00988D",
  income: "#1baf7a",
  expense: "#eb6834",
  balance: "#2a78d6",
  meterFill: "#2a78d6",
  meterTrack: "#cde2fb",
  deltaGood: "#006300",
  deltaBad: "#d03b3b",
};

export const DARK_THEME: ChartTheme = {
  dark: true,
  surface: "#012a3d",
  ink: "#f8fafc",
  inkSecondary: "#cbd5e1",
  inkMuted: "#94a3b8",
  grid: "#1e293b",
  axis: "#334155",
  tooltipBg: "#012a3d",
  tooltipBorder: "#1e293b",
  bar: "#00988D",
  income: "#199e70",
  expense: "#d95926",
  balance: "#3987e5",
  meterFill: "#3987e5",
  meterTrack: "#184f95",
  deltaGood: "#0ca30c",
  deltaBad: "#e66767",
};

export function useChartTheme(): ChartTheme {
  const { theme } = useTheme();
  return theme === "dark" ? DARK_THEME : LIGHT_THEME;
}

export const PAYMENT_LABELS: Record<string, string> = {
  credit_card: "Cartão de crédito",
  debit_card: "Cartão de débito",
  cash: "Dinheiro",
  pix: "Pix",
  bill: "Boleto",
  automatic_debit: "Débito automático",
};

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const brlCompact = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatBRL(value: number): string {
  return brl.format(value);
}

export function formatBRLCompact(value: number): string {
  return brlCompact.format(value);
}

/** `value` é uma fração (0..1). */
export function formatShare(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits).replace(".", ",")}%`;
}

/** `value` já é percentual (ex.: 33.33). */
export function formatSignedPct(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits).replace(".", ",")}%`;
}
