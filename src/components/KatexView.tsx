import katex from 'katex'
import 'katex/dist/katex.min.css'

const rendi = (tex: string, display: boolean) => katex.renderToString(tex, { displayMode: display, throwOnError: false })

/** Caricato in lazy da Latex.tsx: KaTeX e il suo CSS restano fuori dal chunk iniziale. */
export default function KatexView({ tex, misto }: { tex: string; misto?: boolean }) {
  if (!misto) return <div className="text-white" dangerouslySetInnerHTML={{ __html: rendi(tex, true) }} />
  // testo con formule inline racchiuse tra $...$
  const parti = tex.split(/\$([^$]+)\$/g)
  return (
    <p className="text-[15px] leading-relaxed text-white/85">
      {parti.map((p, i) =>
        i % 2 ? <span key={i} dangerouslySetInnerHTML={{ __html: rendi(p, false) }} /> : <span key={i}>{p}</span>,
      )}
    </p>
  )
}
