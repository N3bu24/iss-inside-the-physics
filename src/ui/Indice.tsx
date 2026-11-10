import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Lock, Search, X } from 'lucide-react'
import { nodi, tappeSuggerite, type NodoId } from '../data/stazione'
import { hotspotDi, luogoDi } from '../data/contenuti'
import { guidaSimulazione, introSimulazione, moduliChiusi } from '../data/extra'
import { iconaSim } from '../data/iconeSim'
import { SIMULAZIONI } from '../simulazioni'
import { passiSimulazione } from '../simulazioni/passi'
import { pulisciFormula } from '../simulazioni/contenuto'
import Badge from '../components/Badge'
import CorpoScheda from '../components/CorpoScheda'
import Latex from '../components/Latex'
import { BollinoSim, CATEGORIE } from './Hotspot'

interface Props {
  onClose: () => void
  /** viaggio rapido fin lì; con `scheda` apre anche la scheda del punto */
  onVai: (nodo: NodoId, scheda?: string) => void
  onSimulazione: (id: string) => void
  /** una simulazione e` aperta sopra l'indice: Esc non lo chiude */
  sospeso?: boolean
}

const ORDINE: NodoId[] = tappeSuggerite.map((t) => t.nodo)
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

function Sezione({ id, titolo, children }: { id: string; titolo: string; children: React.ReactNode }) {
  return (
    <section id={id} className="indice-sez mb-14">
      <h2 className="mb-6 border-b border-white/15 pb-2 text-[12px] font-medium uppercase tracking-[0.28em] text-cyan-200/90">{titolo}</h2>
      {children}
    </section>
  )
}

/**
 * Indice di tutti i contenuti: ambienti, punti di interesse (testo completo), simulazioni, moduli non visitabili.
 * Overlay a tutto schermo con testata fissa (titolo, ricerca, X), sommario laterale e colonna di lettura. Esc chiude.
 */
