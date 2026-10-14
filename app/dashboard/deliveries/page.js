'use client';
import { useApi } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import ShipmentCard from '@/components/logistics/ShipmentCard';
import { Truck } from 'lucide-react';
import { EmptyState, ErrorNotice, ListSkeleton, Notice, PageHeader } from '@/components/ui';

export default function DeliveriesPage() {
  const { profile } = useAuth();
  const { data, error, loading, reload } = useApi('/logistics/shipments');
  const all = data?.shipments || [];
  const active = all.filter((s) => ['planned', 'in_transit'].includes(s.status));
  const past = all.filter((s) => s.status === 'completed').slice(0, 10);

  return (
    <>
      <PageHeader title="My deliveries" subtitle={`Loads assigned to ${profile.full_name || 'you'}. Follow the stops in order: pick up at the farms, then deliver to the buyers.`} />
      <ErrorNotice error={error} onRetry={reload} />
      {loading && !data && <ListSkeleton rows={2} label="Loading deliveries…" />}

      {data && active.length === 0 && (
        <EmptyState icon={Truck} title="No loads assigned right now">When your FPO dispatches a shipment to your vehicle, it will appear here.</EmptyState>
      )}
      {active.some((s) => s.status === 'planned') && <Notice tone="info" className="mb-4">Tap “Start trip” when you leave the depot. Orders in that load change to “On the way” for the buyers.</Notice>}

      <div className="space-y-4">
        {active.map((s) => <ShipmentCard key={s.id} shipment={s} driverView onChanged={reload} />)}
      </div>

      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-lg font-semibold">Recently completed</h2>
          <div className="grid gap-4 xl:grid-cols-2">{past.map((s) => <ShipmentCard key={s.id} shipment={s} driverView onChanged={reload} />)}</div>
        </section>
      )}
    </>
  );
}
