import { useEffect, useRef, useState } from 'react';
import { todayKey } from './storage';

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Inline formatting: `code`, **bold**, *italic*, ~~strike~~
function inline(s) {
  let t = escapeHtml(s);
  t = t.replace(/`([^`]+)`/g, '<code class="bg-stone-200 px-1 text-[0.9em]">$1</code>');
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  t = t.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  return t;
}

// Tiny markdown renderer. Everything is HTML-escaped first, so it's safe.
function renderMarkdown(text) {
  const out = [];
  let inList = false;
  const closeList = () => {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  };

  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();
    let m;
    if ((m = line.match(/^(#{1,3})\s+(.*)$/))) {
      closeList();
      const size = ['text-xl', 'text-lg', 'text-base'][m[1].length - 1];
      out.push(`<p class="font-serif ${size} mt-3 mb-1 text-stone-800">${inline(m[2])}</p>`);
    } else if ((m = line.match(/^\s*[-*]\s+(.*)$/))) {
      if (!inList) {
        out.push('<ul class="my-1 list-disc pl-5">');
        inList = true;
      }
      out.push(`<li>${inline(m[1])}</li>`);
    } else if ((m = line.match(/^>\s?(.*)$/))) {
      closeList();
      out.push(
        `<blockquote class="my-1 border-l-2 border-amber-300 pl-3 text-stone-500">${inline(m[1])}</blockquote>`
      );
    } else if (line.trim() === '') {
      closeList();
      out.push('<div class="h-2"></div>');
    } else {
      closeList();
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  closeList();
  return out.join('');
}

export default function Journal({ log, onSave }) {
  const today = todayKey();
  const [dateKey, setDateKey] = useState(today);
  const [text, setText] = useState(log[today]?.journal || '');
  const [preview, setPreview] = useState(false);

  const timer = useRef(null);
  const dirty = useRef(false);
  const latest = useRef({ dateKey, text });
  latest.current = { dateKey, text };

  function flush() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (dirty.current) {
      dirty.current = false;
      onSave(latest.current.dateKey, latest.current.text);
    }
  }

  // save any pending text if the component goes away
  useEffect(() => () => flush(), []);

  function handleChange(e) {
    const value = e.target.value;
    setText(value);
    latest.current.text = value;
    dirty.current = true;
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, 800); // save after 0.8s of no typing
  }

  function goTo(key) {
    flush();
    setDateKey(key);
    setText(log[key]?.journal || '');
    setPreview(false);
  }

  function shift(delta) {
    const d = new Date(dateKey + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    const k = todayKey(d);
    if (k > today) return;
    goTo(k);
  }

  const label =
    dateKey === today
      ? 'Today'
      : new Date(dateKey + 'T00:00:00').toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });

  return (
    <div className="mb-5 border-b border-stone-300 pb-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-stone-500">Journal</p>
          <div className="flex items-center gap-2 text-stone-400">
            <button onClick={() => shift(-1)} className="hover:text-stone-700">‹</button>
            <span className="text-sm text-stone-600">{label}</span>
            <button
              onClick={() => shift(1)}
              disabled={dateKey === today}
              className="hover:text-stone-700 disabled:opacity-30"
            >
              ›
            </button>
          </div>
        </div>
        <button
          onClick={() => {
            flush();
            setPreview((p) => !p);
          }}
          className="text-sm text-amber-700"
        >
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {preview ? (
        <div
          className="min-h-[9rem] border border-stone-300 p-3 text-sm text-stone-800"
          dangerouslySetInnerHTML={{
            __html: text.trim()
              ? renderMarkdown(text)
              : '<p class="text-stone-400">Nothing written.</p>',
          }}
        />
      ) : (
        <textarea
          value={text}
          onChange={handleChange}
          onBlur={flush}
          placeholder="What's on your mind today?"
          rows={7}
          className="w-full resize-y border border-stone-300 bg-transparent p-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-600"
        />
      )}

      {!preview && (
        <p className="mt-1 text-xs text-stone-400">
          # heading · **bold** · *italic* · ~~strike~~ · `code` · - list · &gt; quote
        </p>
      )}
    </div>
  );
}
