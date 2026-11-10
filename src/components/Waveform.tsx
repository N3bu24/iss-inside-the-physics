import { useEffect, useRef } from 'react'
import { analizzatore } from '../lib/ambient'
import { preferenze } from '../lib/preferenze'

const L = 72, A = 28
const BARRE = 18

/**
 * Forma d'onda dell'audio che sta suonando davvero (voce + sottofondo, dall'AnalyserNode finale di lib/ambient.ts).
 * Audio disattivato o contesto non ancora partito: linea piatta attenuata. Con "riduci animazioni" aggiorna 6 volte al secondo.
 */
export default function Waveform({ attivo, className = '' }: { attivo: boolean; className?: string }) {
  const cv = useRef<HTMLCanvasElement>(null)
  const on = useRef(attivo)
  on.current = attivo

  useEffect(() => {
    const canvas = cv.current
    if (!canvas) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = L * dpr; canvas.height = A * dpr
    const g = canvas.getContext('2d')
    if (!g) return
    g.scale(dpr, dpr)
    let raf = 0, ultimo = 0, vivo = true
    let buf: Uint8Array<ArrayBuffer> | null = null
    const liv = new Array<number>(BARRE).fill(0)

    const disegna = (t: number) => {
      if (!vivo) return
      raf = requestAnimationFrame(disegna)
      const lento = preferenze.get().riduciAnimazioni || window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (t - ultimo < (lento ? 160 : 33)) return
      ultimo = t
      const an = on.current ? analizzatore() : null
      if (an) {
        if (!buf || buf.length !== an.fftSize) buf = new Uint8Array(an.fftSize)
        an.getByteTimeDomainData(buf)
        const per = Math.floor(buf.length / BARRE)
        for (let i = 0; i < BARRE; i++) {
          let m = 0
          for (let k = 0; k < per; k++) m = Math.max(m, Math.abs(buf[i * per + k] - 128))
          // scala in decibel: il sottofondo (molto piu' basso della voce) resta visibile e la voce non satura.
          // -54 dBFS -> 0, -4 dBFS -> 1; il ronzio della stazione (~-36 dB) disegna barre basse ma vive.
          const db = m > 0 ? 20 * Math.log10(m / 128) : -100
          const v = Math.min(1, Math.max(0, (db + 54) / 50))
          liv[i] += (v - liv[i]) * 0.5
        }
      } else for (let i = 0; i < BARRE; i++) liv[i] *= 0.7
      g.clearRect(0, 0, L, A)
      const passo = L / BARRE
      const piatta = !an
      g.fillStyle = piatta ? 'rgba(53,224,255,.28)' : '#35e0ff'
      for (let i = 0; i < BARRE; i++) {
        const h = Math.max(1.5, liv[i] * (A - 4))
        g.fillRect(i * passo + 1, (A - h) / 2, passo - 3, h)
      }
    }
    raf = requestAnimationFrame(disegna)
    return () => { vivo = false; cancelAnimationFrame(raf) }
  }, [])

  return <canvas ref={cv} width={L} height={A} style={{ width: L, height: A }} className={`pointer-events-none ${attivo ? 'opacity-90' : 'opacity-50'} ${className}`} aria-hidden />
}
