import { useEffect, useState } from 'react';
import { habitStreak } from './storage';

const OPEN_KEY = 'best-streaks-open';

export default function BestStreaks({ bests, log }) {
    const [open, setOpen] = useState(() => {
        try {
            const v = localStorage.getItem(OPEN_KEY);
            return v ? JSON.parse(v) : false;
        } catch {
            return false;
        }
    });

    useEffect(() => {
        try { localStorage.setItem(OPEN_KEY, JSON.stringify(open)); } catch { }
    }, [open]);

    const rows = Object.values(bests)
        .filter((r) => r.best_streak > 0)
        .sort((a, b) => b.best_streak - a.best_streak);

    if (!rows.length) return null;

    const avg = rows.reduce((s, r) => s + r.best_streak, 0) / rows.length;

    return (
        <div className="mb-6 border-b border-stone-300 pb-4">
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-baseline justify-between text-left"
            >
                <span className="text-sm text-stone-500 hover:text-stone-800">
                    {open ? '▾' : '▸'} Best streaks
                </span>
                <span className="text-sm text-stone-600">
                    avg longest{' '}
                    <span className="font-serif text-xl text-stone-800">{avg.toFixed(1)}</span> days
                </span>
            </button>

            {open && (
                <ul className="mt-3 space-y-1">
                    {rows.map((r, i) => {
                        const current = habitStreak(log, r.habit_id);
                        return (
                            <li key={r.habit_id} className="flex items-baseline gap-3 py-1 text-sm">
                                <span className="w-5 text-stone-400">{i + 1}</span>
                                <span className="flex-1 text-stone-800">
                                    {r.habit_name}
                                    {r.start_date && (
                                        <span className="ml-2 text-xs text-stone-400">
                                            {r.start_date} → {r.end_date}
                                        </span>
                                    )}
                                </span>
                                <span className="font-serif text-lg text-stone-800">{r.best_streak}</span>
                                <span className="w-16 text-right text-xs text-stone-400">
                                    now {current}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}