"use client";

import { useState, useEffect, useMemo } from 'react';
import { Plus, CreditCard, AlertCircle, Hash } from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod } from '../types';

// --- CONSTANTES DE DOMÍNIO ---
const CATEGORIES = {
  income: ["Salário", "Férias", "Décimo Terceiro", "Investimentos", "Outros"],
  expense: ["Compra", "Conta Fixa", "Empréstimo", "Impostos", "Juros Cheque Especial"]
};

const SUGGESTIONS: Record<string, string[]> = {
  "Conta Fixa": ["Aluguel", "Luz", "Internet", "Água", "Gás", "Condomínio"],
  "Empréstimo": ["FGTS", "Pessoal", "Consignado"],
  "Impostos": ["IPVA", "IPTU", "Imposto de Renda"]
};

const PAYMENT_OPTIONS_DEFAULT = [
  { value: "credit_card", label: "Cartão de Crédito" },
  { value: "debit_card", label: "Débito" },
  { value: "cash", label: "Dinheiro" },
  { value: "pix", label: "Pix" }
];

const PAYMENT_OPTIONS_TAXES = [
  { value: "automatic_debit", label: "Débito Automático" },
  { value: "bill", label: "Boleto" },
  { value: "pix", label: "Pix" }
];

interface TransactionFormProps {
  onAddTransaction: (transaction: Transaction) => Promise<void>;
}

