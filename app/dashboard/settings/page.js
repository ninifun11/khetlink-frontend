'use client';
import { useEffect, useState } from 'react';
import { LocateFixed } from 'lucide-react';
import { api } from '@/lib/api';
import { useApi } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import { DISTRICTS, HUBS, LOCALITIES, ROLES } from '@/lib/constants';
import { Badge, ErrorNotice, Field, Notice, PageHeader, Section } from '@/components/ui';

const blank = (v) => (v == null ? '' : String(v));

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const isSeller = ['farmer', 'fpo'].includes(profile.role);
  const [f, setF] = useState(() => ({
    full_name: blank(profile.full_name), phone: blank(profile.phone), organization: blank(profile.organization), village: blank(profile.village),
    district: blank(profile.district), address: blank(profile.address), lat: blank(profile.lat), lng: blank(profile.lng), fpo_id: blank(profile.fpo_id),
  }));
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [geoMsg, setGeoMsg] = useState('');
  const [welcome, setWelcome] = useState(false);
  const fpos = useApi('/profile/fpos', undefined, { enabled: profile.role === 'farmer' });

  useEffect(() => { setWelcome(new URLSearchParams(window.location.search).get('welcome') === '1'); }, []);

  const set = (k) => (e) => { setSaved(false); setF((s) => ({ ...s, [k]: e.target.value })); };
  const setPlace = (p) => { setSaved(false); setF((s) => ({ ...s, lat: String(p.lat), lng: String(p.lng) })); };

  const pickPlace = (name) => {
    const p = [...LOCALITIES, ...HUBS].find((x) => x.name === name);
    if (p) setPlace(p);
  };

  const locate = () => {
    setGeoMsg('');
    if (!navigator.geolocation) return setGeoMsg('Location is not available in this browser.');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setPlace({ lat: pos.coords.latitude.toFixed(5), lng: pos.coords.longitude.toFixed(5) }); setGeoMsg('Location captured.'); },
      () => setGeoMsg('Could not read your location. Choose a place from the list or type coordinates.'),
      { timeout: 8000 },
    );
  };

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    const hasLat = f.lat !== '' && f.lng !== '';
    const body = {
      full_name: f.full_name.trim(),
      phone: f.phone.trim() || null,
      organization: f.organization.trim() || null,
      village: f.village.trim() || null,
      district: f.district || null,
      address: f.address.trim() || null,
      lat: hasLat ? Number(f.lat) : null,
      lng: hasLat ? Number(f.lng) : null,
      ...(profile.role === 'farmer' ? { fpo_id: f.fpo_id || null } : {}),
    };
    try {
      await api('/profile/me', { method: 'PUT', body });
      await refreshProfile();
      setSaved(true);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  const locLabel = { farmer: 'Farm / pickup location', fpo: 'Collection hub location', driver: 'Home base' }[profile.role] || 'Delivery location';

  return (
    <>
      <PageHeader title="Profile and location" subtitle="Your location decides distances, delivery pins and where trucks collect from." actions={<Badge tone="info">{ROLES[profile.role]?.label}</Badge>} />
      {welcome && <Notice tone="good" className="mb-4" title="Welcome to KhetLink">Set your location below so buyers and route planning can find you.</Notice>}

      <form onSubmit={submit} className="max-w-3xl animate-fade-up space-y-6">
        <Section title="About you">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="fn"><input id="fn" required minLength={2} className="input" value={f.full_name} onChange={set('full_name')} /></Field>
            <Field label="Phone" htmlFor="ph"><input id="ph" type="tel" className="input" value={f.phone} onChange={set('phone')} /></Field>
            <Field label="Email" htmlFor="em"><input id="em" className="input" value={profile.email || ''} disabled /></Field>
            {['fpo', 'bulk_buyer', 'farmer'].includes(profile.role) && (
              <Field label={profile.role === 'fpo' ? 'FPO name' : profile.role === 'bulk_buyer' ? 'Business name' : 'Farm name (optional)'} htmlFor="org">
                <input id="org" className="input" value={f.organization} onChange={set('organization')} />
              </Field>
            )}
          </div>
        </Section>

        {profile.role === 'farmer' && (
          <Section title="Producer organisation" subtitle="Join an FPO so it can manage your orders and pool your deliveries with other members.">
            <Field label="My FPO" htmlFor="fpo" hint="You can leave at any time by choosing “Independent”.">
              <select id="fpo" className="input" value={f.fpo_id} onChange={set('fpo_id')} disabled={fpos.loading}>
                <option value="">Independent (no FPO)</option>
                {(fpos.data?.fpos || []).map((o) => <option key={o.id} value={o.id}>{o.organization || o.full_name}{o.district ? ` · ${o.district}` : ''}</option>)}
              </select>
            </Field>
          </Section>
        )}

        <Section title={locLabel}>
          <div className="grid gap-4 sm:grid-cols-2">
            {isSeller && <Field label="Village / town" htmlFor="vil"><input id="vil" className="input" value={f.village} onChange={set('village')} /></Field>}
            <Field label="District" htmlFor="dist"><select id="dist" className="input" value={f.district} onChange={set('district')}><option value="">—</option>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select></Field>
            <div className="sm:col-span-2"><Field label="Address" htmlFor="addr"><textarea id="addr" rows={2} className="input" value={f.address} onChange={set('address')} /></Field></div>
          </div>

          <div className="mt-5 rounded-lg border border-line bg-field p-4">
            <p className="text-sm font-semibold">Map coordinates</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <select aria-label="Pick a known place" className="input w-auto" defaultValue="" onChange={(e) => pickPlace(e.target.value)}>
                <option value="" disabled>Pick a known place…</option>
                <optgroup label="Hyderabad localities">{LOCALITIES.map((l) => <option key={l.name}>{l.name}</option>)}</optgroup>
                {profile.role !== 'consumer' && <optgroup label="Hubs and market yards">{HUBS.map((h) => <option key={h.name}>{h.name}</option>)}</optgroup>}
              </select>
              <button type="button" className="btn btn-secondary" onClick={locate}><LocateFixed className="h-4 w-4" aria-hidden /> Use my current location</button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Latitude" htmlFor="lat"><input id="lat" type="number" step="any" min="-90" max="90" className="input" value={f.lat} onChange={set('lat')} /></Field>
              <Field label="Longitude" htmlFor="lng"><input id="lng" type="number" step="any" min="-180" max="180" className="input" value={f.lng} onChange={set('lng')} /></Field>
            </div>
            {geoMsg && <p className="hint">{geoMsg}</p>}
            <p className="hint">Tip: in Google Maps, right-click your spot and click the coordinates to copy them.</p>
          </div>
        </Section>

        <ErrorNotice error={error} />
        {saved && <Notice tone="good">Profile saved.</Notice>}
        <button className="btn btn-primary px-6" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
      </form>
    </>
  );
}
