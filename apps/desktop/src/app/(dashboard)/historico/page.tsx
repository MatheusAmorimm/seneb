"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileSearch, ArrowLeft, UnlockKeyhole } from "lucide-react";
import Link from "next/link";

import api from "../../../services/api";
import { Transaction } from "../../../types";
import { TransactionList } from "../../../components/transaction_list";
import { BalanceCard } from "../../../components/balance_card";
import { useReports } from "../../../hooks/use_reports"; // Reutilizamos o hook limpo

export default function HistoricoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reportId = searchParams.get("id");

  // 1. Hook de Relatórios (Traz a lista e metadados como saldo, nome, etc)
  const { reports, isLoading: loadingReports, refetch: refreshSidebar } = useReports();

  // 2. Estados locais para os detalhes da transação
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);


  // 3. Efeito: Sempre que o reportId da URL mudar, carregamos os detalhes
  useEffect(() => {
    if (!reportId) return;

    async function loadDetails() {
      setLoadingDetails(true);
      try {
        const response = await api.get(`/reports/${reportId}/transactions`);
        setTransactions(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar detalhes do mês.");
      } finally {
        setLoadingDetails(false);
      }
    }

    loadDetails();
  }, [reportId]);

  // 4. Lógica de Redirecionamento Automático (Opcional)
  // Se entrou na página sem ID e tem relatórios, joga para o mais recente
  useEffect(() => {
    if (!loadingReports && reports.length > 0 && !reportId) {
      router.replace(`/historico?id=${reports[0].id}`);
    }
  }, [loadingReports, reports, reportId, router]);

  // --- ESTADO: Carregando Lista Principal ---
  if (loadingReports) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00988D]"></div>
      </div>
    );
  }

  // --- ESTADO: Sem Nenhum Histórico ---
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 animate-in fade-in">
        <div className="bg-slate-100 p-6 rounded-full">
          <FileSearch size={48} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#013750]">Histórico Vazio</h2>
        <p className="text-slate-500 max-w-md">
          Você ainda não fechou nenhum mês. Vá em &quot;Lançamentos&quot; e finalize seu planejamento.
        </p>
        <Link 
          href="/lancamentos"
          className="bg-[#00988D] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#007f76] transition-colors"
        >
          Ir para Lançamentos
        </Link>
      </div>
    );
  }

  // Encontra o relatório ativo para mostrar os Cards de Saldo (Metadados)
  const currentReport = reports.find(r => r.id === reportId);

  // Se tem ID na URL mas não achou o relatório (ex: ID inválido), mostra erro
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

  const handleReopenMonth = async () => {
    if (!currentReport) return;

    const confirm = window.confirm(`Tem certeza que deseja reabrir "${currentReport.name}"? Isso moverá todas as transações de volta para "Lançamentos".`);
    
    if (confirm){
      try {
        await api.delete(`/reports/${currentReport.id}/reopen`);
        toast.success("Mês reaberto com sucesso!");
        
        await refreshSidebar();
        router.push("/lancamentos");
      } catch (error) {
        toast.error("Erro ao reabrir mês:");
      }
    }
  };

    return (
    <div className="space-y-8 pb-10">
      
      {/* --- INÍCIO DA ALTERAÇÃO: NOVO CABEÇALHO --- */}
      <div className="flex items-end justify-between mb-6 animate-in slide-in-from-top-4">
        
        {/* LADO ESQUERDO: Voltar, Label e Título */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
              <Link href="/" className="p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                  <ArrowLeft size={20} />
              </Link>
              <span className="text-xs font-bold text-[#00988D] uppercase tracking-wider">
                  Relatório Fechado
              </span>
          </div>
          
          {currentReport ? (
              <h1 className="text-4xl font-serif font-bold text-[#013750]">
                  {currentReport.name}
              </h1>
          ) : (
              <div className="h-10 w-64 bg-slate-200 rounded animate-pulse" />
          )}
        </div>

        {/* LADO DIREITO: Botão Compacto e Alinhado */}
        {currentReport && (
          <button 
            onClick={handleReopenMonth}
            className="h-fit w-fit bg-[#F23E02] hover:bg-[#d93602] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            title="Voltar itens para edição"
          >
            <UnlockKeyhole size={18} />
            <span>Reabrir Mês</span>
          </button>
        )}
      </div>
      {/* --- FIM DA ALTERAÇÃO --- */}

      {/* Cards de Saldo (Mantido igual) */}
      {currentReport && (
        <section className="animate-in fade-in duration-500">
          <BalanceCard 
            totalIncome={currentReport.total_income}
            totalExpense={currentReport.total_expense}
            balance={currentReport.balance}
          />
        </section>
      )}

      {/* Lista de Transações (Mantido igual) */}
      <section className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
        <h3 className="text-lg font-bold text-[#013750] mb-4 flex items-center gap-2">
            Detalhamento
            {loadingDetails && <span className="text-xs font-normal text-slate-400">(Carregando...)</span>}
        </h3>
        
        {loadingDetails ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <TransactionList 
            transactions={transactions} 
            onDeleteTransaction={async () => toast.info("Histórico é imutável! Reabra o mês se precisar editar.")}
          />
        )}
      </section>
    </div>
  );
}