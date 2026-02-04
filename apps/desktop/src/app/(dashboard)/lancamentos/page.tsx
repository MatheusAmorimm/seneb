"use client";

import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import api from "../../../services/api"; 
import { Transaction } from "../../../types";
import { BalanceCard } from "../../../components/balance_card";
import { TransactionForm } from "../../../components/transaction_form";
import { TransactionList } from "../../../components/transaction_list";
import { toast } from "sonner";
import { AlertTriangle, X, Trash2, Save, Pencil, FileEdit } from "lucide-react"; 
import { useReports } from "../../../hooks/use_reports"; 

export default function LancamentosPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados de Hover dos botões
  const [isHovered, setIsHovered] = useState(false); 
  const [isEditHovered, setIsEditHovered] = useState(false);
  
  // Modais e Controle
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [reportName, setReportName] = useState("");
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null); 
  
  // Estado que ativa o formulário em modo edição
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { refetch : updateSidebar } = useReports(); 

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/transactions/draft'); 
      setTransactions(response.data);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      toast.error("Não foi possível carregar o histórico.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- LÓGICA DE SALVAR/EDITAR (CORRIGIDA PARA ERRO 400) ---
  const handleSaveTransaction = async (transaction: Transaction) => {
    try {
      // 1. Prepara os dados brutos e remove vazios
      const rawPayload = {
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        type: transaction.type,
        date: transaction.date,
        due_date: transaction.due_date || null,
        payment_method: transaction.payment_method || null,
        bank: transaction.bank || null,
        is_installment: transaction.is_installment,
        total_installments: transaction.total_installments,
        installment_identifier: transaction.installment_identifier || null
      };

      // Remove chaves que são null, undefined ou string vazia
      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(([_, v]) => v !== null && v !== undefined && v !== "")
      );

      if (transaction.id) {
        // --- EDIÇÃO (PUT) ---
        const response = await api.put(`/transactions/${transaction.id}`, payload);
        
        setTransactions((prev) => 
          prev.map((t) => (t.id === transaction.id ? response.data : t))
        );
        
        toast.success("Lançamento atualizado!");
        setEditingTransaction(null);
      } else {
        // --- CRIAÇÃO (POST) ---
        // Para POST, enviamos o rawPayload se o backend aceitar, ou o payload limpo
        const response = await api.post('/transactions', rawPayload); 
        setTransactions((prev) => [response.data, ...prev]);
        toast.success("Lançamento salvo!");
      }
    } catch (error) {
      console.error("Erro detalhado:", error);
      
      if (error instanceof AxiosError && error.response?.data) {
         const data = error.response.data;
         let errorMessage = "Erro na validação dos dados.";
         
         if (Array.isArray(data.detail)) {
            const firstError = data.detail[0];
            const field = firstError.loc ? firstError.loc[firstError.loc.length - 1] : 'Campo desconhecido';
            errorMessage = `Erro no campo '${field}': ${firstError.msg}`;
         } else if (typeof data.detail === 'string') {
            errorMessage = data.detail;
         }
         toast.error(errorMessage);
      } else {
         toast.error("Erro ao comunicar com o servidor.");
      }
    }
  };

  // --- LÓGICA DE FINALIZAR MÊS ---
  const handleFinalize = async () => {
    if (!reportName) {
      toast.warning("Dê um nome para o relatório (Ex: Março 2026)");
      return;
    }
    try {
      await api.post('/transactions/finalize', {
        report_name: reportName,
        reference_month: new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })
      });
      toast.success("Mês finalizado! Relatório salvo no Histórico.");
      setShowFinalizeModal(false);
      setReportName("");
      await updateSidebar(); 
      fetchTransactions(); 
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Erro ao finalizar mês.");
    }}
  };

  // --- LÓGICA DE DELETE (AS VARIÁVEIS QUE FALTAVAM) ---
  const requestDelete = (id: string) => {
    setTransactionToDelete(id);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;
    try {
      const id = transactionToDelete;
      setTransactions((prev) => prev.filter((t) => t.id !== id)); // Otimista
      setTransactionToDelete(null); 
      
      await api.delete(`/transactions/${id}`);
      toast.success("Item removido.");
      
      // Se deletou o item que estava sendo editado, limpa o form
      if (editingTransaction?.id === id) {
        setEditingTransaction(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir. O item reaparecerá ao atualizar.");
      fetchTransactions(); 
    }
  };

  // --- LÓGICA DE EDIÇÃO ---
  const handleEditClick = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
  };

  const confirmEdit = () => {
    if (transactionToEdit) {
      setEditingTransaction(transactionToEdit);
      setTransactionToEdit(null);
      toast.info("Modo de edição ativado.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    toast.info("Edição cancelada.");
  };

  // Cálculos de Totais
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-turquoise"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 relative">
      <div className="flex justify-between items-center animate-in slide-in-from-top-4">
        <h1 className="text-3xl font-serif font-bold text-[#013750]">Planejamento</h1>
        
        <button
          onClick={() => setShowFinalizeModal(true)}
          className="bg-[#00988D] hover:bg-[#007f76] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all hover:scale-105"
        >
          <Save size={20} />
          Finalizar Mês
        </button>
      </div>
      
      <section className="animate-in slide-in-from-top-4 duration-500">
        <TransactionForm 
          onAddTransaction={handleSaveTransaction} 
          initialData={editingTransaction}
          onCancelEdit={handleCancelEdit}
        />
      </section>

      <section className="animate-in fade-in duration-700 delay-100">
        <BalanceCard totalIncome={totalIncome} totalExpense={totalExpense} balance={balance} />
      </section>

      <section className="animate-in slide-in-from-bottom-4 duration-700 delay-200">
        <TransactionList 
          transactions={transactions} 
          onDeleteTransaction={requestDelete} 
          onEditTransaction={handleEditClick} 
        />
      </section>

      {/* --- MODAL FINALIZAR --- */}
      {showFinalizeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl w-[400px] shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-serif font-bold text-[#013750] mb-2">Fechar Planejamento</h2>
            <p className="text-slate-500 mb-6 text-sm">
              Isso salvará os dados atuais no Histórico e preparará a tela para o próximo mês.
            </p>
            <input 
              autoFocus value={reportName} onChange={(e) => setReportName(e.target.value)}
              placeholder="Ex: Fevereiro 2026" className="w-full p-3 border border-slate-300 rounded-lg mb-6 focus:outline-none focus:border-[#F23E02]"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowFinalizeModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-medium">Cancelar</button>
              <button onClick={handleFinalize} className="px-6 py-2 bg-[#F23E02] text-white rounded-lg font-bold hover:bg-[#d93602]">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE EXCLUSÃO --- */}
      {transactionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md overflow-hidden animate-in zoom-in-95 duration-200 scale-100">
            <div className="bg-red-50 p-6 flex items-center gap-4 border-b border-red-100">
              <div className="bg-red-100 p-3 rounded-full"><AlertTriangle className="text-brand-orange w-6 h-6" /></div>
              <div><h3 className="text-lg font-serif font-bold text-brand-deepBlue">Excluir Transação?</h3><p className="text-sm text-slate-500">Essa ação não poderá ser desfeita.</p></div>
              <button onClick={() => setTransactionToDelete(null)} className="ml-auto text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 bg-white flex justify-end gap-3">
              <button onClick={() => setTransactionToDelete(null)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={confirmDelete} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
                className="px-4 py-2 text-white font-bold rounded-lg shadow-md flex items-center gap-2 transition-all duration-200 active:scale-95"
                style={{ backgroundColor: isHovered ? '#d63802' : '#F23E02', cursor: 'pointer' }}>
                <Trash2 size={18} /> Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE CONFIRMAÇÃO DE EDIÇÃO --- */}
      {transactionToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md overflow-hidden animate-in zoom-in-95 duration-200 scale-100">
            <div className="bg-blue-50 p-6 flex items-center gap-4 border-b border-blue-100">
              <div className="bg-blue-100 p-3 rounded-full"><FileEdit className="text-blue-600 w-6 h-6" /></div>
              <div><h3 className="text-lg font-serif font-bold text-brand-deepBlue">Editar Lançamento?</h3><p className="text-sm text-slate-500">Os dados serão carregados no formulário acima.</p></div>
              <button onClick={() => setTransactionToEdit(null)} className="ml-auto text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 bg-white flex justify-end gap-3">
              <button onClick={() => setTransactionToEdit(null)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={confirmEdit} onMouseEnter={() => setIsEditHovered(true)} onMouseLeave={() => setIsEditHovered(false)}
                className="px-4 py-2 text-white font-bold rounded-lg shadow-md flex items-center gap-2 transition-all duration-200 active:scale-95"
                style={{ backgroundColor: isEditHovered ? '#007f76' : '#00988D', cursor: 'pointer' }}>
                <Pencil size={18} /> Editar Agora
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}