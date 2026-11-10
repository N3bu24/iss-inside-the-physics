import { useEffect, useRef, type ReactNode } from 'react'

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
      <div className="mb-1 flex flex-wrap items-center gap-x-3 text-[10px] uppercase tracking-wider text-white/55">
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
    <div className="w-[260px] tel:w-[212px] tab:w-[240px] compatto:shrink-0">
      <div className="mb-0.5 flex items-baseline justify-between text-xs compatto:gap-2 compatto:whitespace-nowrap compatto:text-[11px]">
        <span className="uppercase tracking-wider compatto:tracking-[0.04em] text-white/55">{p.etichetta}</span>
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
        <div className="flex justify-between text-[10px] text-white/40 tel:hidden">
          <span>{p.sinistra}</span>
          <span>{p.destra}</span>
        </div>
      )}
    </div>
  )
}

export function Pulsante({ children, onClick, attivo }: { children: ReactNode; onClick: () => void; attivo?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={
        'rounded-full border px-4 py-1.5 compatto:min-h-[44px] compatto:shrink-0 compatto:whitespace-nowrap text-[13px] font-medium backdrop-blur transition ' +
        (attivo
          ? 'border-cyan-300/80 bg-cyan-300/20 text-cyan-100 shadow-[0_0_24px_rgba(53,224,255,.35)]'
          : 'border-white/25 bg-white/5 text-white hover:border-white/50 hover:bg-white/10')
      }
    >
      {children}
    </button>
  )
}
