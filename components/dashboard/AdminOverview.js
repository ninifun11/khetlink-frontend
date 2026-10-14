'use client';
import { Boxes, IndianRupee, Percent, Route, TrendingUp, Users } from 'lucide-react';
import { useApi } from '@/lib/hooks';
import { inr, kg, num, pct } from '@/lib/format';
import { Donut, HBar, TrendArea } from '@/components/charts';
import { Badge, DashboardSkeleton, ErrorNotice, Section, StatCard } from '@/components/ui';
import { ORDER_STATUS, ROLES } from '@/lib/constants';

export default function AdminOverview() {
  const { data, error, loading, reload } = useApi('/analytics/admin');
  if (loading && !data) return <DashboardSkeleton label="Loading platform overview…" />;
  if (error) return <ErrorNotice error={error} onRetry={reload} />;
  const t = data.totals;
  const ai = data.ai_service;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={IndianRupee} label="Gross merchandise value (90 days)" value={inr(t.gmv)} hint={`${num(t.orders)} orders · ${kg(t.volume_kg)}`} />
        <StatCard icon={TrendingUp} label="Farmers earn above mandi" value={t.farmer_premium_pct == null ? '—' : pct(t.farmer_premium_pct, 1)} tone="good" hint="Weighted across all items sold" />
        <StatCard icon={Percent} label="Buyers save vs retail" value={t.consumer_saving_pct == null ? '—' : `${num(t.consumer_saving_pct, 1)}%`} tone="good" />
        <StatCard icon={Route} label="Distance saved by pooling" value={t.route_saving_pct == null ? '—' : `${num(t.route_saving_pct, 1)}%`} tone="good" hint={`${num(t.shipments)} shipments`} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Users" value={num(t.users)} />
        <StatCard icon={Boxes} label="Active listings" value={num(t.active_listings)} />
        <div className="panel animate-fade-up p-5">
          <p className="text-[13px] font-medium text-ink-soft">AI service</p>
          <p className="mt-3 flex flex-wrap items-center gap-2">
            <Badge dot tone={ai?.status === 'ok' ? 'good' : 'bad'}>{ai?.status === 'ok' ? 'Online' : 'Unreachable'}</Badge>
            {ai?.status === 'ok' && <span className="text-xs text-ink-soft">Routing engine: {ai.ortools ? 'OR-Tools' : 'built-in heuristic'}</span>}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="GMV, last 30 days" className="lg:col-span-2"><TrendArea data={data.gmv_by_day} money label="GMV per day for the last 30 days" /></Section>
        <Section title="Orders by status"><Donut data={data.by_status.map((s) => ({ name: ORDER_STATUS[s.status]?.label || s.status, value: s.count }))} label="Orders by status" /></Section>
        <Section title="GMV by seller district" className="lg:col-span-2"><HBar data={data.gmv_by_district} money label="GMV by district" color="#4C9A3F" /></Section>
        <Section title="Users by role"><Donut data={data.users_by_role.map((r) => ({ name: ROLES[r.role]?.label || r.role, value: r.count }))} label="Users by role" /></Section>
      </div>
    </div>
  );
}
