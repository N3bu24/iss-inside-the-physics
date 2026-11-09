// Testi dei passi: se esiste content/simulazioni.json (scritto da un altro agente) ha la precedenza
// sui testi provvisori; se manca o ha un formato inatteso il sito funziona comunque.

export type Passo = {
  titolo: string
  testo: string
  cosaSiVede?: string
  formula?: string
  /** URL del video del fenomeno (mostrato solo se il file esiste) */
  video?: string
  /** camera libera (simulazioni a guscio comune) */
  camera?: { pos: [number, number, number]; target: [number, number, number] }
  /** nome di un oggetto del modello EML su cui portare la camera */
  ancora?: string
  distanza?: number
  /** identificativo di stato letto dalla scena (es. "fusione") */
  stato?: string
  /** durata dell'avanzamento automatico, in secondi */
  durata?: number
}

type PassoFile = { titolo?: string; testo?: string; cosa_si_vede?: string; formula?: string }

const moduli = import.meta.glob('/content/simulazioni.json', { eager: true, import: 'default' }) as Record<string, unknown>

function passiDaFile(id: string): PassoFile[] | null {
  try {
    const raw = Object.values(moduli)[0] as unknown
    if (!raw) return null
    const lista: unknown[] = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as { simulazioni?: unknown[] }).simulazioni)
        ? (raw as { simulazioni: unknown[] }).simulazioni
        : Object.entries(raw as Record<string, unknown>).map(([k, v]) => ({ id: k, ...(v as object) }))
    const voce = lista.find((v) => (v as { id?: string })?.id === id) as { passi?: PassoFile[] } | undefined
    return voce?.passi && voce.passi.length ? voce.passi : null
  } catch {
    return null
  }
}

/** Toglie i delimitatori $...$ / $$...$$ dalle formule del file. */
export function pulisciFormula(f?: string): string | undefined {
  if (!f) return undefined
  const s = f.trim().replace(/^\$\$?/, '').replace(/\$\$?$/, '').trim()
  return s || undefined
}

/** Unisce i passi provvisori (con camera/stato) ai testi definitivi del file, se presenti. */
export function passiDi(id: string, provvisori: Passo[], stati?: string[]): Passo[] {
  const file = passiDaFile(id)
  if (!file) return provvisori
  const n = file.length
  return file.map((f, i) => {
    const j = n === 1 ? 0 : Math.round((i * (provvisori.length - 1)) / (n - 1))
    const base = (stati?.[i] && provvisori.find((q) => q.stato === stati[i])) || provvisori[Math.min(j, provvisori.length - 1)]
    return {
      ...base,
      titolo: f.titolo ?? base.titolo,
      testo: f.testo ?? base.testo,
      cosaSiVede: f.cosa_si_vede ?? undefined,
      stato: stati?.[i] ?? base.stato,
      formula: f.formula !== undefined ? pulisciFormula(f.formula) : base.formula,
    }
  })
}
