import { Component, Suspense, type ReactNode } from 'react'
import { componenteSimulazione } from '../simulazioni'
import { useEscape } from '../simulazioni/useEscape'

type Props = { onClose: () => void }

function Fallback({ onClose, onRiprova }: Props & { onRiprova?: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="glass max-w-md rounded-2xl p-8 text-center">
        <h2 className="text-xl font-semibold">Non è stato possibile caricare la simulazione</h2>
        <p className="mt-2 text-sm text-white/65">Può dipendere da una connessione lenta o dalla scheda grafica. Riprova: il resto del sito non è toccato.</p>
        <div className="mt-6 flex justify-center gap-3">
          {onRiprova && <button className="btn-primary !px-5 !py-2" onClick={onRiprova}>Riprova</button>}
          <button className="btn-ghost !py-2" onClick={onClose}>Chiudi</button>
        </div>
      </div>
    </div>
  )
}

class Barriera extends Component<{ onClose: () => void; children: ReactNode }, { errore: boolean }> {
  state = { errore: false }
  static getDerivedStateFromError() { return { errore: true } }
  componentDidCatch(e: unknown) { console.error('[Simulazione] errore di caricamento o di rendering:', e) }
  render() { return this.state.errore ? <Fallback onClose={this.props.onClose} onRiprova={() => this.setState({ errore: false })} /> : this.props.children }
}

/**
 * Simulazione a schermo intero con l'id indicato nella scheda. Il registro (src/simulazioni/index.ts)
 * fornisce già il componente caricato con lazy(): niente secondo lazy (causava l'errore React #306).
 * Esc e pulsante "Esci" sono gestiti da ogni simulazione (LayoutSimulazione); qui resta solo il ripiego.
 */
export default function SimulazioneOverlay({ id, onClose }: { id: string; onClose: () => void }) {
  const Comp = componenteSimulazione(id)
  // ripiego: se la simulazione non è montata (errore, caricamento) Esc la chiude; le simulazioni hanno un gestore di priorità più alta
  useEscape(() => { onClose(); return true }, 0)
  return (
    <div className="fade-in absolute inset-0 z-[55] bg-[#05070f]">
      <Barriera onClose={onClose}>
        {Comp ? (
          <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-white/40">Caricamento…</div>}>
            <Comp onClose={onClose} />
          </Suspense>
        ) : (
          <Fallback onClose={onClose} />
        )}
      </Barriera>
    </div>
  )
}
