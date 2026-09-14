import { TASKS } from './storage';

export default function DailyChecklist({ tasks, onToggle }) {
  return (
    <div className="py-5">
      <p className="mb-3 text-sm text-stone-500">Today</p>
      <ul className="space-y-1">
        {TASKS.map((t) => {
          const done = tasks[t.key];
          return (
            <li key={t.key}>
              <button
                onClick={() => onToggle(t.key)}
                className="flex w-full items-center gap-3 py-2 text-left"
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center border ${
                    done ? 'border-amber-600 bg-amber-600' : 'border-stone-400'
                  }`}
                >
                  {done && (
                    <svg viewBox="0 0 12 12" className="h-3 w-3 fill-none stroke-white stroke-2">
                      <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className={done ? 'text-stone-400 line-through' : 'text-stone-800'}>
                  {t.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
