import React from 'react';
import { Transaction, Category, Budget } from '../types';
import { StatCard } from './StatCard';
import { ExpenseChart } from './ExpenseChart';
import { RecentTransactions } from './RecentTransactions';
import { MonthComparison } from './MonthComparison';
import { MonthSelector } from './MonthSelector';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  transactions, 
  categories, 
  budgets, 
  selectedMonth, 
  onMonthChange 
}) => {
  const currentMonth = selectedMonth.getMonth();
  const currentYear = selectedMonth.getFullYear();
  
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const totalBudget = budgets
    .filter(b => b.period === 'monthly')
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-8">
      <MonthSelector 
        selectedMonth={selectedMonth} 
        onMonthChange={onMonthChange} 
      />
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Overview</h2>
        <p className="text-gray-600">Your financial snapshot for {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Income"
          value={totalIncome}
          icon="💰"
          color="green"
          trend={totalIncome > 0 ? 'up' : 'neutral'}
        />
        <StatCard
          title="Total Expenses"
          value={totalExpenses}
          icon="💸"
          color="red"
          trend={totalExpenses > totalBudget ? 'down' : 'neutral'}
        />
        <StatCard
          title="Balance"
          value={balance}
          icon="⚖️"
          color={balance >= 0 ? 'green' : 'red'}
          trend={balance >= 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Budget Used"
          value={totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0}
          icon="🎯"
          color={totalExpenses > totalBudget ? 'red' : 'blue'}
          trend="neutral"
          isPercentage
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending by Category</h3>
          <ExpenseChart 
            transactions={currentMonthTransactions.filter(t => t.type === 'expense')} 
            categories={categories}
          />
        </div>

        <MonthComparison 
          transactions={transactions}
          categories={categories}
          selectedMonth={selectedMonth}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions This Month</h3>
        <RecentTransactions 
          transactions={currentMonthTransactions.slice(0, 5)} 
          categories={categories}
        />
      </div>
    </div>
  );
};