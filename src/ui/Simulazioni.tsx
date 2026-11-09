import { Component, Suspense, type ReactNode } from 'react'
import { componenteSimulazione } from '../simulazioni'

type Props = { onClose: () => void }

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

/**
 * Simulazione a schermo intero con l'id indicato nella scheda. Il registro (src/simulazioni/index.ts)
 * fornisce già il componente caricato con lazy(): niente secondo lazy (causava l'errore React #306).
 * Chiusura (Esc, pulsante "Chiudi") e intestazione sono gestite da ogni simulazione tramite SimulazioneShell.
 */
export default function SimulazioneOverlay({ id, onClose }: { id: string; onClose: () => void }) {
  const Comp = componenteSimulazione(id)
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
