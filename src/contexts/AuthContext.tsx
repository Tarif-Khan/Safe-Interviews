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
    // Force sign out and clear session on app load, then set up auth state change handler
    const forceSignOutAndInit = async () => {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setLoading(false);

      // Now set up auth state change handler
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          try {
            console.log('Auth state change:', event, session?.user?.email);

            if (event === 'SIGNED_OUT') {
              console.log('User signed out, clearing state');
              setUser(null);
              setProfile(null);
              setLoading(false);
              return;
            }

            setUser(session?.user ?? null);

            if (session?.user) {
              console.log('Fetching profile for user id:', session.user.id, 'and email:', session.user.email);
              await new Promise(res => setTimeout(res, 500));
              try {
                const { data: rawProfile, error: rawError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('email', session.user.email)
                  .single();
                console.log('Raw Supabase profile query result:', { rawProfile, rawError });
                if (rawProfile) setProfile(rawProfile);
                else setProfile(null);
              } catch (e) {
                console.error('Exception during raw profile fetch:', e);
                setProfile(null);
              }
            } else {
              setProfile(null);
            }

            setLoading(false);
          } catch (e) {
            console.error('Exception in onAuthStateChange handler:', e);
          }
        }
      );

      // Clean up subscription on unmount
      return () => subscription.unsubscribe();
    };

    forceSignOutAndInit();
  }, []);

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
      
      // Don't manually set user/profile to null - let the auth state change listener handle it
      // Only set loading to false on error, success will be handled by onAuthStateChange
      if (result.error) {
        setLoading(false)
      }
      
      return result
    } catch (error) {
      setLoading(false)
      throw error
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