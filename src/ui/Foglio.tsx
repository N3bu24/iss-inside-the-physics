import { useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { PRIORITA_PANNELLO, useEscape } from '../lib/useEscape'

/**
 * Maniglia dei fogli: tocco = chiude, trascinamento verso il basso = chiude.
 * Sposta il contenitore (l'elemento padre) mentre si trascina. Solo per telefono e tablet.
 */
export function Maniglia({ onClose }: { onClose: () => void }) {
  const y0 = useRef<number | null>(null)
  const muovi = (e: React.PointerEvent<HTMLButtonElement>, dy: number) => {
    const p = e.currentTarget.parentElement
    if (p) { p.style.transition = ''; p.style.transform = dy > 0 ? `translateY(${dy}px)` : '' }
  }
  return (
    <button
      type="button" className="foglio-maniglia" aria-label="Chiudi il pannello"
      onPointerDown={(e) => { y0.current = e.clientY; e.currentTarget.setPointerCapture(e.pointerId) }}
      onPointerMove={(e) => { if (y0.current !== null) muovi(e, e.clientY - y0.current) }}
      onPointerUp={(e) => {
        const dy = y0.current === null ? 0 : e.clientY - y0.current
        y0.current = null
        if (Math.abs(dy) < 6 || dy > 70) onClose()
        else muovi(e, 0)
      }}
      onPointerCancel={(e) => { y0.current = null; muovi(e, 0) }}
    />
  )
}

/**
 * Pannello dal basso (telefono e tablet in verticale) o laterale (in orizzontale): sfondo che si tocca per chiudere,
 * maniglia, testata fissa con titolo e X grande, corpo scorrevole. Esc chiude.
 */
export default function Foglio({ titolo, sottotitolo, onClose, children, piede, senzaSfondo = false, sopra = false }: {
  titolo: string; sottotitolo?: string; onClose: () => void; children: ReactNode; piede?: ReactNode; senzaSfondo?: boolean; sopra?: boolean
}) {
  useEscape(() => { onClose(); return true }, PRIORITA_PANNELLO)
  return (
    <>
      {!senzaSfondo && <div className="foglio-sfondo fade-in" style={sopra ? { zIndex: 69 } : undefined} onClick={onClose} aria-hidden />}
      <aside role="dialog" aria-label={titolo} className="foglio glass pannello-opaco slide-in" style={{ background: 'rgba(7,12,26,.96)', ...(sopra ? { zIndex: 70 } : {}) }}>
        <Maniglia onClose={onClose} />
        <header className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4 pb-2.5 pt-1 landscape:pt-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold leading-tight">{titolo}</h2>
            {sottotitolo && <p className="truncate text-xs text-white/50">{sottotitolo}</p>}
          </div>
          <button onClick={onClose} aria-label="Chiudi" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/20 bg-white/5 text-white/80 active:bg-white/15"><X size={20} /></button>
        </header>
        <div className="scroll-sottile min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-3">{children}</div>
        {piede && <footer className="shrink-0 border-t border-white/10 px-4 py-3">{piede}</footer>}
      </aside>
    </>
  )
}
