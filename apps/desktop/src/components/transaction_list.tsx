import { Trash2, ArrowUpCircle, ArrowDownCircle, CreditCard, Banknote, Barcode, Wallet, Building2, Pencil, Calendar, CalendarClock, Layers } from 'lucide-react';
import { Transaction } from '../types';
import { useTheme } from './theme_provider';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onEditTransaction?: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, onDeleteTransaction, onEditTransaction }: TransactionListProps) {
  const { theme } = useTheme();

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

    switch (method) {
      case 'credit_card':
        return { label: 'Crédito', icon: CreditCard, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' };
      case 'debit_card':
        return { label: 'Débito', icon: CreditCard, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' };
      case 'pix':
        return { label: 'Pix', icon: Banknote, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/30' };
      case 'cash':
        return { label: 'Dinheiro', icon: Wallet, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' };
      case 'bill':
        return { label: 'Boleto', icon: Barcode, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800/50' };
      case 'automatic_debit':
        return { label: 'Déb. Auto.', icon: Banknote, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30' };
      default:
        return { label: '-', icon: Wallet, color: 'text-gray-400', bg: '' };
    }
  };

  return (
    <div className="bg-white dark:bg-[#012a3d] rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <h2 className="text-lg font-bold font-serif text-[#013750] dark:text-slate-100">Histórico Recente</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/80">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2C6B74] dark:text-teal-400">Data</th>
              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2C6B74] dark:text-teal-400">Categoria</th>
              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2C6B74] dark:text-teal-400">Sub Categoria</th>
              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2C6B74] dark:text-teal-400">Descrição</th>
              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2C6B74] dark:text-teal-400">Tipo</th>
              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2C6B74] dark:text-teal-400">Valor</th>
              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2C6B74] dark:text-teal-400">Pagamento</th>
              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2C6B74] dark:text-teal-400">Parcela</th>
              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2C6B74] dark:text-teal-400">Banco</th>
              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2C6B74] dark:text-teal-400">Vencimento</th>
              <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#2C6B74] dark:text-teal-400">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#012a3d]">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Wallet size={40} className="text-slate-200 dark:text-slate-700" />
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
                  <tr key={transaction.id} className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/40">

                    {/* 1. DATA */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-300 dark:text-slate-600" />
                        {formatDate(transaction.date)}
                      </div>
                    </td>

                    {/* 2. CATEGORIA */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {transaction.category}
                      </span>
                    </td>

                    {/* 2. SUBCATEGORIA */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {transaction.subcategory}
                      </span>
                    </td>

                    {/* 3. DESCRIÇÃO */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-medium text-[#013750] dark:text-slate-200 text-sm">{transaction.description}</span>
                    </td>

                    {/* 4. TIPO */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${transaction.type === 'income'
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                        }`}>
                        {transaction.type === 'income' ? <ArrowUpCircle size={13} /> : <ArrowDownCircle size={13} />}
                        {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                      </div>
                    </td>

                    {/* 5. VALOR */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`font-bold text-sm ${transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#F23E02] dark:text-orange-400'}`}>
                          {transaction.type === 'expense' ? '- ' : '+ '}
                          {formatCurrency(effectiveAmount)}
                        </span>
                        {transaction.is_installment && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                            Total: {formatCurrency(transaction.amount)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 6. PAGAMENTO */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {transaction.type === 'expense' && transaction.payment_method ? (
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${theme === 'dark'
                          ? `border-slate-700 ${Payment.bg} ${Payment.color} shadow-[0_0_10px_rgba(0,0,0,0.2)]`
                          : `border-transparent ${Payment.bg} ${Payment.color}`
                          }`}>
                          <PaymentIcon size={12} strokeWidth={2.5} />
                          {Payment.label}
                        </div>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 text-xs">-</span>
                      )}
                    </td>

                    {/* 7. PARCELA */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {transaction.installment_identifier ? (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 text-xs font-bold border border-orange-100 dark:border-orange-900/50">
                          <Layers size={12} />
                          {transaction.installment_identifier}
                        </div>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 text-xs pl-2">-</span>
                      )}
                    </td>

                    {/* 8. BANCO */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {transaction.bank ? (
                        <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                          <Building2 size={13} className="text-slate-400 dark:text-slate-600" />
                          {transaction.bank}
                        </div>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 text-xs">-</span>
                      )}
                    </td>

                    {/* 9. VENCIMENTO */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {transaction.due_date ? (
                        <div className="flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400 font-medium">
                          <CalendarClock size={13} />
                          {formatDate(transaction.due_date)}
                        </div>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 text-xs pl-2">-</span>
                      )}
                    </td>

                    {/* 10. AÇÕES */}
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-0.5">
                        {onEditTransaction && (
                          <button
                            onClick={() => onEditTransaction(transaction)}
                            className="text-slate-300 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => transaction.id && onDeleteTransaction(transaction.id)}
                          className="text-slate-300 dark:text-slate-600 hover:text-[#F23E02] dark:hover:text-orange-400 transition-colors p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/30"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
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