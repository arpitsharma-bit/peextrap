import React from 'react';
import { StatCard } from './StatCard';
import { RecentTransactions } from './RecentTransactions';
import { MonthlyTrend } from './MonthlyTrend';
import { MonthComparison } from './MonthComparison';
import { MonthSelector } from './MonthSelector';
import { useAuth } from '../hooks/useAuth';

interface DashboardProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyTransactions: any[];
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
  currency?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  totalIncome, 
  totalExpenses, 
  balance, 
  monthlyTransactions,
  selectedMonth,
  onMonthChange,
  currency = 'USD'
}) => {
  const { user } = useAuth();
  const userCurrency = user?.user_metadata?.currency || 'USD';

  // Filter transactions for the selected month
  const currentMonthTransactions = monthlyTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getMonth() === selectedMonth.getMonth() && 
           transactionDate.getFullYear() === selectedMonth.getFullYear();
  });

  // Calculate totals for the selected month
  const currentMonthIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthBalance = currentMonthIncome - currentMonthExpenses;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Month Selector */}
      <MonthSelector 
        selectedMonth={selectedMonth}
        onMonthChange={onMonthChange}
      />
      {/* Stats Cards */}
      <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
        {/* Balance Card - Full width on mobile, 1/3 on larger screens */}
        <div className="w-full">
          <StatCard
            title="Balance"
            value={currentMonthBalance}
            change={+4.3}
            isPercentage={false}
            currency={userCurrency}
            className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
          />
        </div>
        
        {/* Income and Expenses - Single row on mobile, separate on larger screens */}
        <div className="grid grid-cols-2 gap-3 sm:contents">
          <StatCard
            title="Total Income"
            value={currentMonthIncome}
            change={+12.5}
            isPercentage={false}
            currency={userCurrency}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200"
          />
          <StatCard
            title="Total Expenses"
            value={currentMonthExpenses}
            change={-8.2}
            isPercentage={false}
            currency={userCurrency}
            className="bg-gradient-to-br from-red-50 to-red-100 border-red-200"
          />
        </div>
      </div>

      {/* Charts and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6">Monthly Trend</h3>
            <MonthlyTrend transactions={monthlyTransactions} />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6">Recent Transactions</h3>
            <RecentTransactions transactions={currentMonthTransactions.slice(0, 5)} currency={userCurrency} />
          </div>
        </div>
      </div>

      {/* Month Comparison */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6">Month Comparison</h3>
        <MonthComparison currency={userCurrency} />
      </div>
    </div>
  );
};