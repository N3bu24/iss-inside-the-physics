import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { assetExists } from '../lib/assets'

/** Slot voce narrante: se esiste public/audio/simulazioni/<id>.mp3 compare il pulsante on/off. */
export default function Voce({ id }: { id: string }) {
  const url = `/audio/simulazioni/${id}.mp3`
  const [esiste, setEsiste] = useState(false)
  const [on, setOn] = useState(true)
  const audio = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    let vivo = true
    assetExists(url).then((e) => vivo && setEsiste(e))
    return () => {
      vivo = false
      audio.current?.pause()
      audio.current = null
    }
  }, [url])

  useEffect(() => {
    if (!esiste) return
    if (!audio.current) audio.current = new Audio(url)
    const a = audio.current
    if (on) a.play().catch(() => setOn(false))
    else a.pause()
  }, [esiste, on, url])

  if (!esiste) return null
  return (
    <button
      onClick={() => setOn(!on)}
      className="glass pointer-events-auto flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-white hover:bg-white/15"
      aria-pressed={on}
      aria-label={on ? 'Spegni la voce narrante' : 'Accendi la voce narrante'}
    >
      {on ? <Volume2 size={15} /> : <VolumeX size={15} />} Voce
    </button>
  )
}
