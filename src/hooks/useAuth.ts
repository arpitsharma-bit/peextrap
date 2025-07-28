import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    // If signup successful, create default categories manually
    if (data.user && !error) {
      try {
        const defaultCategories = [
          { name: 'Food & Dining', color: '#F97316', icon: '🍽️', is_default: true },
          { name: 'Transportation', color: '#3B82F6', icon: '🚗', is_default: true },
          { name: 'Entertainment', color: '#8B5CF6', icon: '🎬', is_default: true },
          { name: 'Shopping', color: '#EF4444', icon: '🛍️', is_default: true },
          { name: 'Health', color: '#10B981', icon: '🏥', is_default: true },
          { name: 'Utilities', color: '#F59E0B', icon: '⚡', is_default: true },
          { name: 'Income', color: '#10B946', icon: '💰', is_default: true },
          { name: 'Other', color: '#6B7280', icon: '📝', is_default: true },
        ]

        for (const category of defaultCategories) {
          const { error: categoryError } = await supabase
            .from('categories')
            .insert({
              user_id: data.user.id,
              ...category
            })
          
          if (categoryError) {
            console.error('Error creating category:', categoryError)
          }
        }
      } catch (categoryError) {
        console.error('Error creating default categories:', categoryError)
      }
    }
    
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }
}