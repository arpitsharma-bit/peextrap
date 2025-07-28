import React from 'react';
import { Transaction, Category } from '../types';

interface ExpenseChartProps {
  transactions: Transaction[];
  categories: Category[];
}

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ transactions, categories }) => {
  const categoryTotals = categories.map(category => {
    const total = transactions
      .filter(t => t.categoryId === category.id)
      .reduce((sum, t) => sum + t.amount, 0);
    return { ...category, total };
  }).filter(c => c.total > 0);

  const maxAmount = Math.max(...categoryTotals.map(c => c.total), 1);

  if (categoryTotals.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>No expenses this month</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categoryTotals.map(category => (
        <div key={category.id} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span>{category.icon}</span>
              <span className="font-medium text-gray-700">{category.name}</span>
            </div>
            <span className="font-semibold text-gray-900">
              ${category.total.toFixed(2)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-500 ease-out"
              style={{
                backgroundColor: category.color,
                width: `${(category.total / maxAmount) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};