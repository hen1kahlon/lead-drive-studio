import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check if user is admin when auth state changes
      if (session?.user) {
        // Use maybeSingle() instead of single() to handle no role case
        setTimeout(async () => {
          try {
            // First, try to create admin role if none exists
            await supabase.rpc('grant_admin_if_none', { _user_id: session.user.id });
            
            const { data: roles, error } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id);
            
            if (error) throw error;
            setIsAdmin(!!roles?.some((r: any) => r.role === 'admin'));
          } catch (error) {
            console.error('Error checking user role:', error);
            setIsAdmin(false);
          } finally {
            setLoading(false);
          }
        }, 0);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(async () => {
          try {
            // First, try to create admin role if none exists
            await supabase.rpc('grant_admin_if_none', { _user_id: session.user.id });
            
            const { data: roles, error } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id);
            if (error) throw error;
            setIsAdmin(!!roles?.some((r: any) => r.role === 'admin'));
          } catch (error) {
            console.error('Error checking user role (init):', error);
            setIsAdmin(false);
          } finally {
            setLoading(false);
          }
        }, 0);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'שגיאה בהתחברות' };
    }
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, login, logout, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};