
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { LogIn, Menu, ShoppingBasket, Store, UserPlus, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { useI18n } from '@/lib/i18n';
import { Avatar, Logo } from '@/components/ui';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Navbar() {
  const { user, profile, loading } = useAuth();
  const { count } = useCart();
  const { t } = useI18n();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Cart is only for household buyers and bulk buyers
  const CART_ROLES = ['consumer', 'bulk_buyer'];
  const showCart = !loading && CART_ROLES.includes(profile?.role);

  // Close the mobile menu after navigating
  useEffect(() => { setOpen(false); }, [path]);

  // Soft shadow once the page has scrolled under the header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Escape closes the mobile menu
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const active = (href) => path.startsWith(href);
  const link = (href, label) => (
    <Link
      href={href}
      aria-current={active(href) ? 'page' : undefined}
      className={clsx(
        'rounded-md px-3.5 py-2 text-sm font-medium transition-colors',
        active(href) ? 'bg-neel-50 text-neel-800' : 'text-ink-soft hover:bg-neel-50/70 hover:text-ink',
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className={clsx('sticky top-0 z-30 border-b bg-white/90 backdrop-blur-xl transition-shadow duration-200', scrolled ? 'border-line shadow-card' : 'border-transparent')}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" aria-label="KhetLink home" className="rounded-md"><Logo /></Link>
          <nav className="hidden sm:flex" aria-label="Main">{link('/marketplace', t('nav.marketplace'))}</nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {showCart && (
            <Link href="/cart" className="relative rounded-md p-2.5 text-ink-soft transition-colors hover:bg-neel-50 hover:text-ink" aria-label={`${t('nav.cart')}, ${count}`}>
              <ShoppingBasket className="h-5 w-5" />
              {count > 0 && (
                <span key={count} className="absolute right-0.5 top-0.5 grid h-4 min-w-4 animate-pop place-items-center rounded-full bg-turmeric-400 px-1 text-[10px] font-bold text-ink ring-2 ring-white">{count}</span>
              )}
            </Link>
          )}

          <LanguageSwitcher className="hidden sm:inline-flex" />

          <div className="hidden items-center gap-2 sm:flex">
            {loading ? null : user ? (
              <Link href="/dashboard" className="btn btn-primary btn-sm gap-2 pl-1.5">
                <Avatar name={profile?.full_name} size="sm" onDark />
                {t('nav.dashboard')}
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost btn-sm">{t('nav.signIn')}</Link>
                <Link href="/register" className="btn btn-primary btn-sm">{t('nav.createAccount')}</Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="rounded-md p-2.5 text-ink-soft transition-colors hover:bg-neel-50 hover:text-ink sm:hidden"
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="animate-fade-in border-t border-line bg-white px-4 pb-5 pt-3 shadow-lift sm:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            <LanguageSwitcher className="mb-2 self-start" />
            <Link
              href="/marketplace"
              aria-current={active('/marketplace') ? 'page' : undefined}
              className={clsx('flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium', active('/marketplace') ? 'bg-neel-50 text-neel-800' : 'text-ink hover:bg-field')}
            >
              <Store className="h-5 w-5 text-neel-600" aria-hidden /> {t('nav.marketplace')}
            </Link>
            {loading ? null : user ? (
              <Link href="/dashboard" className="btn btn-primary mt-3 w-full">{t('nav.dashboard')}</Link>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link href="/login" className="btn btn-secondary"><LogIn className="h-4 w-4" aria-hidden /> {t('nav.signIn')}</Link>
                <Link href="/register" className="btn btn-primary"><UserPlus className="h-4 w-4" aria-hidden /> {t('nav.createAccount')}</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}