'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MapPin, Leaf, ShoppingBasket, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { useI18n } from '@/lib/i18n';
import { inr, unitLabel } from '@/lib/format';
import { Badge } from '@/components/ui';

const TILE = {
  vegetables: 'from-paddy-50 to-paddy-100', fruits: 'from-turmeric-50 to-turmeric-100', grains: 'from-turmeric-100/70 to-turmeric-50', pulses: 'from-chilli-50 to-turmeric-50', spices: 'from-chilli-50 to-chilli-100', dairy: 'from-neel-50 to-neel-100', other: 'from-field to-neel-50',
};

export default function ProductCard({ product: p, index = 0 }) {
  const { add } = useCart();
  const { profile } = useAuth();
  const canBuy = ['consumer', 'bulk_buyer'].includes(profile?.role);
  const { t } = useI18n();
  const [added, setAdded] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const sellerName = p.seller?.organization || p.seller?.full_name || 'Seller';

  // Same cart call as before, plus a brief "Added" confirmation on the button
  const addToCart = () => {
    add(p, Number(p.min_order_qty));
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="panel panel-hover group flex animate-fade-up flex-col overflow-hidden" style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}>
      <Link href={`/marketplace/${p.id}`} className={`relative grid h-36 place-items-center overflow-hidden bg-gradient-to-br text-6xl ${TILE[p.category] || TILE.other}`} aria-label={`View ${p.name}`}>
        <span aria-hidden className="transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3">{p.image_emoji || '🌱'}</span>
        {p.is_organic && <span className="absolute left-3 top-3"><Badge tone="good"><Leaf className="h-3 w-3" aria-hidden />{t('product.organic')}</Badge></span>}
        {p.saving_vs_retail_pct > 0 && <span className="absolute right-3 top-3 rounded-full bg-paddy-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-card">{t('product.save', { pct: p.saving_vs_retail_pct })}</span>}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/marketplace/${p.id}`} className="font-display text-lg font-semibold leading-tight text-ink transition-colors hover:text-neel-700">{p.name}</Link>
        <p className="mt-1 text-sm text-ink-soft">
          {sellerName}{p.seller?.role === 'fpo' ? ' · FPO' : ''}
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-ink-soft">
          <MapPin className="h-3 w-3" aria-hidden />{p.district || '—'}{p.distance_km != null ? ` · ${p.distance_km} km away` : ''}
        </p>

        <div className="mt-4 flex items-baseline gap-1.5">
          <span className="font-display text-[1.65rem] font-bold tabular-nums text-ink">{inr(p.price_per_unit)}</span>
          <span className="text-sm text-ink-soft">/ {unitLabel(p.unit)}</span>
        </div>
        <p className="mt-1 text-xs text-ink-soft">
          {p.retail_price_per_unit ? <>Shops charge about {inr(p.retail_price_per_unit)}</> : null}
          {p.saving_vs_retail_pct > 0 && <span className="ml-1 font-semibold text-paddy-700">— you save {p.saving_vs_retail_pct}%</span>}
        </p>
        {p.premium_vs_mandi_pct > 0 && (
          <p className="text-xs text-ink-soft">Farmer earns <span className="font-semibold text-neel-700">{p.premium_vs_mandi_pct}% more</span> than at the mandi</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-4">
          <span className="text-xs text-ink-soft">{t('product.left', { qty: Number(p.quantity_available), unit: unitLabel(p.unit) })}</span>
          {canBuy && (
            <button className={`btn btn-sm min-w-[5.5rem] ${added ? 'btn-secondary border-paddy-200 text-paddy-700' : 'btn-primary'}`} onClick={addToCart} aria-label={`Add ${p.name} to cart`}>
              {added
                ? <><Check className="h-4 w-4" aria-hidden /> {t('common.added')}</>
                : <><ShoppingBasket className="h-4 w-4" aria-hidden /> {t('common.add')}</>}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}