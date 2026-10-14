'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api';

/**
 * useApi('/orders', { status: 'placed' }) → { data, error, loading, reload }
 * Re-fetches when path/params change. Pass { enabled: false } to hold back.
 */
export function useApi(path, params, { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: enabled });
  const key = `${path}|${JSON.stringify(params || {})}`;
  const seq = useRef(0);

  const run = useCallback(async () => {
    if (!enabled) return;
    const mine = ++seq.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await api(path, { params });
      if (mine === seq.current) setState({ data, error: null, loading: false });
    } catch (e) {
      if (mine === seq.current) setState({ data: null, error: e, loading: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  useEffect(() => { run(); }, [run]);
  return { ...state, reload: run };
}

/** Debounce a fast-changing value (search boxes) */
export function useDebounced(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
