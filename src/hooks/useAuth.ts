import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { updateFavicon, createInitialsFavicon } from '../utils/favicon'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Function to update favicon based on user profile
  const updateUserFavicon = async (user: User | null) => {
    if (!user) {
      // Reset to default favicon when user logs out
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/x-icon';
      link.href = '/favicon.ico';
      document.head.appendChild(link);
      return;
    }

    try {
      // Get user profile
      const { data, error } = await supabase
        .from('user_profiles')
        .select('full_name, profile_picture_url')
        .eq('user_id', user.id)
        .single();
      
      if (data && !error) {
        if (data.profile_picture_url) {
          updateFavicon(data.profile_picture_url);
        } else {
          const displayName = data.full_name || user.email?.split('@')[0] || 'User';
          const initials = displayName.split(' ').map((word: string) => word.charAt(0)).join('').toUpperCase().slice(0, 2);
          createInitialsFavicon(initials);
        }
      } else {
        // Fallback to initials favicon
        const displayName = user.email?.split('@')[0] || 'User';
        const initials = displayName.split(' ').map((word: string) => word.charAt(0)).join('').toUpperCase().slice(0, 2);
        createInitialsFavicon(initials);
      }
    } catch (error) {
      console.error('Error updating favicon:', error);
      // Fallback to initials favicon
      const displayName = user.email?.split('@')[0] || 'User';
      const initials = displayName.split(' ').map((word: string) => word.charAt(0)).join('').toUpperCase().slice(0, 2);
      createInitialsFavicon(initials);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      // Update favicon for initial session
      updateUserFavicon(session?.user ?? null)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      // Update favicon when auth state changes
      updateUserFavicon(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    // Detect user's country and set default currency
    const detectUserCountry = () => {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone.includes('Asia/Kolkata')) return 'INR';
        if (timezone.includes('Europe')) return 'EUR';
        if (timezone.includes('America')) return 'USD';
        if (timezone.includes('Asia/Tokyo')) return 'JPY';
        return 'USD'; // Default fallback
      } catch {
        return 'USD';
      }
    };

    const defaultCurrency = detectUserCountry();
    const displayName = email.split('@')[0];

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName,
          currency: defaultCurrency,
          country: defaultCurrency === 'INR' ? 'India' : 'United States',
        }
      }
    })
    
    // Create user profile in database
    if (data.user && !error) {
      try {
        await createUserProfile({
          full_name: displayName,
          email: email,
          currency: defaultCurrency,
          country: defaultCurrency === 'INR' ? 'India' : 'United States',
        })
      } catch (profileError) {
        console.error('Error creating user profile:', profileError)
      }
    }
    
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

  const updateUserMetadata = async (metadata: any) => {
    const { data, error } = await supabase.auth.updateUser({
      data: metadata
    })
    return { data, error }
  }

  const getUserProfile = async () => {
    if (!user) return { data: null, error: null }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    return { data, error }
  }

  const updateUserProfile = async (profileData: any) => {
    if (!user) return { data: null, error: null }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        ...profileData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()
    
    return { data, error }
  }

  const createUserProfile = async (profileData: any) => {
    if (!user) return { data: null, error: null }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        ...profileData
      })
      .select()
      .single()
    
    return { data, error }
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateUserMetadata,
    getUserProfile,
    updateUserProfile,
    createUserProfile,
  }
}