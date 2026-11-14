import { useEffect, useState } from 'react';

const OPEN_KEY = 'contests-open';
const CACHE_KEY = 'contests-cache-v1';
const CACHE_MS = 10 * 60 * 1000; // 10 min
const BASE = 'https://contest-hive.vercel.app/api';
const PLATFORMS = ['leetcode', 'codechef', 'codeforces', 'atcoder'];

// Field names may differ: console.log(json.data[0]) once and adjust if needed.
function normalize(platform, c) {
  const dur = c.duration ?? c.durationSeconds ?? 0;
  return {
    platform,
    name: c.name ?? c.title ?? c.contest_name,
    url: c.url ?? c.link,
    start: new Date(c.startTime ?? c.start_time ?? c.start),
    durationMin: Math.round(dur > 10000 ? dur / 60 : dur),
  };
}

async function loadContests(force = false) {
  if (!force) {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (cached && Date.now() - cached.t < CACHE_MS) {
        return cached.items.map((i) => ({ ...i, start: new Date(i.start) }));
      }
    } catch { }
  }

  const results = await Promise.allSettled(
    PLATFORMS.map(async (p) => {
      const res = await fetch(`${BASE}/${p}`);
      const json = await res.json();
      return (json.data ?? []).map((c) => normalize(p, c));
    })
  );

  const items = results
    .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    .filter((c) => c.start > new Date())
    .sort((a, b) => a.start - b.start);

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), items }));
  } catch { }
  return items;
}

function formatStart(d) {
  return d.toLocaleString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Contests() {
  const [open, setOpen] = useState(() => {
    try {
      const v = localStorage.getItem(OPEN_KEY);
      return v ? JSON.parse(v) : false;
    } catch {
      return false;
    }
  });
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(OPEN_KEY, JSON.stringify(open));
    } catch { }
  }, [open]);

  async function fetchContests(force = false) {
    setLoading(true);
    setError(false);
    try {
      const data = await loadContests(force);
      setItems(data);
      if (!data.length) setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open && !items.length) fetchContests();
  }, [open]);

  const shown = items
    .filter((c) => filter === 'all' || c.platform === filter)
    .slice(0, 15);

  return (
    <div className="mb-6 border-b border-stone-300 pb-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpen(!open)}
          className="text-sm text-stone-500 hover:text-stone-800"
        >
          {open ? '▾' : '▸'} Contests
        </button>
        {open && (
          <button
            onClick={() => fetchContests(true)}
            className="text-xs text-stone-400 hover:text-stone-700"
          >
            {loading ? 'loading…' : 'refresh'}
          </button>
        )}
      </div>

      {open && (
        <div className="mt-3">
          <div className="mb-3 flex flex-wrap gap-3 text-xs">
            {['all', ...PLATFORMS].map((p) => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={
                  filter === p
                    ? 'text-stone-800 underline underline-offset-4'
                    : 'text-stone-400 hover:text-stone-700'
                }
              >
                {p}
              </button>
            ))}
          </div>

          {error && !loading && (
            <p className="text-xs text-stone-400">Couldn’t load contests. Try refresh.</p>
          )}

          <ul className="max-h-72 space-y-2 overflow-y-auto">
            {shown.map((c, i) => (
              <li key={i} className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-sm text-stone-700 hover:text-stone-900"
                  >
                    {c.name}
                  </a>
                  <span className="text-xs text-stone-400">
                    {formatStart(c.start)}
                    {c.durationMin ? ` · ${c.durationMin} min` : ''}
                  </span>
                </div>
                <span className="shrink-0 rounded-full bg-stone-200 px-2 py-0.5 text-xs text-stone-600">
                  {c.platform}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}