export const inr = (n, digits = 0) =>
  n == null || Number.isNaN(Number(n)) ? '—'
    : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: digits, minimumFractionDigits: digits }).format(Number(n));

export const num = (n, digits = 0) =>
  n == null || Number.isNaN(Number(n)) ? '—' : new Intl.NumberFormat('en-IN', { maximumFractionDigits: digits }).format(Number(n));

export const pct = (n, digits = 0) => (n == null ? '—' : `${n > 0 ? '+' : ''}${Number(n).toFixed(digits)}%`);

export const kg = (n) => (n == null ? '—' : Number(n) >= 1000 ? `${num(Number(n) / 1000, 1)} t` : `${num(n)} kg`);

export const shortDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—');
export const dateTime = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—');

export function timeAgo(d) {
  if (!d) return '';
  const s = Math.max(1, Math.round((Date.now() - new Date(d).getTime()) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
}

export const minutes = (m) => {
  if (m == null) return '—';
  const h = Math.floor(m / 60);
  const r = Math.round(m % 60);
  return h ? `${h} h ${r} min` : `${r} min`;
};

export const unitLabel = (unit) => ({ kg: 'kg', quintal: 'quintal', dozen: 'dozen', piece: 'piece', bunch: 'bunch' }[unit] || unit);
