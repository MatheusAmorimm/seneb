"use client";

import { useState, useEffect, useMemo } from 'react';
import { Plus, CreditCard, AlertCircle, Hash, CalendarClock, Save, Info } from 'lucide-react';
import api from '../services/api';
import { Transaction, TransactionType, PaymentMethod } from '../types';
import { toast } from 'sonner';

// --- CONSTANTES ---

const CATEGORIES = {
  income: ["Salário", "Férias", "Décimo Terceiro", "Investimentos", "Outros"],
  expense: ["Compra", "Conta Fixa", "Empréstimo", "Impostos", "Fatura do Cartão"]
};

// Sugestões para o campo DESCRIÇÃO
const DESCRIPTION_SUGGESTIONS: Record<string, string[]> = {
  "Conta Fixa": ["Aluguel", "Luz", "Internet", "Água", "Gás", "Condomínio"],
  "Empréstimo": ["FGTS", "Pessoal", "Consignado"],
  "Impostos": ["IPVA", "IPTU", "Imposto de Renda"],
};

// Bancos Padrão
const DEFAULT_BANKS = [
  "Nubank", "Itaú", "Inter", "Bradesco", "Santander", "Caixa", "Banco do Brasil", "C6 Bank"
];

const PAYMENT_OPTIONS_DEFAULT = [
  { value: "credit_card", label: "Cartão de Crédito" },
  { value: "debit_card", label: "Cartão de Débito" },
  { value: "cash", label: "Dinheiro" },
  { value: "pix", label: "Pix" }
];

const PAYMENT_OPTIONS_BILLS = [
  { value: "automatic_debit", label: "Débito Automático" },
  { value: "bill", label: "Boleto" },
  { value: "pix", label: "Pix" }
];

