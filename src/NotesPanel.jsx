export default function NotesPanel({ notes, onChange }) {
  return (
    <div className="border-t border-stone-300 py-5">
      <p className="mb-2 text-sm text-stone-500">Notes</p>
      <textarea
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Alarm time, what threw you off, anything worth remembering."
        rows={3}
        className="w-full resize-none border border-stone-300 bg-transparent p-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-600"
      />
    </div>
  );
}
