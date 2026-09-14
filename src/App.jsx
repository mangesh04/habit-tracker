import { useEffect, useState } from 'react';
import {
  loadLog, saveLog, loadNotes, saveNotes, loadHabits, saveHabits,
  todayKey, emptyEntry, DEFAULT_HABITS,
} from './storage';
import WakeTracker from './WakeTracker';
import WakeChart from './WakeChart';
import HabitGrid from './HabitGrid';
import NotesPanel from './NotesPanel';

export default function App() {
  const [log, setLog] = useState(null);
  const [habits, setHabits] = useState(null);
  const [notes, setNotes] = useState('');
  const key = todayKey();

  useEffect(() => {
    (async () => {
      const [l, h, n] = await Promise.all([loadLog(), loadHabits(), loadNotes()]);
      const habitsList = h && h.length ? h : DEFAULT_HABITS;
      if (!h) await saveHabits(habitsList);
      if (!l[key]) {
        l[key] = emptyEntry(new Date().toISOString());
        await saveLog(l);
      }
      setLog(l);
      setHabits(habitsList);
      setNotes(n);
    })();
  }, []);

  function updateToday(patch) {
    setLog((prev) => {
      const next = { ...prev, [key]: { ...prev[key], ...patch } };
      saveLog(next);
      return next;
    });
  }

  function toggleCell(habitId, dateKey) {
    setLog((prev) => {
      const entry = prev[dateKey] || emptyEntry(null);
      const nextEntry = {
        ...entry,
        habits: { ...entry.habits, [habitId]: !entry.habits?.[habitId] },
      };
      const next = { ...prev, [dateKey]: nextEntry };
      saveLog(next);
      return next;
    });
  }

  function addHabit(name) {
    setHabits((prev) => {
      const next = [...prev, { id: `${Date.now()}`, name }];
      saveHabits(next);
      return next;
    });
  }

  function removeHabit(id) {
    setHabits((prev) => {
      const next = prev.filter((h) => h.id !== id);
      saveHabits(next);
      return next;
    });
  }

  function handleNotesChange(text) {
    setNotes(text);
    saveNotes(text);
  }

  if (!log || !habits) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 text-stone-400">
        Loading…
      </div>
    );
  }

  const today = log[key];

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-10 text-stone-800">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6">
          <h1 className="font-serif text-2xl text-stone-800">Daily habits</h1>
          <p className="text-sm text-stone-500">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </header>

        <div className="border-b border-stone-300 pb-5">
          <p className="mb-3 text-sm text-stone-500">Sleep</p>
          <WakeTracker wakeTime={today.wakeTime} onChange={(t) => updateToday({ wakeTime: t })} />
          <div className="mt-4">
            <WakeChart log={log} />
          </div>
        </div>

        <HabitGrid
          log={log}
          habits={habits}
          onToggleCell={toggleCell}
          onAddHabit={addHabit}
          onRemoveHabit={removeHabit}
        />

        <NotesPanel notes={notes} onChange={handleNotesChange} />
      </div>
    </div>
  );
}
