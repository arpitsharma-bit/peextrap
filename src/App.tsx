import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useSupabaseData } from './hooks/useSupabaseData';
import { AuthForm } from './components/Auth/AuthForm';
import { LoadingScreen } from './components/Auth/LoadingScreen';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { BudgetTracker } from './components/BudgetTracker';
import { Analytics } from './components/Analytics';
import { Transaction, Budget } from './types';

function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const {
    transactions,
    categories,
    budgets,
    loading: dataLoading,
    addTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
  } = useSupabaseData();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Handle authentication
  const handleAuth = async (email: string, password: string) => {
    setAuthSubmitting(true);
    setAuthError(null);

    try {
      const { error } = authMode === 'signin' 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        console.error('Auth error:', error);
        setAuthError(error.message);
      }
    } catch (error) {
      console.error('Unexpected auth error:', error);
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'signin' ? 'signup' : 'signin');
    setAuthError(null);
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Show auth form if user is not authenticated
  if (!user) {
    return (
      <AuthForm
        mode={authMode}
        onSubmit={handleAuth}
        onToggleMode={toggleAuthMode}
        loading={authSubmitting}
        error={authError}
      />
    );
  }

  // Show loading screen while fetching user data
  if (dataLoading) {
    return <LoadingScreen />;
  }

  // Handle transaction operations
  const handleAddTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    await addTransaction(transaction);
  };

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
  };

  // Handle budget operations
  const handleAddBudget = async (budget: Omit<Budget, 'id'>) => {
    await addBudget(budget);
  };

  const handleUpdateBudget = async (id: string, updates: Partial<Budget>) => {
    await updateBudget(id, updates);
  };

  const handleDeleteBudget = async (id: string) => {
    await deleteBudget(id);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'add', label: 'Add Transaction', icon: '➕' },
    { id: 'transactions', label: 'History', icon: '📋' },
    { id: 'budgets', label: 'Budgets', icon: '🎯' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === item.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard 
            transactions={transactions} 
            categories={categories}
            budgets={budgets}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        )}
        {activeTab === 'add' && (
          <TransactionForm 
            onSubmit={handleAddTransaction} 
            categories={categories}
          />
        )}
        {activeTab === 'transactions' && (
          <TransactionList 
            transactions={transactions}
            categories={categories}
            selectedMonth={selectedMonth}
            onDelete={handleDeleteTransaction}
          />
        )}
        {activeTab === 'budgets' && (
          <BudgetTracker 
            budgets={budgets}
            categories={categories}
            transactions={transactions}
            selectedMonth={selectedMonth}
            onAddBudget={handleAddBudget}
            onUpdateBudget={handleUpdateBudget}
            onDeleteBudget={handleDeleteBudget}
          />
        )}
        {activeTab === 'analytics' && (
          <Analytics 
            transactions={transactions}
            categories={categories}
            selectedMonth={selectedMonth}
          />
        )}
      </main>
    </div>
  );
}

export default App;