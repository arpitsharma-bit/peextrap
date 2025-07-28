import React, { useState } from 'react';
import { Budget, Category, Transaction } from '../types';

interface BudgetTrackerProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  selectedMonth: Date;
  onAddBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  onUpdateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  onDeleteBudget: (id: string) => Promise<void>;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  budgets,
  categories,
  transactions,
  selectedMonth,
  onAddBudget,
  onDeleteBudget,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'weekly',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId || !formData.amount) return;

    setSubmitting(true);
    try {
      await onAddBudget({
        categoryId: formData.categoryId,
        amount: parseFloat(formData.amount),
        period: formData.period,
        startDate: new Date().toISOString().split('T')[0],
      });

      setFormData({
        categoryId: '',
        amount: '',
        period: 'monthly',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error adding budget:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      await onDeleteBudget(id);
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const getBudgetProgress = (budget: Budget) => {
    const currentMonth = selectedMonth.getMonth();
    const currentYear = selectedMonth.getFullYear();
    
    const spent = transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'expense' && 
               t.categoryId === budget.categoryId &&
               transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    return { spent, remaining: budget.amount - spent, percentage: (spent / budget.amount) * 100 };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Budget Tracker</h2>
          <p className="text-gray-600">Set and monitor your spending limits for {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02]"
        >
          Create Budget
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">New Budget</h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  {categories.filter(c => c.name !== 'Income').map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period
                </label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value as 'monthly' | 'weekly' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  'Create Budget'
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map(budget => {
          const category = categories.find(c => c.id === budget.categoryId);
          const progress = getBudgetProgress(budget);
          const isOverBudget = progress.percentage > 100;

          return (
            <div key={budget.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ backgroundColor: category?.color + '20' }}
                  >
                    {category?.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{category?.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{budget.period}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteBudget(budget.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  🗑️
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Spent</span>
                  <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                    ${progress.spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ease-out ${
                      isOverBudget ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{
                      width: `${Math.min(progress.percentage, 100)}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${
                    progress.remaining >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {progress.remaining >= 0 ? 'Remaining' : 'Over budget'}
                  </span>
                  <span className={`text-sm font-semibold ${
                    progress.remaining >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    ${Math.abs(progress.remaining).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {budgets.length === 0 && !showForm && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets yet</h3>
          <p className="text-gray-500 mb-6">Create your first budget to start tracking your spending limits</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
          >
            Create Budget
          </button>
        </div>
      )}
    </div>
  );
};