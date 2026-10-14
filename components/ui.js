import clsx from 'clsx';
import { AlertTriangle, CheckCircle2, Info, Loader2, Sprout } from 'lucide-react';
import { ORDER_STATUS, SHIPMENT_STATUS } from '@/lib/constants';

export function Logo({ className = '', light = false }) {
  return (
    <span className={clsx('inline-flex items-center gap-2.5 font-display text-xl font-bold tracking-tight', light ? 'text-white' : 'text-neel-800', className)}>
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill={light ? '#F5B921' : '#2A3B7D'} />
        <path d="M16 25V13" stroke={light ? '#1B2340' : '#F5B921'} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M16 15c0-4 2.6-6.4 7-6.6 0 4.2-2.6 6.6-7 6.6Z" fill={light ? '#1B2340' : '#F5B921'} />
        <path d="M16 19c0-3.2-2.2-5.2-6-5.4 0 3.4 2.2 5.4 6 5.4Z" fill={light ? '#1B2340' : '#F5B921'} opacity=".7" />
      </svg>
      KhetLink
    </span>
  );
}

/** Initials in a soft gradient circle. Purely presentational. `onDark` renders a translucent chip for dark buttons. */
export function Avatar({ name = '', size = 'md', onDark = false, className = '' }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?';
  const dims = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-11 w-11 text-base' }[size] || 'h-9 w-9 text-sm';
  return (
    <span aria-hidden className={clsx('grid shrink-0 place-items-center rounded-full font-display font-bold text-white', onDark ? 'bg-white/20' : 'bg-gradient-to-br from-neel-500 to-neel-800', dims, className)}>
      {initial}
    </span>
  );
}

export function Spinner({ label = 'Loading…', className = '' }) {
  return (
    <div role="status" className={clsx('flex animate-fade-in items-center justify-center gap-2.5 py-12 text-sm text-ink-soft', className)}>
      <Loader2 className="h-4 w-4 animate-spin text-neel-600" aria-hidden /> {label}
    </div>
  );
}

/* ---------------- Skeletons (loading placeholders) ---------------- */

export function Skeleton({ className = '' }) {
  return <div className={clsx('skeleton', className)} aria-hidden />;
}

/** Placeholder grid shaped like ProductCard */
export function CardGridSkeleton({ count = 6, label = 'Loading…' }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="panel overflow-hidden">
            <Skeleton className="h-36 !rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-2/5" />
              <div className="flex items-center justify-between pt-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Placeholder stack of list rows (orders, shipments) */
export function ListSkeleton({ rows = 3, label = 'Loading…' }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="space-y-3" aria-hidden>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="panel space-y-4 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2"><Skeleton className="h-5 w-40" /><Skeleton className="h-3.5 w-56" /></div>
              <Skeleton className="h-7 w-24 !rounded-full" />
            </div>
            <Skeleton className="h-2 w-full !rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Placeholder for a dashboard: stat cards plus two panels */
export function DashboardSkeleton({ label = 'Loading…' }) {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">{label}</span>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="panel space-y-3 p-5"><Skeleton className="h-3.5 w-24" /><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40" /></div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3" aria-hidden>
        <div className="panel p-6 lg:col-span-2"><Skeleton className="mb-5 h-5 w-48" /><Skeleton className="h-56 w-full" /></div>
        <div className="panel p-6"><Skeleton className="mb-5 h-5 w-32" /><Skeleton className="mx-auto h-44 w-44 !rounded-full" /></div>
      </div>
    </div>
  );
}

/* ---------------- Badges and notices ---------------- */

const TONES = {
  neutral: 'border-line bg-field text-ink-soft',
  info: 'border-neel-100 bg-neel-50 text-neel-700',
  warn: 'border-turmeric-200 bg-turmeric-50 text-turmeric-700',
  good: 'border-paddy-200 bg-paddy-50 text-paddy-700',
  bad: 'border-chilli-100 bg-chilli-50 text-chilli-600',
};
const DOTS = { neutral: 'bg-ink-muted', info: 'bg-neel-500', warn: 'bg-turmeric-500', good: 'bg-paddy-500', bad: 'bg-chilli-500' };

export function Badge({ tone = 'neutral', children, className = '', dot = false }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold', TONES[tone], className)}>
      {dot && <span className={clsx('h-1.5 w-1.5 rounded-full', DOTS[tone])} aria-hidden />}
      {children}
    </span>
  );
}

