export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'transfer' | 'promptpay' | 'credit_card' | 'ewallet';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
  paymentMethod?: PaymentMethod | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface MonthlyBudgetSettings {
  userId: string;
  monthlyBudget: number;
  updatedAt?: string;
}

export interface MonthlySummaryStats {
  year: number;
  month: number; // 1 - 12
  monthLabel: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number; // percentage
  dailyAvgExpense: number;
  highestExpenseCategory: { name: string; amount: number; percentage: number } | null;
  transactionCount: number;
  prevMonthDiff: {
    incomePercent: number;
    expensePercent: number;
  };
}

export interface DailyDataPoint {
  day: number;
  dateStr: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryDataPoint {
  name: string;
  amount: number;
  count: number;
  color: string;
  percentage: number;
  icon?: string;
}
