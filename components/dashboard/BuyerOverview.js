'use client';
import Link from 'next/link';
import { ClipboardList, IndianRupee, Wallet, Store } from 'lucide-react';
import { useApi } from '@/lib/hooks';
import { inr, kg, num, pct } from '@/lib/format';
import { Donut, TrendArea } from '@/components/charts';
import { DashboardSkeleton, EmptyState, ErrorNotice, Section, StatCard } from '@/components/ui';

export default function BuyerOverview() {
  const { data, error, loading, reload } = useApi('/analytics/buyer');
  if (loading && !data) return <DashboardSkeleton label="Loading your overview…" />;
  if (error) return <ErrorNotice error={error} onRetry={reload} />;
  const t = data.totals;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={IndianRupee} label="Spent (180 days)" value={inr(t.spend)} hint={`${num(t.orders)} orders · ${kg(t.volume_kg)}`} />
        <StatCard icon={Wallet} label="Saved vs shop prices" value={inr(t.saved_vs_retail)} tone="good" hint={t.saved_pct == null ? undefined : `${pct(t.saved_pct, 1)} of what shops would charge`} />
        <StatCard icon={ClipboardList} label="Open orders" value={num(t.open_orders)} tone={t.open_orders ? 'warn' : undefined} hint={<Link className="font-medium text-neel-700 underline underline-offset-2 hover:text-neel-800" href="/dashboard/orders">Track them</Link>} />
        <StatCard icon={Store} label="Find produce" value="Browse" hint={<Link className="font-medium text-neel-700 underline underline-offset-2 hover:text-neel-800" href="/marketplace">Go to the marketplace</Link>} />
      </div>

      {t.orders === 0 ? (
        <EmptyState title="You have not ordered yet" action={<Link href="/marketplace" className="btn btn-primary">Browse produce</Link>}>
          Your spending and savings will be summarised here.
        </EmptyState>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Section title="Spending, last 30 days" className="lg:col-span-2"><TrendArea data={data.spend_by_day} money color="#E3A008" label="Spending per day for the last 30 days" /></Section>
          <Section title="Spend by category"><Donut data={data.by_category} money label="Spend by category" /></Section>
        </div>
      )}
    </div>
  );
}
