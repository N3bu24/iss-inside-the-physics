import { Component, lazy, Suspense, useEffect, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react'
import { X } from 'lucide-react'
import type { AmbienteId } from '../data/stazione'
import AmbienteOverlay from './Ambienti'

type Props = { onClose: () => void }
type Voce = { id?: string; Componente?: ComponentType<Props>; Component?: ComponentType<Props>; componente?: ComponentType<Props> }

/**
 * Registri delle simulazioni: src/simulazioni/index.ts e src/ambienti/index.ts (li scrive un altro agente).
 * import.meta.glob non fallisce se i file mancano; il registro e` cercato in modo tollerante
 * (qualsiasi export che sia un array di { id, Componente } o un oggetto id -> componente).
 */
const registri = import.meta.glob(['/src/simulazioni/index.ts', '/src/simulazioni/index.tsx', '/src/ambienti/index.ts']) as Record<string, () => Promise<Record<string, unknown>>>
const AMBIENTI_NOTI: AmbienteId[] = ['campo', 'energia', 'levitazione', 'rmn']

async function cerca(id: string): Promise<ComponentType<Props> | null> {
  for (const carica of Object.values(registri)) {
    let mod: Record<string, unknown>
    try { mod = await carica() } catch { continue }
    for (const val of Object.values(mod)) {
      if (Array.isArray(val)) {
        const v = (val as Voce[]).find((x) => x && x.id === id)
        const c = v?.Componente ?? v?.Component ?? v?.componente
        if (c) return c
      } else if (val && typeof val === 'object' && !('$$typeof' in (val as object))) {
        const v = (val as Record<string, unknown>)[id] as Voce | ComponentType<Props> | undefined
        if (v && typeof v === 'function') return v as ComponentType<Props>
        if (v && typeof v === 'object') { const c = (v as Voce).Componente ?? (v as Voce).Component; if (c) return c }
      }
    }
  }
  return null
}

function Fallback({ onClose }: Props) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="glass max-w-md rounded-2xl p-8 text-center">
        <h2 className="text-xl font-semibold">Simulazione in arrivo</h2>
        <p className="mt-2 text-sm text-white/65">Questa simulazione non è ancora disponibile. Intanto continua a esplorare la stazione.</p>
        <button className="btn-ghost mt-6 !py-2" onClick={onClose}>Torna alla scheda</button>
      </div>
    </div>
  )
}

class Barriera extends Component<{ onClose: () => void; children: ReactNode }, { errore: boolean }> {
  state = { errore: false }
  static getDerivedStateFromError() { return { errore: true } }
  render() { return this.state.errore ? <Fallback onClose={this.props.onClose} /> : this.props.children }
}

const cache = new Map<string, LazyExoticComponent<ComponentType<Props>>>()
function componentePer(id: string) {
  let c = cache.get(id)
  if (!c) {
    c = lazy(async () => ({ default: (await cerca(id)) ?? Fallback }))
    cache.set(id, c)
  }
  return c
}

function Generica({ id, onClose }: { id: string; onClose: () => void }) {
  const Comp = componentePer(id)
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="fade-in absolute inset-0 z-[55] bg-[#05070f]">
      <Barriera onClose={onClose}>
        <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-white/40">Caricamento…</div>}>
          <Comp onClose={onClose} />
        </Suspense>
      </Barriera>
      <button onClick={onClose} aria-label="Chiudi la simulazione" className="glass absolute right-4 top-12 z-[60] rounded-full p-2 text-white/70 hover:text-white"><X size={18} /></button>
    </div>
  )
}

/** Simulazione a schermo intero con l'id indicato nella scheda (ambiente interattivo noto oppure registro delle simulazioni). */
export default function SimulazioneOverlay({ id, onClose }: { id: string; onClose: () => void }) {
  if (AMBIENTI_NOTI.includes(id as AmbienteId)) return <AmbienteOverlay id={id as AmbienteId} onClose={onClose} />
  return <Generica id={id} onClose={onClose} />
}
