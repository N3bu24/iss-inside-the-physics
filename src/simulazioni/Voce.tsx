import { useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { assetExists } from '../lib/assets'
import { collegaVoce, seguiVoce, impostaInSimulazione } from '../lib/ambient'
import { annunciaVoce, congedaVoce, fermaVoce, useAudioGlobale } from '../lib/audioGlobale'

/**
 * Slot voce narrante: se esiste public/audio/simulazioni/<id>.mp3 compare il pulsante on/off.
 * Ogni simulazione monta questo componente, quindi qui si gestisce anche la musica calma di sottofondo
 * (dissolvenza incrociata in entrata e in uscita) e si ferma la voce del punto/modulo che era in corso.
 *
 * Affidabilita`: l'elemento Audio nasce e muore dentro l'effetto (nessun riuso tra i cicli di StrictMode),
 * un play() interrotto (AbortError) non spegne mai la voce; solo un autoplay realmente bloccato
 * (NotAllowedError) mette il pulsante in evidenza ("Tocca per ascoltare").
 */
export default function Voce({ id }: { id: string }) {
  const url = `/audio/simulazioni/${id}.mp3`
  const [esiste, setEsiste] = useState(false)
  const [on, setOn] = useState(true)
  const [bloccata, setBloccata] = useState(false)
  const [el, setEl] = useState<HTMLAudioElement | null>(null)
  const globale = useAudioGlobale()
  const attiva = on && globale

  // musica della simulazione al posto del sottofondo; la voce di prima si interrompe
  useEffect(() => {
    fermaVoce()
    impostaInSimulazione(true)
    return () => impostaInSimulazione(false)
  }, [])

  useEffect(() => {
    let vivo = true
    let nuovo: HTMLAudioElement | null = null
    assetExists(url).then((e) => {
      if (!vivo) return
      setEsiste(e)
      if (!e) return
      nuovo = new Audio(url)
      nuovo.preload = 'auto'
      seguiVoce(nuovo)
      nuovo.addEventListener('play', () => { collegaVoce(nuovo!); annunciaVoce(nuovo!, () => nuovo?.pause()) })
      nuovo.addEventListener('ended', () => congedaVoce(nuovo!))
      setEl(nuovo)
    })
    return () => {
      vivo = false
      if (nuovo) { nuovo.pause(); congedaVoce(nuovo); nuovo.removeAttribute('src'); nuovo.load() }
      setEl(null)
    }
  }, [url])

  useEffect(() => {
    if (!el) return
    if (!attiva) { el.pause(); return }
    if (el.ended) return
    el.play().then(() => setBloccata(false)).catch((err: unknown) => {
      // AbortError = interrotto da una pausa/cambio sorgente: normale, non e` un rifiuto
      if ((err as { name?: string })?.name === 'NotAllowedError') setBloccata(true)
    })
  }, [el, attiva])

  if (!esiste) return null
  const tocca = bloccata && attiva
  return (
    <button
      onClick={() => {
        if (tocca && el) { el.play().then(() => setBloccata(false)).catch(() => {}); return }
        setOn(!on)
      }}
      className={`glass pointer-events-auto flex items-center gap-2 rounded-full px-3 py-1.5 compatto:min-h-[44px] tel:min-w-[44px] tel:justify-center text-xs text-white hover:bg-white/15 ${tocca ? 'ring-1 ring-cyan-300/70 animate-pulse' : ''}`}
      aria-pressed={attiva}
      aria-label={tocca ? 'Avvia la voce narrante' : attiva ? 'Spegni la voce narrante' : 'Accendi la voce narrante'}
    >
      {attiva ? <Volume2 size={15} /> : <VolumeX size={15} />} <span className="tel:hidden">{tocca ? 'Tocca per ascoltare' : 'Voce'}</span>
    </button>
  )
}
