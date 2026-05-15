"use client";

import { Crown, Lock, ArrowLeft, TrendingUp, PieChart } from "lucide-react";
import { useRouter } from "next/navigation";
export default function AnalyticsPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] text-center p-8 py-12 relative">
      
      {/* Botão de Voltar */}
      <div className="absolute top-4 left-4 flex gap-2">
        <button 
          onClick={() => router.push('/')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 dark:text-slate-500 hover:text-[#013750] dark:hover:text-slate-100"
          title="Voltar para Home"
        >
          <ArrowLeft size={24} />
        </button>
      </div>
      
      {/* Ícone Principal */}
      <div className="relative mb-8 group">
        <div className="absolute inset-0 bg-yellow-100 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
        <div className="relative bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-full border-2 border-yellow-100 shadow-xl">
          <Crown size={64} className="text-[#F2B705] drop-shadow-sm" />
          <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md border border-slate-100">
            <Lock size={20} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Títulos */}
      <h1 className="text-3xl font-serif font-bold text-[#013750] dark:text-slate-100 mb-3 transition-colors">
        Analytics Premium
      </h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-10 leading-relaxed transition-colors">
        Desbloqueie o poder dos dados. Visualize tendências, projeções futuras e gráficos detalhados para tomar as melhores decisões financeiras.
      </p>

      {/* Grid de Features (Bloqueadas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full mb-12 opacity-60 grayscale-[0.5] pointer-events-none select-none">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center gap-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg"><PieChart className="text-blue-400" size={24}/></div>
          <div className="text-left">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
            <div className="h-3 w-32 bg-slate-100 dark:bg-slate-900 rounded"></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center gap-4">
          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg"><TrendingUp className="text-green-400" size={24}/></div>
          <div className="text-left">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
            <div className="h-3 w-32 bg-slate-100 dark:bg-slate-900 rounded"></div>
          </div>
        </div>
      </div>

      {/* Botão de Ação (Em breve) */}
      <div className="space-y-3">
        <button disabled className="px-8 py-3 bg-[#013750] dark:bg-slate-100 text-white dark:text-[#013750] font-bold rounded-xl shadow-lg opacity-80 cursor-not-allowed flex items-center gap-2 mx-auto transition-colors">
          <Crown size={18} />
          Disponível em breve
        </button>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium transition-colors">
          Exclusivo para assinantes Premium
        </p>
      </div>
    </div>
  );
}