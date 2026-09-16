// Helpers de data em horário local (o app roda no PC do usuário).
// Todas as strings são YYYY-MM-DD, o formato usado pela API.

const MONTH_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayYMD(): string {
  return toYMD(new Date());
}

export function startOfMonthYMD(d: Date = new Date()): string {
  return toYMD(new Date(d.getFullYear(), d.getMonth(), 1));
}

/** Primeiro dia do mês que fica `months - 1` meses antes do mês de `d`. */
export function monthsAgoStartYMD(months: number, d: Date = new Date()): string {
  return toYMD(new Date(d.getFullYear(), d.getMonth() - months + 1, 1));
}

export function formatMonthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  const idx = parseInt(m, 10) - 1;
  return `${MONTH_SHORT[idx] ?? m}/${y.slice(2)}`;
}

export function formatDateBR(ymd: string): string {
  const [y, m, d] = ymd.split("-");
  return `${d}/${m}/${y}`;
}
