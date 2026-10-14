'use client';
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { boundsOf, buildGeometry } from './geo';

const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function pin(text, { bg, fg, border, square = false }) {
  const el = document.createElement('div');
  el.textContent = text;
  el.style.cssText = `width:24px;height:24px;display:grid;place-items:center;font:700 11px system-ui;color:${fg};background:${bg};border:2.5px solid ${border};border-radius:${square ? '6px' : '50%'};box-shadow:0 1px 3px rgba(0,0,0,.35)`;
  return el;
}

export default function MapboxRouteMap({ depot, routes, token }) {
  const box = useRef(null);
  const mapRef = useRef(null);
  const markers = useRef([]);
  const layerIds = useRef([]);

  // create the map once
  useEffect(() => {
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({ container: box.current, style: 'mapbox://styles/mapbox/streets-v12', center: [depot.lng, depot.lat], zoom: 9 });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;
    return () => { markers.current.forEach((m) => m.remove()); map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // (re)draw whenever the plan changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;

    const draw = () => {
      layerIds.current.forEach((id) => { if (map.getLayer(id)) map.removeLayer(id); if (map.getSource(id)) map.removeSource(id); });
      layerIds.current = [];
      markers.current.forEach((m) => m.remove());
      markers.current = [];

      const { lines, points, all } = buildGeometry(depot, routes);
      lines.forEach((l, i) => {
        const id = `route-${i}`;
        map.addSource(id, { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: l.coords } } });
        map.addLayer({ id, type: 'line', source: id, layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': l.color, 'line-width': 4, 'line-opacity': 0.85 } });
        layerIds.current.push(id);
      });

      points.forEach((p) => {
        const pickup = p.type === 'pickup';
        const el = pin(String(p.seq), pickup ? { bg: '#fff', fg: p.color, border: p.color } : { bg: p.color, fg: '#fff', border: p.color });
        const popup = new mapboxgl.Popup({ offset: 16 }).setHTML(
          `<strong>${p.seq}. ${pickup ? 'Pickup' : 'Delivery'}</strong><br>${esc(p.name)}<br><span style="color:#5A6480">${esc(p.routeName)}${p.label ? ' · ' + esc(p.label) : ''}</span>`,
        );
        markers.current.push(new mapboxgl.Marker({ element: el }).setLngLat([p.lng, p.lat]).setPopup(popup).addTo(map));
      });
      markers.current.push(new mapboxgl.Marker({ element: pin('H', { bg: '#1B2340', fg: '#F5B921', border: '#1B2340', square: true }) })
        .setLngLat([depot.lng, depot.lat]).setPopup(new mapboxgl.Popup({ offset: 16 }).setText(depot.name || 'Collection hub')).addTo(map));

      if (all.length > 1) {
        const b = boundsOf(all);
        map.fitBounds([[b.minLng, b.minLat], [b.maxLng, b.maxLat]], { padding: 56, duration: 0, maxZoom: 13 });
      }
    };

    if (map.loaded()) draw(); else map.once('load', draw);
    return () => map.off('load', draw);
  }, [depot, routes]);

  return <div ref={box} className="h-[420px] w-full overflow-hidden rounded-lg border border-line" role="region" aria-label="Route map" />;
}
