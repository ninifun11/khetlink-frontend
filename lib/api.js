import { supabase } from './supabaseClient';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/** Fetch wrapper: attaches the Supabase JWT, parses JSON, throws ApiError with a readable message. */
export async function api(path, { method = 'GET', body, params, auth = true, signal } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  const qs = params
    ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString()
    : '';

  let res;
  try {
    res = await fetch(`${API_URL}/api${path}${qs}`, { method, headers, body: body ? JSON.stringify(body) : undefined, signal });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new ApiError(`Cannot reach the KhetLink API at ${API_URL}. Is the backend running?`, 0);
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(json.error || `Request failed (${res.status})`, res.status, json.details);
  return json;
}
