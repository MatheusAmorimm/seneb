"use client";

import { useState, useMemo } from "react";
import { Search, Filter, X } from "lucide-react";
import { Transaction, TransactionType } from "../types";

interface TransactionFiltersProps {
  transactions: Transaction[];
  onFilter: (filtered: Transaction[]) => void;
}

export function TransactionFilters({ transactions, onFilter }: TransactionFiltersProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [bankFilter, setBankFilter] = useState("");

  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  const banks = useMemo(() => {
    const bks = new Set(transactions.filter(t => t.bank).map(t => t.bank!));
    return Array.from(bks).sort();
  }, [transactions]);

  const applyFilters = (s: string, type: TransactionType | "all", cat: string, bank: string) => {
    let result = [...transactions];

    if (s) {
      const lower = s.toLowerCase();
      result = result.filter(t =>
        t.description?.toLowerCase().includes(lower) ||
        t.category?.toLowerCase().includes(lower) ||
        t.bank?.toLowerCase().includes(lower)
      );
    }

    if (type !== "all") {
      result = result.filter(t => t.type === type);
    }

    if (cat) {
      result = result.filter(t => t.category === cat);
    }

    if (bank) {
      result = result.filter(t => t.bank === bank);
    }

    onFilter(result);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    applyFilters(value, typeFilter, categoryFilter, bankFilter);
  };

  const handleTypeFilter = (value: TransactionType | "all") => {
    setTypeFilter(value);
    applyFilters(search, value, categoryFilter, bankFilter);
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    applyFilters(search, typeFilter, value, bankFilter);
  };

  const handleBankFilter = (value: string) => {
    setBankFilter(value);
    applyFilters(search, typeFilter, categoryFilter, value);
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("");
    setBankFilter("");
    onFilter(transactions);
  };

  const hasActiveFilters = search || typeFilter !== "all" || categoryFilter || bankFilter;

  return (
    <div className="bg-white dark:bg-[#012a3d] p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 mb-4 transition-colors">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-[#00988D] dark:focus:border-teal-400 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-all font-medium"
            placeholder="Buscar por descrição, categoria ou banco..."
          />
        </div>

        {/* Type filter */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
          {[
            { value: "all" as const, label: "Todos" },
            { value: "income" as const, label: "Receitas" },
            { value: "expense" as const, label: "Despesas" },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleTypeFilter(opt.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                typeFilter === opt.value 
                  ? "bg-white dark:bg-slate-800 text-[#013750] dark:text-slate-100 shadow-sm border border-slate-100 dark:border-slate-700" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => handleCategoryFilter(e.target.value)}
          className="h-9 px-3 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:border-[#00988D] dark:focus:border-teal-400 bg-white dark:bg-slate-900 cursor-pointer"
        >
          <option value="" className="dark:bg-slate-900">Categoria</option>
          {categories.map(cat => (
            <option key={cat} value={cat} className="dark:bg-slate-900">{cat}</option>
          ))}
        </select>

        {/* Bank filter */}
        {banks.length > 0 && (
          <select
            value={bankFilter}
            onChange={(e) => handleBankFilter(e.target.value)}
            className="h-9 px-3 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:border-[#00988D] dark:focus:border-teal-400 bg-white dark:bg-slate-900 cursor-pointer"
          >
            <option value="" className="dark:bg-slate-900">Banco</option>
            {banks.map(b => (
              <option key={b} value={b} className="dark:bg-slate-900">{b}</option>
            ))}
          </select>
        )}

        {/* Clear */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="h-9 px-3 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-[#F23E02] dark:hover:text-orange-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <X size={14} /> Limpar
          </button>
        )}
      </div>
    </div>
  );
}
