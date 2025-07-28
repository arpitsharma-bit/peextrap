import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please connect to Supabase using the button in the top right.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          description: string | null
          category_id: string
          type: 'income' | 'expense'
          date: string
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          description?: string | null
          category_id: string
          type: 'income' | 'expense'
          date: string
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          description?: string | null
          category_id?: string
          type?: 'income' | 'expense'
          date?: string
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          icon: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          icon: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          icon?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          period: 'monthly' | 'weekly'
          start_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: number
          period: 'monthly' | 'weekly'
          start_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          amount?: number
          period?: 'monthly' | 'weekly'
          start_date?: string
          created_at?: string
          updated_at?: string
        }
        user_profiles: {
          Row: {
            id: string
            user_id: string
            full_name: string | null
            email: string | null
            profile_picture_url: string | null
            currency: string
            country: string
            preferences: any
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            user_id: string
            full_name?: string | null
            email?: string | null
            profile_picture_url?: string | null
            currency?: string
            country?: string
            preferences?: any
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            user_id?: string
            full_name?: string | null
            email?: string | null
            profile_picture_url?: string | null
            currency?: string
            country?: string
            preferences?: any
            created_at?: string
            updated_at?: string
          }
        }
      }
    }
  }
}