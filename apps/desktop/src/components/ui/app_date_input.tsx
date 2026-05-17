"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { getDaysInMonth, getDay, startOfMonth, addMonths, subMonths, isValid } from "date-fns";

interface AppDateInputProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  hasError?: boolean;
  className?: string;
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const WEEKDAY_INITIALS = ["D", "S", "T", "Q", "Q", "S", "S"];

function parseLocalDate(str: string | undefined): Date | null {
  if (!str) return null;
  const d = new Date(str + "T00:00:00");
  return isValid(d) ? d : null;
}

function toYMD(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function AppDateInput({
  value,
  onChange,
  min,
  max,
  hasError,
  className = "",
}: AppDateInputProps) {
  const [open, setOpen] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selectedDate = parseLocalDate(value);
  const [viewDate, setViewDate] = useState<Date>(() => selectedDate ?? new Date());

  const minDate = parseLocalDate(min);
  const maxDate = parseLocalDate(max);

  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPanelPos({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !panelRef.current?.contains(t)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOffset = getDay(startOfMonth(viewDate));
  const daysInMonth = getDaysInMonth(viewDate);

  const isDayDisabled = (day: number) => {
    const d = new Date(year, month, day);
    if (minDate) {
      const minNormalized = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
      if (d < minNormalized) return true;
    }
    if (maxDate) {
      const maxNormalized = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
      if (d > maxNormalized) return true;
    }
    return false;
  };

  const isSelected = (day: number) =>
    !!selectedDate &&
    selectedDate.getFullYear() === year &&
    selectedDate.getMonth() === month &&
    selectedDate.getDate() === day;

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const handleDayClick = (day: number) => {
    if (isDayDisabled(day)) return;
    onChange(toYMD(year, month, day));
    setOpen(false);
  };

  const displayValue = selectedDate
    ? `${String(selectedDate.getDate()).padStart(2, "0")}/${String(selectedDate.getMonth() + 1).padStart(2, "0")}/${selectedDate.getFullYear()}`
    : "";

  const triggerClass = [
    "w-full h-11 flex items-center gap-2 px-3 border rounded-lg text-sm transition-all cursor-pointer text-left",
    hasError
      ? "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-200 ring-1 ring-red-500"
      : open
      ? "border-[#2C6B74] dark:border-teal-500 bg-white dark:bg-slate-900 ring-1 ring-[#2C6B74] dark:ring-teal-500"
      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600",
  ].join(" ");

  const panel = (
    <div
      ref={panelRef}
      style={{ position: "fixed", top: panelPos.top, left: panelPos.left, zIndex: 9999 }}
      className="w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-3"
    >
      {/* Month / Year navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setViewDate((d) => subMonths(d, 1))}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft size={15} className="text-slate-500 dark:text-slate-400" />
        </button>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 select-none">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => setViewDate((d) => addMonths(d, 1))}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronRight size={15} className="text-slate-500 dark:text-slate-400" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_INITIALS.map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 py-1 select-none"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const disabled = isDayDisabled(day);
          const selected = isSelected(day);
          const today = isToday(day);

          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => handleDayClick(day)}
              className={[
                "h-8 w-full rounded-lg text-sm transition-colors select-none",
                selected
                  ? "bg-[#2C6B74] text-white font-semibold"
                  : disabled
                  ? "text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50"
                  : today
                  ? "border border-[#2C6B74] dark:border-teal-500 text-[#2C6B74] dark:text-teal-400 font-medium hover:bg-teal-50 dark:hover:bg-teal-950/30"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={`relative w-full ${className}`}>
      <button ref={triggerRef} type="button" onClick={handleToggle} className={triggerClass}>
        <Calendar
          size={15}
          className={
            hasError
              ? "text-red-400 shrink-0"
              : "text-slate-400 dark:text-slate-500 shrink-0"
          }
        />
        <span className={displayValue ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"}>
          {displayValue || "Selecione..."}
        </span>
      </button>

      {open && typeof document !== "undefined" && createPortal(panel, document.body)}
    </div>
  );
}
