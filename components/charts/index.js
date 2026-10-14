'use client';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { inr, num, shortDate } from '@/lib/format';

const AXIS = { fontSize: 11, fill: '#5A6480' };
const GRID = '#E9EDF4';
const TIP = {
  contentStyle: { borderRadius: 10, border: '1px solid #E3E8F1', boxShadow: '0 10px 28px -8px rgba(27,35,64,.22)', fontSize: 12, padding: '8px 12px' },
  labelStyle: { color: '#5A6480', fontWeight: 600, marginBottom: 2 },
  itemStyle: { color: '#1B2340' },
};
const PALETTE = ['#2A3B7D', '#F5B921', '#4C9A3F', '#D64533', '#7A4FBF', '#0E8A8A', '#8FA4DC'];
// Donut slices: a thin white gap keeps neighbouring colours distinguishable

const Box = ({ height = 260, label, children }) => (
  <div style={{ height }} role="img" aria-label={label}>
    <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
  </div>
);

/** Daily values, e.g. revenue for the last 30 days. data: [{ date, value }] */
export function TrendArea({ data, color = '#2A3B7D', money = false, label = 'Daily trend', height }) {
  const fmt = (v) => (money ? inr(v) : num(v));
  return (
    <Box height={height} label={label}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`g-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="date" tickFormatter={shortDate} tick={AXIS} tickLine={false} axisLine={false} minTickGap={28} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={52} tickFormatter={(v) => (money && v >= 1000 ? `₹${num(v / 1000, 1)}k` : fmt(v))} />
        <Tooltip {...TIP} formatter={(v) => [fmt(v), money ? 'Amount' : 'Value']} labelFormatter={shortDate} />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fill={`url(#g-${color.slice(1)})`} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
      </AreaChart>
    </Box>
  );
}

/** Horizontal bars. data: [{ name, value }] */
export function HBar({ data, money = false, color = '#2A3B7D', label = 'Bar chart', height }) {
  const h = height || Math.max(180, data.length * 40 + 20);
  return (
    <Box height={h} label={label}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} tickFormatter={(v) => (money ? `₹${num(v / 1000, 0)}k` : num(v))} />
        <YAxis type="category" dataKey="name" tick={AXIS} tickLine={false} axisLine={false} width={96} />
        <Tooltip {...TIP} formatter={(v) => (money ? inr(v) : num(v))} cursor={{ fill: '#F5F7FB' }} />
        <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} barSize={18} />
      </BarChart>
    </Box>
  );
}

/** Donut with a legend. data: [{ name, value }] */
export function Donut({ data, money = false, label = 'Breakdown', height = 240 }) {
  return (
    <Box height={height} label={label}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={3} stroke="#fff" strokeWidth={2}>
          {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
        </Pie>
        <Tooltip {...TIP} formatter={(v) => (money ? inr(v) : num(v))} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </Box>
  );
}

/**
 * History + forecast with an 80% band.
 * rows: [{ date, actual?, forecast?, lower?, upper? }]
 */
export function ForecastChart({ rows, unit = '', money = false, label = 'Forecast chart', height = 300 }) {
  const fmt = (v) => (money ? `₹${num(v, 1)}` : `${num(v)}${unit}`);
  return (
    <Box height={height} label={label}>
      <ComposedChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="date" tickFormatter={shortDate} tick={AXIS} tickLine={false} axisLine={false} minTickGap={30} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={56} tickFormatter={(v) => (money ? `₹${num(v, 0)}` : num(v))} domain={['auto', 'auto']} />
        <Tooltip
          {...TIP}
          labelFormatter={shortDate}
          formatter={(v, name) => (Array.isArray(v) ? [`${fmt(v[0])} – ${fmt(v[1])}`, name] : [fmt(v), name])}
        />
        <Area type="monotone" dataKey="band" name="80% range" stroke="none" fill="#F5B921" fillOpacity={0.22} isAnimationActive={false} />
        <Line type="monotone" dataKey="actual" name="Actual" stroke="#2A3B7D" strokeWidth={2.5} dot={false} connectNulls={false} />
        <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#E3A008" strokeWidth={2.5} strokeDasharray="5 4" dot={false} connectNulls={false} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </ComposedChart>
    </Box>
  );
}
