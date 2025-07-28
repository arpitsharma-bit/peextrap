import React from 'react';
import { Transaction, Category } from '../types';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ 
  transactions, 
  categories 
}) => {
  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📋</div>
          <p>No transactions yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map(transaction => {
        const category = categories.find(c => c.id === transaction.categoryId);
        return (
          <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ backgroundColor: category?.color + '20' }}
              >
                {category?.icon}
              </div>
              <div>
                <p className="font-medium text-gray-900">{transaction.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${
                transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">{category?.name}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};