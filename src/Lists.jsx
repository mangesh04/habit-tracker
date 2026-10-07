import { useState } from 'react';

function ListSection({ title, hint, items, checkable, placeholder, onAdd, onToggle, onRemove, onClearDone }) {
  const [value, setValue] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue('');
  }

  const hasDone = checkable && items.some((i) => i.done);

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <p className="text-sm text-stone-800">{title}</p>
        {hasDone && (
          <button onClick={onClearDone} className="text-xs text-amber-700">
            Clear done
          </button>
        )}
      </div>
      <p className="mb-2 text-xs text-stone-400">{hint}</p>

      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.id} className="group flex items-center gap-3 py-1">
            {checkable && (
              <button
                onClick={() => onToggle(item.id)}
                className={`flex h-5 w-5 shrink-0 items-center justify-center border ${
                  item.done ? 'border-amber-600 bg-amber-600' : 'border-stone-400'
                }`}
              >
                {item.done && (
                  <svg viewBox="0 0 12 12" className="h-3 w-3 fill-none stroke-white stroke-2">
                    <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            )}
            {!checkable && <span className="text-stone-400">·</span>}
            <span
              className={`flex-1 text-sm ${
                item.done ? 'text-stone-400 line-through' : 'text-stone-800'
              }`}
            >
              {item.text}
            </span>
            <button
              onClick={() => onRemove(item.id)}
              className="text-stone-300 hover:text-red-600"
              aria-label="Remove"
            >
              ×
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="py-1 text-sm text-stone-400">Nothing here yet.</li>}
      </ul>

      <form onSubmit={submit} className="mt-2 flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
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

export default function Lists({ lists, onAdd, onToggle, onRemove, onClearDone }) {
  return (
    <div className="space-y-8 border-t border-stone-300 py-5">
      <ListSection
        title="I have to do"
        hint="Things that actually need doing."
        items={lists.todo}
        checkable
        placeholder="Add something to do"
        onAdd={(t) => onAdd('todo', t)}
        onToggle={onToggle}
        onRemove={(id) => onRemove('todo', id)}
        onClearDone={onClearDone}
      />
      <ListSection
        title="I can do"
        hint="Look here instead of getting carried away."
        items={lists.ideas}
        placeholder="Add something you can do instead"
        onAdd={(t) => onAdd('ideas', t)}
        onRemove={(id) => onRemove('ideas', id)}
      />
    </div>
  );
}
