import { Component, lazy, Suspense, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react'
import type { AmbienteId } from '../data/stazione'
import { useEscape } from '../lib/useEscape'

type Props = { onClose: () => void }

/** Moduli src/ambienti/Ambiente*.tsx: la glob non fallisce se i file non esistono ancora. */
const moduli = import.meta.glob('/src/ambienti/Ambiente*.tsx') as Record<string, () => Promise<{ default: ComponentType<Props> }>>
const NOMI: Record<AmbienteId, string> = { campo: 'AmbienteCampo', energia: 'AmbienteEnergia', levitazione: 'AmbienteLevitazione', rmn: 'AmbienteRmn' }

function Fallback({ onClose }: Props) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="glass max-w-md rounded-2xl p-8 text-center">
        <h2 className="text-xl font-semibold">Ambiente in arrivo</h2>
        <p className="mt-2 text-sm text-white/65">Questo ambiente interattivo non è ancora disponibile. Torna presto: intanto continua a esplorare la stazione.</p>
        <button className="btn-ghost mt-6 !py-2" onClick={onClose}>Chiudi</button>
      </div>
    </div>
  )
}

const cache = new Map<AmbienteId, LazyExoticComponent<ComponentType<Props>>>()
function componentePer(id: AmbienteId) {
  let c = cache.get(id)
  if (!c) {
    const chiave = Object.keys(moduli).find((k) => k.endsWith(`/${NOMI[id]}.tsx`))
    c = lazy(async () => {
      try { return chiave ? await moduli[chiave]() : { default: Fallback } } catch { return { default: Fallback } }
    })
    cache.set(id, c)
  }
  return c
}

class Barriera extends Component<{ onClose: () => void; children: ReactNode }, { errore: boolean }> {
  state = { errore: false }
  static getDerivedStateFromError() { return { errore: true } }
  componentDidCatch(e: unknown) { console.error('[Ambiente] errore di caricamento o di rendering:', e) }
  render() { return this.state.errore ? <Fallback onClose={this.props.onClose} /> : this.props.children }
}

/** Ambiente interattivo a schermo intero, caricato solo al bisogno. */
export default function AmbienteOverlay({ id, onClose }: { id: AmbienteId; onClose: () => void }) {
  const Comp = componentePer(id)
  // ripiego: l'Esc degli ambienti (LayoutSimulazione) ha priorità più alta; qui serve solo se l'ambiente non è montato
  useEscape(() => { onClose(); return true }, 0)
  return (
    <div className="fade-in absolute inset-0 z-[55] bg-[#05070f]">
      <Barriera onClose={onClose}>
        <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-white/40">Caricamento…</div>}>
          <Comp onClose={onClose} />
        </Suspense>
      </Barriera>
    </div>
  )
}
