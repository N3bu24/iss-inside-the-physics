import { lazy, Suspense } from 'react'

const KatexView = lazy(() => import('./KatexView'))

/** `tex` = formula in display; con `misto` = testo con formule inline $...$ (come negli approfondimenti). */
export default function Latex({ tex, misto }: { tex: string; misto?: boolean }) {
  return (
    <Suspense fallback={<div className="py-2 text-sm text-white/40">…</div>}>
      <KatexView tex={tex} misto={misto} />
    </Suspense>
  )
}
