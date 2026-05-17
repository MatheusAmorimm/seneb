"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  accent?: boolean;
}

interface AppSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AppSelect({
  value,
  onChange,
  options,
  placeholder = "Selecione...",
  hasError,
  disabled,
  className = "",
}: AppSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  const triggerClass = [
    "w-full h-11 flex items-center justify-between px-3 rounded-lg border transition-all text-sm",
    disabled
      ? "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
      : hasError
      ? "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-200 ring-1 ring-red-500 cursor-pointer"
      : open
      ? "border-[#2C6B74] dark:border-teal-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 ring-1 ring-[#2C6B74] dark:ring-teal-500 cursor-pointer"
      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer",
    className,
  ].join(" ");

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={triggerClass}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span
          className={
            selected
              ? selected.accent
                ? "text-[#F23E02] dark:text-orange-400 font-semibold"
                : ""
              : "text-slate-400 dark:text-slate-500"
          }
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={[
            "shrink-0 transition-transform duration-200",
            open ? "rotate-180" : "",
            disabled
              ? "text-slate-300 dark:text-slate-700"
              : hasError
              ? "text-red-400"
              : "text-slate-400 dark:text-slate-500",
          ].join(" ")}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
          <ul className="max-h-52 overflow-y-auto py-1" role="listbox">
            {options.map((opt) => (
              <li key={opt.value} role="option" aria-selected={value === opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={[
                    "w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors text-left",
                    opt.accent
                      ? "text-[#F23E02] dark:text-orange-400 font-semibold hover:bg-orange-50 dark:hover:bg-orange-950/20 border-t border-slate-100 dark:border-slate-700"
                      : value === opt.value
                      ? "bg-teal-50 dark:bg-teal-950/30 text-[#2C6B74] dark:text-teal-400 font-medium"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50",
                  ].join(" ")}
                >
                  <span>{opt.label}</span>
                  {value === opt.value && !opt.accent && (
                    <Check size={14} className="text-[#2C6B74] dark:text-teal-400 shrink-0" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
