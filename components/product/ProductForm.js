'use client';
import { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { api } from '@/lib/api';
import { CATEGORIES, CROPS, DISTRICTS, UNITS, UNIT_KG } from '@/lib/constants';
import { inr } from '@/lib/format';
import { ErrorNotice, Field, Notice } from '@/components/ui';

const EMPTY = {
  name: '', category: 'vegetables', unit: 'kg', price_per_unit: '', mandi_price_per_unit: '', retail_price_per_unit: '',
  quantity_available: '', min_order_qty: '1', is_organic: false, harvest_date: '', district: '', description: '', image_emoji: '🌱',
};

const numOrNull = (v) => (v === '' || v == null ? null : Number(v));
const r2 = (n) => Math.round(n * 100) / 100;

function toForm(p) {
  if (!p) return EMPTY;
  return {
    ...EMPTY,
    name: p.name, category: p.category, unit: p.unit,
    price_per_unit: p.price_per_unit ?? '', mandi_price_per_unit: p.mandi_price_per_unit ?? '', retail_price_per_unit: p.retail_price_per_unit ?? '',
    quantity_available: p.quantity_available ?? '', min_order_qty: p.min_order_qty ?? '1', is_organic: Boolean(p.is_organic),
    harvest_date: p.harvest_date || '', district: p.district || '', description: p.description || '', image_emoji: p.image_emoji || '🌱',
  };
}

export default function ProductForm({ product, defaultDistrict, onClose, onSaved }) {
  const [f, setF] = useState(() => ({ ...toForm(product), district: product?.district || defaultDistrict || '' }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [grade, setGrade] = useState('B');
  const [ai, setAi] = useState({ loading: false, data: null, error: null });

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const kgPerUnit = Number(product?.kg_per_unit) && f.unit === product.unit ? Number(product.kg_per_unit) : UNIT_KG[f.unit] || 1;
  const knownCrop = CROPS.find((c) => c.name.toLowerCase() === f.name.trim().toLowerCase());

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const pickCrop = (c) => setF((s) => ({ ...s, name: c.name, category: c.category, unit: c.unit, image_emoji: c.emoji }));

  async function suggest() {
    setAi({ loading: true, data: null, error: null });
    try {
      const data = await api('/ai/price-suggestion', { params: { crop: knownCrop.name, quality: grade, organic: f.is_organic ? 'true' : 'false' } });
      setAi({ loading: false, data, error: null });
    } catch (e) {
      setAi({ loading: false, data: null, error: e });
    }
  }

  function applySuggestion() {
    const d = ai.data;
    setF((s) => ({
      ...s,
      price_per_unit: r2(d.recommended_price_per_kg * kgPerUnit),
      mandi_price_per_unit: r2(d.market.latest_mandi_price_per_kg * kgPerUnit),
      retail_price_per_unit: r2(d.assumed_retail_price_per_kg * kgPerUnit),
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const body = {
      name: f.name.trim(), category: f.category, unit: f.unit, description: f.description.trim() || null,
      price_per_unit: Number(f.price_per_unit), mandi_price_per_unit: numOrNull(f.mandi_price_per_unit), retail_price_per_unit: numOrNull(f.retail_price_per_unit),
      quantity_available: Number(f.quantity_available), min_order_qty: Number(f.min_order_qty) || 1,
      is_organic: f.is_organic, harvest_date: f.harvest_date || null, district: f.district || null, image_emoji: f.image_emoji || null,
    };
    try {
      const res = product ? await api(`/products/${product.id}`, { method: 'PUT', body }) : await api('/products', { method: 'POST', body });
      onSaved(res.product);
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  }

  const d = ai.data;
  return (
    <div className="fixed inset-0 z-40 flex animate-fade-in items-start justify-center overflow-y-auto overscroll-contain bg-ink/60 p-3 backdrop-blur-sm sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="pf-title" className="panel my-4 w-full max-w-2xl animate-scale-in shadow-pop sm:my-8">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
          <h2 id="pf-title" className="font-display text-lg font-semibold">{product ? 'Edit listing' : 'New listing'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close"><X className="h-4 w-4" aria-hidden /></button>
        </div>

        <form onSubmit={submit} className="space-y-6 p-5 sm:p-6">
          {!product && (
            <div>
              <p className="label">Quick pick</p>
              <div className="flex flex-wrap gap-1.5">
                {CROPS.map((c) => (
                  <button key={c.name} type="button" onClick={() => pickCrop(c)} aria-pressed={f.name === c.name}
                    className={`chip ${f.name === c.name ? 'chip-on' : ''}`}>
                    <span aria-hidden>{c.emoji}</span> {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-[1fr_1fr_90px]">
            <Field label="Produce name" htmlFor="pname"><input id="pname" required minLength={2} className="input" value={f.name} onChange={set('name')} /></Field>
            <Field label="Category" htmlFor="pcat"><select id="pcat" className="input" value={f.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Icon" htmlFor="pemoji"><input id="pemoji" className="input text-center" maxLength={4} value={f.image_emoji} onChange={set('image_emoji')} /></Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Sold per" htmlFor="punit"><select id="punit" className="input" value={f.unit} onChange={set('unit')}>{UNITS.map((u) => <option key={u}>{u}</option>)}</select></Field>
            <Field label="Quantity available" htmlFor="pqty"><input id="pqty" type="number" min="0" step="any" required className="input" value={f.quantity_available} onChange={set('quantity_available')} /></Field>
            <Field label="Minimum order" htmlFor="pmin"><input id="pmin" type="number" min="0.01" step="any" required className="input" value={f.min_order_qty} onChange={set('min_order_qty')} /></Field>
          </div>

          <div className="rounded-lg border border-turmeric-200 bg-gradient-to-br from-turmeric-50 to-white p-4 sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold"><span className="grid h-7 w-7 place-items-center rounded-md bg-turmeric-400 text-ink"><Sparkles className="h-4 w-4" aria-hidden /></span> Fair price assistant</p>
                <p className="text-xs text-ink-soft">Blends the mandi rate with the demand forecast and splits the mandi-to-retail gap fairly.</p>
              </div>
              <div className="flex items-end gap-2">
                <div>
                  <label htmlFor="grade" className="text-xs text-ink-soft">Quality</label>
                  <select id="grade" className="input w-auto py-1.5" value={grade} onChange={(e) => setGrade(e.target.value)}>
                    <option value="A">Grade A</option><option value="B">Grade B</option><option value="C">Grade C</option>
                  </select>
                </div>
                <button type="button" className="btn btn-accent btn-sm" disabled={!knownCrop || ai.loading} onClick={suggest}>{ai.loading ? 'Thinking…' : 'Suggest price'}</button>
              </div>
            </div>
            {!knownCrop && <p className="hint">Pick one of the quick-pick crops above to get a suggestion (they have market data behind them).</p>}
            <ErrorNotice error={ai.error} />
            {d && (
              <div className="mt-4 animate-fade-in space-y-2 rounded-md border border-turmeric-200 bg-white p-4 text-sm">
                <p>
                  Suggested <b className="font-display text-lg tabular-nums">{inr(d.recommended_price_per_kg * kgPerUnit, 2)}</b> per {f.unit}
                  <span className="text-ink-soft"> (range {inr(d.min_price_per_kg * kgPerUnit, 2)} to {inr(d.max_price_per_kg * kgPerUnit, 2)})</span>
                </p>
                <p className="text-ink-soft">{d.explanation} Confidence: {d.confidence}.</p>
                <ul className="list-disc space-y-0.5 pl-5 text-xs text-ink-soft">{d.factors.map((x) => <li key={x}>{x}</li>)}</ul>
                <p className="text-xs text-ink-soft">{d.market.recommendation}</p>
                <button type="button" className="btn btn-primary btn-sm" onClick={applySuggestion}>Use these prices</button>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={`Your price (₹ per ${f.unit})`} htmlFor="pprice"><input id="pprice" type="number" min="0" step="any" required className="input" value={f.price_per_unit} onChange={set('price_per_unit')} /></Field>
            <Field label="Mandi price (reference)" htmlFor="pmandi" hint="Used to show your premium"><input id="pmandi" type="number" min="0" step="any" className="input" value={f.mandi_price_per_unit} onChange={set('mandi_price_per_unit')} /></Field>
            <Field label="Shop price (reference)" htmlFor="pretail" hint="Used to show buyer savings"><input id="pretail" type="number" min="0" step="any" className="input" value={f.retail_price_per_unit} onChange={set('retail_price_per_unit')} /></Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Harvest date" htmlFor="pharv"><input id="pharv" type="date" className="input" value={f.harvest_date} onChange={set('harvest_date')} /></Field>
            <Field label="District" htmlFor="pdist"><select id="pdist" className="input" value={f.district} onChange={set('district')}><option value="">—</option>{DISTRICTS.map((x) => <option key={x}>{x}</option>)}</select></Field>
          </div>
          <Field label="Description" htmlFor="pdesc"><textarea id="pdesc" rows={2} maxLength={600} className="input" value={f.description} onChange={set('description')} placeholder="Variety, how it was grown, packing…" /></Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 rounded border-line text-neel-700" checked={f.is_organic} onChange={set('is_organic')} /> Grown organically</label>

          {!product && <Notice tone="info">Your listing uses the pickup location saved in your profile, so make sure it is set. Routes are planned from there.</Notice>}
          <ErrorNotice error={error} />
          <div className="flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary px-6" disabled={busy}>{busy ? 'Saving…' : product ? 'Save changes' : 'Publish listing'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
