import React from 'react';
import { Transaction, Category } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MonthComparisonProps {
  transactions: Transaction[];
  categories: Category[];
  selectedMonth: Date;
}

export const MonthComparison: React.FC<MonthComparisonProps> = ({ 
  transactions, 
  categories, 
  selectedMonth 
}) => {
  const getCurrentMonthData = () => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === selectedMonth.getMonth() && 
             date.getFullYear() === selectedMonth.getFullYear();
    });
  };

  const getPreviousMonthData = () => {
    const prevMonth = new Date(selectedMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === prevMonth.getMonth() && 
             date.getFullYear() === prevMonth.getFullYear();
    });
  };

  const currentMonthTransactions = getCurrentMonthData();
  const previousMonthTransactions = getPreviousMonthData();

  const currentMonthTotal = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const previousMonthTotal = previousMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const difference = currentMonthTotal - previousMonthTotal;
  const percentageChange = previousMonthTotal === 0 ? 0 : 
    ((difference / previousMonthTotal) * 100);

  const getTrendIcon = () => {
    if (Math.abs(percentageChange) < 1) return <Minus className="w-5 h-5" />;
    return percentageChange > 0 ? 
      <TrendingUp className="w-5 h-5" /> : 
      <TrendingDown className="w-5 h-5" />;
  };

  const getTrendColor = () => {
    if (Math.abs(percentageChange) < 1) return 'text-gray-500';
    return percentageChange > 0 ? 'text-red-500' : 'text-emerald-500';
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const prevMonth = new Date(selectedMonth);
  prevMonth.setMonth(prevMonth.getMonth() - 1);

  const maxAmount = Math.max(currentMonthTotal, previousMonthTotal, 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Month-over-Month Comparison</h3>
      
      <div className="space-y-6">
        {/* Visual Comparison Bars */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm font-medium text-gray-700">
                {formatMonth(selectedMonth)}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              ${currentMonthTotal.toFixed(2)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${(currentMonthTotal / maxAmount) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span className="text-sm font-medium text-gray-700">
                {formatMonth(prevMonth)}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              ${previousMonthTotal.toFixed(2)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gray-400 h-3 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${(previousMonthTotal / maxAmount) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Change Summary */}
        <div className={`p-4 rounded-lg border-l-4 ${
          Math.abs(percentageChange) < 1 ? 'bg-gray-50 border-gray-400' :
          percentageChange > 0 ? 'bg-red-50 border-red-400' : 'bg-emerald-50 border-emerald-400'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={getTrendColor()}>
                {getTrendIcon()}
              </div>
              <span className="text-sm font-medium text-gray-700">
                Change from last month
              </span>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${getTrendColor()}`}>
                {difference >= 0 ? '+' : ''}${difference.toFixed(2)}
              </div>
              <div className={`text-sm ${getTrendColor()}`}>
                {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown Comparison */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Top Categories This Month</h4>
          {categories.slice(0, 3).map(category => {
            const currentAmount = currentMonthTransactions
              .filter(t => t.type === 'expense' && t.categoryId === category.id)
              .reduce((sum, t) => sum + t.amount, 0);
            
            const previousAmount = previousMonthTransactions
              .filter(t => t.type === 'expense' && t.categoryId === category.id)
              .reduce((sum, t) => sum + t.amount, 0);

            const categoryChange = currentAmount - previousAmount;
            
            if (currentAmount === 0) return null;

            return (
              <div key={category.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-gray-700">{category.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    ${currentAmount.toFixed(2)}
                  </span>
                  {categoryChange !== 0 && (
                    <span className={`text-xs ${
                      categoryChange > 0 ? 'text-red-500' : 'text-emerald-500'
                    }`}>
                      {categoryChange > 0 ? '+' : ''}${categoryChange.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};