import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

/** local: Supabase not configured, so there is no sign-in and progress stays in this browser. */
export type AuthStatus = 'loading' | 'signed-out' | 'signed-in' | 'local';

interface AuthContextValue {
  status: AuthStatus;
  user: AppUser | null;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toUser(session: Session | null): AppUser | null {
  const user = session?.user;
  if (!user) return null;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const name = [meta.full_name, meta.name].find((value): value is string => typeof value === 'string' && value.length > 0);
  const avatar = [meta.avatar_url, meta.picture].find((value): value is string => typeof value === 'string' && value.length > 0);
  return { id: user.id, email: user.email ?? '', name: name ?? user.email ?? 'Usuario', avatarUrl: avatar };
}

/** Where Google sends the learner back: this same app (works on localhost and on GitHub Pages). */
const redirectUrl = () => new URL(import.meta.env.BASE_URL, window.location.origin).toString();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>(supabase ? 'loading' : 'local');
  const [user, setUser] = useState<AppUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(sessionError.message);
      const current = toUser(data.session);
      setUser(current);
      setStatus(current ? 'signed-in' : 'signed-out');
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const current = toUser(session);
      setUser(current);
      setStatus(current ? 'signed-in' : 'signed-out');
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    status,
    user,
    error,
    signInWithGoogle: async () => {
      if (!supabase) return;
      setError(null);
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl(), queryParams: { prompt: 'select_account' } },
      });
      if (signInError) setError(signInError.message);
    },
    signOut: async () => {
      if (!supabase) return;
      await supabase.auth.signOut();
    },
  }), [status, user, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
