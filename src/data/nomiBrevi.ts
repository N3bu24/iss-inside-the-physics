import v11 from '@content/v11.json'

/** Nome breve dello strumento accanto al punto luminoso (content/v11.json -> strumenti: id punto -> nome). Se manca: undefined (si usa il titolo). */
const mappa = ((v11 as { strumenti?: Record<string, string> }).strumenti ?? {})

export function nomeBreve(id: string | undefined): string | undefined {
  const n = id ? mappa[id] : undefined
  return n && n.trim() ? n.trim() : undefined
}
