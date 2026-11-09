import type { Fenomeno } from './types'

/**
 * I cinque fenomeni dell'EML. `hotspot` = id dell'hotspot da cui il loader prende testo e approfondimento;
 * `clip` = clip di voce riprodotta quando si sceglie il fenomeno.
 */
export const fenomeni: (Fenomeno & { hotspot: string })[] = [
  { id: 'campo-variabile', titolo: 'Campo magnetico variabile', colore: 'cyan', hotspot: 'eml-campo-variabile', clip: 'eml-02',
    testo: 'La corrente alternata nelle bobine genera un campo magnetico che varia nel tempo.',
    latex: 'B(t)=B_0\\sin(\\omega t)' },
  { id: 'correnti-indotte', titolo: 'Correnti indotte', colore: 'cyan', hotspot: 'eml-correnti-indotte', clip: 'eml-03',
    testo: 'Il campo variabile induce correnti parassite nel campione conduttore.',
    latex: '\\varepsilon=-\\dfrac{d\\Phi_B}{dt}' },
  { id: 'joule', titolo: 'Riscaldamento per effetto Joule', colore: 'heat', hotspot: 'eml-joule', clip: 'eml-04',
    testo: 'Le correnti indotte dissipano energia e scaldano il campione.',
    latex: 'P=R\\,I^2' },
  { id: 'fusione', titolo: 'Fusione', colore: 'heat', hotspot: 'eml-fusione', clip: 'eml-05',
    testo: 'Raggiunta la temperatura di fusione il campione diventa una goccia liquida.' },
  { id: 'solidificazione', titolo: 'Solidificazione', colore: 'cyan', hotspot: 'eml-solidificazione', clip: 'eml-05',
    testo: 'Spegnendo il riscaldamento il campione si raffredda e solidifica senza contatto.' },
]

