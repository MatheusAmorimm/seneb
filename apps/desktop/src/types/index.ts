export type TransactionType = 'income' | 'expense' | 'goal';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'cash' | 'pix' | 'bill' | 'automatic_debit';
export type TransactionStatus = 'draft' | 'finalized';

export interface Transaction {
  id?: string; // Opcional pois na criação ainda não tem ID
  description?: string;
  amount: number;
  type: TransactionType;
  category: string;
  subcategory?: string;
  date: string;
  due_date?: string;

  payment_method?: PaymentMethod;
  bank?: string;
  
  // Controle de Parcelas
  is_installment?: boolean;
  current_installment?: number;
  total_installments?: number;
  installment_identifier?: string; // Ex: "1/10"

  goal_id?: string;
  status?: TransactionStatus;
  report_id?: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  deadline: string; // "YYYY-MM-DD"
  image_base64?: string;
  current_amount: number;
  is_celebrated: boolean;
  celebrated_at?: string;
  created_at?: string;
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
export interface UserData {
  nickname?: string;
  full_name?: string;
  email?: string;
}

export interface GroupMember {
  user_id: string;
  role: 'admin' | 'guest';
}

export interface Group {
  id: string;
  name: string;
  owner_id: string;
  members: GroupMember[];
  created_at: string;
}