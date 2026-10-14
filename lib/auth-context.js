'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabaseClient';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileFailed, setProfileFailed] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const { profile } = await api('/profile/me');
      setProfile(profile);
      setProfileFailed(false);
    } catch {
      setProfile(null);
      setProfileFailed(true);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      if (!data.session) setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) { setProfile(null); setLoading(false); }
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  // Load the profile whenever the signed-in user changes
  const userId = session?.user?.id;
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    loadProfile().finally(() => setLoading(false));
  }, [userId, loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const value = useMemo(() => ({
    session, user: session?.user ?? null, profile, signOut, refreshProfile: loadProfile, setProfile,
    // still "loading" while a signed-in user's profile has not arrived (avoids flashing an error state)
    loading: loading || (Boolean(session) && !profile && !profileFailed),
  }), [session, profile, loading, profileFailed, signOut, loadProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
