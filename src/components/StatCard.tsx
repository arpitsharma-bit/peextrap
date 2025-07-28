import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'green' | 'red' | 'blue' | 'orange';
  trend: 'up' | 'down' | 'neutral';
  isPercentage?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  trend, 
  isPercentage = false 
}) => {
  const colorClasses = {
    green: 'from-emerald-500 to-emerald-600',
    red: 'from-red-500 to-red-600',
    blue: 'from-blue-500 to-blue-600',
    orange: 'from-orange-500 to-orange-600',
  };

  const trendIcon = {
    up: '📈',
    down: '📉',
    neutral: '📊',
  };

  const formatValue = (val: number) => {
    if (isPercentage) {
      return `${val.toFixed(1)}%`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <span className="text-xl">{icon}</span>
        </div>
        <span className="text-lg">{trendIcon[trend]}</span>
      </div>
      
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
      </div>
    </div>
  );
};