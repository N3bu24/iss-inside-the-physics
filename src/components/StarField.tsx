import { useEffect, useRef } from 'react'

/**
 * Cielo stellato della schermata iniziale: canvas 2D leggero (niente Three.js nel chunk iniziale).
 * Le stelle ruotano lentamente attorno al centro e scintillano appena.
 */
export default function StarField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current!
    const ctx = c.getContext('2d')!
    const stelle = Array.from({ length: 900 }, () => ({
      a: Math.random() * Math.PI * 2,
      r: Math.sqrt(Math.random()),
      s: 0.4 + Math.random() * 1.3,
      f: Math.random() * Math.PI * 2,
    }))
    let w = 0, h = 0, raf = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = c.clientWidth; h = c.clientHeight
      c.width = w * dpr; c.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)
    const t0 = performance.now()
    const frame = (now: number) => {
      const t = (now - t0) / 1000
      ctx.clearRect(0, 0, w, h)
      const R = Math.hypot(w, h) / 2
      for (const s of stelle) {
        const a = s.a + t * 0.01
        const x = w / 2 + Math.cos(a) * s.r * R
        const y = h / 2 + Math.sin(a) * s.r * R
        ctx.globalAlpha = 0.45 + 0.4 * Math.sin(t * 1.5 + s.f)
        ctx.fillStyle = '#cfe8ff'
        ctx.fillRect(x, y, s.s, s.s)
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={ref} className="h-full w-full" />
}
