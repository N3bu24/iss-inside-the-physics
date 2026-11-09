const cache = new Map<string, Promise<boolean>>()

/** Verifica se un asset statico esiste davvero (su dev server i file mancanti rispondono con index.html). */
export function assetExists(url: string): Promise<boolean> {
  let p = cache.get(url)
  if (!p) {
    p = fetch(url, { method: 'HEAD' })
      .then((r) => r.ok && !(r.headers.get('content-type') ?? '').includes('text/html'))
      .catch(() => false)
    cache.set(url, p)
  }
  return p
}

export interface Cue { start: number; end: number; text: string }

const toSec = (s: string) => {
  const p = s.trim().replace(',', '.').split(':').map(Number)
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1]
}

export function parseVtt(src: string): Cue[] {
  const cues: Cue[] = []
  for (const block of src.replace(/\r/g, '').split(/\n\n+/)) {
    const lines = block.split('\n')
    const i = lines.findIndex((l) => l.includes('-->'))
    if (i < 0) continue
    const [a, b] = lines[i].split('-->')
    cues.push({ start: toSec(a), end: toSec(b.split(' ')[0]), text: lines.slice(i + 1).join(' ') })
  }
  return cues
}
