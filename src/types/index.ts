export interface Transaction {
  id: string;
  user_id?: string;
  amount: number;
  description: string;
  categoryId: string;
  type: 'income' | 'expense';
  date: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  color: string;
  icon: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Budget {
  id: string;
  user_id?: string;
  categoryId: string;
  amount: number;
  period: 'monthly' | 'weekly';
  startDate: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChartData {
  label: string;
  value: number;
  color: string;
}