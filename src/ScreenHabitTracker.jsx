export default function ScreenHabitTracker({ screenClean, onToggle, streak }) {
  return (
    <div className="border-t border-stone-300 py-5">
      <p className="mb-3 text-sm text-stone-500">Screen habit</p>
      <button
        onClick={onToggle}
        className={`flex w-full items-center justify-between border px-4 py-3 text-left transition-colors ${
          screenClean
            ? 'border-emerald-600 bg-emerald-50'
            : 'border-stone-300 bg-transparent'
        }`}
      >
        <span className={screenClean ? 'text-emerald-800' : 'text-stone-800'}>
          Stayed off Instagram / YouTube today
        </span>
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            screenClean ? 'border-emerald-600 bg-emerald-600' : 'border-stone-400'
          }`}
        >
          {screenClean && (
            <svg viewBox="0 0 12 12" className="h-3 w-3 fill-none stroke-white stroke-2">
              <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      </button>
      {streak > 0 && (
        <p className="mt-2 text-sm text-stone-500">
          {streak} clean day{streak === 1 ? '' : 's'} in a row
        </p>
      )}
    </div>
  );
}
