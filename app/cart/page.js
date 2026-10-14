
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Banknote, CheckCircle2, LocateFixed, ShoppingBasket, Smartphone, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { useI18n } from '@/lib/i18n';
import { LOCALITIES } from '@/lib/constants';
import { inr, kg, num, unitLabel } from '@/lib/format';
import { EmptyState, ErrorNotice, Field, Notice, PageHeader, Section } from '@/components/ui';

export default function CartPage() {
  const { t } = useI18n();
  const { user, profile, loading: authLoading } = useAuth();
  const cart = useCart();
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState({ lat: '', lng: '' });
  const [payment, setPayment] = useState('cod');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [placed, setPlaced] = useState(null);
  const [geoMsg, setGeoMsg] = useState('');

  // Pre-fill from the saved profile
  useEffect(() => {
    if (!profile) return;
    setAddress((a) => a || profile.address || '');
    setCoords((c) => (c.lat === '' && profile.lat != null ? { lat: String(profile.lat), lng: String(profile.lng) } : c));
  }, [profile]);

  const pickLocality = (name) => {
    const l = LOCALITIES.find((x) => x.name === name);
    if (!l) return;
    setCoords({ lat: String(l.lat), lng: String(l.lng) });
    setAddress((a) => (a && !LOCALITIES.some((x) => a.startsWith(x.name)) ? a : `${l.name}, Hyderabad`));
  };

  const useMyLocation = () => {
    setGeoMsg('');
    if (!navigator.geolocation) return setGeoMsg('Location is not available in this browser.');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude.toFixed(5), lng: pos.coords.longitude.toFixed(5) }); setGeoMsg('Location captured.'); },
      () => setGeoMsg('Could not read your location. Pick a locality instead.'),
      { timeout: 8000 },
    );
  };

  const bad = cart.items.filter((i) => i.qty < i.min_qty);
  const hasCoords = coords.lat !== '' && coords.lng !== '' && !Number.isNaN(Number(coords.lat)) && !Number.isNaN(Number(coords.lng));
  const bySeller = Object.values(cart.items.reduce((m, i) => { (m[i.seller_id] ||= { name: i.seller_name, items: [] }).items.push(i); return m; }, {}));

  async function placeOrder(e) {
    e.preventDefault();
    setError(null);
    if (!hasCoords) return setError(new Error('Choose a delivery locality or use your current location so we can plan the route.'));
    setBusy(true);
    try {
      const res = await api('/orders', {
        method: 'POST',
        body: {
          items: cart.items.map((i) => ({ product_id: i.product_id, quantity: i.qty })),
          delivery_address: address,
          delivery_lat: Number(coords.lat),
          delivery_lng: Number(coords.lng),
          payment_method: payment,
          notes: notes || null,
        },
      });
      cart.clear();
      setPlaced(res.orders);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="panel panel-pad animate-scale-in text-center shadow-lift">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-paddy-50 ring-8 ring-paddy-50/60"><CheckCircle2 className="h-10 w-10 text-paddy-600" aria-hidden /></span>
          <h1 className="mt-5 text-2xl font-bold sm:text-3xl">Order placed</h1>
          <p className="mt-1.5 text-ink-soft">{placed.length > 1 ? `Your cart was split into ${placed.length} orders, one per seller.` : 'The seller has been notified.'}</p>
          <ul className="mt-6 divide-y divide-line overflow-hidden rounded-lg border border-line text-left text-sm">
            {placed.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 bg-field/60 p-4">
                <span><b>Order #{o.order_no}</b> · {o.seller?.organization || o.seller?.full_name}</span>
                <span className="font-display font-bold tabular-nums">{inr(o.total_amount, 2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/dashboard/orders" className="btn btn-primary px-6">Track my orders</Link>
            <Link href="/marketplace" className="btn btn-secondary px-6">Keep shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.ready && cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <EmptyState icon={ShoppingBasket} title={t('cart.empty')} action={<Link href="/marketplace" className="btn btn-primary">{t('home.browse')}</Link>}>
          Add some fresh produce and it will show up here.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <PageHeader title={t('cart.title')} subtitle="Orders are split automatically when items come from different sellers." />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {bySeller.map((g) => (
            <Section key={g.name} title={`From ${g.name}`}>
              <ul className="-my-1 divide-y divide-line">
                {g.items.map((i) => (
                  <li key={i.product_id} className="flex flex-wrap items-center gap-x-4 gap-y-3 py-4">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-turmeric-50 to-turmeric-100 text-3xl" aria-hidden>{i.emoji || '🌱'}</span>
                    <div className="min-w-0 flex-1 basis-40">
                      <Link href={`/marketplace/${i.product_id}`} className="font-semibold transition-colors hover:text-neel-700">{i.name}</Link>
                      <p className="text-xs text-ink-soft">{inr(i.price, 2)} / {unitLabel(i.unit)} · min {num(i.min_qty)} · max {num(i.max_qty)}</p>
                      {i.qty < i.min_qty && <p className="mt-0.5 text-xs font-medium text-chilli-600">Minimum order is {num(i.min_qty)} {unitLabel(i.unit)}.</p>}
                    </div>
                    <label className="sr-only" htmlFor={`q-${i.product_id}`}>Quantity of {i.name}</label>
                    <input id={`q-${i.product_id}`} type="number" step="any" min={i.min_qty} max={i.max_qty} className="input w-24 text-center font-semibold tabular-nums"
                      value={i.qty} onChange={(e) => cart.setQty(i.product_id, e.target.value)} />
                    <span className="w-24 text-right font-display font-bold tabular-nums">{inr(i.qty * i.price, 2)}</span>
                    <button className="btn btn-ghost btn-sm hover:!bg-chilli-50 hover:!text-chilli-600" onClick={() => cart.remove(i.product_id)} aria-label={`Remove ${i.name}`}><Trash2 className="h-4 w-4" aria-hidden /></button>
                  </li>
                ))}
              </ul>
            </Section>
          ))}
        </div>

        <form onSubmit={placeOrder} className="panel panel-pad h-fit space-y-4 shadow-lift lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">{t('cart.delivery')}</h2>
          {!authLoading && !user && <Notice tone="info">Sign in to place your order. Your cart will be kept.</Notice>}

          <Field label="Locality" htmlFor="loc">
            <select id="loc" className="input" defaultValue="" onChange={(e) => pickLocality(e.target.value)}>
              <option value="" disabled>Choose an area…</option>
              {LOCALITIES.map((l) => <option key={l.name}>{l.name}</option>)}
            </select>
          </Field>
          <button type="button" className="btn btn-secondary btn-sm w-full" onClick={useMyLocation}><LocateFixed className="h-4 w-4" aria-hidden /> Use my current location</button>
          {geoMsg && <p className="hint">{geoMsg}</p>}
          {hasCoords && <p className="hint">Delivery pin: {Number(coords.lat).toFixed(4)}, {Number(coords.lng).toFixed(4)}</p>}

          <Field label="Full address" htmlFor="addr"><textarea id="addr" required minLength={5} rows={2} className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House no., street, landmark" /></Field>

          <fieldset>
            <legend className="label">Payment</legend>
            <div className="grid grid-cols-2 gap-2">
              {[['cod', 'Cash on delivery', Banknote], ['upi', 'UPI on delivery', Smartphone]].map(([v, l, PayIcon]) => (
                <label key={v} className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-3 text-center text-sm transition-all focus-within:ring-2 focus-within:ring-neel-500 focus-within:ring-offset-2 ${payment === v ? 'border-neel-600 bg-neel-50 font-semibold text-neel-800 shadow-card' : 'border-line-strong hover:border-neel-300 hover:bg-field'}`}>
                  <input type="radio" className="sr-only" name="pay" checked={payment === v} onChange={() => setPayment(v)} />
                  <PayIcon className="h-5 w-5" aria-hidden />{l}
                </label>
              ))}
            </div>
          </fieldset>

          <Field label="Notes for the seller (optional)" htmlFor="notes"><input id="notes" className="input" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} /></Field>

          <dl className="space-y-1.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink-soft">Items</dt><dd>{cart.count}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">Total weight</dt><dd>{kg(cart.weight)}</dd></div>
            <div className="flex items-baseline justify-between pt-1 text-base font-bold"><dt>{t('cart.total')}</dt><dd className="font-display text-2xl tabular-nums">{inr(cart.subtotal, 2)}</dd></div>
          </dl>

          <ErrorNotice error={error} />
          {user ? (
            <button className="btn btn-accent w-full py-3" disabled={busy || bad.length > 0}>{busy ? 'Placing order…' : t('cart.placeOrder')}</button>
          ) : (
            <Link href="/login?next=/cart" className="btn btn-primary w-full py-3">Sign in to continue</Link>
          )}
        </form>
      </div>
    </div>
  );
}