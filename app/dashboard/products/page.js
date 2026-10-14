'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Boxes, Pause, Pencil, Play, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useApi } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { inr, num, unitLabel } from '@/lib/format';
import ProductForm from '@/components/product/ProductForm';
import { Badge, EmptyState, ErrorNotice, ListSkeleton, Notice, PageHeader } from '@/components/ui';

const TONE = { active: 'good', paused: 'neutral', sold_out: 'warn' };

export default function ProductsPage() {
  const { profile } = useAuth();
  const { t, tf } = useI18n();
  const { data, error, loading, reload } = useApi('/products/mine');
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [actionError, setActionError] = useState('');
  const canCreate = profile.role !== 'admin';
  const products = data?.products || [];
  const missingLocation = canCreate && (profile.lat == null || profile.lng == null);

  async function patch(p, body) {
    setActionError('');
    try { await api(`/products/${p.id}`, { method: 'PUT', body }); reload(); } catch (e) { setActionError(e.message); }
  }
  async function remove(p) {
    if (!window.confirm(`Delete “${p.name}”? Past orders keep their history.`)) return;
    setActionError('');
    try { await api(`/products/${p.id}`, { method: 'DELETE' }); reload(); } catch (e) { setActionError(e.message); }
  }

  return (
    <>
      <PageHeader
        title={profile.role === 'admin' ? t('prod.title.all') : t('prod.title.mine')}
        subtitle={t('prod.subtitle')}
        actions={canCreate && <button className="btn btn-primary" onClick={() => setEditing('new')}><Plus className="h-4 w-4" aria-hidden /> {t('prod.new')}</button>}
      />
      {missingLocation && (
        <Notice tone="warn" className="mb-4" title="Add your pickup location">
          Listings and route planning use the coordinates in your profile. <Link className="font-semibold underline" href="/dashboard/settings">Set your location</Link> before publishing.
        </Notice>
      )}
      {actionError && <div className="mb-4"><ErrorNotice error={new Error(actionError)} /></div>}
      <ErrorNotice error={error} onRetry={reload} />
      {loading && !data && <ListSkeleton rows={4} label="Loading listings…" />}

      {data && products.length === 0 && (
        <EmptyState icon={Boxes} title={t('prod.emptyTitle')} action={canCreate && <button className="btn btn-primary" onClick={() => setEditing('new')}>{t('prod.createFirst')}</button>}>
          List what is ready to harvest and buyers nearby can order it directly.
        </EmptyState>
      )}

      {products.length > 0 && (
        <>
          {/* Phones: one card per listing (same actions as the table) */}
          <ul className="space-y-3 md:hidden">
            {products.map((p) => (
              <li key={p.id} className="panel animate-fade-up p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-field text-2xl" aria-hidden>{p.image_emoji || '🌱'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-tight">{p.name}</p>
                    <p className="text-xs text-ink-soft">{p.category}{p.is_organic ? ' · organic' : ''}</p>
                  </div>
                  <Badge dot tone={TONE[p.status]}>{tf(`prod.status.${p.status}`, p.status.replace('_', ' '))}</Badge>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-3 rounded-md bg-field px-3 py-2.5 text-sm">
                  <div>
                    <dt className="text-xs text-ink-soft">{t('prod.col.price')}</dt>
                    <dd className="font-semibold tabular-nums">{inr(p.price_per_unit, 2)}<span className="text-xs font-normal text-ink-soft"> / {unitLabel(p.unit)}</span></dd>
                    {p.premium_vs_mandi_pct != null && <dd className={`text-xs ${p.premium_vs_mandi_pct >= 0 ? 'text-paddy-700' : 'text-chilli-600'}`}>{t('prod.vsMandi', { sign: p.premium_vs_mandi_pct >= 0 ? '+' : '', pct: p.premium_vs_mandi_pct })}</dd>}
                  </div>
                  <div>
                    <dt className="text-xs text-ink-soft">{t('prod.col.stock')}</dt>
                    <dd className="font-semibold tabular-nums">{num(p.quantity_available)} {unitLabel(p.unit)}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex justify-end gap-1">
                  {p.status !== 'sold_out' && (
                    <button className="btn btn-ghost btn-sm" onClick={() => patch(p, { status: p.status === 'active' ? 'paused' : 'active' })} aria-label={p.status === 'active' ? `Pause ${p.name}` : `Resume ${p.name}`}>
                      {p.status === 'active' ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
                    </button>
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`}><Pencil className="h-4 w-4" aria-hidden /></button>
                  <button className="btn btn-ghost btn-sm text-chilli-600" onClick={() => remove(p)} aria-label={`Delete ${p.name}`}><Trash2 className="h-4 w-4" aria-hidden /></button>
                </div>
              </li>
            ))}
          </ul>

          <div className="panel hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-line bg-field/60"><tr>
                <th className="th">{t('prod.col.produce')}</th><th className="th text-right">{t('prod.col.price')}</th><th className="th text-right">{t('prod.col.stock')}</th><th className="th">{t('prod.col.status')}</th><th className="th text-right">{t('prod.col.actions')}</th>
              </tr></thead>
              <tbody className="divide-y divide-line">
                {products.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-field/60">
                    <td className="td"><span className="mr-2 text-xl" aria-hidden>{p.image_emoji || '🌱'}</span><b>{p.name}</b> <span className="text-xs text-ink-soft">{p.category}{p.is_organic ? ' · organic' : ''}</span></td>
                    <td className="td text-right tabular-nums">
                      {inr(p.price_per_unit, 2)}<span className="text-xs text-ink-soft"> / {unitLabel(p.unit)}</span>
                      {p.premium_vs_mandi_pct != null && <span className={`block text-xs ${p.premium_vs_mandi_pct >= 0 ? 'text-paddy-700' : 'text-chilli-600'}`}>{t('prod.vsMandi', { sign: p.premium_vs_mandi_pct >= 0 ? '+' : '', pct: p.premium_vs_mandi_pct })}</span>}
                    </td>
                    <td className="td text-right tabular-nums">{num(p.quantity_available)} {unitLabel(p.unit)}</td>
                    <td className="td"><Badge dot tone={TONE[p.status]}>{tf(`prod.status.${p.status}`, p.status.replace('_', ' '))}</Badge></td>
                    <td className="td">
                      <div className="flex justify-end gap-1">
                        {p.status !== 'sold_out' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => patch(p, { status: p.status === 'active' ? 'paused' : 'active' })} aria-label={p.status === 'active' ? `Pause ${p.name}` : `Resume ${p.name}`}>
                            {p.status === 'active' ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
                          </button>
                        )}
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`}><Pencil className="h-4 w-4" aria-hidden /></button>
                        <button className="btn btn-ghost btn-sm text-chilli-600" onClick={() => remove(p)} aria-label={`Delete ${p.name}`}><Trash2 className="h-4 w-4" aria-hidden /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {editing && (
        <ProductForm
          product={editing === 'new' ? null : editing}
          defaultDistrict={profile.district}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload(); }}
        />
      )}
    </>
  );
}