export const OrderBadge = ({ status }) => <Badge dot tone={ORDER_STATUS[status]?.tone}>{ORDER_STATUS[status]?.label || status}</Badge>;
export const ShipmentBadge = ({ status }) => <Badge dot tone={SHIPMENT_STATUS[status]?.tone}>{SHIPMENT_STATUS[status]?.label || status}</Badge>;

const NOTICE = {
  info: { cls: 'border-neel-100 bg-neel-50 text-neel-800', icon: 'text-neel-600', Icon: Info },
  good: { cls: 'border-paddy-200 bg-paddy-50 text-paddy-700', icon: 'text-paddy-600', Icon: CheckCircle2 },
  warn: { cls: 'border-turmeric-200 bg-turmeric-50 text-turmeric-700', icon: 'text-turmeric-600', Icon: AlertTriangle },
  bad: { cls: 'border-chilli-100 bg-chilli-50 text-chilli-700', icon: 'text-chilli-500', Icon: AlertTriangle },
};

export function Notice({ tone = 'info', title, children, className = '' }) {
  const { cls, icon, Icon } = NOTICE[tone];
  return (
    <div role={tone === 'bad' ? 'alert' : 'status'} className={clsx('flex animate-fade-in gap-3 rounded-lg border p-4 text-sm leading-relaxed', cls, className)}>
      <Icon className={clsx('mt-0.5 h-[18px] w-[18px] shrink-0', icon)} aria-hidden />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-0.5' : ''}>{children}</div>}
      </div>
    </div>
  );
}

export function ErrorNotice({ error, onRetry }) {
  if (!error) return null;
  return (
    <Notice tone="bad" title="Something went wrong">
      <p>{error.message}</p>
      {onRetry && <button type="button" onClick={onRetry} className="btn btn-danger btn-sm mt-3">Try again</button>}
    </Notice>
  );
}

export function EmptyState({ title, children, action, icon: Icon = Sprout }) {
  return (
    <div className="animate-fade-in rounded-lg border border-dashed border-line-strong bg-white/70 px-6 py-14 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-neel-50 text-neel-600 ring-8 ring-neel-50/60">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <p className="mt-5 font-display text-lg font-semibold text-ink">{title}</p>
      {children && <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-ink-soft">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-7 flex animate-fade-up flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[2rem] sm:leading-tight">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-[15px]">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const STAT = {
  good: { bar: 'from-paddy-500 to-paddy-200', chip: 'bg-paddy-50 text-paddy-600' },
  warn: { bar: 'from-turmeric-400 to-turmeric-100', chip: 'bg-turmeric-50 text-turmeric-600' },
  bad: { bar: 'from-chilli-500 to-chilli-200', chip: 'bg-chilli-50 text-chilli-600' },
  default: { bar: 'from-neel-600 to-neel-200', chip: 'bg-neel-50 text-neel-600' },
};

export function StatCard({ label, value, hint, tone, icon: Icon }) {
  const t = STAT[tone] || STAT.default;
  return (
    <div className="panel relative animate-fade-up overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium leading-snug text-ink-soft">{label}</p>
        {Icon && <span className={clsx('grid h-9 w-9 shrink-0 place-items-center rounded-md', t.chip)}><Icon className="h-[18px] w-[18px]" aria-hidden /></span>}
      </div>
      <p className="mt-2 font-display text-[1.7rem] font-bold leading-tight tabular-nums text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs leading-snug text-ink-soft">{hint}</p>}
      <span className={clsx('absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r', t.bar)} aria-hidden />
    </div>
  );
}

export function Section({ title, subtitle, actions, children, className = '' }) {
  return (
    <section className={clsx('panel panel-pad', className)}>
      {(title || actions) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-ink-soft">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({ label, hint, children, htmlFor }) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}























