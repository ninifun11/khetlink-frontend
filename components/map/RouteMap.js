'use client';
import dynamic from 'next/dynamic';
import { ROUTE_COLORS } from '@/lib/constants';
import SvgRouteMap from './SvgRouteMap';

const MapboxRouteMap = dynamic(() => import('./MapboxRouteMap'), {
  ssr: false,
  loading: () => <div className="h-[420px] animate-pulse rounded-lg border border-line bg-field" aria-label="Loading map" />,
});

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

/**
 * Draws a depot plus one coloured line per vehicle.
 *   depot:  { lat, lng, name }
 *   routes: [{ vehicle_id, vehicle_name, stops: [{ seq, type: 'pickup'|'delivery', name, lat, lng, order_id, label }] }]
 * Uses Mapbox when NEXT_PUBLIC_MAPBOX_TOKEN is set, otherwise a built-in SVG canvas.
 * Lines join stops in order (straight segments); road distance is estimated by the optimiser.
 */
export default function RouteMap({ depot, routes }) {
  if (!depot || !routes?.length) return null;
  return (
    <div>
      {TOKEN ? <MapboxRouteMap depot={depot} routes={routes} token={TOKEN} /> : <SvgRouteMap depot={depot} routes={routes} />}
      <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-soft" aria-label="Map legend">
        {routes.map((r, i) => (
          <li key={r.vehicle_id || i} className="flex items-center gap-1.5">
            <span className="h-2.5 w-5 rounded-full shadow-card" style={{ background: ROUTE_COLORS[i % ROUTE_COLORS.length] }} aria-hidden />{r.vehicle_name || `Vehicle ${i + 1}`}
          </li>
        ))}
        <li>Hollow number = pickup at farm</li>
        <li>Filled number = delivery to buyer</li>
        <li>Dark square = depot</li>
      </ul>
    </div>
  );
}
