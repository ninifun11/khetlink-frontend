
'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { NAV } from '@/lib/nav';
import { ROLES } from '@/lib/constants';
import { Avatar, Badge, ErrorNotice, Spinner } from '@/components/ui';

export default function DashboardLayout({ children }) {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const navRef = useRef(null);
  const { t, tf } = useI18n();

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(path)}`);
  }, [loading, user, path, router]);

  // Keep each role inside the pages that belong to it
  const items = profile ? NAV[profile.role] || [] : [];
  const allowed = items.some((i) => i.href === path);
  useEffect(() => {
    if (profile && items.length && !allowed) router.replace(items[0].href);
  }, [profile, allowed, items, router]);

  // On phones the menu is a horizontal strip: keep the current page's pill in view
  useEffect(() => {
    if (!allowed || typeof window === 'undefined' || !window.matchMedia('(max-width: 1023px)').matches) return;
    navRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [allowed, path]);

  if (loading || (!user && !profile)) return <Spinner label="Loading your workspace…" className="py-32" />;
  if (!profile) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <ErrorNotice error={new Error('We could not load your profile. Make sure the backend API is running, then try again.')} onRetry={refreshProfile} />
      </div>
    );
  }

  const handleSignOut = async () => { await signOut(); router.push('/'); };
  const displayName = profile.full_name || profile.email;

  return (
    <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[256px_1fr] lg:gap-8 lg:py-8">
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        {/* Phones: who am I + sign out (the desktop card below is hidden on small screens) */}
        <div className="mb-3 flex items-center gap-3 lg:hidden">
          <Avatar name={displayName} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">{displayName}</p>
            <p className="truncate text-xs text-ink-soft">{tf(`role.${profile.role}`, ROLES[profile.role]?.label)}</p>
          </div>
          <button type="button" onClick={handleSignOut} className="btn btn-secondary btn-sm"><LogOut className="h-3.5 w-3.5" aria-hidden /> {t('common.signOut')}</button>
        </div>

        <nav ref={navRef} aria-label="Dashboard" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:panel lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:p-2 lg:pb-2">
          {items.map(({ href, label, icon: Icon }) => {
            const active = path === href;
            return (
              <Link key={href} href={href} aria-current={active ? 'page' : undefined}
                className={clsx('flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-neel-700 text-white shadow-card'
                    : 'text-ink-soft hover:bg-neel-50 hover:text-ink max-lg:border max-lg:border-line max-lg:bg-white')}>
                <Icon className={clsx('h-4 w-4', active ? 'text-turmeric-300' : 'text-ink-muted')} aria-hidden /> {tf(`menu.${label}`, label)}
              </Link>
            );
          })}
        </nav>

        <div className="panel mt-4 hidden p-4 lg:block">
          <div className="flex items-center gap-3">
            <Avatar name={displayName} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">{profile.full_name || profile.email}</p>
              <p className="truncate text-xs text-ink-soft">{profile.organization || profile.email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <Badge tone="info">{tf(`role.${profile.role}`, ROLES[profile.role]?.label)}</Badge>
            <button onClick={handleSignOut} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-ink-soft transition-colors hover:bg-chilli-50 hover:text-chilli-600"><LogOut className="h-3.5 w-3.5" aria-hidden /> {t('common.signOut')}</button>
          </div>
        </div>
      </aside>
      <div className="min-w-0"><div key={path} className="animate-fade-in">{allowed ? children : null}</div></div>
    </div>
  );
}