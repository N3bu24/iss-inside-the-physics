import { useImperativeHandle, useRef, type Ref } from 'react'

export interface FxApi {
  /** tutti i valori in 0..1 */
  imposta(v: { vignetta?: number; scie?: number; copertura?: number; video?: number }): void
  /** contenitore dove inserire l'eventuale <video> di volo */
  videoHost(): HTMLDivElement | null
}

/**
 * Effetti della transizione di volo, sopra il panorama: vignettatura, scie radiali (sensazione di velocità),
 * copertura per la dissolvenza e contenitore del video di volo a schermo intero.
 * Si pilota con l'API imperativa (a ogni frame, senza passare da React).
 */
export default function VoloFx({ ref }: { ref?: Ref<FxApi> }) {
  const vig = useRef<HTMLDivElement>(null)
  const scie = useRef<HTMLDivElement>(null)
  const cop = useRef<HTMLDivElement>(null)
  const vid = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    imposta: ({ vignetta, scie: s, copertura, video }) => {
      if (vignetta !== undefined && vig.current) vig.current.style.opacity = String(vignetta)
      if (s !== undefined && scie.current) {
        scie.current.style.opacity = String(Math.min(1, s) * 0.55)
        scie.current.style.transform = `scale(${1 + s * 0.9}) rotate(${s * 6}deg)`
      }
      if (copertura !== undefined && cop.current) cop.current.style.opacity = String(copertura)
      if (video !== undefined && vid.current) vid.current.style.opacity = String(video)
    },
    videoHost: () => vid.current,
  }), [])

  return (
    <div className="pointer-events-none absolute inset-0 z-[35] overflow-hidden">
      <div ref={vig} className="absolute inset-0 opacity-0" style={{ background: 'radial-gradient(ellipse at center, rgba(2,4,12,0) 18%, rgba(2,4,12,.55) 55%, rgba(2,4,12,.97) 92%)' }} />
      <div
        ref={scie}
        className="absolute -inset-[20%] opacity-0"
        style={{
          background: 'repeating-conic-gradient(from 0deg at 50% 50%, rgba(170,215,255,0) 0deg 3deg, rgba(170,215,255,.35) 3.4deg 3.8deg, rgba(170,215,255,0) 4.2deg 9deg)',
          WebkitMaskImage: 'radial-gradient(circle at center, transparent 22%, #000 72%)',
          maskImage: 'radial-gradient(circle at center, transparent 22%, #000 72%)',
        }}
      />
      <div ref={cop} className="absolute inset-0 opacity-0" style={{ background: 'radial-gradient(circle at center, #16233d 0%, #03060e 75%)' }} />
      <div ref={vid} className="absolute inset-0 bg-black opacity-0" />
    </div>
  )
}
