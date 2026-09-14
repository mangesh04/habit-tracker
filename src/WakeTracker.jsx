import { useState } from 'react';
import { formatTime } from './storage';

export default function WakeTracker({ wakeTime, onChange }) {
  const [editing, setEditing] = useState(false);

  function handleTimeInput(e) {
    const [h, m] = e.target.value.split(':').map(Number);
    const d = new Date(wakeTime || Date.now());
    d.setHours(h, m, 0, 0);
    onChange(d.toISOString());
  }

  const inputValue = (() => {
    const d = new Date(wakeTime || Date.now());
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  })();

  return (
    <div className="flex items-baseline justify-between">
      <div>
        <p className="text-sm text-stone-500">Woke up at</p>
        {editing ? (
          <input
            type="time"
            autoFocus
            defaultValue={inputValue}
            onChange={handleTimeInput}
            onBlur={() => setEditing(false)}
            className="mt-1 border border-stone-300 bg-transparent px-2 py-1 font-serif text-3xl text-stone-800"
          />
        ) : (
          <p className="font-serif text-4xl text-stone-800">{formatTime(wakeTime)}</p>
        )}
      </div>
      {!editing && (
        <button
          onClick={() => setEditing(true)}
          className="text-sm text-amber-700 underline decoration-amber-300 underline-offset-4 hover:text-amber-800"
        >
          Adjust
        </button>
      )}
    </div>
  );
}
