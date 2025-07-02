import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// User roles enum
export enum UserRole {
  INTERVIEWER = 'interviewer',
  CANDIDATE = 'candidate'
}

// Types for our user profiles
export interface UserProfile {
  id: string
  email: string
  role: UserRole
  full_name?: string
  created_at: string
  updated_at: string
}

// Auth helper functions
export const authHelpers = {
  signUp: async (email: string, password: string, role: UserRole, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: fullName,
        }
      }
    })
    return { data, error }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  getProfile: async (userId: string): Promise<{ profile: UserProfile | null, error: any }> => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    return { profile, error }
  },

  updateProfile: async (userId: string, updates: Partial<UserProfile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    return { data, error }
  }
} 