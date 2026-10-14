'use client';
import Link from 'next/link';
import { Boxes, ClipboardList, IndianRupee, Leaf, Route, TrendingUp, Truck, Wallet } from 'lucide-react';
import { useApi } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import { inr, kg, num, pct } from '@/lib/format';
import { Donut, HBar, TrendArea } from '@/components/charts';
import { DashboardSkeleton, EmptyState, ErrorNotice, Section, StatCard } from '@/components/ui';
import { ORDER_STATUS } from '@/lib/constants';

export default function SellerOverview() {
  const { profile } = useAuth();
  const { data, error, loading, reload } = useApi('/analytics/seller');
  const ship = useApi('/analytics/logistics', undefined, { enabled: profile.role === 'fpo' });

  if (loading && !data) return <DashboardSkeleton label="Loading your overview…" />;
  if (error) return <ErrorNotice error={error} onRetry={reload} />;
  const t = data.totals;
  const hasSales = t.orders > 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={IndianRupee} label="Revenue (90 days)" value={inr(t.revenue)} hint={`${num(t.orders)} orders · ${kg(t.volume_kg)}`} />
        <StatCard icon={TrendingUp} label="Earned above mandi rate" value={t.premium_vs_mandi_pct == null ? '—' : pct(t.premium_vs_mandi_pct, 1)} tone="good"
          hint={t.premium_vs_mandi_pct == null ? 'Add a mandi reference price to listings' : `${inr(t.extra_earned_vs_mandi)} extra vs selling at the mandi`} />
        <StatCard icon={ClipboardList} label="Orders to action" value={num(t.pending_orders)} tone={t.pending_orders ? 'warn' : undefined} hint={<Link className="font-medium text-neel-700 underline underline-offset-2 hover:text-neel-800" href="/dashboard/orders">Open orders</Link>} />
        <StatCard icon={Boxes} label="Active listings" value={num(t.active_listings)} hint={<Link className="font-medium text-neel-700 underline underline-offset-2 hover:text-neel-800" href="/dashboard/products">Manage listings</Link>} />
      </div>

      {profile.role === 'fpo' && ship.data && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Truck} label="Shipments (90 days)" value={num(ship.data.totals.shipments)} hint={`${kg(ship.data.totals.load_kg)} moved`} />
          <StatCard icon={Route} label="Distance saved by pooling" value={`${num(ship.data.totals.saved_km, 0)} km`} tone="good" hint={`${num(ship.data.totals.saved_pct, 1)}% vs one trip per order`} />
          <StatCard icon={Leaf} label="CO₂ avoided (est.)" value={`${num(ship.data.totals.co2_saved_kg_est, 0)} kg`} tone="good" />
          <StatCard icon={Wallet} label="Transport cost" value={inr(ship.data.totals.cost)} hint={<Link className="font-medium text-neel-700 underline underline-offset-2 hover:text-neel-800" href="/dashboard/logistics">Plan routes</Link>} />
        </div>
      )}

      {!hasSales ? (
        <EmptyState title="No sales yet" action={<Link href="/dashboard/products" className="btn btn-primary">Add a listing</Link>}>
          Once buyers start ordering, revenue and product performance will appear here.
        </EmptyState>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Section title="Revenue, last 30 days" className="lg:col-span-2"><TrendArea data={data.revenue_by_day} money label="Revenue per day for the last 30 days" /></Section>
          <Section title="Orders by status">
            <Donut data={data.by_status.map((s) => ({ name: ORDER_STATUS[s.status]?.label || s.status, value: s.count }))} label="Orders by status" />
          </Section>
          <Section title="Top products by revenue" className="lg:col-span-2">
            <HBar data={data.top_products.map((p) => ({ name: p.name, value: p.revenue }))} money color="#4C9A3F" label="Top products by revenue" />
          </Section>
          <Section title="Running low">
            {data.low_stock.length === 0 ? <p className="text-sm text-ink-soft">All active listings have healthy stock.</p> : (
              <ul className="divide-y divide-line text-sm">
                {data.low_stock.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2.5"><span>{p.image_emoji} {p.name}</span><b className="tabular-nums text-chilli-600">{num(p.quantity_available)} {p.unit} left</b></li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}
