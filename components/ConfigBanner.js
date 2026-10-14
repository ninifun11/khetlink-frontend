'use client';
import { AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabaseClient';

/** Shown only when the Supabase env vars are still the placeholders from .env.example */
export default function ConfigBanner() {
  if (isSupabaseConfigured) return null;
  return (
    <div role="alert" className="flex items-center justify-center gap-2 border-b border-turmeric-200 bg-turmeric-100 px-4 py-2.5 text-center text-sm text-turmeric-700">
      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
      <span>
        Supabase is not configured yet. Copy <code className="rounded bg-white/60 px-1 font-mono">frontend/.env.example</code> to{' '}
        <code className="rounded bg-white/60 px-1 font-mono">frontend/.env.local</code> and fill in your project URL and anon key.
      </span>
    </div>
  );
}