export function TransactionForm({ onAddTransaction }: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATE ---
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [bank, setBank] = useState('');
  
  // State de Parcelamento
  const [isInstallment, setIsInstallment] = useState(false);
  const [totalInstallments, setTotalInstallments] = useState(1);
  const [currentInstallment, setCurrentInstallment] = useState(1); // Novo campo

  // --- LÓGICA DE VISIBILIDADE ---
  const descriptionOptions = useMemo(() => SUGGESTIONS[category] || [], [category]);
  const hasDescriptionOptions = descriptionOptions.length > 0;

  const showPaymentField = useMemo(() => {
    if (type === 'income') return false;
    return ["Compra", "Empréstimo", "Juros Cheque Especial", "Impostos"].includes(category);
  }, [type, category]);

  const currentPaymentOptions = useMemo(() => {
    return category === "Impostos" ? PAYMENT_OPTIONS_TAXES : PAYMENT_OPTIONS_DEFAULT;
  }, [category]);

  const showBankField = useMemo(() => {
    if (type === 'income') return false;
    if (["Empréstimo", "Juros Cheque Especial", "Impostos"].includes(category)) return true;
    if (category === "Compra" && paymentMethod && paymentMethod !== 'cash') return true;
    return false;
  }, [type, category, paymentMethod]);

  const showInstallmentField = useMemo(() => {
    if (type === 'income') return false;
    if (category === "Compra" && paymentMethod === "credit_card") return true;
    if (category === "Empréstimo") return true;
    if (category === "Impostos" && (description === "IPVA" || description === "IPTU")) return true;
    return false;
  }, [type, category, paymentMethod, description]);

  // --- EFEITOS ---
  useEffect(() => {
    setCategory('');
    setDescription('');
    setAmount('');
    setPaymentMethod('');
    setBank('');
    setIsInstallment(false);
  }, [type]);

  useEffect(() => {
    setPaymentMethod('');
    setBank('');
    setIsInstallment(false);
    if (SUGGESTIONS[category] && !SUGGESTIONS[category].includes(description)) {
      setDescription('');
    }
  }, [category]);

  // Resetar a parcela atual se o total diminuir (Ex: estava na 10/12, mudou total para 5 -> vira 1/5)
  useEffect(() => {
    if (currentInstallment > totalInstallments) {
      setCurrentInstallment(1);
    }
  }, [totalInstallments, currentInstallment]);

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) return;
    if (type === 'expense' && !description) return;

    try {
      setIsSubmitting(true);

      const payload: Transaction = {
        type,
        category,
        description,
        amount: parseFloat(amount),
        date: new Date().toISOString().split('T')[0],
        payment_method: showPaymentField ? (paymentMethod as PaymentMethod) : undefined,
        bank: showBankField ? bank : undefined,
        is_installment: isInstallment,
        total_installments: isInstallment ? totalInstallments : 1,
        // Envia o índice atual para o backend calcular corretamente (Ex: salvar como 3/10)
        installment_identifier: isInstallment ? `${currentInstallment}/${totalInstallments}` : undefined
      };

      await onAddTransaction(payload);

      // Reset
      setDescription('');
      setAmount('');
      setPaymentMethod('');
      setBank('');
      setIsInstallment(false);
      setTotalInstallments(1);
      setCurrentInstallment(1);

    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const installmentPreview = useMemo(() => {
    if (!amount || totalInstallments <= 1) return null;
    const value = parseFloat(amount) / totalInstallments;
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }, [amount, totalInstallments]);

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
      
      {/* TIPO */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-serif font-bold text-[#013750]">Nova Movimentação</h2>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              type === 'income' ? 'bg-white text-[#00988D] shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Receita
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              type === 'expense' ? 'bg-white text-[#F23E02] shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Despesa
          </button>
          
        </div>
      </div>
      
      <div className="flex flex-col gap-5">
        
        {/* LINHA 1 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1.5 ml-1">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-11 px-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F23E02] bg-white text-slate-700 transition-all"
            >
              <option value="">Selecione...</option>
              {CATEGORIES[type].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1.5 ml-1">Descrição</label>
            {hasDescriptionOptions ? (
              <div className="relative">
                <select
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!category}
                  className="w-full h-11 px-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F23E02] bg-white text-slate-700 transition-all disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">{category ? "Selecione..." : "Escolha a categoria"}</option>
                  {descriptionOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ) : (
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!category && type === 'expense'}
                className="w-full h-11 px-4 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F23E02] transition-all disabled:bg-slate-50 disabled:placeholder-slate-300"
                placeholder={type === 'income' ? "Opcional" : "Ex: Supermercado"}
              />
            )}
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1.5 ml-1">Valor Total (R$)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-11 px-4 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F23E02] transition-all"
              placeholder="0,00"
            />
          </div>

        </div>

        {/* LINHA 2 */}
        {(showPaymentField || showBankField) && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start animate-in fade-in slide-in-from-top-1 duration-300">
            
            {showPaymentField && (
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1.5 ml-1">Meio de Pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full h-11 px-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F23E02] bg-white text-slate-700"
                >
                  <option value="">Selecione...</option>
                  {currentPaymentOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}

            {showBankField && (
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1.5 ml-1">Banco / Origem</label>
                <input
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="w-full h-11 px-4 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F23E02]"
                  placeholder="Ex: Nubank, Itaú"
                />
              </div>
            )}
          </div>
        )}

        {/* LINHA 3: PARCELAMENTO */}
        {showInstallmentField && (
          <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              
              {/* Checkbox */}
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="installments" 
                  checked={isInstallment}
                  onChange={(e) => setIsInstallment(e.target.checked)}
                  className="w-5 h-5 accent-[#F23E02] rounded cursor-pointer"
                />
                <label htmlFor="installments" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                  Compra Parcelada?
                </label>
              </div>

              {isInstallment && (
                <div className="flex-1 flex flex-wrap items-end gap-4 animate-in fade-in slide-in-from-left-2">
                  
                  {/* Total de Parcelas */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#F23E02] uppercase mb-1 flex items-center gap-1">
                      <CreditCard size={12} /> Total
                    </label>
                    <select
                      value={totalInstallments}
                      onChange={(e) => setTotalInstallments(parseInt(e.target.value))}
                      className="w-24 h-10 px-2 border border-orange-200 rounded-lg focus:outline-none focus:border-[#F23E02] bg-white text-sm"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1}x</option>
                      ))}
                      <option value="18">18x</option>
                      <option value="24">24x</option>
                      <option value="36">36x</option>
                      <option value="48">48x</option>
                    </select>
                  </div>

                  {/* Parcela Atual (O NOVO CAMPO) */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#F23E02] uppercase mb-1 flex items-center gap-1">
                      <Hash size={12} /> Atual
                    </label>
                    <select
                      value={currentInstallment}
                      onChange={(e) => setCurrentInstallment(parseInt(e.target.value))}
                      className="w-24 h-10 px-2 border border-orange-200 rounded-lg focus:outline-none focus:border-[#F23E02] bg-white text-sm"
                    >
                      {/* Gera lista de 1 até o Total selecionado */}
                      {[...Array(totalInstallments)].map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1}ª</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Preview do Valor */}
                  {installmentPreview && (
                    <div className="ml-auto flex items-center gap-1.5 text-xs font-medium text-orange-700 bg-orange-100 px-3 py-1.5 rounded-full mt-2 md:mt-0">
                      <AlertCircle size={14} />
                      <span>{totalInstallments}x de <strong>{installmentPreview}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOTÃO */}
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !amount || !category}
            className="bg-[#F23E02] hover:bg-[#d93602] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            {isSubmitting ? 'Processando...' : <><Plus size={20} /> Adicionar</>}
          </button>
        </div>
      </div>
    </form>
  );
}