import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Transaction, Category, Budget } from '../types'
import { useAuth } from './useAuth'

export function useSupabaseData() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch all data
  const fetchData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (categoriesError) throw categoriesError

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (transactionsError) throw transactionsError

      // Fetch budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (budgetsError) throw budgetsError

      setCategories(categoriesData || [])
      setTransactions(transactionsData || [])
      setBudgets(budgetsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchData()
    } else {
      setTransactions([])
      setCategories([])
      setBudgets([])
      setLoading(false)
    }
  }, [user])

  // Add transaction
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transaction,
          user_id: user.id,
        }])
        .select()
        .single()

      if (error) throw error

      setTransactions(prev => [data, ...prev])
      return { data, error: null }
    } catch (error) {
      console.error('Error adding transaction:', error)
      return { data: null, error }
    }
  }

  // Delete transaction
  const deleteTransaction = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setTransactions(prev => prev.filter(t => t.id !== id))
      return { error: null }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      return { error }
    }
  }

  // Add budget
  const addBudget = async (budget: Omit<Budget, 'id'>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert([{
          ...budget,
          user_id: user.id,
        }])
        .select()
        .single()

      if (error) throw error

      setBudgets(prev => [data, ...prev])
      return { data, error: null }
    } catch (error) {
      console.error('Error adding budget:', error)
      return { data: null, error }
    }
  }

  // Update budget
  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setBudgets(prev => prev.map(b => b.id === id ? data : b))
      return { data, error: null }
    } catch (error) {
      console.error('Error updating budget:', error)
      return { data: null, error }
    }
  }

  // Delete budget
  const deleteBudget = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setBudgets(prev => prev.filter(b => b.id !== id))
      return { error: null }
    } catch (error) {
      console.error('Error deleting budget:', error)
      return { error }
    }
  }

  return {
    transactions,
    categories,
    budgets,
    loading,
    addTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    refetch: fetchData,
  }
}