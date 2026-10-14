'use client';
import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { CheckCircle2, Leaf, Sparkles, TrendingDown, Truck, Wallet } from 'lucide-react';
import { api } from '@/lib/api';
import { useApi } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import { HUBS } from '@/lib/constants';
import { dateTime, inr, kg, num } from '@/lib/format';
import RouteMap from '@/components/map/RouteMap';
import RouteCard from '@/components/logistics/RouteCard';
import { Badge, EmptyState, ErrorNotice, ListSkeleton, Notice, Section, StatCard } from '@/components/ui';

export default function PlanPanel({ goToShipments }) {
  const { profile } = useAuth();
  const orders = useApi('/logistics/pending-orders');
  const vehicles = useApi('/logistics/vehicles');

  const depots = useMemo(() => {
    const list = [...HUBS];
    if (profile.lat != null && profile.lng != null) list.unshift({ name: `My location${profile.village ? ` (${profile.village})` : ''}`, lat: profile.lat, lng: profile.lng });
    return list;
  }, [profile]);

  const [orderIds, setOrderIds] = useState(new Set());
  const [vehicleIds, setVehicleIds] = useState(new Set());
  const [depotIdx, setDepotIdx] = useState(0);
  const [maxKm, setMaxKm] = useState(300);
  const [busy, setBusy] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState(null);
  const [done, setDone] = useState(null);

  const pending = orders.data?.orders || [];
  const fleet = (vehicles.data?.vehicles || []).filter((v) => v.is_active);
  const routable = pending.filter((o) => o.has_coordinates);

  // Sensible defaults: everything routable, every active vehicle
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => { if (orders.data) setOrderIds(new Set(routable.map((o) => o.id))); }, [orders.data]);
  useEffect(() => { if (vehicles.data) setVehicleIds(new Set(fleet.map((v) => v.id))); }, [vehicles.data]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const toggle = (set, setter, id) => { const n = new Set(set); n.has(id) ? n.delete(id) : n.add(id); setter(n); setPlan(null); };
  const totalKg = pending.filter((o) => orderIds.has(o.id)).reduce((s, o) => s + Number(o.total_weight_kg), 0);
  const capacityKg = fleet.filter((v) => vehicleIds.has(v.id)).reduce((s, v) => s + Number(v.capacity_kg), 0);
  const orderNo = (id) => pending.find((o) => o.id === id)?.order_no;

  async function optimise() {
    setBusy(true); setError(null); setPlan(null); setDone(null);
    try {
      const depot = depots[depotIdx];
      setPlan(await api('/logistics/optimize', { method: 'POST', body: { order_ids: [...orderIds], vehicle_ids: [...vehicleIds], depot: { lat: depot.lat, lng: depot.lng, name: depot.name }, max_route_km: Number(maxKm) || 300 } }));
    } catch (e) { setError(e); } finally { setBusy(false); }
  }

  async function dispatch() {
    setDispatching(true); setError(null);
    try {
      const res = await api('/logistics/dispatch', { method: 'POST', body: { plan_id: plan.plan_id } });
      setDone(res.shipments.length);
      setPlan(null);
      orders.reload();
    } catch (e) { setError(e); } finally { setDispatching(false); }
  }

  if ((orders.loading && !orders.data) || (vehicles.loading && !vehicles.data)) return <ListSkeleton rows={2} label="Loading orders and vehicles…" />;
  const s = plan?.summary;

  return (
    <div className="space-y-6">
      <ErrorNotice error={orders.error || vehicles.error} onRetry={() => { orders.reload(); vehicles.reload(); }} />
      {done && (
        <Notice tone="good" title={`${done} shipment${done === 1 ? '' : 's'} created`}>
          Orders are marked packed and assigned to trucks. <button className="font-semibold underline" onClick={goToShipments}>Open shipments</button>
        </Notice>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Section title="1. Orders waiting for a truck" subtitle="Confirmed or packed orders from you and your member farmers">
          {pending.length === 0 ? (
            <EmptyState title="Nothing to route right now">Confirm some orders first. They will show up here, ready to be pooled.</EmptyState>
          ) : (
            <>
              <div className="mb-2 flex items-center justify-between text-xs text-ink-soft">
                <span>{orderIds.size} of {pending.length} selected · {kg(totalKg)}</span>
                <span className="space-x-3">
                  <button className="font-medium text-neel-700 underline underline-offset-2" onClick={() => { setOrderIds(new Set(routable.map((o) => o.id))); setPlan(null); }}>Select all</button>
                  <button className="font-medium text-neel-700 underline underline-offset-2" onClick={() => { setOrderIds(new Set()); setPlan(null); }}>None</button>
                </span>
              </div>
              <ul className="scroll-thin max-h-80 divide-y divide-line overflow-y-auto rounded-md border border-line">
                {pending.map((o) => (
                  <li key={o.id}>
                    <label className={clsx('flex items-start gap-3 p-3.5 text-sm transition-colors', o.has_coordinates ? 'cursor-pointer hover:bg-field/70' : 'cursor-not-allowed opacity-50')}>
                      <input type="checkbox" className="mt-1 h-4 w-4 rounded border-line text-neel-700" disabled={!o.has_coordinates} checked={orderIds.has(o.id)} onChange={() => toggle(orderIds, setOrderIds, o.id)} />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-2"><b>#{o.order_no}</b><span className="text-ink-soft">{o.seller?.organization || o.seller?.full_name} → {o.buyer?.organization || o.buyer?.full_name}</span></span>
                        <span className="block truncate text-xs text-ink-soft">{o.delivery_address}</span>
                        {!o.has_coordinates && <span className="text-xs text-chilli-600">Missing pickup or delivery coordinates</span>}
                      </span>
                      <span className="text-right text-xs tabular-nums text-ink-soft">{kg(o.total_weight_kg)}<br />{inr(o.total_amount)}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Section>

        <div className="space-y-6">
          <Section title="2. Vehicles">
            {fleet.length === 0 ? <p className="text-sm text-ink-soft">No active vehicles. Add one in the Fleet tab.</p> : (
              <ul className="space-y-2">
                {fleet.map((v) => (
                  <li key={v.id}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-md p-1.5 text-sm transition-colors hover:bg-field/70">
                      <input type="checkbox" className="mt-1 h-4 w-4 rounded border-line text-neel-700" checked={vehicleIds.has(v.id)} onChange={() => toggle(vehicleIds, setVehicleIds, v.id)} />
                      <span><b>{v.name}</b> <span className="text-xs text-ink-soft">{kg(v.capacity_kg)} · {inr(v.cost_per_km)}/km</span>
                        <span className="block text-xs text-ink-soft">Driver: {v.driver?.full_name || 'not assigned'}</span></span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
            {orderIds.size > 0 && capacityKg > 0 && totalKg > capacityKg && <Notice tone="warn" className="mt-3">Selected orders weigh {kg(totalKg)} but the chosen vehicles carry {kg(capacityKg)} in total. Some orders may stay unassigned.</Notice>}
          </Section>

          <Section title="3. Start point">
            <label htmlFor="depot" className="sr-only">Depot</label>
            <select id="depot" className="input" value={depotIdx} onChange={(e) => { setDepotIdx(Number(e.target.value)); setPlan(null); }}>
              {depots.map((d, i) => <option key={d.name} value={i}>{d.name}</option>)}
            </select>
            <label htmlFor="maxkm" className="label mt-3">Longest route allowed (km)</label>
            <input id="maxkm" type="number" min="20" max="2000" className="input" value={maxKm} onChange={(e) => { setMaxKm(e.target.value); setPlan(null); }} />
          </Section>

          <button className="btn btn-accent w-full py-3 text-base" disabled={busy || orderIds.size === 0 || vehicleIds.size === 0} onClick={optimise}>
            <Sparkles className="h-4 w-4" aria-hidden /> {busy ? 'Optimising routes…' : 'Optimise routes'}
          </button>
        </div>
      </div>

      <ErrorNotice error={error} />

      {plan && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold">Suggested plan</h2>
              <Badge tone="info">{plan.method.startsWith('ortools') ? 'OR-Tools solver' : 'Heuristic solver'}</Badge>
            </div>
            <button className="btn btn-primary" disabled={dispatching || plan.routes.length === 0} onClick={dispatch}>
              <CheckCircle2 className="h-4 w-4" aria-hidden /> {dispatching ? 'Dispatching…' : `Dispatch ${plan.routes.length} shipment${plan.routes.length === 1 ? '' : 's'}`}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={TrendingDown} label="Distance saved" value={`${num(s.distance_saved_pct, 1)}%`} tone="good" hint={`${num(s.total_distance_km, 1)} km vs ${num(s.baseline_distance_km, 1)} km separately`} />
            <StatCard icon={Wallet} label="Transport cost saved" value={inr(s.cost_saved_inr)} tone="good" hint={`Plan cost ${inr(s.total_cost_inr)}`} />
            <StatCard icon={Leaf} label="CO₂ avoided (est.)" value={`${num(s.co2_saved_kg_est, 1)} kg`} tone="good" />
            <StatCard icon={Truck} label="Orders routed" value={`${s.orders_assigned} of ${s.orders_total}`} hint={`${s.vehicles_used} vehicle${s.vehicles_used === 1 ? '' : 's'} used`} tone={s.orders_unassigned ? 'warn' : undefined} />
          </div>
          <p className="flex items-start gap-2 text-xs text-ink-soft"><TrendingDown className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />Baseline: {s.baseline_definition}. Road distance is estimated from straight-line distance with a rural-road factor.</p>

          {plan.unassigned.length > 0 && (
            <Notice tone="warn" title={`${plan.unassigned.length} order${plan.unassigned.length === 1 ? '' : 's'} could not be routed`}>
              <ul className="list-disc pl-5">
                {plan.unassigned.map((u) => <li key={u.order_id}>#{orderNo(u.order_id) ?? u.order_id.slice(0, 6)}: {u.reason}</li>)}
              </ul>
            </Notice>
          )}

          <RouteMap depot={plan.depot} routes={plan.routes} />

          <div className="grid gap-4 lg:grid-cols-2">
            {plan.routes.map((r, i) => <RouteCard key={r.vehicle_id} route={r} index={i} driverMissing={!r.driver_id} />)}
          </div>
          <p className="text-xs text-ink-soft">Plan generated {dateTime(new Date())}. It stays valid for 15 minutes.</p>
        </div>
      )}
    </div>
  );
}
