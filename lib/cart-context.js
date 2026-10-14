'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

const CartContext = createContext(null);
const KEY = 'khetlink_cart_v1';

export function CartProvider({ children }) {
  const { user, loading } = useAuth();
  const userId = user?.id || null;

  const [items, setItems] = useState([]);
  // Whose cart is currently held in `items` (undefined = nothing loaded yet)
  const [loadedFor, setLoadedFor] = useState(undefined);
  const ready = !loading && loadedFor === userId;

  // Load the signed-in user's own cart whenever the user changes (login, logout, switching accounts)
  useEffect(() => {
    if (loading) return;
    let saved = [];
    if (userId) {
      try { saved = JSON.parse(localStorage.getItem(`${KEY}:${userId}`) || '[]'); } catch { saved = []; }
    }
    setItems(Array.isArray(saved) ? saved : []);
    setLoadedFor(userId);
    // the old shared cart (one key for everybody) is no longer used
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  }, [userId, loading]);

  // Save to that user's key only, and only once their cart has been loaded
  useEffect(() => {
    if (ready && userId) { try { localStorage.setItem(`${KEY}:${userId}`, JSON.stringify(items)); } catch { /* ignore */ } }
  }, [items, ready, userId]);

  const clamp = (it, q) => Math.min(Math.max(Number(q) || 0, 0), Number(it.max_qty));

  const add = useCallback((product, qty) => {
    setItems((prev) => {
      const snap = {
        product_id: product.id, name: product.name, emoji: product.image_emoji, unit: product.unit,
        price: Number(product.price_per_unit), kg_per_unit: Number(product.kg_per_unit),
        min_qty: Number(product.min_order_qty), max_qty: Number(product.quantity_available),
        seller_id: product.seller_id, seller_name: product.seller?.organization || product.seller?.full_name || 'Seller',
        district: product.district,
      };
      const existing = prev.find((i) => i.product_id === snap.product_id);
      if (existing) {
        return prev.map((i) => (i.product_id === snap.product_id ? { ...i, ...snap, qty: clamp(snap, i.qty + qty) } : i));
      }
      return [...prev, { ...snap, qty: clamp(snap, qty) }];
    });
  }, []);

  const setQty = useCallback((id, qty) => setItems((prev) => prev.map((i) => (i.product_id === id ? { ...i, qty: clamp(i, qty) } : i))), []);
  const remove = useCallback((id) => setItems((prev) => prev.filter((i) => i.product_id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({
    items, ready, add, setQty, remove, clear,
    count: items.length,
    subtotal: items.reduce((s, i) => s + i.price * i.qty, 0),
    weight: items.reduce((s, i) => s + i.kg_per_unit * i.qty, 0),
  }), [items, ready, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
};