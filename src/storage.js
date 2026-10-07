import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const LOG_KEY = 'habit-log';
export const NOTES_KEY = 'habit-notes';
export const HABITS_KEY = 'habits';
export const LISTS_KEY = 'lists';

export const DEFAULT_HABITS = [
  { id: 'meditation', name: 'Meditate (2–3 min)' },
  { id: 'pushup', name: 'At least 1 push-up' },
  { id: 'brush', name: 'Brush' },
  { id: 'bath', name: 'Bath' },
  { id: 'screen_free', name: 'Off Instagram / YouTube' },
];

async function getValue(key) {
  const { data, error } = await supabase
    .from('app_storage')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error) {
    console.error(`Failed to load ${key}`, error);
    return null;
  }
  return data ? data.value : null;
}

async function setValue(key, value) {
  const { error } = await supabase
    .from('app_storage')
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) console.error(`Failed to save ${key}`, error);
}

export async function loadLog() {
  const v = await getValue(LOG_KEY);
  return v || {};
}

export async function saveLog(log) {
  await setValue(LOG_KEY, log);
}

export async function loadHabits() {
  return await getValue(HABITS_KEY);
}

export async function saveHabits(habits) {
  await setValue(HABITS_KEY, habits);
}

export async function loadNotes() {
  const v = await getValue(NOTES_KEY);
  return typeof v === 'string' ? v : '';
}

export async function saveNotes(text) {
  await setValue(NOTES_KEY, text);
}

// Lists: { todo: [{id, text, done}], ideas: [{id, text}] }
export async function loadLists() {
  const v = await getValue(LISTS_KEY);
  return {
    todo: Array.isArray(v?.todo) ? v.todo : [],
    ideas: Array.isArray(v?.ideas) ? v.ideas : [],
  };
}

export async function saveLists(lists) {
  await setValue(LISTS_KEY, lists);
}

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatTime(iso) {
  if (!iso) return '--:--';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function emptyEntry(wakeTime) {
  return { wakeTime, habits: {} };
}

export function dateKeysBack(count, end = new Date()) {
  const keys = [];
  const d = new Date(end);
  for (let i = 0; i < count; i++) {
    keys.push(todayKey(d));
    d.setDate(d.getDate() - 1);
  }
  return keys.reverse();
}

export function shortLabel(key) {
  const d = new Date(key + 'T00:00:00');
  return d.toLocaleDateString(undefined, { day: 'numeric' });
}

export function habitStreak(log, habitId, end = new Date()) {
  let streak = 0;
  const d = new Date(end);
  while (true) {
    const k = todayKey(d);
    const entry = log[k];
    if (!entry || !entry.habits || !entry.habits[habitId]) break;
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// ---- wake time helpers ----

export function wakeMinutes(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

export function minutesToLabel(mins) {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

// Average wake time over the last `days` days (only days that have a wake time).
// Returns { avg (minutes since midnight), count } or null.
export function averageWakeMinutes(log, days) {
  const mins = dateKeysBack(days)
    .map((k) => wakeMinutes(log[k]?.wakeTime))
    .filter((m) => m !== null);
  if (!mins.length) return null;
  const avg = Math.round(mins.reduce((a, b) => a + b, 0) / mins.length);
  return { avg, count: mins.length };
}
