export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'cash' | 'pix' | 'bill' | 'automatic_debit';
export type TransactionStatus = 'draft' | 'finalized';

export interface Transaction {
  id?: string; // Opcional pois na criação ainda não tem ID
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  due_date?: string;

  payment_method?: PaymentMethod;
  bank?: string;
  
  // Controle de Parcelas
  is_installment?: boolean;
  current_installment?: number;
  total_installments?: number;
  installment_identifier?: string; // Ex: "1/10"

  status?: TransactionStatus;
  report_id?: string; // ID do relatório ao qual pertence
}

export interface Report {
  id: string; // _id do Mongo mapeado
  name: string; // "Janeiro 2026"
  reference_month: string;
  total_income: number;
  total_expense: number;
  balance: number;
  created_at: string;
}