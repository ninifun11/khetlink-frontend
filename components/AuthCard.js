import Link from 'next/link';
import { Check } from 'lucide-react';
import { Logo } from '@/components/ui';

const POINTS = [
  'Farmers and FPOs sell directly to households and bulk buyers',
  'Confirmed orders are pooled onto shared trucks',
  'AI helps with fair prices, demand forecasts and routes',
];

export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="grid w-full animate-fade-up overflow-hidden rounded-2xl border border-line bg-white shadow-lift lg:grid-cols-[0.9fr_1.1fr]">
        {/* Brand panel (desktop only) */}
        <aside className="dark-surface relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex">
          <div className="dot-pattern absolute inset-0 opacity-60" aria-hidden />
          <Link href="/" aria-label="KhetLink home" className="relative self-start"><Logo light /></Link>
          <div className="relative">
            <h2 className="font-display text-3xl font-bold leading-tight">Farm-gate prices for farmers.<br /><span className="text-turmeric-300">Fresher, cheaper produce for you.</span></h2>
            <ul className="mt-8 space-y-4">
              {POINTS.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm leading-relaxed text-white/80">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-turmeric-400 text-ink"><Check className="h-3 w-3" strokeWidth={3} aria-hidden /></span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <p className="relative text-xs text-white/60">Demo prices and orders are synthetic.</p>
        </aside>

        {/* Form */}
        <div className="flex flex-col p-6 sm:p-10">
          <Link href="/" className="mb-6 self-start lg:hidden" aria-label="KhetLink home"><Logo /></Link>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{subtitle}</p>}
          <div className="mt-7">{children}</div>
          {footer && <p className="mt-8 border-t border-line pt-5 text-center text-sm text-ink-soft">{footer}</p>}
        </div>
      </div>
    </div>
  );
}
