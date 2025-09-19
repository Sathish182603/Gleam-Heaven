import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    // Use the current origin to ensure correct redirect URL
    const redirectUrl = `${window.location.origin}/`;
    console.log('Signup redirect URL:', redirectUrl); // Debug log
    
    // Basic validation before sending to Supabase
    if (!email.trim()) {
      return { error: { message: 'Email is required' } };
    }
    
    if (!password.trim()) {
      return { error: { message: 'Password is required' } };
    }
    
    if (password.length < 6) {
      return { error: { message: 'Password must be at least 6 characters long' } };
    }
    
    // Comprehensive email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { 
        error: { 
          message: 'Email is not valid. Please enter a valid email address (e.g., user@example.com)' 
        } 
      };
    }
    
    // Check for common invalid email patterns
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      return { 
        error: { 
          message: 'Email format is invalid. Please check for consecutive dots or dots at the beginning/end.' 
        } 
      };
    }
    
    const { error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(), // Normalize email
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName || email.split('@')[0]
        }
      }
    });
    
    if (error) {
      console.error('SignUp Error:', error);
      
      // Provide specific error messages for different scenarios
      if (error.message.includes('invalid') || error.message.includes('Invalid')) {
        return { 
          error: { 
            message: 'Email is not valid or not supported. Please use Gmail, Yahoo, Outlook, or other major email providers.' 
          } 
        };
      } else if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        return { 
          error: { 
            message: 'An account with this email already exists. Please sign in instead or use a different email.' 
          } 
        };
      } else if (error.message.includes('Password')) {
        return { 
          error: { 
            message: 'Password is too weak. Please use at least 6 characters with a mix of letters and numbers.' 
          } 
        };
      } else if (error.message.includes('rate limit')) {
        return { 
          error: { 
            message: 'Too many signup attempts. Please wait a few minutes and try again.' 
          } 
        };
      }
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    // Basic validation before sending to Supabase
    if (!email.trim()) {
      return { error: { message: 'Email is required' } };
    }
    
    if (!password.trim()) {
      return { error: { message: 'Password is required' } };
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });
    
    if (error) {
      console.error('SignIn Error:', error);
      
      // Provide specific error messages
      if (error.message.includes('Invalid login credentials')) {
        return { error: { message: 'Incorrect email or password. Please check your credentials and try again.' } };
      } else if (error.message.includes('Email not confirmed')) {
        return { error: { message: 'Please verify your email address by clicking the link sent to your inbox.' } };
      } else if (error.message.includes('Too many requests')) {
        return { error: { message: 'Too many login attempts. Please wait a few minutes and try again.' } };
      } else if (error.message.includes('User not found')) {
        return { error: { message: 'No account found with this email address. Please sign up first.' } };
      }
    }
    
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};