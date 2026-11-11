import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { etichetteEml } from '../simulazioni/etichetteEml'

/**
 * Valori discreti sull'EML: la temperatura del campione (sopra di esso) e la frequenza della corrente nella bobina.
 * Sono valori QUALITATIVI ma plausibili (ordini di grandezza dell'esperimento reale, non una misura):
 * - 25 °C a campione freddo; ~1250 °C in riscaldamento; ~1450 °C a campione liquido (lega di nichel, fusione ~1400 °C);
 * - raffreddamento: scende SOTTO la fusione (sottoraffreddamento, ~1340 °C), poi la solidificazione libera calore latente
 *   e la temperatura risale di colpo verso ~1400 °C (ricalescenza), resta lì finché non solidifica, poi si raffredda.
 * - frequenze: quadrupolo di posizionamento ~140 kHz, dipolo di riscaldamento ~380 kHz (come nei testi dei passi).
 */
const AMBIENTE = 25
const FUSIONE = 1400

type Fase = { target: number; k: number; nota?: string }

function faseTemperatura(fenomeno: string | null, calore: number | null, t: number): Fase {
  switch (fenomeno) {
    case 'posizionamento': return { target: 30, k: 1 }
    case 'campo-variabile': return { target: 30, k: 1 }
    case 'correnti-indotte': return { target: 380, k: 1 }
    case 'joule': return { target: 1250, k: 0.7 }
    case 'fusione': return { target: 1450, k: 0.9 }
    case 'oscillazione': return { target: 1450, k: 1.2 }
    case 'solidificazione':
      if (t < 3.5) return { target: 1340, k: 1.3, nota: 'sottoraffreddamento' }
      if (t < 4.3) return { target: FUSIONE, k: 8, nota: 'ricalescenza' }
      if (t < 6.8) return { target: FUSIONE - 5, k: 3, nota: 'solidificazione' }
      return { target: 500, k: 0.45 }
    default:
      return { target: AMBIENTE + (calore ?? 0) * (FUSIONE - AMBIENTE), k: 1 }
  }
}

function testoFrequenza(fenomeno: string | null): string | null {
  switch (fenomeno) {
    case 'posizionamento': case 'campo-variabile': case 'correnti-indotte': case 'oscillazione': case 'solidificazione': return '≈ 140 kHz'
    case 'joule': case 'fusione': return '≈ 140 + 380 kHz'
    default: return null
  }
}

const FREDDO = new THREE.Color('#8fe9ff')
const CALDO = new THREE.Color('#ffa24a')

interface Props { ancore: Record<string, THREE.Vector3> | null; fenomeno: string | null; calore: number | null; visibile: boolean }

export default function ValoriEml({ ancore, fenomeno, calore, visibile }: Props) {
  const et = useMemo(() => etichetteEml(), [])
  const gT = useRef<HTMLDivElement>(null)
  const numT = useRef<HTMLSpanElement>(null)
  const notaT = useRef<HTMLSpanElement>(null)
  const gF = useRef<HTMLDivElement>(null)
  const numF = useRef<HTMLSpanElement>(null)
  const T = useRef(AMBIENTE)
  const inizio = useRef({ f: fenomeno as string | null, t: 0 })
  const ultimo = useRef(0)
  const col = useMemo(() => new THREE.Color(), [])

  useFrame(({ clock }, dt) => {
    const ora = clock.elapsedTime
    if (inizio.current.f !== fenomeno) inizio.current = { f: fenomeno, t: ora }
    const fase = faseTemperatura(fenomeno, calore, ora - inizio.current.t)
    T.current += (fase.target - T.current) * Math.min(1, dt * fase.k)
    if (ora - ultimo.current < 0.1) return
    ultimo.current = ora
    const t = T.current
    if (numT.current) numT.current.textContent = `${Math.round(t / 10) * 10} °C`
    if (notaT.current) notaT.current.textContent = fase.nota ?? ''
    if (numT.current) {
      col.copy(FREDDO).lerp(CALDO, Math.min(1, Math.max(0, (t - 100) / 1100)))
      numT.current.style.color = `#${col.getHexString()}`
    }
    const f = testoFrequenza(fenomeno)
    if (gF.current) gF.current.style.display = f ? '' : 'none'
    if (numF.current && f) numF.current.textContent = f
  })

  if (!visibile || !ancore?.sample) return null
  const pc = ancore.sample.clone().add(new THREE.Vector3(0, 0.85, 0))
  const pb = ancore.sample.clone().add(new THREE.Vector3(1.2, -0.3, 0.4))
  const stile = 'valore-eml glass pointer-events-none select-none whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] leading-tight text-white/75 compatto:text-[10px]'
  return (
    <>
      <Html position={pc} center zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={gT} className={stile + ' flex flex-col items-center'}>
          <span>{et.temperatura} <span ref={numT} className="font-semibold tabular-nums">25 °C</span></span>
          <span ref={notaT} className="text-[10px] italic text-white/50 empty:hidden" />
        </div>
      </Html>
      <Html position={pb} center zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={gF} className={stile} style={{ display: 'none' }}>
          {et.frequenza} <span ref={numF} className="font-semibold tabular-nums text-cyan-200" />
        </div>
      </Html>
    </>
  )
}
