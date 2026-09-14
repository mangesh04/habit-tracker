import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { dateKeysBack, shortLabel } from './storage';

function wakeMinutes(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

function minutesToLabel(mins) {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export default function WakeChart({ log, days = 14 }) {
  const keys = dateKeysBack(days);
  const data = keys.map((k) => ({
    label: shortLabel(k),
    minutes: wakeMinutes(log[k]?.wakeTime),
  }));

  if (!data.some((d) => d.minutes !== null)) return null;

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
          <CartesianGrid stroke="#E7E5E4" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#A8A29E' }} axisLine={false} tickLine={false} />
          <YAxis
            domain={['dataMin - 30', 'dataMax + 30']}
            tickFormatter={minutesToLabel}
            tick={{ fontSize: 10, fill: '#A8A29E' }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip formatter={(v) => minutesToLabel(v)} />
          <Line type="monotone" dataKey="minutes" stroke="#B45309" strokeWidth={2} dot={{ r: 3, fill: '#B45309' }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
