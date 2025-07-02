import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, UserRole, authHelpers } from '../lib/supabase'
import type { UserProfile } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, role: UserRole, fullName?: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<any>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    if (user) {
      const { profile, error } = await authHelpers.getProfile(user.id)
      if (!error && profile) {
        setProfile(profile)
      }
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const { profile, error } = await authHelpers.getProfile(session.user.id)
        if (!error && profile) {
          setProfile(profile)
        }
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const { profile, error } = await authHelpers.getProfile(session.user.id)
          console.log('Profile fetch result:', { profile, error })
          
          if (!error && profile) {
            setProfile(profile)
          } else if (error) {
            console.error('Error fetching profile:', error)
            // If profile doesn't exist, we might need to create it or handle this case
            setProfile(null)
          }
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, role: UserRole, fullName?: string) => {
    setLoading(true)
    try {
      const result = await authHelpers.signUp(email, password, role, fullName)
      
      // If sign-up was successful, keep loading true until auth state updates
      // For sign-up, we actually want to set loading to false since users need to verify email
      setLoading(false)
      
      return result
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await authHelpers.signIn(email, password)
      
      // If sign-in was successful, keep loading true until auth state updates
      // The loading will be set to false by the onAuthStateChange listener
      if (result.error) {
        setLoading(false)
      }
      
      return result
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const result = await authHelpers.signOut()
      setUser(null)
      setProfile(null)
      return result
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 