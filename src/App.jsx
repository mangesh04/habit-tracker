import { useEffect, useState } from 'react';

import {
  loadLog, saveLog, loadHabits, saveHabits,
  loadLists, saveLists,
  loadShortcuts, saveShortcuts,
  todayKey, emptyEntry, DEFAULT_HABITS,
  loadBestStreaks, saveBestStreaks, longestStreak,
} from './storage';



import BestStreaks from './BestStreaks';

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

  const [bests, setBests] = useState(null);



  useEffect(() => {

    (async () => {
      const [l, h, li, sc, bs] = await Promise.all([
        loadLog(), loadHabits(), loadLists(), loadShortcuts(), loadBestStreaks(),
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
      setBests(bs);
    })();
  }, []);

  useEffect(() => {
    if (!log || !habits || !bests) return;
    const next = { ...bests };
    const toSave = [];
    for (const h of habits) {
      const c = longestStreak(log, h.id);
      if (c.length > (bests[h.id]?.best_streak || 0)) {
        const row = {
          habit_id: h.id,
          habit_name: h.name,
          best_streak: c.length,
          start_date: c.start,
          end_date: c.end,
        };
        next[h.id] = row;
        toSave.push(row);
      }
    }
    if (toSave.length) {
      setBests(next);
      saveBestStreaks(toSave);
    }
  }, [log, habits, bests]);

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

  function reorderHabit(from, to) {
    setHabits((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
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

  function reorderListItem(listName, from, to) {
    updateLists((prev) => {
      const arr = [...prev[listName]];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return { ...prev, [listName]: arr };
    });
  }

  if (!log || !habits || !lists || !shortcuts || !bests) {
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

        <BestStreaks bests={bests} log={log} />

        <Shortcuts
          shortcuts={shortcuts}
          onAdd={addShortcut}
          onRemove={removeShortcut}
        />

        <Journal log={log} onSave={saveJournal} />

        {/* <div className="border-b border-stone-300 pb-5">
          <p className="mb-3 text-sm text-stone-500">Sleep</p>
          <WakeTracker wakeTime={today.wakeTime} onChange={(t) => updateToday({ wakeTime: t })} />
          <WakeAverage log={log} />
          <div className="mt-4">
            <WakeChart log={log} />
          </div>
        </div> */}

        <HabitGrid
          log={log}
          habits={habits}
          onToggleCell={toggleCell}
          onAddHabit={addHabit}
          onRemoveHabit={removeHabit}
          onReorderHabit={reorderHabit}
        />

        <Lists
          kind="todo"
          lists={lists}
          onAdd={addListItem}
          onRemove={removeListItem}
          onReorder={reorderListItem}
        />

        <Lists
          kind="ideas"
          lists={lists}
          onAdd={addListItem}
          onRemove={removeListItem}
          onReorder={reorderListItem}
        />
      </div>
    </div >
  );
}
