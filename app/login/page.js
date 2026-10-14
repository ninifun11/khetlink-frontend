
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import AuthCard from '@/components/AuthCard';
import { Field, Notice } from '@/components/ui';

const DEMO_PASSWORD = 'Demo@12345';
const DEMO = [
  ['Farmer (FPO member)', 'khetlink.farmer1@example.com'],
  ['Farmer (independent)', 'khetlink.farmer4@example.com'],
  ['FPO manager', 'khetlink.fpo@example.com'],
  ['Household buyer', 'khetlink.consumer1@example.com'],
  ['Bulk buyer', 'khetlink.buyer1@example.com'],
  ['Driver', 'khetlink.driver1@example.com'],
  ['Admin', 'khetlink.admin@example.com'],
];

function nextPath() {
  if (typeof window === 'undefined') return '/dashboard';
  const n = new URLSearchParams(window.location.search).get('next');
  return n && n.startsWith('/') && !n.startsWith('//') ? n : '/dashboard';
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) router.replace(nextPath());
  }, [loading, user, router]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err) {
      setError(err.message === 'Invalid login credentials' ? 'That email and password do not match.' : err.message);
      setBusy(false);
      return;
    }
    router.replace(nextPath());
  }

  return (
    <AuthCard
      title={t('auth.signIn')}
      subtitle={t('auth.welcome')}
      footer={<>{t('auth.newHere')} <Link href="/register" className="font-semibold text-neel-700 underline underline-offset-2 hover:text-neel-800">{t('auth.createAnAccount')}</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        {error && <Notice tone="bad">{error}</Notice>}
        <Field label={t('auth.email')} htmlFor="email">
          <input id="email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label={t('auth.password')} htmlFor="password">
          <input id="password" type="password" required autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <button className="btn btn-primary w-full py-3" disabled={busy}>{busy ? 'Signing in…' : t('auth.signIn')}</button>
      </form>

      <details className="group mt-6 rounded-lg border border-line bg-field text-sm open:bg-white open:shadow-card">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-4 py-3 font-medium text-ink [&::-webkit-details-marker]:hidden">
          {t('auth.demo')}
          <ChevronDown className="h-4 w-4 text-ink-soft transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <div className="border-t border-line px-4 pb-4 pt-3">
          <p className="text-xs leading-relaxed text-ink-soft">Available after running <code className="rounded bg-field px-1 font-mono">npm run seed</code> in the backend. Password for all: <code className="rounded bg-field px-1 font-mono">{DEMO_PASSWORD}</code></p>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {DEMO.map(([label, mail]) => (
              <li key={mail}>
                <button type="button" className="w-full rounded-md border border-line px-3 py-2 text-left transition-colors hover:border-neel-300 hover:bg-neel-50" onClick={() => { setEmail(mail); setPassword(DEMO_PASSWORD); }}>
                  <span className="block font-medium">{label}</span>
                  <span className="block truncate text-xs text-ink-soft">{mail}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </AuthCard>
  );
}