const PAYMENT_OPTIONS_FIXED = [
  { value: "automatic_debit", label: "Débito Automático" },
  { value: "bill", label: "Boleto" },
  { value: "pix", label: "Pix" },
  { value: "credit_card", label: "Cartão de Crédito" }
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
  const [dueDate, setDueDate] = useState(''); 
  
  const [bank, setBank] = useState('');
  const [bankList, setBankList] = useState(DEFAULT_BANKS); 
  const [isCustomBankMode, setIsCustomBankMode] = useState(false);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  
  const [isInstallment, setIsInstallment] = useState(false);
  const [totalInstallments, setTotalInstallments] = useState(1);
  const [currentInstallment, setCurrentInstallment] = useState(1);

  // Helper de formatação (Ex: nubank -> Nubank)
  const formatBankName = (name: string) => {
    return name.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  // --- BUSCA BANCOS ---
  useEffect(() => {
    const fetchUserBanks = async () => {
      try {
        setIsLoadingBanks(true);
        const response = await api.get('/users/me');
        const userCustomBanks: string[] = response.data.custom_banks || [];
        const allBanks = [...DEFAULT_BANKS, ...userCustomBanks].map(b => formatBankName(b));
        const uniqueBanks = Array.from(new Set(allBanks)).sort();
        setBankList(uniqueBanks);
      } catch (error) {
        console.error("Erro ao carregar bancos:", error);
      } finally {
        setIsLoadingBanks(false);
      }
    };
    fetchUserBanks();
  }, []);

  // --- MEMOS DE VISIBILIDADE ---
  const descriptionOptions = useMemo(() => DESCRIPTION_SUGGESTIONS[category] || [], [category]);
  const hasDescriptionOptions = descriptionOptions.length > 0;

  const showPaymentField = useMemo(() => {
    if (type === 'income') return false;
    return ["Compra", "Empréstimo", "Impostos", "Conta Fixa", "Fatura do Cartão"].includes(category);
  }, [type, category]);

  const currentPaymentOptions = useMemo(() => {
    if (category === "Impostos" || category === "Fatura do Cartão" || category === "Empréstimo") return PAYMENT_OPTIONS_BILLS;
    if (category === "Conta Fixa") return PAYMENT_OPTIONS_FIXED;
    return PAYMENT_OPTIONS_DEFAULT;
  }, [category]);

  const showBankField = useMemo(() => {
    if (type === 'income') return false;
    // 1. Categorias que sempre pedem banco
    if (["Empréstimo", "Impostos", "Conta Fixa", "Fatura do Cartão"].includes(category)) return true;
    
    // 2. CORREÇÃO AQUI: Compra pede banco se tiver meio de pagamento e NÃO for Dinheiro.
    // (Isso inclui agora Cartão de Crédito, Débito e Pix)
    if (category === "Compra" && paymentMethod && paymentMethod !== 'cash') return true;
    
    return false;
  }, [type, category, paymentMethod]);

  const showDueDateField = useMemo(() => {
    if (type === 'income') return false;
    return ["Fatura do Cartão", "Empréstimo", "Conta Fixa", "Impostos"].includes(category);
  }, [type, category]);

  const showInstallmentField = useMemo(() => {
    if (type === 'income') return false;
    if (category === "Compra" && paymentMethod === "credit_card") return true;
    if (category === "Empréstimo") return true;
    if (category === "Impostos" && (description === "IPVA" || description === "IPTU")) return true;
    return false;
  }, [type, category, paymentMethod, description]);

  const showTotalValueWarning = useMemo(() => {
    if (category === "Empréstimo") return true;
    if (isInstallment) return true;
    return false;
  }, [category, isInstallment]);

  // --- EFEITOS ---
  useEffect(() => {
    setCategory(''); setDescription(''); setAmount(''); setPaymentMethod('');
    setBank(''); setDueDate(''); setIsInstallment(false); setIsCustomBankMode(false);
  }, [type]);

  useEffect(() => {
    setPaymentMethod(''); setBank(''); setDueDate('');
    setIsInstallment(false); setIsCustomBankMode(false);
    if (category === "Fatura do Cartão") {
      setDescription("Fatura do Cartão");
    } else if (DESCRIPTION_SUGGESTIONS[category] && !DESCRIPTION_SUGGESTIONS[category].includes(description)) {
      setDescription('');
    }
  }, [category]);

  useEffect(() => {
    if (currentInstallment > totalInstallments) setCurrentInstallment(1);
  }, [totalInstallments, currentInstallment]);

  // --- HANDLERS ---
  const handleBankChange = (val: string) => {
    if (val === 'other_custom_option') { setIsCustomBankMode(true); setBank(''); } 
    else { setIsCustomBankMode(false); setBank(val); }
  };

  const handleAddNewBank = async () => {
    if (!bank) return;
    const formattedNewBank = formatBankName(bank);
    const alreadyExists = bankList.some(b => b.toLowerCase() === formattedNewBank.toLowerCase());

    if (alreadyExists) {
      toast.info(`O banco "${formattedNewBank}" já está na lista!`);
      setBank(formattedNewBank);
      setIsCustomBankMode(false);
      return;
    }

    try {
      await api.post('/users/banks', { bank_name: formattedNewBank });
      setBankList(prev => {
        const newList = [...prev, formattedNewBank].sort();
        return Array.from(new Set(newList));
      });
      toast.success(`Banco "${formattedNewBank}" salvo!`);
      setBank(formattedNewBank);
      setIsCustomBankMode(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar o banco.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) return;
    if (type === 'expense' && !description) return;

    try {
      setIsSubmitting(true);
      const finalDescription = category === "Fatura do Cartão" ? "Fatura do Cartão" : description;
      const payload: Transaction = {
        type, category, description: finalDescription, amount: parseFloat(amount),
        date: new Date().toISOString().split('T')[0],
        due_date: showDueDateField && dueDate ? dueDate : undefined,
        payment_method: showPaymentField ? (paymentMethod as PaymentMethod) : undefined,
        bank: showBankField ? bank : undefined,
        is_installment: isInstallment,
        total_installments: isInstallment ? totalInstallments : 1,
        installment_identifier: isInstallment ? `${currentInstallment}/${totalInstallments}` : undefined
      };
      await onAddTransaction(payload);
      
      if (category !== "Fatura do Cartão") setDescription('');
      setAmount(''); setPaymentMethod(''); setBank(''); setDueDate('');
      setIsInstallment(false); setTotalInstallments(1); setCurrentInstallment(1); setIsCustomBankMode(false);
    } catch (error) { console.error(error); } 
    finally { setIsSubmitting(false); }
  };

  const installmentPreview = useMemo(() => {
    if (!amount || totalInstallments <= 1) return null;
    const value = parseFloat(amount) / totalInstallments;
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }, [amount, totalInstallments]);

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
      {/* HEADER TIPO */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-serif font-bold text-[#013750]">Nova Movimentação</h2>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button type="button" onClick={() => setType('income')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${type === 'income' ? 'bg-white text-[#00988D] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Receita</button>
          <button type="button" onClick={() => setType('expense')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${type === 'expense' ? 'bg-white text-[#F23E02] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Despesa</button>
        </div>
      </div>
      
      <div className="flex flex-col gap-5">
        {/* LINHA 1 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1.5 ml-1">Categoria</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full h-11 px-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F23E02] bg-white text-slate-700 transition-all">
              <option value="">Selecione...</option>
              {CATEGORIES[type].map(cat => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1.5 ml-1">Descrição</label>
            {hasDescriptionOptions ? (
              <div className="relative">
                <select value={description} onChange={(e) => setDescription(e.target.value)} disabled={!category}
                  className="w-full h-11 px-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F23E02] bg-white text-slate-700 transition-all disabled:bg-slate-50 disabled:text-slate-400">
                  <option value="">{category ? "Selecione..." : "Escolha a categoria"}</option>
                  {descriptionOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
              </div>
            ) : (
              <input value={description} onChange={(e) => setDescription(e.target.value)}
                disabled={(!category && type === 'expense') || category === "Fatura do Cartão"}
                className="w-full h-11 px-4 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F23E02] transition-all disabled:bg-slate-50 disabled:placeholder-slate-300"
                placeholder={category === "Fatura do Cartão" ? "Automático" : (type === 'income' ? "Opcional" : "Ex: Supermercado")} />
            )}
          </div>

          <div className="md:col-span-4 relative">
            <div className="flex items-center gap-1.5 mb-1.5 ml-1">
              <label className="block text-xs font-bold text-[#2C6B74] uppercase">Valor Total (R$)</label>
              {showTotalValueWarning && (
                <div className="group relative flex items-center justify-center cursor-help">
                  <Info size={14} className="text-orange-500 hover:text-orange-600 transition-colors" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] leading-tight rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 text-center pointer-events-none">
                    Digite o valor <strong>TOTAL</strong> (com juros).<br/>O sistema dividirá pelas parcelas.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                  </div>
                </div>
              )}
            </div>
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full h-11 px-4 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F23E02] transition-all" placeholder="0,00" />
          </div>
        </div>

        {/* LINHA 2: Pagamento e Banco */}
        {(showPaymentField || showBankField || showDueDateField) && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start animate-in fade-in slide-in-from-top-1 duration-300">
            {showPaymentField && (
              <div className={`${showDueDateField ? 'md:col-span-4' : 'md:col-span-6'}`}>
                <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1.5 ml-1">Meio de Pagamento</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full h-11 px-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F23E02] bg-white text-slate-700">
                  <option value="">Selecione...</option>
                  {currentPaymentOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
              </div>
            )}

            {showBankField && (
              <div className={`${showDueDateField ? 'md:col-span-4' : 'md:col-span-6'}`}>
                <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1.5 ml-1">Banco / Origem</label>
                {!isCustomBankMode ? (
                  <select value={bank} onChange={(e) => handleBankChange(e.target.value)} disabled={isLoadingBanks}
                    className="w-full h-11 px-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F23E02] bg-white text-slate-700 disabled:opacity-70">
                    <option value="">{isLoadingBanks ? "Carregando..." : "Selecione..."}</option>
                    {bankList.map(b => (<option key={b} value={b}>{b}</option>))}
                    <option value="other_custom_option" className="font-bold text-[#F23E02] border-t border-slate-200">+ Outro</option>
                  </select>
                ) : (
                  <div className="flex gap-2 animate-in fade-in slide-in-from-left-1">
                    <input value={bank} onChange={(e) => setBank(e.target.value)} autoFocus
                      className="w-full h-11 px-4 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F23E02]" placeholder="Nome do banco..." />
                    {bank && (
                      <button type="button" onClick={handleAddNewBank} title="Salvar banco"
                        className="h-11 px-3 bg-teal-50 text-[#00988D] border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"><Save size={18} /></button>
                    )}
                  </div>
                )}
              </div>
            )}

            {showDueDateField && (
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1.5 ml-1 flex items-center gap-1"><CalendarClock size={12} /> Vencimento</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-11 px-4 border border-slate-200 rounded-lg focus:outline-none focus:border-[#F23E02] text-slate-600 font-sans" />
              </div>
            )}
          </div>
        )}

        {/* LINHA 3: Parcelamento */}
        {showInstallmentField && (
          <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="installments" checked={isInstallment} onChange={(e) => setIsInstallment(e.target.checked)}
                  className="w-5 h-5 accent-[#F23E02] rounded cursor-pointer" />
                <label htmlFor="installments" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                  {category === "Empréstimo" ? "Empréstimo Parcelado?" : "Compra Parcelada?"}
                </label>
              </div>

              {isInstallment && (
                <div className="flex-1 flex flex-wrap items-end gap-4 animate-in fade-in slide-in-from-left-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#F23E02] uppercase mb-1 flex items-center gap-1"><CreditCard size={12} /> Total</label>
                    <select value={totalInstallments} onChange={(e) => setTotalInstallments(parseInt(e.target.value))}
                      className="w-24 h-10 px-2 border border-orange-200 rounded-lg focus:outline-none focus:border-[#F23E02] bg-white text-sm">
                      {[...Array(12)].map((_, i) => (<option key={i} value={i + 1}>{i + 1}x</option>))}
                      <option value="18">18x</option><option value="24">24x</option><option value="36">36x</option><option value="48">48x</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#F23E02] uppercase mb-1 flex items-center gap-1"><Hash size={12} /> Atual</label>
                    <select value={currentInstallment} onChange={(e) => setCurrentInstallment(parseInt(e.target.value))}
                      className="w-24 h-10 px-2 border border-orange-200 rounded-lg focus:outline-none focus:border-[#F23E02] bg-white text-sm">
                      {[...Array(totalInstallments)].map((_, i) => (<option key={i} value={i + 1}>{i + 1}ª</option>))}
                    </select>
                  </div>
                  {installmentPreview && (
                    <div className="ml-auto flex items-center gap-1.5 text-xs font-medium text-orange-700 bg-orange-100 px-3 py-1.5 rounded-full mt-2 md:mt-0">
                      <AlertCircle size={14} /><span>{totalInstallments}x de <strong>{installmentPreview}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-2 flex justify-end">
          <button type="submit" disabled={isSubmitting || !amount || !category}
            className="bg-[#F23E02] hover:bg-[#d93602] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95">
            {isSubmitting ? 'Processando...' : <><Plus size={20} /> Adicionar</>}
          </button>
        </div>
      </div>
    </form>
  );
}