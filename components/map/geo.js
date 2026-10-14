import { ROUTE_COLORS } from '@/lib/constants';

/** Turn optimiser routes into drawable lines + points. Shared by the SVG and Mapbox maps. */
export function buildGeometry(depot, routes = []) {
  const lines = routes.map((r, i) => ({
    key: r.vehicle_id || String(i),
    color: ROUTE_COLORS[i % ROUTE_COLORS.length],
    name: r.vehicle_name || `Vehicle ${i + 1}`,
    coords: [depot, ...r.stops, depot].filter((p) => p && p.lat != null && p.lng != null).map((p) => [p.lng, p.lat]),
    stops: r.stops,
  }));
  const points = lines.flatMap((l) => l.stops.map((s) => ({ ...s, color: l.color, routeName: l.name })));
  const all = [depot, ...points].filter((p) => p && p.lat != null && p.lng != null);
  return { lines, points, all };
}

export function boundsOf(all) {
  const lats = all.map((p) => p.lat);
  const lngs = all.map((p) => p.lng);
  return { minLat: Math.min(...lats), maxLat: Math.max(...lats), minLng: Math.min(...lngs), maxLng: Math.max(...lngs) };
}
