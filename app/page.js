

'use client';
import Link from 'next/link';
import { ArrowRight, BarChart3, Check, Home as HomeIcon, Route, Sprout, Store, Truck, Users } from 'lucide-react';
import { Logo } from '@/components/ui';
import { useI18n } from '@/lib/i18n';

// Illustrative numbers for the price ladder (₹ per kg, tomatoes)
const LADDER = { mandi: 22, khetlink: 34, retail: 48 };

function PriceLadder() {
  const max = LADDER.retail;
  const rows = [
    { label: 'Mandi rate the farmer usually gets', value: LADDER.mandi, bar: 'bg-neel-300', text: 'text-ink' },
    { label: 'KhetLink direct price', value: LADDER.khetlink, bar: 'bg-turmeric-400', text: 'text-ink' },
    { label: 'What the shop charges you', value: LADDER.retail, bar: 'bg-ink/80', text: 'text-ink' },
  ];
  return (
    <figure className="panel panel-pad relative w-full max-w-md shadow-lift" aria-label="Illustrative price comparison for tomatoes">
      <figcaption className="mb-5 flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-paddy-50 text-2xl" aria-hidden>🍅</span>
        <div>
          <p className="font-display text-base font-semibold">One kilo of tomatoes, three prices</p>
          <p className="text-xs text-ink-soft">Illustrative example. Real gaps vary by crop and season.</p>
        </div>
      </figcaption>
      <div className="space-y-5">
        {rows.map((r, i) => (
          <div key={r.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="text-ink-soft">{r.label}</span>
              <span className={`font-display font-bold tabular-nums ${r.text}`}>₹{r.value}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-field">
              <div className={`h-3 origin-left animate-grow-x rounded-full ${r.bar}`} style={{ width: `${(r.value / max) * 100}%`, animationDelay: `${300 + i * 150}ms` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm text-ink-soft">
        <span className="rounded-md bg-neel-50 px-3 py-2">Farmer earns <b className="block font-display text-lg text-neel-800">₹{LADDER.khetlink - LADDER.mandi} more</b>per kilo</span>
        <span className="rounded-md bg-paddy-50 px-3 py-2">Buyer pays <b className="block font-display text-lg text-paddy-700">₹{LADDER.retail - LADDER.khetlink} less</b>per kilo</span>
      </p>
    </figure>
  );
}

const STEPS = [
  { icon: Sprout, title: 'Farmers list their harvest', body: 'Farmers and FPOs post what is ready, with a fair price the AI suggests from mandi rates and demand trends.' },
  { icon: Store, title: 'Buyers order directly', body: 'Households and bulk buyers browse nearby produce, compare with shop prices, and place one order that splits across sellers.' },
  { icon: Truck, title: 'Loads are pooled and routed', body: 'The FPO groups confirmed orders onto shared trucks. The optimiser plans pickups and drops so fewer kilometres are driven.' },
];

const AI = [
  { icon: BarChart3, title: 'Demand and price forecasts', body: 'Two-week outlook for each crop with a confidence band, so farmers know what to plant, list or hold.' },
  { icon: Sprout, title: 'Fair-price suggestions', body: 'A farm-gate price between the mandi rate and retail, adjusted for demand, quality grade and organic produce.' },
  { icon: Route, title: 'Route optimisation', body: 'Capacity-aware pickup and delivery routing with OR-Tools. Every plan reports the distance, cost and CO₂ saved against one truck per order.' },
];

const ROLES = [
  { role: 'farmer', icon: Sprout, title: 'I grow produce', body: 'Sell direct and see how much more you earn than at the mandi.' },
  { role: 'fpo', icon: Users, title: 'I run an FPO', body: 'Aggregate members’ produce, manage the fleet and dispatch pooled loads.' },
  { role: 'consumer', icon: HomeIcon, title: 'I buy for my home', body: 'Fresh produce from nearby farms, priced below retail.' },
  { role: 'bulk_buyer', icon: Store, title: 'I buy in bulk', body: 'Restaurants, hostels and retailers: larger quantities, scheduled supply.' },
];

const HIGHLIGHTS = ['Fair farm-gate prices', 'Pooled truck deliveries', 'AI price and demand help'];

export default function Home() {
  const { t } = useI18n();
  return (
    <>
      <section className="hero-surface relative overflow-hidden border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-neel-100 bg-white px-3.5 py-1.5 text-xs font-semibold text-neel-700 shadow-card">
              <Sprout className="h-3.5 w-3.5 text-paddy-600" aria-hidden /> Farm-direct marketplace
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
              {t('home.title1')}<br />
              <span className="text-neel-700">{t('home.title2')}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              KhetLink connects farmers and FPOs directly with households and bulk buyers, then pools deliveries onto shared
              trucks so the savings are not eaten up by transport.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/marketplace" className="btn btn-accent px-6 py-3 text-base">{t('home.browse')} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
              <Link href="/register" className="btn btn-secondary px-6 py-3 text-base">{t('home.startSelling')}</Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
              {HIGHLIGHTS.map((h) => (
                <li key={h} className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-paddy-100 text-paddy-700"><Check className="h-3 w-3" strokeWidth={3} aria-hidden /></span>{h}</li>
              ))}
            </ul>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <PriceLadder />
            <span aria-hidden className="absolute -left-2 top-2 hidden animate-float rounded-2xl bg-white p-3 text-3xl shadow-lift sm:block lg:-left-6">🥬</span>
            <span aria-hidden className="absolute -bottom-5 right-2 hidden animate-float rounded-2xl bg-white p-3 text-3xl shadow-lift sm:block" style={{ animationDelay: '1.5s' }}>🌾</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <p className="text-sm font-semibold uppercase tracking-wider text-neel-600">How it works</p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">How an order travels</h2>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="panel panel-pad panel-hover relative">
              <div className="mb-4 flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-neel-700 text-white shadow-card"><s.icon className="h-5 w-5" aria-hidden /></span>
                <span className="font-display text-4xl font-bold text-neel-100" aria-hidden>0{i + 1}</span>
              </div>
              <span className="sr-only">Step {i + 1}: </span>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="dark-surface text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-turmeric-300">AI service</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Intelligence where the decisions are made</h2>
          <p className="mt-3 max-w-2xl text-white/75">A small Python service (FastAPI) sits behind the marketplace and answers three questions.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {AI.map((a) => (
              <div key={a.title} className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-turmeric-300/40 hover:bg-white/10">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-turmeric-400/20 text-turmeric-300"><a.icon className="h-5 w-5" aria-hidden /></span>
                <h3 className="mt-4 text-lg font-semibold">{a.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/70">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex items-center gap-3"><Users className="h-6 w-6 text-neel-700" aria-hidden /><h2 className="text-2xl font-bold sm:text-3xl">Who it is for</h2></div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r) => (
            <Link key={r.role} href={`/register?role=${r.role}`} className="panel panel-pad panel-hover group flex flex-col">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-turmeric-50 text-turmeric-600 transition-colors group-hover:bg-turmeric-400 group-hover:text-ink"><r.icon className="h-5 w-5" aria-hidden /></span>
              <h3 className="mt-4 font-display text-lg font-semibold group-hover:text-neel-700">{r.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{r.body}</p>
              <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-neel-700">Create account <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:pb-20">
        <div className="dark-surface mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 rounded-2xl p-8 text-white sm:p-12">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to see what your produce is really worth?</h2>
            <p className="mt-2 text-white/75">Browse what farmers have listed today, or create a free account and list your first harvest.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/marketplace" className="btn btn-accent px-6 py-3 text-base">{t('home.browse')} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            <Link href="/register" className="btn border border-white/25 px-6 py-3 text-base text-white hover:bg-white/10">Create account</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 py-10 sm:px-6">
          <div className="space-y-3">
            <Logo light />
            <p className="text-sm text-white/70">Built with Next.js, Express, Supabase and FastAPI. Demo prices are synthetic.</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
            <Link href="/marketplace" className="transition-colors hover:text-turmeric-300">Marketplace</Link>
            <Link href="/login" className="transition-colors hover:text-turmeric-300">Sign in</Link>
            <Link href="/register" className="transition-colors hover:text-turmeric-300">Create account</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}