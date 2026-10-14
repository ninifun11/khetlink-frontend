'use client';
import { useState } from 'react';
import clsx from 'clsx';
import { ClipboardList } from 'lucide-react';
import { useApi } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import { ORDER_STATUS } from '@/lib/constants';
import OrderCard from '@/components/orders/OrderCard';
import { EmptyState, ErrorNotice, ListSkeleton, PageHeader } from '@/components/ui';

export default function OrdersPage() {
  const { profile } = useAuth();
  const isSeller = ['farmer', 'fpo'].includes(profile.role);
  const isAdmin = profile.role === 'admin';
  const [scope, setScope] = useState(isSeller ? 'selling' : isAdmin ? 'all' : 'buying');
  const [status, setStatus] = useState('');
  const { data, error, loading, reload } = useApi('/orders', { scope, status: status || undefined });
  const [patched, setPatched] = useState({});

  const orders = (data?.orders || []).map((o) => patched[o.id] || o);
  const sellerSide = scope === 'selling' || scope === 'all';
  const title = scope === 'selling' ? 'Orders received' : scope === 'all' ? 'All orders' : 'My orders';

  return (
    <>
      <PageHeader
        title={title}
        subtitle={sellerSide ? 'Confirm, pack and hand over orders. Pooled shipments update these automatically.' : 'Track what you have ordered.'}
        actions={isSeller && (
          <div role="tablist" aria-label="Order view" className="seg">
            {[['selling', 'Received'], ['buying', 'Placed by me']].map(([v, l]) => (
              <button key={v} role="tab" aria-selected={scope === v} onClick={() => { setScope(v); setPatched({}); }}
                className={clsx('seg-btn', scope === v && 'seg-btn-on')}>{l}</button>
            ))}
          </div>
        )}
      />

      <div className="no-scrollbar -mx-4 mb-5 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by status">
        {['', ...Object.keys(ORDER_STATUS)].map((s) => (
          <button key={s || 'all'} aria-pressed={status === s} onClick={() => { setStatus(s); setPatched({}); }}
            className={clsx('chip shrink-0', status === s && 'chip-on')}>
            {s ? ORDER_STATUS[s].label : 'All'}
          </button>
        ))}
      </div>

      <ErrorNotice error={error} onRetry={reload} />
      {loading && !data && <ListSkeleton label="Loading orders…" />}
      {data && orders.length === 0 && (
        <EmptyState icon={ClipboardList} title={status ? 'No orders with that status' : 'No orders yet'}>
          {sellerSide ? 'New orders from buyers will appear here.' : 'Orders you place on the marketplace will appear here.'}
        </EmptyState>
      )}
      <div className="space-y-3">
        {orders.map((o) => (
          <OrderCard key={o.id} order={o} sellerSide={sellerSide} buyerSide={!sellerSide}
            onChanged={(u) => setPatched((p) => ({ ...p, [u.id]: u }))} />
        ))}
      </div>
    </>
  );
}
