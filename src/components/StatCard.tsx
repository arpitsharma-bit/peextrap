import React from 'react';
import { formatCurrency } from '../utils/currency';

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  isPercentage?: boolean;
  currency?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change,
  isPercentage = false,
  currency = 'USD',
  className = ''
}) => {
  const formatValue = (val: number) => {
    if (isPercentage) {
      return `${val.toFixed(1)}%`;
    }
    return formatCurrency(val, currency);
  };

  const getChangeColor = (change?: number) => {
    if (!change) return 'text-gray-500';
    return change > 0 ? 'text-emerald-600' : 'text-red-600';
  };

  const getChangeIcon = (change?: number) => {
    if (!change) return '📊';
    return change > 0 ? '📈' : '📉';
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 sm:p-6 hover:shadow-md transition-shadow duration-200 ${className}`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-lg sm:text-xl">💰</span>
        </div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 text-sm ${getChangeColor(change)}`}>
            <span>{getChangeIcon(change)}</span>
            <span>{change > 0 ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>
      
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatValue(value)}</p>
      </div>
    </div>
  );
};