import React, { useState } from 'react';
import { Category } from '../types';

interface TransactionFormProps {
  onSubmit: (transaction: {
    amount: number;
    description: string;
    categoryId: string;
    type: 'income' | 'expense';
    date: string;
  }) => Promise<void>;
  categories: Category[];
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, categories }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    categoryId: '',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.categoryId) return;

    setSubmitting(true);
    try {
      await onSubmit({
      amount: parseFloat(formData.amount),
      description: formData.description,
      categoryId: formData.categoryId,
      type: formData.type,
      date: formData.date,
      });

      setFormData({
        amount: '',
        description: '',
        categoryId: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const availableCategories = categories.filter(c => 
    formData.type === 'income' ? c.name === 'Income' : c.name !== 'Income'
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Transaction</h2>
          <p className="text-gray-600">Record your income or expenses</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'expense', categoryId: '' }))}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                formData.type === 'expense'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">💸</div>
              <div className="font-medium">Expense</div>
            </button>
            
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'income', categoryId: '' }))}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                formData.type === 'income'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">💰</div>
              <div className="font-medium">Income</div>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What did you spend on?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableCategories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, categoryId: category.id }))}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    formData.categoryId === category.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg mb-1">{category.icon}</div>
                  <div className="text-sm font-medium text-gray-700">{category.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Add Transaction'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};