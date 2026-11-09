export default function AudioToggle({ on, onToggle, className = '' }: { on: boolean; onToggle: () => void; className?: string }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      title={on ? 'Disattiva audio e voce narrante' : 'Attiva audio e voce narrante'}
      className={`glass flex items-center gap-2 rounded-full px-4 py-2 text-xs text-white/80 transition hover:text-white ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M11 5 6 9H2v6h4l5 4V5z" />
        {on ? <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /> : <path d="m16 9 6 6m0-6-6 6" />}
      </svg>
      {on ? 'Audio attivo' : 'Audio disattivato'}
    </button>
  )
}
