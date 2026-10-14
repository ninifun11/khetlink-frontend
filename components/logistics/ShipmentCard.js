'use client';
import { useState } from 'react';
import { Map as MapIcon, Truck, User } from 'lucide-react';
import { api } from '@/lib/api';
import { dateTime, inr, kg, minutes, num } from '@/lib/format';
import RouteMap from '@/components/map/RouteMap';
import RouteCard from '@/components/logistics/RouteCard';
import { OrderBadge, ShipmentBadge } from '@/components/ui';

/**
 * A shipment with its status actions. Used by the FPO ("Shipments" tab) and by drivers.
 * driverView: also lets the driver mark individual drops as delivered and hides "cancel".
 */
export default function ShipmentCard({ shipment: s, driverView = false, onChanged }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [showRoute, setShowRoute] = useState(driverView && s.status !== 'completed');
  const route = s.plan?.route;
  const depot = s.plan?.depot;
  const savedPct = s.baseline_distance_km > 0 ? Math.max(0, ((s.baseline_distance_km - s.total_distance_km) / s.baseline_distance_km) * 100) : null;

  async function shipmentTo(status) {
    if (status === 'cancelled' && !window.confirm('Cancel this shipment? Its orders go back to the waiting list.')) return;
    setBusy(status); setError('');
    try { await api(`/logistics/shipments/${s.id}/status`, { method: 'PATCH', body: { status } }); onChanged?.(); }
    catch (e) { setError(e.message); } finally { setBusy(''); }
  }
  async function orderDelivered(id) {
    setBusy(id); setError('');
    try { await api(`/orders/${id}/status`, { method: 'PATCH', body: { status: 'delivered' } }); onChanged?.(); }
    catch (e) { setError(e.message); } finally { setBusy(''); }
  }

  return (
    <article className="panel animate-fade-up overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5">
        <div>
          <p className="flex items-center gap-2 font-display text-base font-semibold"><span className="grid h-8 w-8 place-items-center rounded-md bg-neel-50 text-neel-700"><Truck className="h-4 w-4" aria-hidden /></span> {s.vehicle?.name || 'Vehicle removed'} {s.vehicle?.registration_no && <span className="text-xs font-normal text-ink-soft">{s.vehicle.registration_no}</span>}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-soft"><User className="h-3.5 w-3.5" aria-hidden /> {s.driver?.full_name || 'No driver assigned'} · created {dateTime(s.created_at)}</p>
        </div>
        <ShipmentBadge status={s.status} />
      </div>

      <dl className="grid grid-cols-2 gap-3 border-y border-line bg-field/60 px-4 py-3.5 text-sm sm:grid-cols-4 sm:px-5">
        <div><dt className="text-xs text-ink-soft">Distance</dt><dd className="font-semibold tabular-nums">{num(s.total_distance_km, 1)} km</dd></div>
        <div><dt className="text-xs text-ink-soft">Duration</dt><dd className="font-semibold tabular-nums">{minutes(s.total_duration_min)}</dd></div>
        <div><dt className="text-xs text-ink-soft">Load</dt><dd className="font-semibold tabular-nums">{kg(s.total_load_kg)}</dd></div>
        <div><dt className="text-xs text-ink-soft">{driverView ? 'Orders' : 'Est. cost'}</dt><dd className="font-semibold tabular-nums">{driverView ? s.orders.length : inr(s.cost_estimate)}</dd></div>
      </dl>

      <div className="space-y-4 p-4 text-sm sm:p-5">
        {!driverView && savedPct != null && <p className="rounded-md bg-paddy-50 px-3 py-2 font-medium text-paddy-700">Pooling saves {num(savedPct, 0)}% of the distance compared with one trip per order.</p>}

        <ul className="divide-y divide-line overflow-hidden rounded-md border border-line">
          {s.orders.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 p-2.5">
              <span className="min-w-0"><b>#{o.order_no}</b> <span className="text-ink-soft">{o.delivery_address}</span></span>
              <span className="flex items-center gap-2">
                <OrderBadge status={o.status} />
                {driverView && o.status === 'in_transit' && (
                  <button className="btn btn-primary btn-sm" disabled={Boolean(busy)} onClick={() => orderDelivered(o.id)}>{busy === o.id ? 'Saving…' : 'Delivered'}</button>
                )}
              </span>
            </li>
          ))}
        </ul>

        {route && depot && (
          <button className="btn btn-ghost btn-sm" onClick={() => setShowRoute((v) => !v)} aria-expanded={showRoute}><MapIcon className="h-4 w-4" aria-hidden /> {showRoute ? 'Hide route' : 'Show route and stops'}</button>
        )}
        {showRoute && route && depot && (
          <div className="space-y-4">
            <RouteMap depot={depot} routes={[route]} />
            <RouteCard route={route} />
          </div>
        )}
        {error && <p role="alert" className="text-sm font-medium text-chilli-600">{error}</p>}
      </div>

      {(s.status === 'planned' || s.status === 'in_transit') && (
        <div className="flex flex-wrap gap-2 border-t border-line bg-field/60 px-4 py-3 sm:px-5">
          {s.status === 'planned' && <button className="btn btn-primary btn-sm" disabled={Boolean(busy)} onClick={() => shipmentTo('in_transit')}>{busy === 'in_transit' ? 'Saving…' : 'Start trip'}</button>}
          {s.status === 'in_transit' && <button className="btn btn-primary btn-sm" disabled={Boolean(busy)} onClick={() => shipmentTo('completed')}>{busy === 'completed' ? 'Saving…' : driverView ? 'Finish trip, all delivered' : 'Mark completed'}</button>}
          {s.status === 'planned' && !driverView && <button className="btn btn-danger btn-sm" disabled={Boolean(busy)} onClick={() => shipmentTo('cancelled')}>Cancel shipment</button>}
        </div>
      )}
    </article>
  );
}
