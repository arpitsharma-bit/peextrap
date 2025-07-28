import React from 'react';
import { Transaction } from '../types';

interface MonthlyTrendProps {
  transactions: Transaction[];
}

export const MonthlyTrend: React.FC<MonthlyTrendProps> = ({ transactions }) => {
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      month: date.getMonth(),
      year: date.getFullYear(),
      name: date.toLocaleDateString('en-US', { month: 'short' }),
    };
  }).reverse();

  const monthlyData = last6Months.map(month => {
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === month.month && 
             transactionDate.getFullYear() === month.year;
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { ...month, income, expenses, balance: income - expenses };
  });

  const maxAmount = Math.max(
    ...monthlyData.flatMap(m => [m.income, m.expenses]),
    1
  );

  if (monthlyData.every(m => m.income === 0 && m.expenses === 0)) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-2">
        {monthlyData.map((month, index) => (
          <div key={index} className="text-center">
            <div className="h-32 flex flex-col justify-end space-y-1 mb-2">
              <div
                className="bg-emerald-500 rounded-t transition-all duration-500 ease-out"
                style={{
                  height: `${(month.income / maxAmount) * 120}px`,
                  minHeight: month.income > 0 ? '4px' : '0px',
                }}
                title={`Income: $${month.income.toFixed(2)}`}
              />
              <div
                className="bg-red-500 rounded-t transition-all duration-500 ease-out"
                style={{
                  height: `${(month.expenses / maxAmount) * 120}px`,
                  minHeight: month.expenses > 0 ? '4px' : '0px',
                }}
                title={`Expenses: $${month.expenses.toFixed(2)}`}
              />
            </div>
            <p className="text-xs font-medium text-gray-600">{month.name}</p>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-emerald-500 rounded"></div>
          <span className="text-gray-600">Income</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-600">Expenses</span>
        </div>
      </div>
    </div>
  );
};