import { useEffect, useState } from 'react';

const OPEN_KEY = 'shortcuts-open';

function normalize(url) {
  const u = url.trim();
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

function favicon(url) {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return '';
  }
}

export default function Shortcuts({ shortcuts, onAdd, onRemove }) {
  const [open, setOpen] = useState(() => {
    try {
      const v = localStorage.getItem(OPEN_KEY);
      return v ? JSON.parse(v) : true;
    } catch {
      return true;
    }
  });
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(OPEN_KEY, JSON.stringify(open));
    } catch {}
  }, [open]);

  function add() {
    if (!url.trim()) return;
    const full = normalize(url);
    let label = name.trim();
    if (!label) {
      try {
        label = new URL(full).hostname.replace('www.', '');
      } catch {
        label = full;
      }
    }
    onAdd(label, full);
    setName('');
    setUrl('');
    setAdding(false);
  }

  return (
    <div className="mb-6 border-b border-stone-300 pb-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpen(!open)}
          className="text-sm text-stone-500 hover:text-stone-800"
        >
          {open ? '▾' : '▸'} Shortcuts
        </button>
        {open && (
          <button
            onClick={() => setEditing(!editing)}
            className="text-xs text-stone-400 hover:text-stone-700"
          >
            {editing ? 'done' : 'edit'}
          </button>
        )}
      </div>

      {open && (
        <div className="mt-3 flex flex-wrap gap-4">
          {shortcuts.map((l) => (
            <div key={l.id} className="relative w-16 text-center">
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-200 transition hover:bg-stone-300">
                  <img src={favicon(l.url)} alt="" className="h-6 w-6" />
                </span>
                <span className="w-full truncate text-xs text-stone-600">{l.name}</span>
              </a>
              {editing && (
                <button
                  onClick={() => onRemove(l.id)}
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-stone-700 text-xs text-white"
                  aria-label={`Remove ${l.name}`}
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {adding ? (
            <div className="flex w-full flex-wrap items-center gap-2 pt-1">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="name"
                className="w-28 rounded border border-stone-300 bg-white px-2 py-1 text-sm"
              />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && add()}
                placeholder="url"
                className="min-w-0 flex-1 rounded border border-stone-300 bg-white px-2 py-1 text-sm"
                autoFocus
              />
              <button onClick={add} className="text-sm text-stone-700">add</button>
              <button onClick={() => setAdding(false)} className="text-sm text-stone-400">
                cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex w-16 flex-col items-center gap-1"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-200 text-xl text-stone-600 hover:bg-stone-300">
                +
              </span>
              <span className="text-xs text-stone-600">Add</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
