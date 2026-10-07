import { averageWakeMinutes, minutesToLabel } from './storage';

const RANGES = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
];

export default function WakeAverage({ log }) {
  const rows = RANGES.map((r) => ({ ...r, res: averageWakeMinutes(log, r.days) }));
  if (!rows.some((r) => r.res)) return null;

  return (
    <div className="mt-4 flex gap-8">
      {rows.map((r) =>
        r.res ? (
          <div key={r.days}>
            <p className="text-xs text-stone-400">
              Average · {r.label}
            </p>
            <p className="font-serif text-xl text-stone-800">{minutesToLabel(r.res.avg)}</p>
            <p className="text-xs text-stone-400">
              from {r.res.count} day{r.res.count === 1 ? '' : 's'}
            </p>
          </div>
        ) : null
      )}
    </div>
  );
}
