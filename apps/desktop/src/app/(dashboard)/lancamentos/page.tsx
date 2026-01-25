"use client";

import { useState, useEffect } from "react";
import { api } from "../../../services/api"; 
import { Transaction } from "../../../types";
import { BalanceCard } from "../../../components/balance_card";
import { TransactionForm } from "../../../components/transaction_form";
import { TransactionList } from "../../../components/transaction_list";

export default function LancamentosPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Estado para controlar carregamento inicial
  const [isLoading, setIsLoading] = useState(true);

  // 1. Carregar transações da API ao abrir a tela
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      // Ajuste a rota se necessário (ex: /transactions)
      const response = await api.get('/transactions'); 
      setTransactions(response.data);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Enviar nova transação para a API
  const handleAddTransaction = async (transaction: Transaction) => {
    try {
      const response = await api.post('/transactions', transaction);
      // Adiciona o retorno da API (que já vem com ID) na lista local
      setTransactions((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      throw error; // Joga o erro para o Form tratar
    }
  };

  // 3. Deletar transação na API
  const handleDeleteTransaction = async (id: string) => {
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Erro ao excluir item.");
    }
  };

  // Cálculos
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Carregando transações...</div>;
  }

  return (
    <div className="space-y-8 pb-10">
      <section className="animate-in slide-in-from-top-4 duration-500">
        <TransactionForm onAddTransaction={handleAddTransaction} />
      </section>

      <section className="animate-in fade-in duration-700 delay-100">
        <BalanceCard 
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          balance={balance}
        />
      </section>

      <section className="animate-in slide-in-from-bottom-4 duration-700 delay-200">
        <TransactionList 
          transactions={transactions} 
          onDeleteTransaction={handleDeleteTransaction}
        />
      </section>
    </div>
  );
}