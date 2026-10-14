'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { Home, Store, Sprout, Truck, Users } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/auth-context';
import { DISTRICTS, ROLES, SIGNUP_ROLES } from '@/lib/constants';
import AuthCard from '@/components/AuthCard';
import { Field, Notice } from '@/components/ui';

// Purely decorative icons for the role picker
const ROLE_ICON = { farmer: Sprout, fpo: Users, consumer: Home, bulk_buyer: Store, driver: Truck };

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [role, setRole] = useState('consumer');
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', organization: '', district: 'Hyderabad' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmSent, setConfirmSent] = useState(false);

  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get('role');
    if (r && SIGNUP_ROLES.includes(r)) setRole(r);
  }, []);
  useEffect(() => { if (!loading && user) router.replace('/dashboard'); }, [loading, user, router]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const needsOrg = ['fpo', 'bulk_buyer'].includes(role);

  async function submit(e) {
    e.preventDefault();
    if (form.password.length < 8) return setError('Use a password with at least 8 characters.');
    setBusy(true);
    setError('');
    const { data, error: err } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          full_name: form.full_name.trim(),
          role,
          phone: form.phone.trim() || null,
          organization: needsOrg ? form.organization.trim() || null : null,
          district: form.district,
        },
      },
    });
    setBusy(false);
    if (err) return setError(err.message);
    if (data.session) router.replace('/dashboard/settings?welcome=1');
    else setConfirmSent(true); // email confirmation is switched on in Supabase
  }

  if (confirmSent) {
    return (
      <AuthCard title="Check your inbox" footer={<Link href="/login" className="font-semibold text-neel-700 underline underline-offset-2 hover:text-neel-800">Back to sign in</Link>}>
        <Notice tone="good">We sent a confirmation link to <b>{form.email}</b>. Open it, then sign in.</Notice>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="It takes a minute. You can change your location and details later."
      footer={<>Already registered? <Link href="/login" className="font-semibold text-neel-700 underline underline-offset-2 hover:text-neel-800">Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        {error && <Notice tone="bad">{error}</Notice>}

        <fieldset>
          <legend className="label">I am a…</legend>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {SIGNUP_ROLES.map((r) => {
              const RoleIcon = ROLE_ICON[r];
              return (
                <label key={r} className={clsx('flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-all focus-within:ring-2 focus-within:ring-neel-500 focus-within:ring-offset-2', role === r ? 'border-neel-600 bg-neel-50 shadow-card' : 'border-line-strong bg-white hover:border-neel-300 hover:bg-field')}>
                  <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="sr-only" />
                  <span className={clsx('grid h-9 w-9 shrink-0 place-items-center rounded-md transition-colors', role === r ? 'bg-neel-700 text-white' : 'bg-field text-ink-soft')}><RoleIcon className="h-4 w-4" aria-hidden /></span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{ROLES[r].label}</span>
                    <span className="block text-xs leading-snug text-ink-soft">{ROLES[r].blurb}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <Field label="Full name" htmlFor="name"><input id="name" required minLength={2} className="input" value={form.full_name} onChange={set('full_name')} autoComplete="name" /></Field>
        {needsOrg && (
          <Field label={role === 'fpo' ? 'FPO / cooperative name' : 'Business name'} htmlFor="org">
            <input id="org" required className="input" value={form.organization} onChange={set('organization')} />
          </Field>
        )}
        <Field label="Email" htmlFor="email"><input id="email" type="email" required className="input" value={form.email} onChange={set('email')} autoComplete="email" /></Field>
        <Field label="Password" htmlFor="pw" hint="At least 8 characters."><input id="pw" type="password" required className="input" value={form.password} onChange={set('password')} autoComplete="new-password" /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone (optional)" htmlFor="phone"><input id="phone" type="tel" className="input" value={form.phone} onChange={set('phone')} autoComplete="tel" /></Field>
          <Field label="District" htmlFor="district">
            <select id="district" className="input" value={form.district} onChange={set('district')}>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select>
          </Field>
        </div>
        <button className="btn btn-primary w-full py-3" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
    </AuthCard>
  );
}
