import { ArrowUpCircle, ArrowDownCircle, DollarSign } from "lucide-react";

interface BalanceCardProps {
    totalIncome: number;
    totalExpense: number;
    balance: number;
}

export function BalanceCard({ totalIncome, totalExpense, balance }: BalanceCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Receitas */}
      <div className="p-6 rounded-xl shadow-md transition-transform hover:scale-105" style={{ 
        background: 'linear-gradient(to bottom right, #d1f4f0, #b3ede7)',
        borderWidth: '1px',
        borderColor: '#00d4a8'
      }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#10b981' }}>
            <ArrowUpCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-medium" style={{ color: '#047857' }}>Receitas</h3>
        </div>
        <p className="text-2xl font-bold" style={{ color: '#065f46' }}>{formatCurrency(totalIncome)}</p>
      </div>

      {/* Despesas */}
      <div className="p-6 rounded-xl shadow-md transition-transform hover:scale-105" style={{ 
        background: 'linear-gradient(to bottom right, #ffe4d6, #ffd4ba)',
        borderWidth: '1px',
        borderColor: '#ffb088'
      }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#ff9966' }}>
            <ArrowDownCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-medium" style={{ color: '#c4511d' }}>Despesas</h3>
        </div>
        <p className="text-2xl font-bold" style={{ color: '#994010' }}>{formatCurrency(totalExpense)}</p>
      </div>

      {/* Saldo Final */}
      <div className="p-6 rounded-xl shadow-md transition-transform hover:scale-105" style={{ 
        background: 'linear-gradient(to bottom right, #dbeafe, #bfdbfe)',
        borderWidth: '1px',
        borderColor: '#60a5fa'
      }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#2C6B74' }}>
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-medium" style={{ color: '#1e40af' }}>Saldo Final</h3>
        </div>
        <p className={`text-2xl font-bold`} style={{ color: balance >= 0 ? '#1e3a8a' : '#991b1b' }}>
          {formatCurrency(balance)}
        </p>
      </div>
    </div>
  );
}