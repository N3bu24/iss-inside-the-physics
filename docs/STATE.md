# STATE — ISS: Inside the Physics

**Ultimo aggiornamento:** martedì 10 novembre 2026, 22:10 (chiusura sessione)
**Fase e giorno:** fase 6 (test e rifinitura), martedì 10 sera. Il progetto è **consegnabile**: versione 1.0.0 pubblicata, poi aggiunto l'adattamento a telefono e tablet (pubblicato, non ancora con un numero di versione).
**Versione:** tag `v1.0.0` (release GitHub con zip). Su `main` dopo il tag: interfaccia responsive (ultimo commit `5b67b9d`). Tutto pushato.
**Sito:** https://iss-inside-the-physics.vercel.app (Vercel si aggiorna a ogni push su `main`).
**Repository:** https://github.com/N3bu24/iss-inside-the-physics, **pubblico**, solo il branch `main`.
**Scadenza:** giovedì 12 novembre 2026, sera. Avanzamento stimato ~98%.

## Fatto
- **v0.11.0 (17 modifiche dell'autore):** scheda del punto con X e «Avvia simulazione» fissi; simulazione EML riparata (copia del modello per ogni scena, illuminazione senza rete, barriere d'errore); nuovo layout delle simulazioni (passi nella colonna sinistra) e pulsante «Esci» con tasto Esc; Esc chiude un livello alla volta (`src/lib/useEscape.ts`); viaggio rapido dalla mini-mappa; note sui moduli chiusi (`content/moduli-chiusi.json`); bollino della simulazione e icona unica per simulazione (`src/data/iconeSim.ts`); portelli a rombo; waveform in decibel (`src/components/Waveform.tsx`); Indice (`src/ui/Indice.tsx`); Impostazioni e crediti con strumenti (`src/ui/Impostazioni.tsx`, `src/lib/preferenze.ts`, `content/strumenti.json`); guida «Come si usa» (`content/simulazioni.json`, campo `guida`); etichetta «ISS» senza parentesi.
- **Finale nella capsula di rientro:** panorama 360 Blender v2 (`public/panorami/capsula.jpg`, maschera oblò `capsula-maschera.png`, dati `src/data/capsula-info.json`), scena `src/explore/CapsulaRientro.tsx` + shader `capsulaShader.ts` (plasma animato, luce che pulsa, tremolio), rombo `public/audio/ambient/rientro.mp3` con dissolvenza incrociata in `src/lib/ambient.ts`; testi in `content/capsula.json`.
- **v1.0.0:** README e relazione PDF di 2 pagine con il link del sito (`docs/relazione/ISS-Inside-the-Physics-relazione.pdf`, sorgente `docs/relazione/pdf-sorgente/relazione.html`); release https://github.com/N3bu24/iss-inside-the-physics/releases/tag/v1.0.0 con `ISS-Inside-the-Physics-v1.0.0.zip` (avvio locale senza installare nulla).
- **Repo resa pubblica (richiesta dell'autore):** pptx del professore tolto da tutta la storia (resta solo in locale; `*.pptx` in `.gitignore`); email dei commit sostituita con `297718675+N3bu24@users.noreply.github.com` (impostata come `user.email` locale della repo); 21 branch secondari cancellati dal remoto.
- **Interfaccia per telefono e tablet (desktop invariato):** soglie in `src/lib/dispositivo.ts` e varianti `compatto:` / `tel:` / `tab:` in `src/index.css` (forma a blocco); stili in `src/responsive.css`. Esplorazione: `src/explore/InterfacciaCompatta.tsx`, `src/ui/BarraCompatta.tsx`, `src/ui/Foglio.tsx`. Simulazioni: `src/simulazioni/{LayoutCompatto,Sheet,CameraCompatta,compatto}.ts(x)`. Nodo EML: colonna comune `src/lib/slot.ts`. Verificato con `scripts/qa/schermate.mjs` (10 risoluzioni) e `scripts/qa/confronta-layout.mjs` (desktop: 0 differenze, salvo tremolio della capsula e due icone dell'Indice che dipendono dal caricamento delle formule). Tavole delle 10 risoluzioni inviate su Telegram.
- QA automatico v0.11: `docs/qa/qa-v0.11-automatico.md` (OK).

## In corso / a metà
- Nessun lavoro a metà nel codice.
- L'adattamento a telefono/tablet non ha ancora un numero di versione (CHANGELOG, `package.json`, tag): sta su `main` dopo `v1.0.0`.

## Prossimo passo preciso
Chiedere all'autore com'è andata la prova del sito sul suo telefono/tablet reale e raccogliere i problemi. Poi correggerli (solo dentro le varianti `compatto:`/`tel:`/`tab:` o i rami non-desktop) e verificare che il desktop resti identico con:
`npm run dev -- --port 5173`, poi `node scripts/qa/schermate.mjs --base http://localhost:5173 --out <cartella> --gruppo desktop` e `node scripts/qa/confronta-layout.mjs <rilievo-prima> <cartella> --gruppo desktop` (il rilievo di riferimento del desktop va rifatto prima di toccare il codice: quello di questa sessione stava nello scratchpad temporaneo).

## Prossimi passi dopo
1. Rifiniture note: sul tablet in orizzontale la scheda del punto copre la miniatura della mappa; sul telefono in verticale il circuito dell'autoinduzione è un po' tagliato a sinistra; nella capsula su telefono orizzontale «Ricomincia» è vicino all'etichetta di un punto.
2. Versione 1.1.0 (CHANGELOG, `package.json`, tag, release) con l'interfaccia responsive; rigenerare lo zip della release se l'autore lo vuole.
3. Se l'autore cambia l'indirizzo Vercel: aggiornarlo in `README.md`, `docs/relazione/relazione-finale.md`, `docs/relazione/pdf-sorgente/relazione.html` (rigenerare il PDF con Chrome headless `--print-to-pdf`), note della release.
4. Giovedì dalle 17: solo correzioni. `/close-session` finale.

## Bloccato / serve l'autore
- Prova su dispositivi reali (telefono, tablet): le verifiche sono state fatte con Chrome che emula i dispositivi.
- Eventuale cambio dell'indirizzo del sito su Vercel (Settings → Domains): solo la parte prima di `.vercel.app`.
- Licenza dei panorami ESA («All rights reserved» su Flickr): ora pubblici nel sito e nella repo, con nota nel README. Decide l'autore se chiedere a ESA.
- Ancora senza risposta da sessioni precedenti: volo harmony→destiny (rifarlo?), cancellazione di `_duplicati/` e `.env.local`.

## File e cartelle importanti
- Codice: `src/` (`explore/`, `ui/`, `components/`, `simulazioni/`, `ambienti/`, `data/`, `lib/`), stili `src/index.css`, `src/esplora.css`, `src/responsive.css`. Testi: `content/*.json`.
- Media: `public/panorami/` (anche `capsula.jpg`), `public/voli/`, `public/audio/` (`ambient/stazione.mp3`, `ambient/rientro.mp3`), `public/video/`, `public/models/eml.glb`.
- Fuori da git (solo in locale): pptx del professore nella radice; render pieni della capsula `assets/renders/capsula/*.png` e v1; originali dei voli `assets/voli/originali*/`; sorgenti audio in `assets/audio/ambient/sorgenti/`.
- Blender: `assets/blender/` (EML) e `assets/blender/capsula/` (`build_capsula.py`, `post_capsula.py`, `capsula.blend`).
- Script: `scripts/notify.mjs`, `scripts/send-media.mjs`, `scripts/qa/schermate.mjs` (opzioni `--gruppo`, `--ris`, `--stati`), `scripts/qa/confronta-layout.mjs`, `scripts/media/`.
- Relazione e README: `docs/relazione/`, `README.md`. Registri: `docs/costi.md`, `docs/DECISIONS.md`, `docs/SESSION-LOG.md`, `CHANGELOG.md`, `TASKS.md`.
- Backup della storia git prima della riscrittura: `C:\Users\ALESSA~1\AppData\Local\Temp\claude\221e0a799b136ef3\c486d2e3-726b-449a-97e1-3373777ce4d8\scratchpad\backup-prima-riscrittura.bundle` (cartella temporanea: può sparire).

## Come avviare il progetto
- `npm install` → `npm run dev` → http://localhost:5173
- `npm run build` (output `dist/`), `npm run preview`.
- Prove a più risoluzioni: `npm i --no-save puppeteer-core@23`, poi gli script in `scripts/qa/` (pesanti: una risoluzione alla volta con `--ris`, il PC ha poca memoria).
- Senza Node: zip della release v1.0.0 → `Avvia ISS.bat` → http://localhost:8173.
- Nessun server o processo in background attivo alla chiusura.

## Stato dei subagent
Nessuno attivo. Tutti consegnati e uniti in `main`: content-writer (testi v0.11), media-producer (rombo del rientro), blender-artist (capsula v1 e v2), web-developer A e B (v0.11 e responsive), web-developer C (finale; interrotto dal limite d'uso di Sonnet e completato dall'orchestratore), qa-reviewer (QA automatico v0.11). Resta una cartella vuota bloccata da Windows: `.claude/worktrees/agent-a05d58aa214ba5f6f` (ignorata da git, si cancella a mano a Claude Code chiuso).

## Rischi aperti
- Memoria del PC (~8 GB): Claude Code ha interrotto due volte i lavori in background per memoria bassa. Chiudere i programmi secondari prima di prove con Chrome headless e lavorare una risoluzione alla volta.
- Limite d'uso di Sonnet (5 ore): un subagent si è fermato a metà; il lavoro resta nel worktree e si può completare o riprendere.
- Comportamento su dispositivi reali non ancora provato (solo emulazione).
- Licenza dei panorami ESA.
- Copie della repo scaricate prima della riscrittura possono contenere ancora pptx ed email.
