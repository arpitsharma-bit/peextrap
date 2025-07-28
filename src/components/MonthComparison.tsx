import React from 'react';
import { Transaction } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

interface MonthComparisonProps {
  currency?: string;
}

export const MonthComparison: React.FC<MonthComparisonProps> = ({ 
  currency = 'USD'
}) => {
  // Mock data for demonstration - in a real app, this would come from props or context
  const currentMonthTotal = 2500;
  const previousMonthTotal = 2200;
  const difference = currentMonthTotal - previousMonthTotal;
  const percentageChange = previousMonthTotal <= 0 ? 0 : 
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

  const currentMonth = new Date();
  const prevMonth = new Date(currentMonth);
  prevMonth.setMonth(prevMonth.getMonth() - 1);

  const maxAmount = Math.max(currentMonthTotal, previousMonthTotal, 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Month-over-Month Comparison</h3>
      
              <div className="space-y-4 sm:space-y-6">
        {/* Visual Comparison Bars */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span className="text-sm font-medium text-gray-700">
              {formatMonth(currentMonth)}
            </span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(currentMonthTotal, currency)}
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
              {formatCurrency(previousMonthTotal, currency)}
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
                {difference >= 0 ? '+' : ''}{formatCurrency(difference, currency)}
              </div>
              <div className={`text-sm ${getTrendColor()}`}>
                {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder for future category breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Top Categories This Month</h4>
          <div className="text-sm text-gray-500">
            Category breakdown will be available when transaction data is connected.
          </div>
        </div>
      </div>
    </div>
  );
};