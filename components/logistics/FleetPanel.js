'use client';
import { useState } from 'react';
import { Pencil, Plus, Trash2, Truck } from 'lucide-react';
import { api } from '@/lib/api';
import { useApi } from '@/lib/hooks';
import { inr, kg } from '@/lib/format';
import { Badge, EmptyState, ErrorNotice, Field, ListSkeleton, Section } from '@/components/ui';

const TYPES = [['mini_truck', 'Mini truck'], ['pickup', 'Pickup'], ['tempo', 'Tempo'], ['van', 'Van'], ['truck', 'Truck']];
const BLANK = { name: '', registration_no: '', vehicle_type: 'mini_truck', capacity_kg: '1000', cost_per_km: '12', fixed_cost: '0', driver_id: '', is_active: true };

function VehicleForm({ vehicle, drivers, onDone, onCancel }) {
  const [f, setF] = useState(() => vehicle ? {
    name: vehicle.name, registration_no: vehicle.registration_no || '', vehicle_type: vehicle.vehicle_type, capacity_kg: String(vehicle.capacity_kg),
    cost_per_km: String(vehicle.cost_per_km), fixed_cost: String(vehicle.fixed_cost), driver_id: vehicle.driver_id || '', is_active: vehicle.is_active,
  } : BLANK);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError(null);
    const body = {
      name: f.name.trim(), registration_no: f.registration_no.trim() || null, vehicle_type: f.vehicle_type,
      capacity_kg: Number(f.capacity_kg), cost_per_km: Number(f.cost_per_km), fixed_cost: Number(f.fixed_cost) || 0,
      driver_id: f.driver_id || null, is_active: f.is_active,
    };
    try {
      if (vehicle) await api(`/logistics/vehicles/${vehicle.id}`, { method: 'PUT', body });
      else await api('/logistics/vehicles', { method: 'POST', body });
      onDone();
    } catch (err) { setError(err); setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Name" htmlFor="vn"><input id="vn" required className="input" value={f.name} onChange={set('name')} placeholder="Tata Ace #1" /></Field>
        <Field label="Registration no." htmlFor="vr"><input id="vr" className="input" value={f.registration_no} onChange={set('registration_no')} placeholder="TS 08 AB 1234" /></Field>
        <Field label="Type" htmlFor="vt"><select id="vt" className="input" value={f.vehicle_type} onChange={set('vehicle_type')}>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
        <Field label="Capacity (kg)" htmlFor="vc"><input id="vc" type="number" min="1" required className="input" value={f.capacity_kg} onChange={set('capacity_kg')} /></Field>
        <Field label="Cost per km (₹)" htmlFor="vk"><input id="vk" type="number" min="0" step="any" required className="input" value={f.cost_per_km} onChange={set('cost_per_km')} /></Field>
        <Field label="Fixed cost per trip (₹)" htmlFor="vf"><input id="vf" type="number" min="0" step="any" className="input" value={f.fixed_cost} onChange={set('fixed_cost')} /></Field>
        <Field label="Driver" htmlFor="vd"><select id="vd" className="input" value={f.driver_id} onChange={set('driver_id')}><option value="">Not assigned</option>{drivers.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}</select></Field>
        <label className="flex cursor-pointer items-center gap-2.5 self-end pb-2.5 text-sm font-medium"><input type="checkbox" className="h-4 w-4 rounded border-line text-neel-700" checked={f.is_active} onChange={set('is_active')} /> Available for planning</label>
      </div>
      <ErrorNotice error={error} />
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : vehicle ? 'Save vehicle' : 'Add vehicle'}</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function FleetPanel() {
  const vehicles = useApi('/logistics/vehicles');
  const drivers = useApi('/profile/drivers');
  const [editing, setEditing] = useState(null); // null | 'new' | vehicle
  const [error, setError] = useState('');
  const list = vehicles.data?.vehicles || [];

  async function remove(v) {
    if (!window.confirm(`Remove ${v.name} from your fleet?`)) return;
    setError('');
    try { await api(`/logistics/vehicles/${v.id}`, { method: 'DELETE' }); vehicles.reload(); } catch (e) { setError(e.message); }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">{!editing && <button className="btn btn-primary" onClick={() => setEditing('new')}><Plus className="h-4 w-4" aria-hidden /> Add vehicle</button>}</div>
      {editing && (
        <Section title={editing === 'new' ? 'New vehicle' : `Edit ${editing.name}`}>
          <VehicleForm vehicle={editing === 'new' ? null : editing} drivers={drivers.data?.drivers || []} onCancel={() => setEditing(null)} onDone={() => { setEditing(null); vehicles.reload(); }} />
        </Section>
      )}
      {error && <ErrorNotice error={new Error(error)} />}
      <ErrorNotice error={vehicles.error} onRetry={vehicles.reload} />
      {vehicles.loading && !vehicles.data && <ListSkeleton rows={2} label="Loading fleet…" />}
      {vehicles.data && list.length === 0 && !editing && <EmptyState icon={Truck} title="No vehicles yet">Add the trucks and pickups you use. The optimiser needs their capacity and running cost.</EmptyState>}
      {list.length > 0 && (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[620px]">
            <thead className="border-b border-line bg-field/60"><tr><th className="th">Vehicle</th><th className="th text-right">Capacity</th><th className="th text-right">Cost</th><th className="th">Driver</th><th className="th">Status</th><th className="th text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-line">
              {list.map((v) => (
                <tr key={v.id} className="transition-colors hover:bg-field/60">
                  <td className="td"><b>{v.name}</b><span className="block text-xs text-ink-soft">{v.registration_no || v.vehicle_type.replace('_', ' ')}</span></td>
                  <td className="td text-right tabular-nums">{kg(v.capacity_kg)}</td>
                  <td className="td text-right tabular-nums">{inr(v.cost_per_km)}/km{Number(v.fixed_cost) > 0 && <span className="block text-xs text-ink-soft">+ {inr(v.fixed_cost)} per trip</span>}</td>
                  <td className="td">{v.driver?.full_name || <span className="text-ink-soft">None</span>}</td>
                  <td className="td"><Badge dot tone={v.is_active ? 'good' : 'neutral'}>{v.is_active ? 'Available' : 'Off duty'}</Badge></td>
                  <td className="td"><div className="flex justify-end gap-1">
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(v)} aria-label={`Edit ${v.name}`}><Pencil className="h-4 w-4" aria-hidden /></button>
                    <button className="btn btn-ghost btn-sm text-chilli-600" onClick={() => remove(v)} aria-label={`Remove ${v.name}`}><Trash2 className="h-4 w-4" aria-hidden /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
