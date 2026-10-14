'use client';
import { useState } from 'react';
import clsx from 'clsx';
import { useApi } from '@/lib/hooks';
import ShipmentCard from '@/components/logistics/ShipmentCard';
import { Truck } from 'lucide-react';
import { EmptyState, ErrorNotice, ListSkeleton } from '@/components/ui';

const FILTERS = [['', 'All'], ['planned', 'Planned'], ['in_transit', 'On the road'], ['completed', 'Completed'], ['cancelled', 'Cancelled']];

export default function ShipmentsPanel() {
  const [status, setStatus] = useState('');
  const { data, error, loading, reload } = useApi('/logistics/shipments', { status: status || undefined });
  const list = data?.shipments || [];

  return (
    <div className="space-y-4">
      <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter shipments">
        {FILTERS.map(([v, l]) => (
          <button key={v || 'all'} aria-pressed={status === v} onClick={() => setStatus(v)}
            className={clsx('chip shrink-0', status === v && 'chip-on')}>{l}</button>
        ))}
      </div>
      <ErrorNotice error={error} onRetry={reload} />
      {loading && !data && <ListSkeleton rows={2} label="Loading shipments…" />}
      {data && list.length === 0 && <EmptyState icon={Truck} title="No shipments here">Optimise and dispatch a plan in the Plan routes tab to create shipments.</EmptyState>}
      <div className="grid gap-4 xl:grid-cols-2">
        {list.map((s) => <ShipmentCard key={s.id} shipment={s} onChanged={reload} />)}
      </div>
    </div>
  );
}
