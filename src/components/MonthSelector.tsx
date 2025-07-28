import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({ selectedMonth, onMonthChange }) => {
  const goToPreviousMonth = () => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    onMonthChange(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    onMonthChange(newMonth);
  };

  const goToCurrentMonth = () => {
    onMonthChange(new Date());
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return selectedMonth.getMonth() === now.getMonth() && 
           selectedMonth.getFullYear() === now.getFullYear();
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6 space-y-3 sm:space-y-0">
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          title="Previous Month"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>
        
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">{formatMonth(selectedMonth)}</h2>
          <p className="text-xs sm:text-sm text-gray-500">Monthly Overview</p>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          title="Next Month"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>
      </div>
      
      {!isCurrentMonth() && (
        <button
          onClick={goToCurrentMonth}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-xs sm:text-sm font-medium"
        >
          Current Month
        </button>
      )}
    </div>
  );
};