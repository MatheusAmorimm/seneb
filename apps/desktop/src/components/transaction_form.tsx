"use client";

import { useState, useEffect, useMemo } from 'react';
import { Plus, CreditCard, AlertCircle, Hash, CalendarClock, Save, Info, X, PenLine, Target } from 'lucide-react';
import api from '../services/api';
import { Goal, Transaction, TransactionType, PaymentMethod } from '../types';
import { toast } from 'sonner';
import { getCategoriesByType, getSubcategories } from '../constants/categories';
import { AppSelect } from './ui/app_select';
import { AppDateInput } from './ui/app_date_input';

const MAX_AMOUNT = 1_000_000_000;

function formatCurrencyInput(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const capped = digits.length > 12 ? digits.slice(0, 12) : digits;
  const num = parseInt(capped, 10);
  const formatted = (num / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return formatted;
}

function parseCurrencyToNumber(masked: string): number {
  if (!masked) return 0;
  const cleaned = masked.replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

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

const PAYMENT_OPTIONS_ALL = [
  { value: "credit_card", label: "Cartão de Crédito" },
  { value: "debit_card", label: "Cartão de Débito" },
  { value: "cash", label: "Dinheiro" },
  { value: "pix", label: "Pix" },
  { value: "bill", label: "Boleto" }
];

// Subcategorias que usam débito automático + boleto + pix + crédito (recorrentes/fixas)
const SUBCATEGORIES_FIXED_PAYMENT = new Set(["Plano de saúde"]);
// Subcategorias que aceitam todas as formas incluindo boleto
const SUBCATEGORIES_ALL_PAYMENT = new Set(["Roupas"]);

// Categorias que mostram campos especiais de despesas
const CATEGORIES_WITH_PAYMENT = ["Moradia", "Transporte", "Saúde", "Educação", "Despesas Financeiras", "Compras Pessoais", "Alimentação", "Lazer e Estilo de Vida", "Família e Dependentes", "Impostos"];
// Categorias cujas contas têm datas de vencimento recorrentes ou anuais
const CATEGORIES_WITH_DUE_DATE = [
  "Moradia",           // aluguel, condomínio, contas de serviços
  "Despesas Financeiras", // fatura do cartão, empréstimo, parcelamentos
  "Impostos",          // IRPF, IPTU, IPVA, taxas
  "Saúde",             // plano de saúde, mensalidade da academia
  "Educação",          // mensalidade escolar, faculdade
  "Transporte",        // IPVA, seguro do veículo
  "Família e Dependentes", // creche, mensalidades
];
const CATEGORIES_WITH_INSTALLMENT = ["Compras Pessoais", "Despesas Financeiras", "Lazer e Estilo de Vida"];

interface TransactionFormProps {
  onAddTransaction: (transaction: Transaction) => Promise<void>;
  initialData?: Transaction | null; 
  onCancelEdit?: () => void;
}

export function TransactionForm({ onAddTransaction, initialData, onCancelEdit }: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
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

  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalId, setGoalId] = useState<string>('');
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);

  const [errors, setErrors] = useState({
    category: false,
    subcategory: false,
    amount: false,
    goal: false,
  });

  const formatBankName = (name: string) => {
    return name.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  // Load edit data
  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setCategory(initialData.category);
      setSubcategory(initialData.subcategory || '');
      setDescription(initialData.description || '');
      setAmount(formatCurrencyInput(Math.round(initialData.amount * 100).toString()));
      setPaymentMethod(initialData.payment_method || '');
      setDueDate(initialData.due_date || '');
      setBank(initialData.bank || '');
      
      setIsInstallment(!!initialData.is_installment);
      setTotalInstallments(initialData.total_installments || 1);
      
      if (initialData.installment_identifier) {
        const [current] = initialData.installment_identifier.split('/');
        setCurrentInstallment(parseInt(current) || 1);
      } else {
        setCurrentInstallment(1);
      }
      
      setGoalId(initialData.goal_id || '');
      setErrors({ category: false, subcategory: false, amount: false, goal: false });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      resetForm();
    }
  }, [initialData]);

  const resetForm = () => {
    setType('expense');
    setCategory('');
    setSubcategory('');
    setDescription('');
    setAmount('');
    setPaymentMethod('');
    setBank('');
    setDueDate('');
    setIsInstallment(false);
    setIsCustomBankMode(false);
    setTotalInstallments(1);
    setCurrentInstallment(1);
    setGoalId('');
    setErrors({ category: false, subcategory: false, amount: false, goal: false });
  };

  // Fetch custom banks
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

  useEffect(() => {
    if (type !== 'goal') return;
    setIsLoadingGoals(true);
    api.get('/goals').then(r => setGoals(r.data)).catch(() => {}).finally(() => setIsLoadingGoals(false));
  }, [type]);

  // Categories filtered by type
  const availableCategories = useMemo(
    () => type === 'goal' ? [] : getCategoriesByType(type),
    [type]
  );
  const availableSubcategories = useMemo(() => getSubcategories(category), [category]);

  // Field visibility
  const showPaymentField = useMemo(() => {
    if (type === 'income') return false;
    return CATEGORIES_WITH_PAYMENT.includes(category);
  }, [type, category]);

  const currentPaymentOptions = useMemo(() => {
    if (["Impostos", "Despesas Financeiras"].includes(category)) return PAYMENT_OPTIONS_BILLS;
    if (["Moradia"].includes(category)) return PAYMENT_OPTIONS_FIXED;
    if (SUBCATEGORIES_FIXED_PAYMENT.has(subcategory)) return PAYMENT_OPTIONS_FIXED;
    if (SUBCATEGORIES_ALL_PAYMENT.has(subcategory)) return PAYMENT_OPTIONS_ALL;
    return PAYMENT_OPTIONS_DEFAULT;
  }, [category, subcategory]);

  const showBankField = useMemo(() => {
    if (type === 'income') return false;
    if (["Moradia", "Despesas Financeiras", "Impostos"].includes(category)) return true;
    if (paymentMethod && paymentMethod !== 'cash') return true;
    return false;
  }, [type, category, paymentMethod]);

  const showDueDateField = useMemo(() => {
    if (type === 'income') return false;
    return CATEGORIES_WITH_DUE_DATE.includes(category);
  }, [type, category]);

  const showInstallmentField = useMemo(() => {
    if (type === 'income') return false;
    if (CATEGORIES_WITH_INSTALLMENT.includes(category) && paymentMethod === "credit_card") return true;
    if (["Despesas Financeiras"].includes(category)) return true;
    return false;
  }, [type, category, paymentMethod]);

  const showTotalValueWarning = useMemo(() => {
    return isInstallment;
  }, [isInstallment]);

  // Cleanup effects
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setGoalId('');
    if (!initialData) {
       setCategory(''); setSubcategory(''); setDescription(''); setAmount(''); setPaymentMethod('');
       setBank(''); setDueDate(''); setIsInstallment(false); setIsCustomBankMode(false);
       setErrors({ category: false, subcategory: false, amount: false, goal: false });
    }
  };

  useEffect(() => {
    if (initialData && category === initialData.category) return;
    setSubcategory('');
    setPaymentMethod(''); setBank(''); setDueDate('');
    setIsInstallment(false); setIsCustomBankMode(false);
  }, [category]);

  useEffect(() => {
    if (currentInstallment > totalInstallments) setCurrentInstallment(1);
  }, [totalInstallments, currentInstallment]);

  // Bank handlers
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

    const parsedAmount = parseCurrencyToNumber(amount);
    const hasAmountError = !amount || parsedAmount <= 0 || parsedAmount > MAX_AMOUNT;

    if (type === 'goal') {
      const hasGoalError = !goalId;
      if (hasGoalError || hasAmountError) {
        setErrors(prev => ({ ...prev, goal: hasGoalError, amount: hasAmountError }));
        toast.error("Preencha os campos obrigatórios em vermelho.");
        return;
      }
    } else {
      const hasCategoryError = !category;
      const hasSubcategoryError = !subcategory;
      if (hasCategoryError || hasSubcategoryError || hasAmountError) {
        setErrors({ category: hasCategoryError, subcategory: hasSubcategoryError, amount: hasAmountError, goal: false });
        toast.error("Preencha os campos obrigatórios em vermelho.");
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const payload: Transaction = type === 'goal' ? {
        id: initialData?.id,
        type,
        category: 'Meta',
        subcategory: '',
        description: description || undefined,
        amount: parsedAmount,
        date: initialData?.date || new Date().toISOString().split('T')[0],
        goal_id: goalId,
      } : {
        id: initialData?.id,
        type, category, subcategory,
        description: description || undefined,
        amount: parsedAmount,
        date: initialData?.date || new Date().toISOString().split('T')[0],
        due_date: showDueDateField && dueDate ? dueDate : undefined,
        payment_method: showPaymentField ? (paymentMethod as PaymentMethod) : undefined,
        bank: showBankField ? bank : undefined,
        is_installment: isInstallment,
        total_installments: isInstallment ? totalInstallments : 1,
        installment_identifier: isInstallment ? `${currentInstallment}/${totalInstallments}` : undefined
      };

      await onAddTransaction(payload);

      if (!initialData) {
        setCategory('');
        setSubcategory('');
        setDescription('');
        setAmount(''); setPaymentMethod(''); setBank(''); setDueDate('');
        setIsInstallment(false); setTotalInstallments(1); setCurrentInstallment(1); setIsCustomBankMode(false);
        setGoalId('');
        setErrors({ category: false, subcategory: false, amount: false, goal: false });
      }
    } catch (error) { console.error(error); }
    finally { setIsSubmitting(false); }
  };

  const installmentPreview = useMemo(() => {
    const parsed = parseCurrencyToNumber(amount);
    if (!parsed || totalInstallments <= 1) return null;
    const value = parsed / totalInstallments;
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }, [amount, totalInstallments]);

  const installmentLabel = useMemo(() => {
    if (subcategory === "Empréstimo") return "Empréstimo Parcelado?";
    if (subcategory === "Fatura do Cartão") return "Fatura Parcelada?";
    return "Compra Parcelada?";
  }, [subcategory]);

  const getInputClass = (hasError: boolean) => 
    `w-full h-11 px-3 border rounded-lg focus:outline-none transition-all ${
        hasError 
        ? 'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-200 placeholder-red-400 ring-1 ring-red-500'
        : 'border-slate-200 dark:border-slate-700 focus:border-[#F23E02] bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200'
    }`;

  return (
    <form onSubmit={handleSubmit} className={`bg-white dark:bg-[#012a3d] p-6 rounded-xl shadow-sm border mb-8 transition-colors ${initialData ? 'border-orange-200 dark:border-orange-900/50 bg-orange-50/10 dark:bg-orange-950/10' : 'border-slate-100 dark:border-slate-800'}`}>
      
      {/* HEADER TIPO */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
            <h2 className="text-lg font-serif font-bold text-[#013750] dark:text-slate-100">
                {initialData ? 'Editar Movimentação' : 'Nova Movimentação'}
            </h2>
            {initialData && <PenLine size={16} className="text-orange-500"/>}
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
          <button type="button" onClick={() => handleTypeChange('income')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${type === 'income' ? 'bg-white dark:bg-slate-800 text-[#00988D] dark:text-teal-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>Receita</button>
          <button type="button" onClick={() => handleTypeChange('expense')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${type === 'expense' ? 'bg-white dark:bg-slate-800 text-[#F23E02] dark:text-orange-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>Despesa</button>
          <button type="button" onClick={() => handleTypeChange('goal')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${type === 'goal' ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}><Target size={13} /> Meta</button>
        </div>
      </div>
      
      <div className="flex flex-col gap-5">
        {/* LINHA 1: Categoria + Subcategoria + Valor (ou Meta) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">

          {type === 'goal' ? (
            <div className="md:col-span-6">
              <label className={`block text-xs font-bold uppercase mb-1.5 ml-1 ${errors.goal ? 'text-red-600' : 'text-[#2C6B74] dark:text-teal-400'}`}>Meta *</label>
              <AppSelect
                value={goalId}
                onChange={(v) => { setGoalId(v); if (v) setErrors(prev => ({ ...prev, goal: false })); }}
                options={goals.map(g => ({ value: g.id!, label: g.name }))}
                placeholder={isLoadingGoals ? 'Carregando...' : 'Selecione a meta...'}
                hasError={errors.goal}
                disabled={isLoadingGoals}
              />
            </div>
          ) : (
            <>
              <div className="md:col-span-3">
                <label className={`block text-xs font-bold uppercase mb-1.5 ml-1 ${errors.category ? 'text-red-600' : 'text-[#2C6B74] dark:text-teal-400'}`}>Categoria *</label>
                <AppSelect
                  value={category}
                  onChange={(v) => { setCategory(v); if (v) setErrors(prev => ({ ...prev, category: false })); }}
                  options={availableCategories.map(cat => ({ value: cat.name, label: cat.name }))}
                  placeholder="Selecione..."
                  hasError={errors.category}
                />
              </div>

              <div className="md:col-span-3">
                <label className={`block text-xs font-bold uppercase mb-1.5 ml-1 ${errors.subcategory ? 'text-red-600' : 'text-[#2C6B74] dark:text-teal-400'}`}>Subcategoria *</label>
                <AppSelect
                  value={subcategory}
                  onChange={(v) => { setSubcategory(v); if (v) setErrors(prev => ({ ...prev, subcategory: false })); }}
                  options={availableSubcategories.map(sub => ({ value: sub, label: sub }))}
                  placeholder={category ? 'Selecione...' : 'Escolha a categoria'}
                  hasError={errors.subcategory}
                  disabled={!category}
                />
              </div>
            </>
          )}

          <div className="md:col-span-3">
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="block text-xs font-bold uppercase text-[#2C6B74] dark:text-teal-400">
                  Descrição
              </label>
              <span className={`text-[10px] font-medium ${description.length >= 90 ? 'text-orange-500 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                {description.length}/100
              </span>
            </div>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={type !== 'goal' && !category}
              maxLength={100}
              className={`${getInputClass(false)} disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:border-slate-200 dark:disabled:border-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600`}
              placeholder="Opcional — detalhe aqui" 
            />
          </div>

          <div className="md:col-span-3 relative">
            <div className="flex items-center gap-1.5 mb-1.5 ml-1">
              <label className={`block text-xs font-bold uppercase ${errors.amount ? 'text-red-600' : 'text-[#2C6B74] dark:text-teal-400'}`}>Valor Total (R$) *</label>
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
            <input 
                type="text" inputMode="numeric"
                value={amount} 
                onChange={(e) => {
                    const formatted = formatCurrencyInput(e.target.value);
                    const parsed = parseCurrencyToNumber(formatted);
                    if (parsed > MAX_AMOUNT) return;
                    setAmount(formatted);
                    if(formatted) setErrors(prev => ({...prev, amount: false}));
                }}
                className={getInputClass(errors.amount)}
                placeholder="0,00" 
            />
          </div>
        </div>

        {/* LINHA 2: Pagamento e Banco */}
        {(showPaymentField || showBankField || showDueDateField) && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start animate-in fade-in slide-in-from-top-1 duration-300">
            {showPaymentField && (
              <div className={`${showDueDateField ? 'md:col-span-4' : 'md:col-span-6'}`}>
                <label className="block text-xs font-bold text-[#2C6B74] dark:text-teal-400 uppercase mb-1.5 ml-1">Meio de Pagamento</label>
                <AppSelect
                  value={paymentMethod}
                  onChange={(v) => setPaymentMethod(v as PaymentMethod)}
                  options={currentPaymentOptions}
                  placeholder="Selecione..."
                />
              </div>
            )}

            {showBankField && (
              <div className={`${showDueDateField ? 'md:col-span-4' : 'md:col-span-6'}`}>
                <label className="block text-xs font-bold text-[#2C6B74] dark:text-teal-400 uppercase mb-1.5 ml-1">Banco / Origem</label>
                {!isCustomBankMode ? (
                  <AppSelect
                    value={bank}
                    onChange={handleBankChange}
                    options={[
                      ...bankList.map(b => ({ value: b, label: b })),
                      { value: 'other_custom_option', label: '+ Outro', accent: true },
                    ]}
                    placeholder={isLoadingBanks ? 'Carregando...' : 'Selecione...'}
                    disabled={isLoadingBanks}
                  />
                ) : (
                  <div className="flex gap-2 animate-in fade-in slide-in-from-left-1">
                    <input value={bank} onChange={(e) => setBank(e.target.value)} autoFocus
                      className="w-full h-11 px-4 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#F23E02] bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" placeholder="Nome do banco..." />
                    {bank && (
                      <button type="button" onClick={handleAddNewBank} title="Salvar banco"
                        className="h-11 px-3 bg-teal-50 dark:bg-teal-950/20 text-[#00988D] dark:text-teal-400 border border-teal-200 dark:border-teal-900/50 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors"><Save size={18} /></button>
                    )}
                  </div>
                )}
              </div>
            )}

            {showDueDateField && (
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-[#2C6B74] dark:text-teal-400 uppercase mb-1.5 ml-1 flex items-center gap-1"><CalendarClock size={12} /> Vencimento</label>
                <AppDateInput value={dueDate} onChange={setDueDate} />
              </div>
            )}
          </div>
        )}

        {/* LINHA 3: Parcelamento */}
        {showInstallmentField && (
          <div className="p-4 bg-orange-50/50 dark:bg-orange-950/10 rounded-xl border border-orange-100 dark:border-orange-900/30 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="installments" checked={isInstallment} onChange={(e) => setIsInstallment(e.target.checked)}
                  className="w-5 h-5 accent-[#F23E02] rounded cursor-pointer" />
                <label htmlFor="installments" className="text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none">
                  {installmentLabel}
                </label>
              </div>

              {isInstallment && (
                <div className="flex-1 flex flex-wrap items-end gap-4 animate-in fade-in slide-in-from-left-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#F23E02] dark:text-orange-400 uppercase mb-1 flex items-center gap-1"><CreditCard size={12} /> Total</label>
                    <select value={totalInstallments} onChange={(e) => setTotalInstallments(parseInt(e.target.value))}
                      className="w-24 h-10 px-2 border border-orange-200 dark:border-orange-900/50 rounded-lg focus:outline-none focus:border-[#F23E02] bg-white dark:bg-slate-900 text-sm dark:text-slate-200">
                      {[...Array(12)].map((_, i) => (<option key={i} value={i + 1} className="dark:bg-slate-900">{i + 1}x</option>))}
                      <option value="18" className="dark:bg-slate-900">18x</option><option value="24" className="dark:bg-slate-900">24x</option><option value="36" className="dark:bg-slate-900">36x</option><option value="48" className="dark:bg-slate-900">48x</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#F23E02] dark:text-orange-400 uppercase mb-1 flex items-center gap-1"><Hash size={12} /> Atual</label>
                    <select value={currentInstallment} onChange={(e) => setCurrentInstallment(parseInt(e.target.value))}
                      className="w-24 h-10 px-2 border border-orange-200 dark:border-orange-900/50 rounded-lg focus:outline-none focus:border-[#F23E02] bg-white dark:bg-slate-900 text-sm dark:text-slate-200">
                      {[...Array(totalInstallments)].map((_, i) => (<option key={i} value={i + 1} className="dark:bg-slate-900">{i + 1}ª</option>))}
                    </select>
                  </div>
                  {installmentPreview && (
                    <div className="ml-auto flex items-center gap-1.5 text-xs font-medium text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/40 px-3 py-1.5 rounded-full mt-2 md:mt-0 border border-orange-200 dark:border-orange-900/50">
                      <AlertCircle size={14} /><span>{totalInstallments}x de <strong>{installmentPreview}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-2 flex justify-end gap-3">
          {initialData && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <X size={20} /> Cancelar
            </button>
          )}

          <button type="submit" disabled={isSubmitting}
            className={`text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed ${initialData ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#F23E02] hover:bg-[#d93602]'}`}>
            {isSubmitting ? 'Processando...' : initialData ? <><Save size={20} /> Salvar Edição</> : <><Plus size={20} /> Adicionar</>}
          </button>
        </div>
      </div>
    </form>
  );
}