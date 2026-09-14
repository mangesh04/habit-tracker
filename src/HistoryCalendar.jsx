import { useState } from 'react';
import { monthMatrix, completionScore, formatTime, TASKS } from './storage';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function scoreColor(score) {
  if (score === 0) return 'bg-stone-100 border-stone-300';
  if (score < 0.5) return 'bg-amber-100 border-amber-300';
  if (score < 1) return 'bg-amber-300 border-amber-400';
  return 'bg-emerald-500 border-emerald-600';
}

export default function HistoryCalendar({ log }) {
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selected, setSelected] = useState(null);

  const cells = monthMatrix(cursor.year, cursor.month);

  function keyFor(day) {
    const m = String(cursor.month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${cursor.year}-${m}-${d}`;
  }

  function shiftMonth(delta) {
    setSelected(null);
    setCursor((c) => {
      let month = c.month + delta;
      let year = c.year;
      if (month < 0) { month = 11; year -= 1; }
      if (month > 11) { month = 0; year += 1; }
      return { year, month };
    });
  }

  const selectedEntry = selected ? log[selected] : null;

  return (
    <div className="py-5">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => shiftMonth(-1)} className="px-2 text-stone-500 hover:text-stone-800">‹</button>
        <p className="font-serif text-lg text-stone-800">
          {MONTH_NAMES[cursor.month]} {cursor.year}
        </p>
        <button onClick={() => shiftMonth(1)} className="px-2 text-stone-500 hover:text-stone-800">›</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-stone-400">
        {WEEKDAYS.map((w, i) => <div key={i}>{w}</div>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const key = keyFor(day);
          const entry = log[key];
          const score = completionScore(entry);
          return (
            <button
              key={i}
              onClick={() => setSelected(key === selected ? null : key)}
              className={`aspect-square border text-xs ${scoreColor(score)} ${
                selected === key ? 'ring-2 ring-amber-600' : ''
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-4 border border-stone-300 p-3 text-sm">
          <p className="mb-2 text-stone-500">{selected}</p>
          {selectedEntry ? (
            <ul className="space-y-1 text-stone-700">
              <li>Woke up at {formatTime(selectedEntry.wakeTime)}</li>
              {TASKS.map((t) => (
                <li key={t.key}>
                  {selectedEntry.tasks[t.key] ? '✓' : '·'} {t.label}
                </li>
              ))}
              <li>{selectedEntry.screenClean ? '✓' : '·'} Stayed off Instagram / YouTube</li>
            </ul>
          ) : (
            <p className="text-stone-400">No record for this day.</p>
          )}
        </div>
      )}
    </div>
  );
}
