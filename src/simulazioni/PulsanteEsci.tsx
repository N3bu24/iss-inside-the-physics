import { X } from 'lucide-react'

/** Pulsante di uscita grande e ovvio, identico in tutte le simulazioni e negli ambienti. */
export default function PulsanteEsci({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Esci dalla simulazione"
      className="pointer-events-auto flex min-h-[44px] items-center gap-2.5 rounded-full border-2 border-cyan-300 bg-white/95 px-5 py-2 text-[15px] font-semibold text-[#05101c] shadow-[0_0_26px_rgba(53,224,255,.45)] transition hover:bg-white hover:shadow-[0_0_36px_rgba(53,224,255,.7)]"
    >
      <X size={19} strokeWidth={2.6} />
      Esci
      <kbd className="rounded-md border border-b-[3px] border-[#05101c]/45 bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-bold leading-none text-[#05101c]">Esc</kbd>
    </button>
  )
}
