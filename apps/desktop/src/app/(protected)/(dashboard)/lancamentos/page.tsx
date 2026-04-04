"use client";

// 🚀 1. Importado useCallback
import { useState, useEffect, useCallback, Suspense } from "react";
import { AxiosError } from "axios";
import api from "../../../../services/api"; 
import { Transaction } from "../../../../types";
import { BalanceCard } from "../../../../components/balance_card";
import { TransactionForm } from "../../../../components/transaction_form";
import { TransactionList } from "../../../../components/transaction_list";
import { TransactionFilters } from "../../../../components/transaction_filters";
import { toast } from "sonner";
import { ArrowLeft, Save, Plus, Trash2, Calendar, FileText, ChevronDown, CheckCircle2, AlertCircle, Info, Calculator as CalculatorIcon, User, AlertTriangle, X, Pencil, FileEdit } from "lucide-react"; 
import { useReports } from "../../../../hooks/use_reports";
import { useRouter, useSearchParams } from "next/navigation";
import { Calculator } from "../../../../components/calculator";

export default function LancamentosPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-turquoise"></div>
      </div>
    }>
      <LancamentosContent />
    </Suspense>
  );
}

function LancamentosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 🚀 2. Corrigido de 'report_id' para 'reopenedId' (como vem da tela de Histórico)
  const editingReportId = searchParams.get('reopenedId'); 
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
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

  // 🚀 3. useCallback e URL dinâmica
  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = editingReportId 
        ? `/transactions/draft?report_id=${editingReportId}` 
        : '/transactions/draft';
        
      const response = await api.get(url); 
      setTransactions(response.data);
      setFilteredTransactions(response.data);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      toast.error("Não foi possível carregar o histórico.");
    } finally {
      setIsLoading(false);
    }
  }, [editingReportId]); // Recarrega se o ID da URL mudar

  // 🚀 4. useEffect agora escuta a função
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // 🚀 PREVENÇÃO DE FUGA: Bloqueia a saída da página sem finalizar caso seja um Mês Reaberto
  useEffect(() => {
    // 🚀 LÓGICA DE TRAVA GLOBAL: Salva no sessionStorage para que Sidebar/Header possam ler
    if (editingReportId) {
      sessionStorage.setItem('seneb_edition_lock', 'true');
      sessionStorage.setItem('seneb_active_reopened_id', editingReportId);
    } else {
      sessionStorage.removeItem('seneb_edition_lock');
    }

    // A. Bloqueia fechamento da aba ou F5 (Exibe alerta nativo do Navegador)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (editingReportId) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    // B. Intercepta clics em links (React Router, Next Link ou tags A nativas) na Fase de Captura
    const handleClickCapture = (e: MouseEvent) => {
      if (!editingReportId) return;

      let target = e.target as HTMLElement | null;
      // Sobe na árvore DOM para encontrar se o clique foi em um Link ou Botão que navega
      while (target && target.tagName !== 'A' && target.tagName !== 'BUTTON') {
        if (target.parentElement) {
            target = target.parentElement;
        } else {
            break;
        }
      }
      
      const isSidebarLink = target?.closest('aside');
      const isHeaderLink = target?.closest('header');

      if (target && (target.tagName === 'A' || isSidebarLink || isHeaderLink)) {
        const href = target.getAttribute('href') || (target as any).href || '';
        const isInternalLancamento = href.includes('/lancamentos') || href.includes('reopenedId');
        
        if (href && !isInternalLancamento) {
          e.preventDefault();
          e.stopPropagation();
          toast.error("Ateção: Finalize o planejamento reaberto antes de sair desta tela.", {
            duration: 5000,
            icon: <AlertTriangle className="text-red-500" />
          });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleClickCapture, true);

    // C. Intercepta o fechamento da janela nativa do Tauri (botão X ou Alt+F4)
    let unlistenTauriClose: (() => void) | undefined;
    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      import('@tauri-apps/api/window').then(({ getCurrentWindow }) => {
        getCurrentWindow().onCloseRequested((event) => {
          if (editingReportId) {
            event.preventDefault();
            toast.error("Atenção: Finalize o planejamento reaberto antes de fechar o aplicativo.", {
              duration: 5000,
            });
          }
        }).then((unlisten) => {
          unlistenTauriClose = unlisten;
        }).catch(console.error);
      }).catch(console.error);
    }

    return () => {
      sessionStorage.removeItem('seneb_edition_lock');
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClickCapture, true);
      if (unlistenTauriClose) {
        unlistenTauriClose();
      }
    };
  }, [editingReportId]);

  const handleSaveTransaction = async (transaction: Transaction) => {
    try {
      const rawPayload = {
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        subcategory: transaction.subcategory || null,
        type: transaction.type,
        date: transaction.date,
        due_date: transaction.due_date || null,
        payment_method: transaction.payment_method || null,
        bank: transaction.bank || null,
        is_installment: transaction.is_installment,
        current_installment: transaction.current_installment,
        total_installments: transaction.total_installments,
        installment_identifier: transaction.installment_identifier || null,
        // 🚀 5. Corrigido de 'editingTransaction' (Objeto) para 'editingReportId' (String da URL)
        report_id: editingReportId || null 
      };

      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(([_, v]) => v !== null && v !== undefined && v !== "")
      );

      if (transaction.id) {
        const response = await api.put(`/transactions/${transaction.id}`, payload);
        
        setTransactions((prev) => 
          prev.map((t) => (t.id === transaction.id ? response.data : t))
        );
        setFilteredTransactions((prev) =>
          prev.map((t) => (t.id === transaction.id ? response.data : t))
        );
        
        toast.success("Lançamento atualizado!");
        setEditingTransaction(null);
      } else {
        const response = await api.post('/transactions', rawPayload); 
        setTransactions((prev) => [response.data, ...prev]);
        setFilteredTransactions((prev) => [response.data, ...prev]);
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

  const handleFinalize = async () => {
    if (!reportName) {
      toast.warning("Dê um nome para o relatório (Ex: Março 2026)");
      return;
    }
    try {
      await api.post('/transactions/finalize', {
        report_name: reportName,
        reference_month: new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }),
        reopened_report_id: editingReportId || null
      });
      toast.success("Mês finalizado! Relatório salvo no Histórico.");
      setShowFinalizeModal(false);
      setReportName("");
      await updateSidebar(); 
      if (editingReportId) {
        sessionStorage.removeItem('seneb_active_reopened_id');
        sessionStorage.removeItem('seneb_edition_lock');
        router.replace('/lancamentos');
      } else {
        fetchTransactions(); 
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Erro ao finalizar mês.");
    }}
  };

  const requestDelete = (id: string) => {
    setTransactionToDelete(id);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;
    try {
      const id = transactionToDelete;
      setTransactions((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        setFilteredTransactions(updated);
        return updated;
      }); 
      setTransactionToDelete(null); 
      
      await api.delete(`/transactions/${id}`);
      toast.success("Item removido.");
      
      if (editingTransaction?.id === id) {
        setEditingTransaction(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir. O item reaparecerá ao atualizar.");
      fetchTransactions(); 
    }
  };

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

  // 🚀 LÓGICA DE VALOR EFETIVO: Calcula a parcela se houver
  const getEffectiveAmount = (t: Transaction) => {
    if (t.is_installment && t.total_installments && t.total_installments > 0) {
      return t.amount / t.total_installments;
    }
    return t.amount;
  };

  // 🚀 Cálculos de Totais agora usam o Valor Efetivo
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + getEffectiveAmount(t), 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + getEffectiveAmount(t), 0);
    
  const balance = totalIncome - totalExpense;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-turquoise"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 relative">
      {/* 🛑 BANNER DE MODO REABERTO (Visual Lock Indicator) */}
      {editingReportId && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-amber-100 p-2 rounded-full">
            <AlertTriangle className="text-amber-600 w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-900">Modo de Edição Ativo</p>
            <p className="text-xs text-amber-700">A navegação está restrita para garantir a integridade dos dados. Finalize o mês para liberar os botões do menu.</p>
          </div>
          <div className="bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
            Lock Ativo
          </div>
        </div>
      )}

      {/* Header com Nome do Relatório Reaberto */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              const isLocked = sessionStorage.getItem('seneb_edition_lock') === 'true';
              if (isLocked) {
                import('sonner').then(({ toast }) => {
                  toast.error("Obrigatório: Finalize o mês reaberto antes de sair.", {
                    duration: 5000,
                    icon: <AlertTriangle className="text-red-500" />
                  });
                });
                return;
              }
              router.push('/');
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 dark:text-slate-500 hover:text-[#013750] dark:hover:text-slate-100"
            title="Voltar para Home"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-serif font-bold text-[#013750] dark:text-slate-50 transition-colors">Planejamento</h1>
        </div>
        
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
        <TransactionFilters transactions={transactions} onFilter={setFilteredTransactions} />
        <TransactionList 
          transactions={filteredTransactions} 
          onDeleteTransaction={requestDelete} 
          onEditTransaction={handleEditClick} 
        />
      </section>

      {/* Calculadora Flutuante */}
      <Calculator />

      {/* --- MODAL FINALIZAR --- */}
      {showFinalizeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white dark:bg-[#012a3d] p-8 rounded-2xl w-[400px] shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-serif font-bold text-[#013750] dark:text-slate-100 mb-2">Fechar Planejamento</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
              Isso salvará os dados atuais no Histórico e preparará a tela para o próximo mês.
            </p>
            <input 
              autoFocus value={reportName} onChange={(e) => setReportName(e.target.value)}
              placeholder="Ex: Fevereiro 2026" className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg mb-6 focus:outline-none focus:border-[#F23E02] bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowFinalizeModal(false)} className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium">Cancelar</button>
              <button onClick={handleFinalize} className="px-6 py-2 bg-[#F23E02] text-white rounded-lg font-bold hover:bg-[#d93602]">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE EXCLUSÃO --- */}
      {transactionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#012a3d] rounded-2xl shadow-2xl max-w-md overflow-hidden animate-in zoom-in-95 duration-200 scale-100 border border-slate-100 dark:border-slate-800">
            <div className="bg-red-50 dark:bg-red-950/20 p-6 flex items-center gap-4 border-b border-red-100 dark:border-red-900/30">
              <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded-full"><AlertTriangle className="text-brand-orange w-6 h-6" /></div>
              <div><h3 className="text-lg font-serif font-bold text-brand-deepBlue dark:text-slate-100">Excluir Transação?</h3><p className="text-sm text-slate-500 dark:text-slate-400">Essa ação não poderá ser desfeita.</p></div>
              <button onClick={() => setTransactionToDelete(null)} className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
            </div>
            <div className="p-6 bg-white dark:bg-[#012a3d] flex justify-end gap-3">
              <button onClick={() => setTransactionToDelete(null)} className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancelar</button>
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
          <div className="bg-white dark:bg-[#012a3d] rounded-2xl shadow-2xl max-w-md overflow-hidden animate-in zoom-in-95 duration-200 scale-100 border border-slate-100 dark:border-slate-800">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-6 flex items-center gap-4 border-b border-blue-100 dark:border-blue-900/30">
              <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-full"><FileEdit className="text-blue-600 dark:text-blue-400 w-6 h-6" /></div>
              <div><h3 className="text-lg font-serif font-bold text-brand-deepBlue dark:text-slate-100">Editar Lançamento?</h3><p className="text-sm text-slate-500 dark:text-slate-400">Os dados serão carregados no formulário acima.</p></div>
              <button onClick={() => setTransactionToEdit(null)} className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
            </div>
            <div className="p-6 bg-white dark:bg-[#012a3d] flex justify-end gap-3">
              <button onClick={() => setTransactionToEdit(null)} className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancelar</button>
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