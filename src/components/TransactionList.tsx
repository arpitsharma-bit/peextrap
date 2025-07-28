import React, { useState } from 'react';
import { Transaction, Category } from '../types';
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../hooks/useAuth';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  selectedMonth: Date;
  onDelete: (id: string) => Promise<void>;
}

export const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  categories, 
  selectedMonth,
  onDelete 
}) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const userCurrency = user?.user_metadata?.currency || 'USD';

  // Filter transactions for selected month first
  const monthlyTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === selectedMonth.getMonth() && 
           transactionDate.getFullYear() === selectedMonth.getFullYear();
  });

  const filteredTransactions = monthlyTransactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.type === filter;
    const matchesSearch = !searchTerm || (transaction.description && transaction.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    } finally {
      setDeletingId(null);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Transaction History</h2>
        <p className="text-gray-600">View and manage transactions for {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex space-x-2">
            {['all', 'income', 'expense'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  filter === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📋</div>
              <p>No transactions found</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map(transaction => {
              const category = categories.find(c => c.id === transaction.categoryId);
              return (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-lg"
                      style={{ backgroundColor: category?.color + '20' }}
                    >
                      {category?.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.description || 'No name'}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{category?.name}</span>
                        <span>•</span>
                        <span>{new Date(transaction.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                                      <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, userCurrency)}
                    </p>
                  </div>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      disabled={deletingId === transaction.id}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === transaction.id ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        '🗑️'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};