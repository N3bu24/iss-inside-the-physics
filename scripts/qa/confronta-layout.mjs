// Confronta due rilievi di schermate.mjs (prima/dopo) e segnala ogni elemento d'interfaccia spostato o cambiato.
// Uso: node scripts/qa/confronta-layout.mjs <cartella-prima> <cartella-dopo> [--gruppo desktop]
// Esce con codice 1 se trova differenze oltre la tolleranza (2 px).
import fs from 'node:fs'
import path from 'node:path'

const [, , A, B] = process.argv
const gi = process.argv.indexOf('--gruppo')
const gruppo = gi > 0 ? process.argv[gi + 1] : 'desktop'
const TOLL = 2
let differenze = 0
const righe = []
for (const ris of fs.readdirSync(A).filter((d) => d.startsWith(gruppo))) {
  for (const f of fs.readdirSync(path.join(A, ris)).filter((x) => x.endsWith('.json'))) {
    const pb = path.join(B, ris, f)
    if (!fs.existsSync(pb)) { righe.push(`${ris}/${f}: manca nel secondo rilievo`); differenze++; continue }
    const a = JSON.parse(fs.readFileSync(path.join(A, ris, f), 'utf8'))
    const b = JSON.parse(fs.readFileSync(pb, 'utf8'))
    const chiave = (e) => `${e.tag}|${e.testo}`
    const mb = new Map()
    for (const e of b.el) { const k = chiave(e); if (!mb.has(k)) mb.set(k, []); mb.get(k).push(e) }
    const usati = new Set()
    for (const e of a.el) {
      const lista = mb.get(chiave(e)) ?? []
      const m = lista.find((x) => !usati.has(x) && Math.abs(x.x - e.x) <= TOLL && Math.abs(x.y - e.y) <= TOLL && Math.abs(x.w - e.w) <= TOLL && Math.abs(x.h - e.h) <= TOLL)
      if (m) { usati.add(m); continue }
      const vicino = lista.find((x) => !usati.has(x))
      righe.push(`${ris}/${f}: ${e.tag} «${e.testo}» ${e.x},${e.y} ${e.w}×${e.h} → ${vicino ? `${vicino.x},${vicino.y} ${vicino.w}×${vicino.h}` : 'SPARITO'}`)
      differenze++
    }
    for (const e of b.el) if (!usati.has(e) && !(a.el.some((x) => chiave(x) === chiave(e)))) { righe.push(`${ris}/${f}: NUOVO ${e.tag} «${e.testo}» ${e.x},${e.y} ${e.w}×${e.h}`); differenze++ }
    if (a.scrollW !== b.scrollW) { righe.push(`${ris}/${f}: larghezza pagina ${a.scrollW} → ${b.scrollW}`); differenze++ }
  }
}
console.log(righe.join('\n') || 'nessuna differenza')
console.log(`\ndifferenze (${gruppo}): ${differenze}`)
process.exit(differenze ? 1 : 0)
