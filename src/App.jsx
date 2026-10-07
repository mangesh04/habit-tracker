import { useEffect, useState } from 'react';
import {
  loadLog, saveLog, loadNotes, saveNotes, loadHabits, saveHabits,
  loadLists, saveLists,
  todayKey, emptyEntry, DEFAULT_HABITS,
} from './storage';
import WakeTracker from './WakeTracker';
import WakeChart from './WakeChart';
import WakeAverage from './WakeAverage';
import HabitGrid from './HabitGrid';
import Lists from './Lists';
import Journal from './Journal';
import NotesPanel from './NotesPanel';

export default function App() {
  const [log, setLog] = useState(null);
  const [habits, setHabits] = useState(null);
  const [lists, setLists] = useState(null);
  const [notes, setNotes] = useState('');
  const key = todayKey();

  useEffect(() => {
    (async () => {
      const [l, h, n, li] = await Promise.all([
        loadLog(), loadHabits(), loadNotes(), loadLists(),
      ]);
      const habitsList = h && h.length ? h : DEFAULT_HABITS;
      if (!h) await saveHabits(habitsList);
      if (!l[key]) {
        l[key] = emptyEntry(new Date().toISOString());
        await saveLog(l);
      }
      setLog(l);
      setHabits(habitsList);
      setNotes(n);
      setLists(li);
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

  function saveJournal(dateKey, text) {
    setLog((prev) => {
      const entry = prev[dateKey] || emptyEntry(null);
      const next = { ...prev, [dateKey]: { ...entry, journal: text } };
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

  // ---- lists ----
  function updateLists(updater) {
    setLists((prev) => {
      const next = updater(prev);
      saveLists(next);
      return next;
    });
  }

  function addListItem(listName, text) {
    updateLists((prev) => ({
      ...prev,
      [listName]: [...prev[listName], { id: `${Date.now()}`, text, done: false }],
    }));
  }

  function toggleTodo(id) {
    updateLists((prev) => ({
      ...prev,
      todo: prev.todo.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }));
  }

  function removeListItem(listName, id) {
    updateLists((prev) => ({
      ...prev,
      [listName]: prev[listName].filter((t) => t.id !== id),
    }));
  }

  function clearDoneTodos() {
    updateLists((prev) => ({ ...prev, todo: prev.todo.filter((t) => !t.done) }));
  }

  function handleNotesChange(text) {
    setNotes(text);
    saveNotes(text);
  }

  if (!log || !habits || !lists) {
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
          <WakeAverage log={log} />
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

        <Lists
          lists={lists}
          onAdd={addListItem}
          onToggle={toggleTodo}
          onRemove={removeListItem}
          onClearDone={clearDoneTodos}
        />

        <Journal log={log} onSave={saveJournal} />

        <NotesPanel notes={notes} onChange={handleNotesChange} />
      </div>
    </div>
  );
}
