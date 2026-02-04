"use client";

import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import api from "../../../services/api"; 
import { Transaction } from "../../../types";
import { BalanceCard } from "../../../components/balance_card";
import { TransactionForm } from "../../../components/transaction_form";
import { TransactionList } from "../../../components/transaction_list";
import { toast } from "sonner";
import { AlertTriangle, X, Trash2, Save } from "lucide-react"; // Importamos ícones para o modal
import { useReports } from "../../../hooks/use_reports"; // Reutilizamos o hook limpo

export default function LancamentosPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [reportName, setReportName] = useState("");
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const {refetch : updateSidebar } = useReports(); // Para atualizar a sidebar após finalizar

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
      
      // [3] A MÁGICA ACONTECE AQUI:
      // Atualiza a lista global. A Sidebar vai "piscar" com o novo dado instantaneamente.
      await updateSidebar(); 
      
      fetchTransactions(); 
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.detail) {
        // Se o backend mandou uma mensagem explicativa (ex: duplicidade), mostramos ela
        toast.error(error.response.data.detail);
      } else {
        // Se foi erro de rede ou algo inesperado
        toast.error("Erro ao finalizar mês. Verifique sua conexão.");
    }}
  };

  const handleAddTransaction = async (transaction: Transaction) => {
    try {
      await api.post('/transactions', transaction);
      toast.success("Lançamento salvo!");
      fetchTransactions(); 
    } catch (error) {
      console.error("Erro ao criar:", error);
      toast.error("Erro ao salvar lançamento.");
    }
  };

  // --- ALTERADO: Apenas abre o modal, não deleta ainda ---
  const requestDelete = (id: string) => {
    setTransactionToDelete(id);
  };

  // --- NOVO: Executa a deleção real quando o usuário clica em "Sim, excluir" ---
  const confirmDelete = async () => {
    if (!transactionToDelete) return;

    try {
      // Otimista: remove da tela antes da API responder
      const id = transactionToDelete;
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setTransactionToDelete(null); // Fecha o modal

      await api.delete(`/transactions/${id}`);
      toast.success("Item removido com sucesso.");
      
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast.error("Erro ao excluir. O item reaparecerá ao atualizar.");
      fetchTransactions(); // Reverte se der erro
    }
  };

  // Cálculos
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
        <TransactionForm onAddTransaction={handleAddTransaction} />
      </section>

      <section className="animate-in fade-in duration-700 delay-100">
        <BalanceCard totalIncome={totalIncome} totalExpense={totalExpense} balance={balance} />
      </section>

      <section className="animate-in slide-in-from-bottom-4 duration-700 delay-200">
        <TransactionList 
          transactions={transactions} 
          onDeleteTransaction={requestDelete} // Passamos a função que abre o modal
        />
      </section>
      {showFinalizeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl w-[400px] shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-serif font-bold text-[#013750] mb-2">Fechar Planejamento</h2>
            <p className="text-slate-500 mb-6 text-sm">
              Isso salvará os dados atuais no Histórico e preparará a tela para o próximo mês.
            </p>
            
            <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1">Nome do Relatório</label>
            <input 
              autoFocus
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="Ex: Fevereiro 2026"
              className="w-full p-3 border border-slate-300 rounded-lg mb-6 focus:outline-none focus:border-[#F23E02]"
            />
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowFinalizeModal(false)}
                className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={handleFinalize}
                className="px-6 py-2 bg-[#F23E02] text-white rounded-lg font-bold hover:bg-[#d93602]"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- NOVO: O Modal Customizado --- */}
      {transactionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md overflow-hidden animate-in zoom-in-95 duration-200 scale-100">
            
            {/* Header do Modal */}
            <div className="bg-red-50 p-6 flex items-center gap-4 border-b border-red-100">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="text-brand-orange w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-brand-deepBlue">Excluir Transação?</h3>
                <p className="text-sm text-slate-500">Essa ação não poderá ser desfeita.</p>
              </div>
              <button 
                onClick={() => setTransactionToDelete(null)}
                className="ml-auto text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Footer com Ações */}
            <div className="p-6 bg-white flex justify-end gap-3">
              <button
                onClick={() => setTransactionToDelete(null)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                // Eventos para detectar o mouse
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
  
                className="px-4 py-2 text-white font-bold rounded-lg shadow-md flex items-center gap-2 transition-all duration-200 active:scale-95"
  
                // Lógica: Se o mouse estiver em cima, usa uma cor mais escura (#d63802), senão usa a cor da marca (#F23E02)
                style={{ 
                  backgroundColor: isHovered ? '#d63802' : '#F23E02',
                  cursor: 'pointer' 
                }}
              >
                <Trash2 size={18} />
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}