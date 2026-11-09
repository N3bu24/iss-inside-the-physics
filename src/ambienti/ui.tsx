import { useEffect, useRef, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { TESTI, type IdAmbiente } from './testi'

/* ---------- stile locale (slider stilizzato) ---------- */
const CSS = `
.amb-range{-webkit-appearance:none;appearance:none;width:100%;height:22px;background:transparent;cursor:pointer}
.amb-range::-webkit-slider-runnable-track{height:3px;border-radius:2px;background:linear-gradient(90deg,rgba(53,224,255,.8),rgba(255,255,255,.18))}
.amb-range::-moz-range-track{height:3px;border-radius:2px;background:rgba(255,255,255,.2)}
.amb-range::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;margin-top:-7.5px;border-radius:50%;background:#35e0ff;border:3px solid #05101c;box-shadow:0 0 14px rgba(53,224,255,.9)}
.amb-range::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#35e0ff;border:3px solid #05101c;box-shadow:0 0 14px rgba(53,224,255,.9)}
.amb-range.heat::-webkit-slider-thumb{background:#ff8a2a;box-shadow:0 0 14px rgba(255,138,42,.9)}
`

/* ---------- traccia oscilloscopio ---------- */
export class Trace {
  data: Float32Array
  head = 0
  constructor(
    public color: string,
    public label: string,
    n = 260,
  ) {
    this.data = new Float32Array(n)
  }
  push(v: number) {
    this.data[this.head] = v
    this.head = (this.head + 1) % this.data.length
  }
}

export function Scope({ traces, titolo }: { traces: Trace[]; titolo: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!
    const ctx = c.getContext('2d')!
    let raf = 0
    const draw = () => {
      raf = requestAnimationFrame(draw)
      const W = c.width,
        H = c.height
      ctx.clearRect(0, 0, W, H)
      ctx.strokeStyle = 'rgba(255,255,255,.12)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, H / 2)
      ctx.lineTo(W, H / 2)
      ctx.stroke()
      for (const t of traces) {
        const n = t.data.length
        ctx.strokeStyle = t.color
        ctx.lineWidth = 1.8
        ctx.shadowColor = t.color
        ctx.shadowBlur = 6
        ctx.beginPath()
        for (let i = 0; i < n; i++) {
          const v = Math.max(-1, Math.min(1, t.data[(t.head + i) % n]))
          const x = (i / (n - 1)) * W
          const y = H / 2 - v * H * 0.42
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
        }
        ctx.stroke()
        ctx.shadowBlur = 0
      }
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [traces])
  return (
    <div className="glass rounded-xl p-2.5 pb-2">
      <div className="mb-1 flex items-center gap-3 text-[10px] uppercase tracking-wider text-white/55">
        <span>{titolo}</span>
        {traces.map((t) => (
          <span key={t.label} style={{ color: t.color }}>
            ● {t.label}
          </span>
        ))}
      </div>
      <canvas ref={ref} width={300} height={84} className="block h-[84px] w-[300px]" />
    </div>
  )
}

/* ---------- controlli ---------- */
export function Cursore(p: {
  etichetta: string
  valore: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  testo: string
  sinistra?: string
  destra?: string
  calore?: boolean
}) {
  return (
    <div className="w-[260px]">
      <div className="mb-0.5 flex items-baseline justify-between text-xs">
        <span className="uppercase tracking-wider text-white/55">{p.etichetta}</span>
        <span className="font-medium text-white">{p.testo}</span>
      </div>
      <input
        type="range"
        className={'amb-range' + (p.calore ? ' heat' : '')}
        min={p.min}
        max={p.max}
        step={p.step ?? 0.01}
        value={p.valore}
        onChange={(e) => p.onChange(parseFloat(e.target.value))}
        aria-label={p.etichetta}
      />
      {(p.sinistra || p.destra) && (
        <div className="flex justify-between text-[10px] text-white/40">
          <span>{p.sinistra}</span>
          <span>{p.destra}</span>
        </div>
      )}
    </div>
  )
}

export function Pulsante({
  children,
  onClick,
  attivo,
}: {
  children: ReactNode
  onClick: () => void
  attivo?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={
        'rounded-full border px-5 py-2.5 text-sm font-medium backdrop-blur transition ' +
        (attivo
          ? 'border-cyan-300/80 bg-cyan-300/20 text-cyan-100 shadow-[0_0_24px_rgba(53,224,255,.35)]'
          : 'border-white/25 bg-white/5 text-white hover:border-white/50 hover:bg-white/10')
      }
    >
      {children}
    </button>
  )
}

function Formula({ tex }: { tex: string }) {
  return (
    <div
      className="overflow-x-auto py-1 text-white"
      dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { displayMode: true, throwOnError: false }) }}
    />
  )
}

/* ---------- guscio a schermo intero ---------- */
export function Shell(p: {
  id: IdAmbiente
  onClose: () => void
  didascalia: string
  controlli: ReactNode
  scope?: ReactNode
  camera?: { position: [number, number, number]; fov?: number }
  children: ReactNode
}) {
  const t = TESTI[p.id]
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && p.onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [p])
  return (
    <div className="fixed inset-0 z-50 flex bg-[#05070f] text-white" role="dialog" aria-label={t.titolo}>
      <style>{CSS}</style>
      <aside className="glass z-10 flex w-[340px] shrink-0 flex-col gap-3 overflow-y-auto rounded-none border-y-0 border-l-0 p-5 text-[13px] leading-relaxed">
        <h2 className="text-xl font-semibold leading-tight">{t.titolo}</h2>
        <p className="text-white/75">{t.intro}</p>
        <p key={p.didascalia} className="slide-in rounded-lg border-l-2 border-cyan-300/70 bg-white/5 px-3 py-2 text-white/90">
          {p.didascalia}
        </p>
        <details className="rounded-lg bg-white/5 px-3 py-2">
          <summary className="cursor-pointer select-none text-xs uppercase tracking-wider text-cyan-200/80">
            La formula
          </summary>
          <Formula tex={t.formula} />
          <p className="text-xs text-white/60">{t.formulaNota}</p>
        </details>
        <div className="mt-auto space-y-1 border-t border-white/10 pt-3 text-[11px] text-white/55">
          <p>{t.agenda}</p>
          <p>Teoria: {t.slide}</p>
        </div>
      </aside>
      <div className="relative min-w-0 flex-1">
        <Canvas camera={{ position: p.camera?.position ?? [0, 3, 12], fov: p.camera?.fov ?? 45 }} dpr={[1, 1.5]}>
          <color attach="background" args={['#05070f']} />
          {p.children}
        </Canvas>
        <div className="pointer-events-none absolute right-4 top-4 flex items-center gap-3">
          <span className="glass rounded-full px-3 py-1 text-[11px] uppercase tracking-wider text-white/70">
            Simulazione concettuale
          </span>
          <button
            onClick={p.onClose}
            className="glass pointer-events-auto rounded-full px-4 py-1.5 text-xs text-white hover:bg-white/15"
            aria-label="Chiudi (Esc)"
          >
            Chiudi · Esc
          </button>
        </div>
        {p.scope && <div className="absolute left-4 top-4">{p.scope}</div>}
        <div className="glass absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-8 rounded-2xl px-6 py-3">
          {p.controlli}
        </div>
      </div>
    </div>
  )
}
