import { Trash2, ArrowUpCircle, ArrowDownCircle, CreditCard, Banknote, Barcode, Wallet, Building2, Pencil, Calendar, CalendarClock } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onEditTransaction?: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, onDeleteTransaction, onEditTransaction }: TransactionListProps) {
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('pt-BR');
  };

  const getPaymentInfo = (transaction: Transaction) => {
    const method = transaction.payment_method;
    
    // Lógica da Parcela
    let installmentLabel = '';
    if (transaction.installment_identifier) {
      installmentLabel = ` ${transaction.installment_identifier}`;
    } else if (transaction.total_installments && transaction.total_installments > 1) {
      installmentLabel = ` (${transaction.total_installments}x)`;
    }

    switch (method) {
      case 'credit_card':
        return { label: `Crédito${installmentLabel}`, icon: CreditCard, color: 'text-purple-600 bg-purple-50' };
      case 'debit_card':
        return { label: 'Débito', icon: CreditCard, color: 'text-blue-600 bg-blue-50' };
      case 'pix':
        return { label: 'Pix', icon: Banknote, color: 'text-teal-600 bg-teal-50' };
      case 'cash':
        return { label: 'Dinheiro', icon: Wallet, color: 'text-green-600 bg-green-50' };
      case 'bill':
        return { label: 'Boleto', icon: Barcode, color: 'text-gray-600 bg-gray-50' };
      case 'automatic_debit':
        return { label: 'Débito Auto.', icon: Banknote, color: 'text-indigo-600 bg-indigo-50' };
      default:
        return { label: '-', icon: Wallet, color: 'text-gray-400' };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-bold font-serif text-[#013750]">Histórico Recente</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              {/* 1. DATA (Primeira Coluna) */}
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2C6B74]">Data</th>
              
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2C6B74]">Descrição</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2C6B74]">Valor</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2C6B74]">Categoria</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2C6B74]">Banco</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2C6B74]">Pagamento</th>
              
              {/* 2. VENCIMENTO (Nova Coluna) */}
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2C6B74]">Vencimento</th>
              
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#2C6B74]">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {transactions.length === 0 ? (
              <tr>
                {/* Ajustado colSpan para 8 colunas */}
                <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Wallet size={40} className="text-slate-200" />
                    <p className="text-sm font-medium">Nenhuma transação lançada neste mês.</p>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => {
                const Payment = getPaymentInfo(transaction);
                const PaymentIcon = Payment.icon;

                const effectiveAmount = transaction.is_installment && transaction.total_installments && transaction.total_installments > 0
                  ? transaction.amount / transaction.total_installments
                  : transaction.amount;

                return (
                  <tr key={transaction.id} className="group transition-colors hover:bg-slate-50/80">
                    
                    {/* 1. DATA (Movido para o início) */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                       <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-300" />
                          {formatDate(transaction.date)}
                       </div>
                    </td>

                    {/* Descrição */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                          {transaction.type === 'income' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                        </div>
                        <span className="font-medium text-[#013750]">{transaction.description}</span>
                      </div>
                    </td>

                    {/* Valor */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`font-bold ${transaction.type === 'income' ? 'text-emerald-600' : 'text-[#F23E02]'}`}>
                          {transaction.type === 'expense' ? '- ' : '+ '}
                          {formatCurrency(effectiveAmount)}
                        </span>
                        {/* 🚀 Se for parcelado, mostra o valor total da compra em miniatura */}
                        {transaction.is_installment && (
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            Total: {formatCurrency(transaction.amount)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Categoria */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {transaction.category}
                      </span>
                    </td>

                    {/* Banco */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.bank ? (
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Building2 size={14} className="text-slate-400" />
                          {transaction.bank}
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>

                    {/* Pagamento */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.type === 'expense' ? (
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${Payment.color}`}>
                          <PaymentIcon size={14} />
                          {Payment.label}
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>

                    {/* 2. VENCIMENTO (Nova lógica) */}
                    <td className="px-6 py-4 whitespace-nowrap">
                        {transaction.due_date ? (
                           <div className="flex items-center gap-1.5 text-sm text-orange-600 font-medium">
                              <CalendarClock size={14} />
                              {formatDate(transaction.due_date)}
                           </div>
                        ) : (
                           <span className="text-slate-300 text-xs pl-4">-</span>
                        )}
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1">
                        
                        {onEditTransaction && (
                          <button 
                            onClick={() => onEditTransaction(transaction)} 
                            className="text-slate-300 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"
                            title="Editar"
                          >
                            <Pencil size={18} />
                          </button>
                        )}

                        <button 
                          onClick={() => transaction.id && onDeleteTransaction(transaction.id)} 
                          className="text-slate-300 hover:text-[#F23E02] transition-colors p-2 rounded-full hover:bg-rose-50"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}