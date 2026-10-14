'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, Leaf, MapPin, Package, ShoppingBasket, Store, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useApi } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { inr, num, pct, shortDate, unitLabel } from '@/lib/format';
import { Badge, ErrorNotice, Notice, Section, Spinner } from '@/components/ui';

function PriceRow({ label, value, max, tone }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between gap-3 text-sm">
        <span className="text-ink-soft">{label}</span>
        <span className="font-display font-bold tabular-nums">{inr(value, 2)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-field"><div className={`h-2.5 origin-left animate-grow-x rounded-full ${tone}`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} /></div>
    </div>
  );
}

function Outlook({ crop, enabled }) {
  const { data } = useApi('/ai/forecast', { crop, horizon: 14 }, { enabled });
  const s = data?.summary;
  if (!s) return null;
  const Icon = s.price_trend === 'rising' ? TrendingUp : s.price_trend === 'falling' ? TrendingDown : Minus;
  return (
    <Section title="Market outlook (next 14 days)" subtitle="AI forecast across all districts">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-neel-50 text-neel-700"><Icon className="h-5 w-5" aria-hidden /></span>
        <div className="text-sm leading-relaxed">
          <p>Prices {s.price_trend || 'steady'} ({pct(s.price_change_pct, 1)}), demand {s.demand_trend || 'steady'} ({pct(s.demand_change_pct, 1)}).</p>
          <p className="mt-1 text-ink-soft">{s.recommendation}</p>
        </div>
      </div>
    </Section>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { add } = useCart();
  const { data, error, loading, reload } = useApi(`/products/${id}`);
  const p = data?.product;
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => { if (p) setQty(Number(p.min_order_qty)); }, [p]);

  if (loading && !data) return <Spinner label="Loading listing…" className="py-24" />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-10"><ErrorNotice error={error} onRetry={reload} /></div>;
  if (!p) return null;

  const min = Number(p.min_order_qty);
  const max = Number(p.quantity_available);
  const seller = p.seller;
  const sellerName = seller?.organization || seller?.full_name || 'Seller';
  const isOwn = profile?.id === p.seller_id;
  const validQty = qty >= min && qty <= max;
  const ref = Math.max(Number(p.retail_price_per_unit) || 0, Number(p.price_per_unit));

  const addToCart = (go) => {
    if (!validQty) return;
    add(p, qty);
    if (go) router.push('/cart');
    else { setAdded(true); setTimeout(() => setAdded(false), 2000); }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/marketplace" className="mb-5 inline-flex items-center gap-1.5 rounded-md py-1 text-sm font-medium text-ink-soft transition-colors hover:text-neel-700"><ArrowLeft className="h-4 w-4" aria-hidden /> All produce</Link>

      {/* One grid: on phones the order is header, buy box, details; from md up the buy box sits in a sticky right column */}
      <div className="grid animate-fade-up gap-6 md:grid-cols-[1fr_360px]">
        <div className="panel overflow-hidden md:col-start-1 md:row-start-1">
          <div className="grid h-52 place-items-center bg-gradient-to-br from-turmeric-50 to-turmeric-100 text-8xl" aria-hidden>{p.image_emoji || '🌱'}</div>
          <div className="panel-pad">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold">{p.name}</h1>
              {p.is_organic && <Badge tone="good"><Leaf className="h-3 w-3" aria-hidden />Organic</Badge>}
              <Badge>{p.category}</Badge>
            </div>
            {p.description && <p className="mt-3 leading-relaxed text-ink-soft">{p.description}</p>}
            <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-md bg-field px-3 py-2.5"><Package className="h-4 w-4 shrink-0 text-neel-600" aria-hidden /><dt className="sr-only">Stock</dt><dd>{num(max)} {unitLabel(p.unit)} available · minimum order {num(min)}</dd></div>
              <div className="flex items-center gap-3 rounded-md bg-field px-3 py-2.5"><MapPin className="h-4 w-4 shrink-0 text-neel-600" aria-hidden /><dt className="sr-only">Origin</dt><dd>{[seller?.village, p.district].filter(Boolean).join(', ') || '—'}</dd></div>
              {p.harvest_date && <div className="flex items-center gap-3 rounded-md bg-field px-3 py-2.5"><CalendarDays className="h-4 w-4 shrink-0 text-neel-600" aria-hidden /><dt className="sr-only">Harvest</dt><dd>Harvested {shortDate(p.harvest_date)}</dd></div>}
              <div className="flex items-center gap-3 rounded-md bg-field px-3 py-2.5"><Store className="h-4 w-4 shrink-0 text-neel-600" aria-hidden /><dt className="sr-only">Seller</dt><dd>{sellerName}{seller?.role === 'fpo' ? ' (FPO)' : ''}</dd></div>
            </dl>
          </div>
        </div>

        <aside className="panel panel-pad h-fit self-start shadow-lift md:sticky md:top-24 md:col-start-2 md:row-span-2 md:row-start-1">
          <p className="text-sm text-ink-soft">Price</p>
          <p className="font-display text-4xl font-bold tabular-nums">{inr(p.price_per_unit, 2)}<span className="text-base font-normal text-ink-soft"> / {unitLabel(p.unit)}</span></p>

          <div className="mt-6">
            <label htmlFor="qty" className="label">Quantity ({unitLabel(p.unit)})</label>
            <div className="flex items-center gap-2">
              <button type="button" className="btn btn-secondary px-4 text-lg" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(min, q - 1))}>−</button>
              <input id="qty" type="number" className="input text-center font-semibold tabular-nums" min={min} max={max} step="any" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
              <button type="button" className="btn btn-secondary px-4 text-lg" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(max, q + 1))}>+</button>
            </div>
            {!validQty && <p className="mt-1.5 text-xs font-medium text-chilli-600">Enter between {num(min)} and {num(max)} {unitLabel(p.unit)}.</p>}
          </div>

          <p className="mt-5 flex items-baseline justify-between border-t border-line pt-4 text-sm"><span className="text-ink-soft">Subtotal</span><b className="font-display text-xl tabular-nums">{inr(qty * Number(p.price_per_unit), 2)}</b></p>

          {isOwn ? (
            <Notice tone="info" className="mt-4">This is your own listing.</Notice>
          ) : (
            <div className="mt-5 space-y-2.5">
              <button className="btn btn-accent w-full py-3" disabled={!validQty} onClick={() => addToCart(true)}>Buy now</button>
              <button className={`btn btn-secondary w-full py-3 ${added ? 'border-paddy-200 text-paddy-700' : ''}`} disabled={!validQty} onClick={() => addToCart(false)}>
                <ShoppingBasket className="h-4 w-4" aria-hidden /> {added ? 'Added to cart ✓' : 'Add to cart'}
              </button>
            </div>
          )}
          <p className="mt-4 text-xs leading-relaxed text-ink-soft">Delivery is arranged by the seller or their FPO. Pay on delivery or by UPI.</p>
        </aside>

        <div className="space-y-6 md:col-start-1 md:row-start-2">
          <Section title="Where your money goes" subtitle="Per unit, compared with wholesale and shop prices">
            <div className="space-y-5">
              {p.mandi_price_per_unit > 0 && <PriceRow label="Mandi (wholesale) price" value={Number(p.mandi_price_per_unit)} max={ref} tone="bg-neel-300" />}
              <PriceRow label="KhetLink price" value={Number(p.price_per_unit)} max={ref} tone="bg-turmeric-400" />
              {p.retail_price_per_unit > 0 && <PriceRow label="Typical shop price" value={Number(p.retail_price_per_unit)} max={ref} tone="bg-ink/80" />}
            </div>
            {(p.premium_vs_mandi_pct > 0 || p.saving_vs_retail_pct > 0) && (
              <p className="mt-5 rounded-md bg-paddy-50 px-4 py-3 text-sm leading-relaxed text-ink-soft">
                {p.premium_vs_mandi_pct > 0 && <>The farmer earns <b className="text-ink">{p.premium_vs_mandi_pct}% more</b> than the mandi rate. </>}
                {p.saving_vs_retail_pct > 0 && <>You pay <b className="text-ink">{p.saving_vs_retail_pct}% less</b> than at the shop.</>}
              </p>
            )}
          </Section>

          <Outlook crop={p.name} enabled={Boolean(user)} />
        </div>
      </div>
    </div>
  );
}
