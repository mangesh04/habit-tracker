import { useState } from 'react';
import { dateKeysBack, shortLabel, habitStreak, todayKey } from './storage';

const WINDOW_SIZE = 10;

export default function HabitGrid({ log, habits, onToggleCell, onAddHabit, onRemoveHabit }) {
  const [offset, setOffset] = useState(0);
  const [newHabit, setNewHabit] = useState('');
  const [editing, setEditing] = useState(false);

  const end = new Date();
  end.setDate(end.getDate() - offset);
  const keys = dateKeysBack(WINDOW_SIZE, end);
  const today = todayKey();

  function submitHabit(e) {
    e.preventDefault();
    if (!newHabit.trim()) return;
    onAddHabit(newHabit.trim());
    setNewHabit('');
  }

  return (
    <div className="border-t border-stone-300 py-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-stone-500">Habits</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-stone-400">
            <button onClick={() => setOffset((o) => o + WINDOW_SIZE)} className="hover:text-stone-700">‹</button>
            <button
              onClick={() => setOffset((o) => Math.max(0, o - WINDOW_SIZE))}
              disabled={offset === 0}
              className="hover:text-stone-700 disabled:opacity-30"
            >
              ›
            </button>
          </div>
          <button onClick={() => setEditing((e) => !e)} className="text-sm text-amber-700">
            {editing ? 'Done' : 'Edit'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-stone-50 pr-3"></th>
              {keys.map((k) => (
                <th
                  key={k}
                  className={`w-7 px-0.5 pb-1 text-center text-xs font-normal ${
                    k === today ? 'text-amber-700' : 'text-stone-400'
                  }`}
                >
                  {shortLabel(k)}
                </th>
              ))}
              <th className="pl-3 text-center text-xs font-normal text-stone-400">streak</th>
            </tr>
          </thead>
          <tbody>
            {habits.map((h) => {
              const streak = habitStreak(log, h.id);
              return (
                <tr key={h.id}>
                  <td className="sticky left-0 z-10 whitespace-nowrap bg-stone-50 py-1.5 pr-3 text-sm text-stone-800">
                    <div className="flex items-center gap-1.5">
                      <span>{h.name}</span>
                      {editing && (
                        <button
                          onClick={() => onRemoveHabit(h.id)}
                          className="text-stone-400 hover:text-red-600"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </td>
                  {keys.map((k) => {
                    const checked = !!log[k]?.habits?.[h.id];
                    return (
                      <td key={k} className="px-0.5 py-1.5 text-center">
                        <button
                          onClick={() => onToggleCell(h.id, k)}
                          className={`h-5 w-5 border ${
                            checked ? 'border-amber-600 bg-amber-600' : 'border-stone-300'
                          }`}
                        />
                      </td>
                    );
                  })}
                  <td className="pl-3 text-center text-sm text-stone-500">{streak || ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <form onSubmit={submitHabit} className="mt-4 flex gap-2">
        <input
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="Add a habit"
          className="flex-1 border border-stone-300 bg-transparent px-2 py-1 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-600"
        />
        <button
          type="submit"
          className="border border-stone-300 px-3 py-1 text-sm text-stone-700 hover:border-amber-600 hover:text-amber-700"
        >
          Add
        </button>
      </form>
    </div>
  );
}
