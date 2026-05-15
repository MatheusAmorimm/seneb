"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileSearch, ArrowLeft, UnlockKeyhole, AlertTriangle, X, RotateCcw } from 'lucide-react';

import api from "../../../../services/api";
import { Transaction } from "../../../../types";
import { TransactionList } from "../../../../components/transaction_list";
import { TransactionFilters } from "../../../../components/transaction_filters";
import { BalanceCard } from "../../../../components/balance_card";
import { useReports } from "../../../../hooks/use_reports"; 
export default function HistoricoPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00988D]"></div>
      </div>
    }>
      <HistoricoContent />
    </Suspense>
  );
}

function HistoricoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reportId = searchParams.get("id");

  // 1. Hook de Relatórios
  const { reports, isLoading: loadingReports, refetch: refreshSidebar } = useReports();

  // 2. Estados locais
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // 3. Estados do Modal e UX
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 4. Efeito: Carregar detalhes
  useEffect(() => {
    if (!reportId) return;

    async function loadDetails() {
      setLoadingDetails(true);
      try {
        const response = await api.get(`/reports/${reportId}/transactions`);
        setTransactions(response.data);
        setFilteredTransactions(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar detalhes do mês.");
      } finally {
        setLoadingDetails(false);
      }
    }

    loadDetails();
  }, [reportId]);

  // 5. Redirecionamento Automático
  useEffect(() => {
    if (!loadingReports && reports.length > 0 && !reportId) {
      router.replace(`/historico?id=${reports[0].id}`);
    }
  }, [loadingReports, reports, reportId, router]);

  const currentReport = reports.find(r => r.id === reportId);

  // --- HANDLERS ---

  // Apenas abre o modal
  const handleRequestReopen = () => {
    if (!currentReport) return;
    setShowReopenModal(true);
  };

  // Executa a ação real (chamado pelo Modal)
  const confirmReopen = async () => {
    if (!currentReport) return;

    try {
      await api.delete(`/reports/${currentReport.id}/reopen`);
      toast.success("Mês reaberto com sucesso!");
      
      setShowReopenModal(false); // Fecha modal
      await refreshSidebar();    // Atualiza sidebar (remove cadeado)
      
      // 🚀 A CORREÇÃO DE OURO: Agora nós enviamos o ID na URL!
      router.push(`/lancamentos?reopenedId=${currentReport.id}`); 
      
    } catch (error) {
      console.error(error);
      toast.error("Erro ao reabrir mês.");
    }
  };

  // --- RENDERS DE ESTADO ---

  if (loadingReports) {
    return (
      <div className="space-y-8 pb-10">
        <div className="flex items-end justify-between mb-6">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 animate-in fade-in">
        <div className="flex justify-between items-center mb-8 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 dark:text-slate-500 hover:text-[#013750] dark:hover:text-slate-100"
              title="Voltar para Home"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-serif font-bold text-[#013750] dark:text-slate-100 transition-colors">Meu Histórico</h1>
          </div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-full border border-slate-200 dark:border-slate-800">
          <FileSearch size={48} className="text-slate-400 dark:text-slate-600" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#013750] dark:text-slate-100">Histórico Vazio</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          Você ainda não fechou nenhum mês. Vá em &quot;Lançamentos&quot; e finalize seu planejamento.
        </p>
        <button 
          onClick={() => {
            const activeReopenedId = sessionStorage.getItem('seneb_active_reopened_id');
            if (activeReopenedId) {
              router.push(`/lancamentos?reopenedId=${activeReopenedId}`);
            } else {
              router.push('/lancamentos');
            }
          }}
          className="bg-[#00988D] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#007f76] transition-colors cursor-pointer"
        >
          Ir para Lançamentos
        </button>
      </div>
    );
  }

  if (reportId && !currentReport) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-xl font-bold text-slate-700">Relatório não encontrado</h2>
        <button onClick={() => router.push('/historico')} className="text-[#00988D] underline mt-2">
          Voltar ao início
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 relative">
      {/* CABEÇALHO */}
      <div className="flex items-end justify-between mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
              <button onClick={() => router.push('/')} className="p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer">
                  <ArrowLeft size={20} />
              </button>
              <span className="text-xs font-bold text-[#00988D] uppercase tracking-wider">
                  Relatório Fechado
              </span>
          </div>
          
          {currentReport ? (
              <h1 className="text-4xl font-serif font-bold text-[#013750] dark:text-slate-100 transition-colors">
                  {currentReport.name}
              </h1>
          ) : (
              <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          )}
        </div>

        {currentReport && (
          <button 
            onClick={handleRequestReopen} 
            className="h-fit w-fit bg-[#F23E02] hover:bg-[#d93602] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            title="Voltar itens para edição"
          >
            <UnlockKeyhole size={18} />
            <span>Reabrir Mês</span>
          </button>
        )}
      </div>

      {/* METADADOS */}
      {currentReport && (
        <section>
          <BalanceCard
            totalIncome={currentReport.total_income}
            totalExpense={currentReport.total_expense}
            balance={currentReport.balance}
          />
        </section>
      )}

      {/* LISTA */}
      <section>
        <h3 className="text-lg font-bold text-[#013750] dark:text-slate-100 mb-4 flex items-center gap-2 transition-colors">
            Detalhamento
            {loadingDetails && <span className="text-xs font-normal text-slate-400 dark:text-slate-500">(Carregando...)</span>}
        </h3>
        
        {loadingDetails ? (
           <div className="space-y-3">
             {[1, 2, 3].map(i => (
               <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
             ))}
           </div>
         ) : (
           <>
            <TransactionFilters transactions={transactions} onFilter={setFilteredTransactions} />
            <TransactionList 
              transactions={filteredTransactions} 
              onDeleteTransaction={async () => toast.info("Histórico é imutável! Reabra o mês se precisar editar.")}
            />
           </>
         )}
      </section>

      {/* --- MODAL DE CONFIRMAÇÃO (Substitui o window.confirm) --- */}
      {showReopenModal && currentReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#012a3d] rounded-2xl shadow-2xl max-w-md overflow-hidden animate-in zoom-in-95 duration-200 scale-100 border border-slate-100 dark:border-slate-800">
            
            {/* Header Amarelo (Atenção) */}
            <div className="bg-amber-50 dark:bg-amber-950/20 p-6 flex items-center gap-4 border-b border-amber-100 dark:border-amber-900/30">
              <div className="bg-amber-100 dark:bg-amber-900/40 p-3 rounded-full">
                <AlertTriangle className="text-amber-600 dark:text-amber-400 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-brand-deepBlue dark:text-slate-100">Reabrir este mês?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Os dados voltarão para a tela de lançamentos.</p>
              </div>
              <button 
                onClick={() => setShowReopenModal(false)}
                className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo Explicativo */}
            <div className="px-6 py-4 bg-white dark:bg-[#012a3d] text-sm text-slate-600 dark:text-slate-400">
              <p>Ao reabrir <strong>{currentReport.name}</strong>, você poderá editar ou excluir as transações novamente na aba de Planejamento.</p>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Nota: O relatório sairá do histórico até ser finalizado novamente.</p>
            </div>

            {/* Footer */}
            <div className="p-6 bg-white dark:bg-[#012a3d] flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowReopenModal(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              
              <button
                onClick={confirmReopen}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="px-4 py-2 text-white font-bold rounded-lg shadow-md flex items-center gap-2 transition-all duration-200 active:scale-95"
                style={{ 
                  backgroundColor: isHovered ? '#d97706' : '#f59e0b', // Laranja Escuro -> Mais escuro no hover
                  cursor: 'pointer' 
                }}
              >
                <RotateCcw size={18} />
                Sim, Reabrir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}