export default function Indice({ onClose, onVai, onSimulazione, sospeso = false }: Props) {
  const [q, setQ] = useState('')
  const corpo = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (sospeso) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose, sospeso])

  const luoghi = useMemo(() => ORDINE.map((id) => ({ id, luogo: luogoDi(id), punti: hotspotDi(id) })), [])
  const sims = useMemo(() => SIMULAZIONI.map((s) => ({ id: s.id, titolo: s.titolo, intro: introSimulazione(s.id).intro, passi: passiSimulazione(s.id), guida: guidaSimulazione(s.id) })), [])

  const nq = norm(q.trim())
  const corrisponde = (...testi: (string | undefined)[]) => !nq || testi.some((t) => t && norm(t).includes(nq))
  const luoghiF = luoghi.filter((l) => corrisponde(l.luogo.nome, l.luogo.sottotitolo, l.luogo.voce, ...l.luogo.punti))
  const puntiF = luoghi.map((l) => ({ ...l, punti: l.punti.filter((h) => corrisponde(h.titolo, h.breve, ...(h.paragrafi ?? []), ...h.punti, h.fonte)) })).filter((l) => l.punti.length)
  const simsF = sims.filter((s) => corrisponde(s.titolo, s.intro, ...s.passi.map((p) => p.titolo + ' ' + p.testo)))
  const chiusiF = moduliChiusi.filter((m) => corrisponde(m.nome, m.ruolo, m.nota))
  const nessuno = !luoghiF.length && !puntiF.length && !simsF.length && !chiusiF.length

  const vaiA = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="absolute inset-0 z-[150] flex flex-col bg-[#04070f] pt-10" role="dialog" aria-label="Indice dei contenuti">
      <header className="flex shrink-0 items-center gap-5 border-b border-white/10 px-8 py-3">
        <h1 className="text-xl font-semibold tracking-tight">Indice dei contenuti</h1>
        <p className="hidden text-[13px] text-white/45 lg:block">Tutto ciò che si può scoprire nella stazione, da leggere anche senza esplorare.</p>
        <label className="relative ml-auto w-72 max-w-[40vw]">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca (es. Lenz, Joule, Columbus)" aria-label="Cerca nei contenuti"
            className="w-full rounded-full border border-white/15 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/35 focus:border-cyan-300/60 focus:outline-none" />
        </label>
        <button onClick={onClose} aria-label="Chiudi l'indice" title="Chiudi (Esc)" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/5 text-white/80 hover:bg-white/15 hover:text-white"><X size={20} /></button>
      </header>

      <div className="flex min-h-0 flex-1">
        <nav aria-label="Sommario" className="scroll-sottile hidden w-64 shrink-0 overflow-y-auto border-r border-white/10 px-6 py-6 text-[13.5px] md:block">
          <ul className="space-y-1">
            {luoghiF.length > 0 && <li><button onClick={() => vaiA('ix-ambienti')} className="w-full py-1 text-left text-white/85 hover:text-cyan-200">Ambienti</button></li>}
            {puntiF.length > 0 && (
              <li>
                <button onClick={() => vaiA('ix-punti')} className="w-full py-1 text-left text-white/85 hover:text-cyan-200">Punti di interesse</button>
                <ul className="mb-1 ml-3 border-l border-white/10 pl-3">
                  {puntiF.map((l) => <li key={l.id}><button onClick={() => vaiA(`ix-p-${l.id}`)} className="w-full py-0.5 text-left text-white/55 hover:text-white">{l.luogo.nome}</button></li>)}
                </ul>
              </li>
            )}
            {simsF.length > 0 && (
              <li>
                <button onClick={() => vaiA('ix-sim')} className="w-full py-1 text-left text-white/85 hover:text-cyan-200">Simulazioni</button>
                <ul className="mb-1 ml-3 border-l border-white/10 pl-3">
                  {simsF.map((s) => { const ic = iconaSim(s.id); return <li key={s.id}><button onClick={() => vaiA(`ix-s-${s.id}`)} className="flex w-full items-center gap-1.5 py-0.5 text-left text-white/55 hover:text-white"><ic.Icon size={12} style={{ color: ic.colore }} />{ic.titolo}</button></li> })}
                </ul>
              </li>
            )}
            {chiusiF.length > 0 && <li><button onClick={() => vaiA('ix-chiusi')} className="w-full py-1 text-left text-white/85 hover:text-cyan-200">Moduli non visitabili</button></li>}
          </ul>
        </nav>

        <div ref={corpo} className="scroll-sottile min-w-0 flex-1 overflow-y-auto px-8 py-8">
          <div className="mx-auto max-w-[780px]">
            {nessuno && <p className="py-20 text-center text-white/50">Nessun risultato per «{q}».</p>}

            {luoghiF.length > 0 && (
              <Sezione id="ix-ambienti" titolo="Ambienti">
                <div className="space-y-8">
                  {luoghiF.map(({ id, luogo }) => (
                    <article key={id}>
                      <div className="flex items-start gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-2xl font-semibold leading-tight">{luogo.nome}</h3>
                          <p className="mt-1 text-[14px] text-white/55">{luogo.sottotitolo}</p>
                        </div>
                        <button onClick={() => onVai(id)} className="mt-1 flex shrink-0 items-center gap-1.5 rounded-full border border-cyan-300/40 px-3.5 py-1.5 text-[13px] text-cyan-100 hover:bg-cyan-300/10">Vai <ArrowRight size={14} /></button>
                      </div>
                      {luogo.punti.length > 0 && (
                        <ul className="testo-corpo mt-3 space-y-2">
                          {luogo.punti.map((p, i) => <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-white/80"><span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />{p}</li>)}
                        </ul>
                      )}
                      {luogo.voce && <p className="testo-corpo mt-3 border-l-2 border-white/15 pl-4 text-[15px] italic leading-relaxed text-white/65">{luogo.voce}</p>}
                      <div className="mt-3 flex flex-wrap items-center gap-3"><Badge tipo={luogo.badge} />{luogo.badgeExtra && <Badge tipo={luogo.badgeExtra} />}{luogo.nota && <span className="text-[11px] text-white/45">{luogo.nota}</span>}{luogo.fonte && <span className="text-[11px] text-white/40">Fonte: {luogo.fonte}</span>}</div>
                    </article>
                  ))}
                </div>
              </Sezione>
            )}

            {puntiF.length > 0 && (
              <Sezione id="ix-punti" titolo="Punti di interesse">
                {puntiF.map((l) => (
                  <div key={l.id} id={`ix-p-${l.id}`} className="indice-sez mb-12">
                    <h3 className="mb-5 text-lg font-medium text-white/90">{l.luogo.nome}</h3>
                    <div className="space-y-9">
                      {l.punti.map((h) => {
                        const { Icon, colore, etichetta } = CATEGORIE[h.categoria]
                        const sim = h.simulazione ? iconaSim(h.simulazione) : null
                        return (
                          <article key={h.id} className="rounded-2xl border border-white/10 bg-white/[.03] p-6">
                            <div className="flex items-start gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: colore }}><Icon size={14} /> {etichetta}</div>
                                <h4 className="mt-1.5 text-xl font-semibold leading-tight">{h.titolo}</h4>
                              </div>
                              <button onClick={() => onVai(l.id, h.id)} className="flex shrink-0 items-center gap-1.5 rounded-full border border-cyan-300/40 px-3.5 py-1.5 text-[13px] text-cyan-100 hover:bg-cyan-300/10">Vai <ArrowRight size={14} /></button>
                            </div>
                            <div className="mt-3"><CorpoScheda scheda={h} colore={colore} /></div>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                              <Badge tipo={h.badge} />
                              {sim && h.simulazione && (
                                <button onClick={() => onSimulazione(h.simulazione!)} className="flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-[12.5px] text-white/80 hover:bg-white/10">
                                  <span className="bollino-in-riga flex"><BollinoSim simulazione={h.simulazione} size={20} /></span>Simulazione: {sim.titolo}
                                </button>
                              )}
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </Sezione>
            )}

            {simsF.length > 0 && (
              <Sezione id="ix-sim" titolo="Simulazioni">
                <div className="space-y-12">
                  {simsF.map((s) => {
                    const ic = iconaSim(s.id)
                    return (
                      <article key={s.id} id={`ix-s-${s.id}`} className="indice-sez">
                        <div className="flex items-start gap-4">
                          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-[3px] bg-[#05080f]" style={{ borderColor: ic.colore }}><ic.Icon size={22} color="#fff" /></span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: ic.colore }}>{ic.titolo}</div>
                            <h3 className="text-xl font-semibold leading-tight">{s.titolo}</h3>
                          </div>
                          <button onClick={() => onSimulazione(s.id)} className="flex shrink-0 items-center gap-1.5 rounded-full border border-cyan-300/40 px-3.5 py-1.5 text-[13px] text-cyan-100 hover:bg-cyan-300/10">Apri simulazione <ArrowRight size={14} /></button>
                        </div>
                        {s.intro && <p className="testo-corpo mt-3 text-[15px] leading-relaxed text-white/75">{s.intro}</p>}
                        {s.guida && (
                          <div className="mt-4 rounded-xl border border-white/10 bg-white/[.03] p-4 text-[14px] leading-relaxed text-white/75">
                            <div className="mb-1 text-[11px] uppercase tracking-[0.16em] text-white/45">Come si usa</div>
                            {s.guida.come_si_usa && <p className="testo-corpo">{s.guida.come_si_usa}</p>}
                            {s.guida.comandi.length > 0 && (
                              <ul className="testo-corpo mt-2 space-y-1">
                                {s.guida.comandi.map((c, i) => <li key={i}><span className="font-medium text-white/90">{c.nome}</span>{c.cosa_fa && <> — {c.cosa_fa}</>}</li>)}
                              </ul>
                            )}
                            {s.guida.cosa_dimostra && <p className="testo-corpo mt-2 text-white/65"><span className="text-white/85">Che cosa dimostra: </span>{s.guida.cosa_dimostra}</p>}
                          </div>
                        )}
                        <ol className="mt-5 space-y-5">
                          {s.passi.map((p, i) => {
                            const f = pulisciFormula(p.formula)
                            return (
                              <li key={i} className="flex gap-4">
                                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/25 text-[11px] text-white/60">{i + 1}</span>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-[15.5px] font-medium">{p.titolo}</h4>
                                  <p className="testo-corpo mt-1 text-[14.5px] leading-relaxed text-white/75">{p.testo}</p>
                                  {f && <div className="mt-2 rounded-lg border border-cyan-300/20 bg-cyan-300/5 px-4 py-1"><Latex tex={f} /></div>}
                                </div>
                              </li>
                            )
                          })}
                        </ol>
                      </article>
                    )
                  })}
                </div>
              </Sezione>
            )}

            {chiusiF.length > 0 && (
              <Sezione id="ix-chiusi" titolo="Moduli non visitabili">
                <div className="space-y-6">
                  {chiusiF.map((m) => (
                    <article key={m.id}>
                      <div className="flex items-center gap-2.5"><Lock size={14} className="text-white/45" /><h3 className="text-lg font-semibold">{m.nome}</h3>{m.ruolo && <span className="text-[13px] text-cyan-200">{m.ruolo}</span>}</div>
                      {m.nota && <p className="testo-corpo mt-1.5 text-[15px] leading-relaxed text-white/75">{m.nota}</p>}
                      <p className="mt-1 text-[11px] text-white/40">Non visitabile in questa esperienza{m.fonte ? ` · Fonte: ${m.fonte}` : ''}</p>
                    </article>
                  ))}
                </div>
              </Sezione>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
