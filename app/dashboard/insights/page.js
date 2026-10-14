'use client';
import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Clock, IndianRupee, TrendingUp } from 'lucide-react';
import { useApi } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import { CROPS, DISTRICTS } from '@/lib/constants';
import { inr, num, pct, shortDate } from '@/lib/format';
import { ForecastChart } from '@/components/charts';
import { EmptyState, ErrorNotice, Notice, PageHeader, Section, Spinner, StatCard } from '@/components/ui';

function buildRows(history, forecast, key, lowKey, upKey) {
  const rows = history.filter((h) => h[key] != null).map((h) => ({ date: h.date, actual: h[key] }));
  if (rows.length) rows[rows.length - 1].forecast = rows[rows.length - 1].actual; // join the two lines
  for (const f of forecast) rows.push({ date: f.date, forecast: f[key], band: [f[lowKey], f[upKey]] });
  return rows;
}

const Trend = ({ v }) => {
  if (v == null) return <span className="text-ink-soft">—</span>;
  const Icon = v > 1 ? ArrowUpRight : v < -1 ? ArrowDownRight : ArrowRight;
  return <span className="inline-flex items-center gap-0.5 tabular-nums"><Icon className="h-3.5 w-3.5" aria-hidden />{pct(v, 1)}</span>;
};

export default function InsightsPage() {
  const { profile } = useAuth();
  const isSeller = ['farmer', 'fpo', 'admin'].includes(profile.role);
  const [crop, setCrop] = useState('Tomato');
  const [district, setDistrict] = useState('');
  const [horizon, setHorizon] = useState(14);

  const fc = useApi('/ai/forecast', { crop, district: district || undefined, horizon });
  const trending = useApi('/ai/trending', { horizon });

  const d = fc.data;
  const demandRows = useMemo(() => (d ? buildRows(d.history, d.forecast, 'demand_kg', 'demand_lower', 'demand_upper') : []), [d]);
  const priceRows = useMemo(() => (d ? buildRows(d.history, d.forecast, 'price_per_kg', 'price_lower', 'price_upper') : []), [d]);
  const s = d?.summary || {};

  return (
    <>
      <PageHeader
        title={isSeller ? 'Market outlook' : 'Price outlook'}
        subtitle={isSeller ? 'Where demand and prices are heading, so you can decide what to list, hold or plant next.' : 'Where prices are heading, so you know when to buy.'}
      />

      <div className="panel panel-pad mb-6 space-y-5">
        <div>
          <p className="label">Crop</p>
          <div className="flex flex-wrap gap-2">
            {CROPS.map((c) => (
              <button key={c.name} onClick={() => setCrop(c.name)} aria-pressed={crop === c.name}
                className={clsx('chip text-sm', crop === c.name && 'chip-on')}>
                <span aria-hidden>{c.emoji}</span> {c.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 border-t border-line pt-5">
          <div>
            <label htmlFor="ds" className="label">Market</label>
            <select id="ds" className="input w-auto min-w-[10rem]" value={district} onChange={(e) => setDistrict(e.target.value)}>
              <option value="">All districts</option>{DISTRICTS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="hz" className="label">Look ahead</label>
            <select id="hz" className="input w-auto min-w-[8rem]" value={horizon} onChange={(e) => setHorizon(Number(e.target.value))}>
              {[7, 14, 30].map((n) => <option key={n} value={n}>{n} days</option>)}
            </select>
          </div>
        </div>
      </div>

      <ErrorNotice error={fc.error} onRetry={fc.reload} />
      {fc.loading && !d && <Spinner label="Running forecast…" />}

      {d && (
        <div className={clsx('space-y-6', fc.loading && 'opacity-60 transition-opacity')}>
          <Notice tone="info" title={`${d.crop}: ${d.scope}`}>{s.recommendation}</Notice>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={IndianRupee} label="Price today" value={s.current_price_per_kg == null ? '—' : `${inr(s.current_price_per_kg, 2)}/kg`} hint="Wholesale (mandi)" />
            <StatCard icon={TrendingUp} label={`Avg price, next ${horizon} days`} value={s.forecast_avg_price_per_kg == null ? '—' : `${inr(s.forecast_avg_price_per_kg, 2)}/kg`} hint={`${pct(s.price_change_pct, 1)} vs last ${horizon} days`} tone={s.price_change_pct > 4 ? 'warn' : undefined} />
            <StatCard icon={BarChart3} label="Demand outlook" value={s.demand_trend ? s.demand_trend[0].toUpperCase() + s.demand_trend.slice(1) : '—'} hint={`${pct(s.demand_change_pct, 1)} vs last ${horizon} days`} tone={s.demand_change_pct > 4 ? 'good' : undefined} />
            <StatCard icon={Clock} label="Expected demand peak" value={shortDate(s.peak_demand_day)} hint={`${num(s.forecast_avg_daily_demand_kg)} kg/day on average`} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Section title="Demand (kg per day)" subtitle="Last 45 days and forecast, with an 80% range"><ForecastChart rows={demandRows} unit=" kg" label={`Demand history and forecast for ${d.crop}`} /></Section>
            <Section title="Price (₹ per kg)" subtitle="Wholesale price, with an 80% range"><ForecastChart rows={priceRows} money label={`Price history and forecast for ${d.crop}`} /></Section>
          </div>

          <p className="text-xs leading-relaxed text-ink-soft">
            Model: {d.method}. Trained on {d.metrics.history_days} days of data and back-tested on the last {d.metrics.backtest_days} days
            (typical error: demand {d.metrics.demand_mape_pct ?? '—'}%, price {d.metrics.price_mape_pct ?? '—'}%). Forecasts are estimates, not guarantees.
          </p>
        </div>
      )}

      <Section title={isSeller ? 'What to list next' : 'Where prices are moving'} subtitle={`All crops ranked by expected demand and price momentum over ${horizon} days`} className="mt-8">
        <ErrorNotice error={trending.error} onRetry={trending.reload} />
        {trending.loading && !trending.data && <Spinner />}
        {trending.data && trending.data.crops.length === 0 && <EmptyState title="No market data yet">Run the seed script to load demo market data.</EmptyState>}
        {trending.data?.crops.length > 0 && (
          <div className="scroll-thin -mx-4 overflow-x-auto sm:-mx-6">
            <table className="w-full min-w-[560px]">
              <thead className="border-b border-line bg-field/60"><tr><th className="th">Crop</th><th className="th text-right">Demand</th><th className="th text-right">Price</th><th className="th text-right">Score</th><th className="th">Advice</th></tr></thead>
              <tbody className="divide-y divide-line">
                {trending.data.crops.map((c) => (
                  <tr key={c.crop} className={clsx('cursor-pointer hover:bg-field/60', c.crop === crop && 'bg-neel-50/50')} onClick={() => { setCrop(c.crop); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                    <td className="td font-medium">{CROPS.find((x) => x.name === c.crop)?.emoji} {c.crop}</td>
                    <td className="td text-right"><Trend v={c.demand_change_pct} /></td>
                    <td className="td text-right"><Trend v={c.price_change_pct} /></td>
                    <td className="td text-right font-semibold tabular-nums">{c.opportunity_score}</td>
                    <td className="td text-xs text-ink-soft">{c.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </>
  );
}
