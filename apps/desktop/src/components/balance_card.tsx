import { ArrowUpCircle, ArrowDownCircle, DollarSign, Target } from "lucide-react";

interface BalanceCardProps {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    goalsTotal?: number;
}

export function BalanceCard({ totalIncome, totalExpense, balance, goalsTotal = 0 }: BalanceCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Receitas */}
      <div className="p-6 rounded-xl shadow-md transition-transform hover:scale-105 bg-gradient-to-br from-[#d1f4f0] to-[#b3ede7] dark:from-emerald-900/40 dark:to-emerald-950/40 border border-[#00d4a8] dark:border-emerald-800/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-[#10b981]">
            <ArrowUpCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-medium text-[#047857] dark:text-emerald-300">Receitas</h3>
        </div>
        <p className="text-2xl font-bold text-[#065f46] dark:text-white">{formatCurrency(totalIncome)}</p>
      </div>

      {/* Investimentos/Metas */}
      <div className="p-6 rounded-xl shadow-md transition-transform hover:scale-105 bg-gradient-to-br from-[#fef9c3] to-[#fde68a] dark:from-amber-900/40 dark:to-amber-950/40 border border-[#fcd34d] dark:border-amber-800/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-[#f59e0b]">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-medium text-[#92400e] dark:text-amber-300">Invest./Metas</h3>
        </div>
        <p className="text-2xl font-bold text-[#78350f] dark:text-white">{formatCurrency(goalsTotal)}</p>
      </div>

      {/* Despesas */}
      <div className="p-6 rounded-xl shadow-md transition-transform hover:scale-105 bg-gradient-to-br from-[#ffe4d6] to-[#ffd4ba] dark:from-rose-900/40 dark:to-rose-950/40 border border-[#ffb088] dark:border-rose-800/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-[#ff9966]">
            <ArrowDownCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-medium text-[#c4511d] dark:text-rose-300">Despesas</h3>
        </div>
        <p className="text-2xl font-bold text-[#994010] dark:text-white">{formatCurrency(totalExpense)}</p>
      </div>

      {/* Saldo Final */}
      <div className="p-6 rounded-xl shadow-md transition-transform hover:scale-105 bg-gradient-to-br from-[#dbeafe] to-[#bfdbfe] dark:from-blue-900/40 dark:to-blue-950/40 border border-[#60a5fa] dark:border-blue-800/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-[#2C6B74] dark:bg-slate-700">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-medium text-[#1e40af] dark:text-blue-300">Saldo Final</h3>
        </div>
        <p className={`text-2xl font-bold ${balance >= 0 ? 'text-[#1e3a8a] dark:text-white' : 'text-[#991b1b] dark:text-rose-400'}`}>
          {formatCurrency(balance)}
        </p>
      </div>
    </div>
  );
}