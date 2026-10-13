import { useEffect, useState } from 'react';
import {
  loadLog, saveLog, loadHabits, saveHabits,
  loadLists, saveLists,
  loadShortcuts, saveShortcuts,
  todayKey, emptyEntry, DEFAULT_HABITS,
} from './storage';
import WakeTracker from './WakeTracker';
import WakeChart from './WakeChart';
import WakeAverage from './WakeAverage';
import HabitGrid from './HabitGrid';
import Lists from './Lists';
import Journal from './Journal';
import Shortcuts from './Shortcuts';

export default function App() {
  const [log, setLog] = useState(null);
  const [habits, setHabits] = useState(null);
  const [lists, setLists] = useState(null);
  const [shortcuts, setShortcuts] = useState(null);
  const key = todayKey();

  useEffect(() => {
    (async () => {
      const [l, h, li, sc] = await Promise.all([
        loadLog(), loadHabits(), loadLists(), loadShortcuts(),
      ]);
      const habitsList = h && h.length ? h : DEFAULT_HABITS;
      if (!h) await saveHabits(habitsList);
      if (!l[key]) {
        l[key] = emptyEntry(new Date().toISOString());
        await saveLog(l);
      }
      setLog(l);
      setHabits(habitsList);
      setLists(li);
      setShortcuts(sc);
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

  // Saves the journal for a date. If the text is empty, nothing is kept:
  // the journal field is removed, and if the day has no other data
  // (no wake time, no habits ticked), the whole day entry is removed.
  function saveJournal(dateKey, text) {
    setLog((prev) => {
      const entry = prev[dateKey];
      let next;
      if (text.trim()) {
        const base = entry || emptyEntry(null);
        next = { ...prev, [dateKey]: { ...base, journal: text } };
      } else {
        if (!entry || !entry.journal) return prev; // nothing to change
        const { journal, ...rest } = entry;
        const hasOtherData =
          rest.wakeTime || Object.values(rest.habits || {}).some(Boolean);
        next = { ...prev };
        if (hasOtherData) next[dateKey] = rest;
        else delete next[dateKey];
      }
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

  // ---- shortcuts ----
  function addShortcut(name, url) {
    setShortcuts((prev) => {
      const next = [...prev, { id: `${Date.now()}`, name, url }];
      saveShortcuts(next);
      return next;
    });
  }

  function removeShortcut(id) {
    setShortcuts((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveShortcuts(next);
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

  function removeListItem(listName, id) {
    updateLists((prev) => ({
      ...prev,
      [listName]: prev[listName].filter((t) => t.id !== id),
    }));
  }

  if (!log || !habits || !lists || !shortcuts) {
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

        <Shortcuts
          shortcuts={shortcuts}
          onAdd={addShortcut}
          onRemove={removeShortcut}
        />

        <Journal log={log} onSave={saveJournal} />

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
          kind="todo"
          lists={lists}
          onAdd={addListItem}
          onRemove={removeListItem}
        />

        <Lists
          kind="ideas"
          lists={lists}
          onAdd={addListItem}
          onRemove={removeListItem}
        />
      </div>
    </div>
  );
}
