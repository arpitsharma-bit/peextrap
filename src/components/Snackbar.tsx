import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface SnackbarProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
}

export const Snackbar: React.FC<SnackbarProps> = ({ 
  message, 
  type, 
  isVisible, 
  onClose 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const icon = type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />;

  return (
    <div className="fixed bottom-4 right-4 z-50 transform transition-all duration-300 ease-in-out">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-80 transform transition-all duration-300 ease-in-out`}>
        {icon}
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}; 