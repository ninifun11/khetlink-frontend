'use client';
import { boundsOf, buildGeometry } from './geo';

const W = 800;
const H = 460;
const PAD = 48;

/** Dependency-free route canvas, used when no Mapbox token is configured. */
export default function SvgRouteMap({ depot, routes }) {
  const { lines, points, all } = buildGeometry(depot, routes);
  if (all.length < 2) return null;

  const b = boundsOf(all);
  const midLat = ((b.minLat + b.maxLat) / 2) * (Math.PI / 180);
  const kx = Math.cos(midLat); // shrink longitude so distances look right
  const spanX = Math.max((b.maxLng - b.minLng) * kx, 0.01);
  const spanY = Math.max(b.maxLat - b.minLat, 0.01);
  const scale = Math.min((W - 2 * PAD) / spanX, (H - 2 * PAD) / spanY);
  const offX = (W - spanX * scale) / 2;
  const offY = (H - spanY * scale) / 2;
  const px = (lng) => offX + (lng - b.minLng) * kx * scale;
  const py = (lat) => H - offY - (lat - b.minLat) * scale;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Route map" className="h-auto w-full rounded-lg border border-line bg-[#F1F4F0]">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#E1E7DF" strokeWidth="1" /></pattern>
      </defs>
      <rect width={W} height={H} fill="url(#grid)" />

      {lines.map((l) => (
        <polyline key={l.key} fill="none" stroke={l.color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" strokeOpacity="0.85"
          points={l.coords.map(([lng, lat]) => `${px(lng)},${py(lat)}`).join(' ')} />
      ))}

      {points.map((p, i) => {
        const x = px(p.lng), y = py(p.lat);
        const pickup = p.type === 'pickup';
        return (
          <g key={`${p.order_id}-${p.type}-${i}`} transform={`translate(${x},${y})`}>
            <title>{`${p.seq}. ${pickup ? 'Pickup' : 'Delivery'}: ${p.name}${p.label ? ` (${p.label})` : ''}`}</title>
            <circle r="11" fill={pickup ? '#fff' : p.color} stroke={p.color} strokeWidth="2.5" />
            <text textAnchor="middle" dy="4" fontSize="11" fontWeight="700" fill={pickup ? p.color : '#fff'}>{p.seq}</text>
          </g>
        );
      })}

      <g transform={`translate(${px(depot.lng)},${py(depot.lat)})`}>
        <title>{`Depot: ${depot.name || 'Collection hub'}`}</title>
        <rect x="-10" y="-10" width="20" height="20" rx="4" fill="#1B2340" />
        <path d="M-5 2 L0 -5 L5 2 Z" fill="#F5B921" />
      </g>
      <text x={W - 12} y={H - 12} textAnchor="end" fontSize="10" fill="#5A6480">Schematic view. Add a Mapbox token to see streets.</text>
    </svg>
  );
}
