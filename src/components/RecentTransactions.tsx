import React from 'react';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../hooks/useAuth';

interface RecentTransactionsProps {
  transactions: Transaction[];
  currency?: string;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ 
  transactions, 
  currency = 'USD'
}) => {
  const { user } = useAuth();
  const userCurrency = user?.user_metadata?.currency || 'USD';
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
    <div className="space-y-2 sm:space-y-3">
      {transactions.map(transaction => {
        return (
          <div key={transaction.id} className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg bg-blue-100"
              >
                {transaction.type === 'income' ? '💰' : '💸'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{transaction.description || 'No name'}</p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right ml-2">
              <p className={`font-semibold text-sm sm:text-base ${
                transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, currency)}
              </p>
              <p className="text-xs text-gray-500">{transaction.type === 'income' ? 'Income' : 'Expense'}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};