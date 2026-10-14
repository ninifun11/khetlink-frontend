'use client';
import { useState } from 'react';
import clsx from 'clsx';
import { useApi } from '@/lib/hooks';
import { kg, num } from '@/lib/format';
import PlanPanel from '@/components/logistics/PlanPanel';
import ShipmentsPanel from '@/components/logistics/ShipmentsPanel';
import FleetPanel from '@/components/logistics/FleetPanel';
import { PageHeader, StatCard } from '@/components/ui';
import { Leaf, Route, Truck, TrendingDown } from 'lucide-react';

const TABS = [['plan', 'Plan routes'], ['shipments', 'Shipments'], ['fleet', 'Fleet']];

export default function LogisticsPage() {
  const [tab, setTab] = useState('plan');
  const stats = useApi('/analytics/logistics');
  const t = stats.data?.totals;

  return (
    <>
      <PageHeader title="Logistics" subtitle="Pool confirmed orders onto shared trucks. The optimiser plans pickups and drops so each truck drives as little as possible." />

      {t && t.shipments > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Truck} label="Shipments (90 days)" value={num(t.shipments)} hint={`${kg(t.load_kg)} moved`} />
          <StatCard icon={TrendingDown} label="Distance saved" value={`${num(t.saved_km, 0)} km`} tone="good" hint={`${num(t.saved_pct, 1)}% vs one trip per order`} />
          <StatCard icon={Leaf} label="CO₂ avoided (est.)" value={`${num(t.co2_saved_kg_est, 0)} kg`} tone="good" />
          <StatCard icon={Route} label="Distance driven" value={`${num(t.distance_km, 0)} km`} hint={`Baseline ${num(t.baseline_km, 0)} km`} />
        </div>
      )}

      <div role="tablist" aria-label="Logistics sections" className="no-scrollbar mb-6 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className={clsx('tab', tab === id && 'tab-on')}>{label}</button>
        ))}
      </div>

      {tab === 'plan' && <PlanPanel goToShipments={() => { setTab('shipments'); stats.reload(); }} />}
      {tab === 'shipments' && <ShipmentsPanel />}
      {tab === 'fleet' && <FleetPanel />}
    </>
  );
}
