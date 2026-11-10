# STATE — ISS: Inside the Physics

**Ultimo aggiornamento:** martedì 10 novembre 2026, mattina (chiusura sessione dopo test notturno, correzioni e relazione di avanzamento)
**Fase e giorno:** fase 6 (test e rifinitura) anticipata; martedì 10. Il calendario è in anticipo: lo sviluppo previsto per mercoledì è già fatto.
**Versione:** v0.9.5 su `main`, con tag, pushata (GitHub privato `N3bu24/iss-inside-the-physics`)
**Scadenza:** giovedì 12 novembre 2026, sera. Avanzamento stimato ~85%, 7-9 ore di lavoro rimaste.

## Fatto
- **Esplorazione:** 6 panorami ESA reali (`public/panorami/`), Cupola con video NASA della Terra, scena 3D EML, finale. Grafo dei moduli in `src/data/stazione.ts`; ↑/↓ verso i portelli, rotella zoom, trascinamento; legenda comandi.
- **Voli:** 10 voli IA in `public/voli/` (5 Seedance 2.0, 5 Kling 3.0; 1280×720, 24 fps, 121 fotogrammi). Originali in `assets/voli/originali/` e `assets/voli/originali-v2/` (fuori da git). Test notturno: tutti corretti.
- **Punti di interesse:** 28 + 4 nel finale (`content/hotspot-v3.json`, `src/data/posizioni.ts`), icone per categoria, indicatori ai bordi, lista laterale, schede con KaTeX e badge di provenienza.
- **Interfaccia:** mini-mappa SVG, "Tappe suggerite", intro con un solo bottone, intestazione autore, "Ricomincia dall'inizio".
- **Simulazioni:** 8 nello stile EML, con finestra a passi; "Avvia esperimento" EML in 6 passi; 4 ambienti interattivi (`src/ambienti/`).
- **Finale** "Dallo spazio alla Terra" (Obiettivi 3/7/9, Art. 32) con 4 schede e voce.
- **Audio:** ~52 clip ElevenLabs (Thomas A.) in `public/audio/{luoghi,poi,simulazioni}/` con sottotitoli; crediti completi in `src/data/crediti.ts` e `public/panorami/CREDITI.md`.
- **QA:** report in `docs/qa/` (`qa-notte-10-11-*.md`, `qa-conferma-10-11.md`) con screenshot in `docs/qa/screens/`.
- **Relazione di avanzamento:** `docs/relazione/avanzamento-10-11.md`, inviata anche su Telegram.

## In corso / a metà
- Nessun lavoro a metà nel codice. Piccoli difetti noti, non bloccanti:
  - nel finale i sottotitoli toccano l'etichetta "Verso Cupola";
  - avvisi THREE.Clock in console (solo warning).

## Prossimo passo preciso
Chiedere all'autore se ha creato l'account Vercel collegato a GitHub. Se sì: importare il repo `N3bu24/iss-inside-the-physics` su Vercel (framework Vite, build `npm run build`, output `dist`), pubblicare e provare il link. Se no: nel frattempo lanciare il `content-writer` sulla relazione scritta in `docs/relazione/` (fonti e crediti da `src/data/crediti.ts`, `public/panorami/CREDITI.md`, `docs/research/`).

## Prossimi passi dopo
1. Relazione scritta (`content-writer`, `docs/relazione/`), con fonti e crediti.
2. Prestazioni (`web-developer`): ridurre chunk iniziale (367 KB gzip), panorami 4-6 MB (WebP/qualità più bassa), video Terra 8,8 MB, font.
3. Correggere i sottotitoli vicini a "Verso Cupola" nel finale.
4. Prova su tablet (viewport 1024×768 / touch).
5. QA finale giovedì sul link Vercel (`qa-reviewer` Sonnet), poi v1.0.0 con tag. Dalle 17 solo correzioni.
6. Facoltativo se avanza tempo: audio ambient della stazione.

## Bloccato / serve l'autore
- **Account Vercel** collegato a GitHub.
- Licenza panorami ESA: su Flickr risultano "All rights reserved" (`docs/research/panorami.md`); oggi usati come uso educativo con credito. L'autore decide se basta.
- Due frasi del finale da confermare con fonte: FDA 2008 per la TMS, OMS sulla copertura universale.
- Cancellare `_duplicati/` e `.env.local`.

## File e cartelle importanti
- Codice: `src/` (`explore/`, `ui/`, `ambienti/`, `data/`, `lib/`); contenuti: `content/*-v3.json`.
- Media: `public/panorami/`, `public/voli/`, `public/audio/`, `public/video/fenomeni/`, `public/models/eml.glb`.
- Blender: `assets/blender/`; render: `assets/renders/`.
- Script: `scripts/notify.mjs`, `scripts/send-media.mjs`, `scripts/media/` (voli Higgsfield, `web-encode.py`), `scripts/pano-view.py`. Guida voli: `docs/voli-v2.md`.
- Registri: `docs/costi.md`, `docs/DECISIONS.md`, `docs/SESSION-LOG.md`, `CHANGELOG.md`.

## Come avviare il progetto
- `npm install` → `npm run dev` (porta 5173) → http://localhost:5173
- `npm run build` per la build (output `dist/`), `npm run preview` per provarla.
- Al momento della chiusura un server dev potrebbe essere ancora attivo sulla 5173; se la porta è occupata, riusarlo o fermarlo per PID (mai taskkill globali).

## Stato dei subagent
Nessuno attivo (`.claude/state/agents.json` = `[]`). Ultimi consegnati: QA notte (Opus + Sonnet), web/fix-notte, web/fix-conferma, content (finale), media (voce finale-trasformatore): tutti uniti in `main`. Circa 20 worktree vecchi in `.claude/worktrees/` da ripulire (`git worktree list`, poi `git worktree remove` solo per quelli già uniti).

## Rischi aperti
- Vercel: se l'account arriva tardi, la pubblicazione slitta a giovedì pomeriggio (P1, mai da tagliare).
- Peso dei media: il primo caricamento su rete lenta può essere lungo; da mitigare prima del test finale.
- Licenza ESA dei panorami non del tutto chiarita.
- Budget Higgsfield già ~21,6 $: ogni nuova generazione solo per difetti trovati e con conferma.

## Costi
Higgsfield ~21,6 $ (~20 €); ElevenLabs dentro il piano Starter. Dettaglio in `docs/costi.md`.
