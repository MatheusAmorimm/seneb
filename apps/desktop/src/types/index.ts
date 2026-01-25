export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'cash' | 'pix' | 'bill' | 'automatic_debit';

export interface Transaction {
  id?: string; // Opcional pois na criação ainda não tem ID
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  
  payment_method?: PaymentMethod;
  bank?: string;
  
  // Controle de Parcelas
  is_installment?: boolean;
  installment_identifier?: string; // Ex: "1/10"
  total_installments?: number;
}