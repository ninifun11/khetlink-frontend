
'use client';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { LocateFixed, Search, SlidersHorizontal } from 'lucide-react';
import { useApi, useDebounced } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { CATEGORIES, DISTRICTS } from '@/lib/constants';
import ProductCard from '@/components/ProductCard';
import { CardGridSkeleton, EmptyState, ErrorNotice, Notice, PageHeader } from '@/components/ui';

const PAGE = 24;
const SORTS = [
  ['newest', 'Newest first'],
  ['price_asc', 'Price: low to high'],
  ['price_desc', 'Price: high to low'],
  ['nearest', 'Nearest to me'],
];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function Marketplace() {
  const { profile } = useAuth();
  const { t } = useI18n();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [organic, setOrganic] = useState(false);
  const [sellerRole, setSellerRole] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [limit, setLimit] = useState(PAGE);
  const [coords, setCoords] = useState(null);
  const [geoError, setGeoError] = useState('');
  const [showFilters, setShowFilters] = useState(false); // phones only: filters are collapsed behind a button

  const dq = useDebounced(q);
  const dMax = useDebounced(maxPrice, 500);

  // Use the saved profile location when there is one
  useEffect(() => {
    if (profile?.lat != null && profile?.lng != null) setCoords((c) => c || { lat: profile.lat, lng: profile.lng });
  }, [profile]);

  useEffect(() => setLimit(PAGE), [dq, category, district, organic, sellerRole, dMax, sort]);

  function chooseSort(value) {
    setSort(value);
    setGeoError('');
    if (value === 'nearest' && !coords) {
      if (!navigator.geolocation) return setGeoError('Location is not available in this browser.');
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => { setGeoError('We could not read your location. Allow location access, or save your address in your profile.'); setSort('newest'); },
        { timeout: 8000 },
      );
    }
  }

  const { data, error, loading, reload } = useApi('/products', {
    q: dq || undefined,
    category: category || undefined,
    district: district || undefined,
    organic: organic ? 'true' : undefined,
    seller_role: sellerRole || undefined,
    max_price: dMax || undefined,
    sort: sort === 'nearest' && !coords ? 'newest' : sort,
    lat: sort === 'nearest' && coords ? coords.lat : undefined,
    lng: sort === 'nearest' && coords ? coords.lng : undefined,
    limit,
  });

  const products = data?.products || [];
  const total = data?.total ?? 0;
  const clear = () => { setQ(''); setCategory(''); setDistrict(''); setOrganic(false); setSellerRole(''); setMaxPrice(''); };
  const filtered = q || category || district || organic || sellerRole || maxPrice;
  const activeFilters = [category, district, organic, sellerRole, maxPrice].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <PageHeader title={t('market.title')} subtitle="Produce listed directly by farmers and FPOs. Prices shown against typical shop prices." />

      <div className="mb-6 flex gap-3">
        <div className="relative flex-1">
          <label htmlFor="search" className="sr-only">Search produce</label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden />
          <input id="search" className="input py-3 pl-10" placeholder={t('market.searchPlaceholder')} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button type="button" className="btn btn-secondary lg:hidden" aria-expanded={showFilters} aria-controls="filters" onClick={() => setShowFilters((v) => !v)}>
          <SlidersHorizontal className="h-4 w-4" aria-hidden /> {t('market.filters')}
          {activeFilters > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-neel-700 px-1 text-[11px] font-bold text-white">{activeFilters}</span>}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        <aside id="filters" className={clsx('panel panel-pad h-fit space-y-6 lg:block', showFilters ? 'block animate-fade-in' : 'hidden')} aria-label="Filters">
          <div>
            <p className="label">Category</p>
            <div className="flex flex-wrap gap-1.5">
              {['', ...CATEGORIES].map((c) => (
                <button key={c || 'all'} type="button" onClick={() => setCategory(c)} aria-pressed={category === c}
                  className={clsx('chip', category === c && 'chip-on')}>
                  {c ? cap(c) : 'All'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="district" className="label">District</label>
            <select id="district" className="input" value={district} onChange={(e) => setDistrict(e.target.value)}>
              <option value="">Anywhere</option>
              {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="seller" className="label">Sold by</label>
            <select id="seller" className="input" value={sellerRole} onChange={(e) => setSellerRole(e.target.value)}>
              <option value="">Farmers and FPOs</option>
              <option value="farmer">Individual farmers</option>
              <option value="fpo">FPOs (bulk supply)</option>
            </select>
          </div>

          <div>
            <label htmlFor="maxp" className="label">Max price (₹ per unit)</label>
            <input id="maxp" type="number" min="0" inputMode="decimal" className="input" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="No limit" />
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 rounded-md border border-line-strong px-3 py-2.5 text-sm font-medium transition-colors hover:bg-field">
            <input type="checkbox" className="h-4 w-4 rounded border-line text-neel-700" checked={organic} onChange={(e) => setOrganic(e.target.checked)} />
            Organic only
          </label>

          {filtered && <button className="btn btn-ghost btn-sm w-full" onClick={clear}>Clear filters</button>}
        </aside>

        <section aria-live="polite">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink-soft">{loading && !data ? 'Loading…' : t('market.listings', { n: total })}</p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-ink-soft">Sort</label>
              <select id="sort" className="input w-auto py-2" value={sort} onChange={(e) => chooseSort(e.target.value)}>
                {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          {geoError && <Notice tone="warn" className="mb-4">{geoError}</Notice>}
          {sort === 'nearest' && coords && (
            <p className="mb-3 flex items-center gap-1.5 text-xs text-ink-soft"><LocateFixed className="h-3.5 w-3.5" aria-hidden /> Distances are measured from {profile?.lat != null ? 'your saved location' : 'your current location'}.</p>
          )}

          <ErrorNotice error={error} onRetry={reload} />
          {loading && !data && <CardGridSkeleton label="Fetching produce…" />}

          {data && products.length === 0 && (
            <EmptyState icon={Search} title="Nothing matches those filters" action={filtered ? <button className="btn btn-secondary" onClick={clear}>Clear filters</button> : null}>
              {filtered ? 'Try a broader search or another district.' : 'No listings yet. Run the backend seed script to load demo produce, or sign up as a farmer and add the first one.'}
            </EmptyState>
          )}

          <div className={clsx('grid gap-5 sm:grid-cols-2 xl:grid-cols-3', loading && data && 'opacity-60 transition-opacity')}>
            {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>

          {products.length < total && limit < 100 && (
            <div className="mt-8 text-center"><button className="btn btn-secondary px-6" onClick={() => setLimit((l) => Math.min(100, l + PAGE))}>Show more</button></div>
          )}
        </section>
      </div>
    </div>
  );
}