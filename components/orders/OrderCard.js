'use client';
import { useState } from 'react';
import clsx from 'clsx';
import { Check, ChevronDown, MapPin, Phone, Truck } from 'lucide-react';
import { api } from '@/lib/api';
import { ORDER_FLOW } from '@/lib/constants';
import { dateTime, inr, kg, num, unitLabel } from '@/lib/format';
import { OrderBadge } from '@/components/ui';

function Timeline({ status }) {
  if (status === 'cancelled') return null;
  const at = ORDER_FLOW.indexOf(status);
  const labels = ['Placed', 'Confirmed', 'Packed', 'On the way', 'Delivered'];
  return (
    <div>
      <ol className="flex items-center gap-1 text-[11px]" aria-label="Order progress">
        {ORDER_FLOW.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-1.5 last:flex-none">
            <span className={clsx('grid h-5 w-5 shrink-0 place-items-center rounded-full transition-colors', i <= at ? 'bg-paddy-500 text-white' : 'bg-line text-transparent', i === at && at < ORDER_FLOW.length - 1 && 'ring-4 ring-paddy-100')}>
              <Check className="h-3 w-3" aria-hidden />
            </span>
            <span className={clsx('hidden whitespace-nowrap sm:block', i <= at ? 'font-semibold text-ink' : 'text-ink-soft')}>{labels[i]}</span>
            {i < ORDER_FLOW.length - 1 && <span className={clsx('h-0.5 flex-1 rounded-full', i < at ? 'bg-paddy-500' : 'bg-line')} />}
          </li>
        ))}
      </ol>
      {/* Phones hide the step names above, so name the current step here */}
      {at >= 0 && <p className="mt-2 text-xs font-medium text-ink-soft sm:hidden" aria-hidden>Step {at + 1} of {ORDER_FLOW.length}: {labels[at]}</p>}
    </div>
  );
}

/** Which status changes the viewer may trigger (mirrors the backend rules) */
function actionsFor(order, { sellerSide, buyerSide }) {
  const acts = [];
  const s = order.status;
  if (sellerSide) {
    if (s === 'placed') acts.push({ to: 'confirmed', label: 'Confirm order', cls: 'btn-primary' }, { to: 'cancelled', label: 'Decline', cls: 'btn-danger' });
    if (s === 'confirmed') acts.push({ to: 'packed', label: 'Mark packed', cls: 'btn-primary' }, { to: 'cancelled', label: 'Cancel', cls: 'btn-danger' });
    if (s === 'packed' && !order.shipment_id) acts.push({ to: 'in_transit', label: 'Out for delivery', cls: 'btn-primary' });
    if (s === 'in_transit' && !order.shipment_id) acts.push({ to: 'delivered', label: 'Mark delivered', cls: 'btn-primary' });
  } else if (buyerSide && s === 'placed') {
    acts.push({ to: 'cancelled', label: 'Cancel order', cls: 'btn-danger' });
  }
  return acts;
}

export default function OrderCard({ order, sellerSide = false, buyerSide = false, onChanged }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const acts = actionsFor(order, { sellerSide, buyerSide });
  const counterpart = sellerSide ? order.buyer : order.seller;
  const counterpartName = counterpart?.organization || counterpart?.full_name || '—';

  async function move(to) {
    if (to === 'cancelled' && !window.confirm('Cancel this order? Stock will be returned to the listing.')) return;
    setBusy(to);
    setError('');
    try {
      const { order: updated } = await api(`/orders/${order.id}/status`, { method: 'PATCH', body: { status: to } });
      onChanged?.(updated);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  }

  return (
    <article className="panel animate-fade-up overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <p className="font-display text-base font-semibold">Order #{order.order_no}</p>
          <p className="text-xs text-ink-soft">{dateTime(order.created_at)} · {sellerSide ? 'Buyer' : 'Seller'}: {counterpartName}</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="font-display text-lg font-bold tabular-nums">{inr(order.total_amount, 2)}</p>
          <OrderBadge status={order.status} />
          <button className="btn btn-ghost btn-sm" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Toggle order details">
            <ChevronDown className={clsx('h-4 w-4 transition-transform duration-200', open && 'rotate-180')} aria-hidden />
          </button>
        </div>
      </div>

      <div className="px-4 pb-5 sm:px-5"><Timeline status={order.status} /></div>

      {open && (
        <div className="animate-fade-in space-y-4 border-t border-line bg-field/40 p-4 text-sm sm:p-5">
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[420px]">
              <thead><tr><th className="th pl-0">Item</th><th className="th text-right">Qty</th><th className="th text-right">Price</th><th className="th pr-0 text-right">Total</th></tr></thead>
              <tbody className="divide-y divide-line">
                {order.items.map((it) => (
                  <tr key={it.id}>
                    <td className="py-2.5">{it.product_name}</td>
                    <td className="py-2.5 text-right tabular-nums">{num(it.quantity, 2)} {unitLabel(it.unit)}</td>
                    <td className="py-2.5 text-right tabular-nums">{inr(it.unit_price, 2)}</td>
                    <td className="py-2.5 text-right font-semibold tabular-nums">{inr(it.line_total, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-2.5 text-ink-soft sm:grid-cols-2">
            <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {order.delivery_address || 'No address'}</p>
            <p>Weight {kg(order.total_weight_kg)} · {order.payment_method === 'upi' ? 'UPI' : 'Cash'} on delivery · {order.payment_status}</p>
            {counterpart?.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4" aria-hidden /> <a className="font-medium text-neel-700 underline underline-offset-2" href={`tel:${counterpart.phone}`}>{counterpart.phone}</a></p>}
            {order.shipment_id && <p className="flex items-center gap-2"><Truck className="h-4 w-4" aria-hidden /> Part of a pooled shipment. Progress follows the truck.</p>}
            {order.notes && <p className="sm:col-span-2">Note: {order.notes}</p>}
          </div>
        </div>
      )}

      {(acts.length > 0 || error) && (
        <div className="flex flex-wrap items-center gap-2 border-t border-line bg-field/60 px-4 py-3 sm:px-5">
          {acts.map((a) => (
            <button key={a.to} className={clsx('btn btn-sm', a.cls)} disabled={Boolean(busy)} onClick={() => move(a.to)}>{busy === a.to ? 'Saving…' : a.label}</button>
          ))}
          {error && <p role="alert" className="text-sm font-medium text-chilli-600">{error}</p>}
        </div>
      )}
    </article>
  );
}
