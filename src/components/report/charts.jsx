import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { formatDate, labelize } from '../../utils/format';

/** Single chart hue (validated for contrast on white); text never uses it. */
export const CHART_COLOR = '#0d9488';
const GRID = '#e2e8f0';
const AXIS_TEXT = { fill: '#64748b', fontSize: 12 };

export function ChartCard({ title, subtitle, children }) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <CardBody>{children}</CardBody>
    </Card>
  );
}

/** Fills missing days with zero so the time axis is continuous (up to ~3 months). */
export function fillDays(trend = {}, from, to) {
  if (!from || !to) return Object.entries(trend).map(([day, count]) => ({ day, count }));
  const days = [];
  for (let date = new Date(`${from}T00:00:00`); date <= new Date(`${to}T00:00:00`) && days.length < 93; date.setDate(date.getDate() + 1)) {
    const key = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    days.push({ day: key, count: trend[key] || 0 });
  }
  return days;
}

function TrendTooltip({ active, payload, unit }) {
  if (!active || !payload?.length) return null;
  const { day, count } = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
      <p className="text-sm font-semibold text-slate-900 tabular-nums">{count} {unit}</p>
      <p className="text-xs text-slate-500">{formatDate(day)}</p>
    </div>
  );
}

export const CHART_KINDS = [
  { id: 'bar', label: 'Bars' },
  { id: 'line', label: 'Line' },
  { id: 'area', label: 'Area' },
];

const CHARTS = { bar: BarChart, line: LineChart, area: AreaChart };

function series(kind) {
  if (kind === 'line') return <Line type="monotone" dataKey="count" stroke={CHART_COLOR} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />;
  if (kind === 'area') return <Area type="monotone" dataKey="count" stroke={CHART_COLOR} strokeWidth={2} fill={CHART_COLOR} fillOpacity={0.1} />;
  return <Bar dataKey="count" fill={CHART_COLOR} maxBarSize={24} radius={[4, 4, 0, 0]} activeBar={{ fill: '#14b8a6' }} />;
}

/** Daily counts as bars, a line or an area, with a hover tooltip. */
export function TrendChart({ data, unit = 'items', height = 220, kind = 'bar' }) {
  const Chart = CHARTS[kind] || BarChart;
  const shortDate = (day) => formatDate(day).slice(0, 6);
  return (
    <div style={{ height }} className="w-full min-w-0" role="img" aria-label={`Daily ${unit}: ${data.reduce((sum, d) => sum + d.count, 0)} in total`}>
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="day" tickFormatter={shortDate} tick={AXIS_TEXT} tickLine={false} axisLine={{ stroke: GRID }} minTickGap={16} />
          <YAxis allowDecimals={false} tick={AXIS_TEXT} tickLine={false} axisLine={false} />
          <Tooltip cursor={kind === 'bar' ? { fill: '#f1f5f9' } : { stroke: '#cbd5e1' }} content={<TrendTooltip unit={unit} />} />
          {series(kind)}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Horizontal bars in plain HTML: category, bar, value at the tip. Works at any width and reads well
 * on phones. `format` turns keys (e.g. enum names) into labels.
 */
export function BreakdownBars({ data = {}, format = labelize, emptyText = 'No data for this period' }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, value]) => value));
  if (entries.length === 0) return <p className="py-6 text-center text-sm text-slate-500">{emptyText}</p>;
  return (
    <ul className="space-y-3">
      {entries.map(([key, value]) => (
        <li key={key} title={`${format(key)}: ${value}`} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-sm">
          <span className="truncate text-slate-600">{format(key)}</span>
          <span className="h-3 rounded-r bg-slate-100">
            <span className="block h-3 rounded-r" style={{ width: `${(value / max) * 100}%`, backgroundColor: CHART_COLOR }} />
          </span>
          <span className="w-8 text-right font-medium text-slate-900 tabular-nums">{value}</span>
        </li>
      ))}
    </ul>
  );
}
