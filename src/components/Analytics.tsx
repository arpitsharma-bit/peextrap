import React from 'react';
import { Transaction, Category } from '../types';

interface AnalyticsProps {
  transactions: Transaction[];
  categories: Category[];
  selectedMonth: Date;
}

export const Analytics: React.FC<AnalyticsProps> = ({ transactions, categories, selectedMonth }) => {
  const currentMonth = selectedMonth.getMonth();
  const currentYear = selectedMonth.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const getCurrentMonthData = () => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
  };

  const getLastMonthData = () => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });
  };

  const currentMonthTransactions = getCurrentMonthData();
  const lastMonthTransactions = getLastMonthData();

  const currentMonthExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const lastMonthExpenses = lastMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseChange = lastMonthExpenses === 0 ? 0 : 
    ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;

  const getTopCategories = () => {
    const categoryTotals = categories.map(category => {
      const total = currentMonthTransactions
        .filter(t => t.type === 'expense' && t.categoryId === category.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...category, total };
    }).filter(c => c.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return categoryTotals;
  };

  const getSpendingInsights = () => {
    const insights = [];
    
    if (expenseChange > 20) {
      insights.push({
        type: 'warning',
        message: `Your spending increased by ${expenseChange.toFixed(1)}% compared to last month`,
        icon: '⚠️'
      });
    } else if (expenseChange < -10) {
      insights.push({
        type: 'success',
        message: `Great job! You reduced spending by ${Math.abs(expenseChange).toFixed(1)}% this month`,
        icon: '🎉'
      });
    }

    const topCategory = getTopCategories()[0];
    if (topCategory && topCategory.total > currentMonthExpenses * 0.4) {
      insights.push({
        type: 'info',
        message: `${topCategory.name} accounts for ${((topCategory.total / currentMonthExpenses) * 100).toFixed(1)}% of your expenses`,
        icon: '💡'
      });
    }

    return insights;
  };

  const topCategories = getTopCategories();
  const insights = getSpendingInsights();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics & Insights</h2>
        <p className="text-gray-600">Understand your spending patterns for {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
      </div>

      {insights.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Smart Insights</h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                insight.type === 'warning' ? 'bg-orange-50 border-orange-400' :
                insight.type === 'success' ? 'bg-emerald-50 border-emerald-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">{insight.icon}</span>
                  <p className="text-sm text-gray-700">{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Spending Categories This Month</h3>
          {topCategories.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p>No spending data available</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {topCategories.map((category, index) => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${category.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      {((category.total / currentMonthExpenses) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Month Comparison</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">{selectedMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                <p className="text-xl font-bold text-gray-900">${currentMonthExpenses.toFixed(2)}</p>
              </div>
              <div className="text-2xl">📅</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Previous Month</p>
                <p className="text-xl font-bold text-gray-900">${lastMonthExpenses.toFixed(2)}</p>
              </div>
              <div className="text-2xl">📆</div>
            </div>

            <div className={`p-4 rounded-lg ${
              expenseChange > 0 ? 'bg-red-50' : 'bg-emerald-50'
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Change</p>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {expenseChange > 0 ? '📈' : expenseChange < 0 ? '📉' : '➖'}
                  </span>
                  <span className={`font-bold ${
                    expenseChange > 0 ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {expenseChange > 0 ? '+' : ''}{expenseChange.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Transaction Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-2xl font-bold text-blue-600">{getCurrentMonthData().length}</p>
            <p className="text-sm text-gray-600">This Month</p>
          </div>
          
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <div className="text-2xl mb-2">💰</div>
            <p className="text-2xl font-bold text-emerald-600">
              {getCurrentMonthData().filter(t => t.type === 'income').length}
            </p>
            <p className="text-sm text-gray-600">Income Entries</p>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl mb-2">💸</div>
            <p className="text-2xl font-bold text-red-600">
              {getCurrentMonthData().filter(t => t.type === 'expense').length}
            </p>
            <p className="text-sm text-gray-600">Expense Entries</p>
          </div>
        </div>
      </div>
    </div>
  );
};