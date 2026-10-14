'use client';
import { ArrowDownToLine, ArrowUpFromLine, Clock, Route as RouteIcon, Wallet } from 'lucide-react';
import { ROUTE_COLORS } from '@/lib/constants';
import { inr, kg, minutes, num } from '@/lib/format';

/** One vehicle's route: totals plus the ordered stop list. `index` picks the colour used on the map. */
export default function RouteCard({ route, index = 0, driverMissing = false }) {
  const color = ROUTE_COLORS[index % ROUTE_COLORS.length];
  return (
    <article className="panel animate-fade-up overflow-hidden">
      <div className="h-1.5" style={{ background: color }} aria-hidden />
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-semibold">{route.vehicle_name || 'Vehicle'}</h3>
            <p className="text-xs text-ink-soft">{route.order_ids.length} order{route.order_ids.length === 1 ? '' : 's'} · peak load {kg(route.peak_load_kg)} of {kg(route.capacity_kg)}</p>
          </div>
          <p className="font-display text-lg font-bold tabular-nums">{inr(route.cost_inr)}</p>
        </div>

        <div className="mt-3" aria-label={`Truck ${route.utilisation_pct}% full`}>
          <div className="h-2 overflow-hidden rounded-full bg-field"><div className="h-2 origin-left animate-grow-x rounded-full" style={{ width: `${Math.min(100, route.utilisation_pct)}%`, background: color }} /></div>
          <p className="mt-1 text-xs text-ink-soft">{num(route.utilisation_pct, 0)}% of capacity used at peak</p>
        </div>

        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <div className="flex items-center gap-1.5"><RouteIcon className="h-4 w-4 text-ink-soft" aria-hidden /><dt className="sr-only">Distance</dt><dd>{num(route.distance_km, 1)} km</dd></div>
          <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-ink-soft" aria-hidden /><dt className="sr-only">Duration</dt><dd>{minutes(route.duration_min)}</dd></div>
          <div className="flex items-center gap-1.5"><Wallet className="h-4 w-4 text-ink-soft" aria-hidden /><dt className="sr-only">Cost</dt><dd>{inr(route.cost_inr)}</dd></div>
        </dl>
        {driverMissing && <p className="mt-3 rounded-md border border-turmeric-200 bg-turmeric-50 px-3 py-2 text-xs leading-relaxed text-turmeric-700">No driver is assigned to this vehicle. Assign one in the Fleet tab so the load shows up in their app.</p>}

        <ol className="mt-4 space-y-3 border-t border-line pt-4">
          {route.stops.map((s) => (
            <li key={`${s.order_id}-${s.type}`} className="flex items-start gap-3 text-sm">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-[11px] font-bold"
                style={s.type === 'pickup' ? { borderColor: color, color, background: '#fff' } : { borderColor: color, color: '#fff', background: color }}>{s.seq}</span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-medium">
                  {s.type === 'pickup' ? <ArrowUpFromLine className="h-3.5 w-3.5 text-ink-soft" aria-label="Pickup" /> : <ArrowDownToLine className="h-3.5 w-3.5 text-ink-soft" aria-label="Delivery" />}
                  <span className="truncate">{s.name}</span>
                  {s.label && <span className="text-xs font-normal text-ink-soft">{s.label}</span>}
                </p>
                <p className="text-xs text-ink-soft">{num(s.leg_km, 1)} km from previous · ETA {minutes(s.eta_min)} · load {kg(s.load_after_kg)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </article>
  );
}
