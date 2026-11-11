# STATE — ISS: Inside the Physics

**Ultimo aggiornamento:** mercoledì 11 novembre 2026, mattina (lavoro programmato delle 4:00 concluso)
**Fase e giorno:** fase 6 (test e rifinitura). Il progetto è **consegnabile**: online la **v1.1.1**.
**Versione:** tag `v1.1.1` su `main` (release GitHub v1.1.0 con le note + v1.1.1 di correzione della build). La v1.0.0 resta con lo zip per l'uso in locale (lo zip non è stato rigenerato per la 1.1).
**Sito:** https://iss-inside-the-physics.vercel.app (verificato: serve la 1.1.1, musica e planisfero presenti).
**Repository:** https://github.com/N3bu24/iss-inside-the-physics, pubblico, solo il branch `main`.
**Scadenza:** giovedì 12 novembre 2026, sera.

## Fatto (11/11, 4:00 → mattina)
- v1.1.0: le 15 note dell'autore (piano in `docs/piano-v1.1.md`): voce unica (`src/lib/audioGlobale.ts`), muto immediato, voce delle simulazioni affidabile, musica nelle simulazioni (`public/audio/ambient/simulazioni.mp3`), simbolo ▶ colorato per i punti con simulazione, cono della mini-mappa riparato, nomi brevi degli strumenti (`content/v11.json`, `src/data/nomiBrevi.ts`), versione nell'interfaccia (`__APP_VERSION__`), EML unico (simulazione 'eml' eliminata, X, pose assolute in `src/simulazioni/passi.ts`, `ValoriEml.tsx`, `EmlAnticollisione.tsx`), sezioni di Aurora, valori nelle simulazioni (`src/simulazioni/Valore.tsx`), Cupola in diretta (`src/data/diretta.ts`, `src/explore/MappaIss.tsx`, opzione nelle Impostazioni).
- QA Sonnet (`docs/qa/qa-v1.1.md`): 0 bloccanti, 12 rifiniture corrette (salvo P-11 accettato); verifica dell'orchestratore a 1920/1440/1280, tablet e telefono, rifiniture mobile della Cupola e dell'EML.
- v1.1.1: il deploy Vercel falliva da web B in poi (mancava `@types/node` in un ambiente pulito); corretto e verificato con un clone pulito.

## Prossimo passo preciso
Raccogliere il parere dell'autore sulla v1.1.1 (in particolare: musica delle simulazioni, Cupola in diretta, inquadrature dell'EML, telefono reale). Poi correggere solo ciò che segnala. Giovedì dalle 17 solo correzioni; `/close-session` finale.

## Aperti / serve l'autore
- ID della diretta NASA (`ID_STREAM_NASA` in `src/data/diretta.ts`): cambia se NASA riavvia lo stream; se la diretta non parte, aggiornarlo (pagina del canale NASA /live).
- Consumo reale di ElevenLabs Music da verificare sulla dashboard (i caratteri non sono cambiati).
- Rifiniture minori: telefono orizzontale, nell'EML un marcatore sfiora l'intestazione; nella Cupola su telefono orizzontale etichette lunghe vicine; posizione di «Esci» su tablet/telefono (P-11).
- Zip per l'uso in locale non rigenerato per la 1.1 (se serve, rifarlo e allegarlo alla release v1.1.1).
- Ancora senza risposta: volo harmony→destiny, cancellazione di `_duplicati/` e `.env.local`, licenza dei panorami ESA, eventuale cambio dell'indirizzo Vercel.

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
- Nessun server o processo in background attivo. Per le schermate serve `npm i --no-save puppeteer-core@23` e il server di sviluppo (lo script usa `window.__app`, che esiste solo in sviluppo).

## Stato dei subagent
Nessuno attivo. 11/11: researcher, media-producer, content-writer, web A/B/C, qa-reviewer (Sonnet), web correzioni QA, web rifiniture mobile: tutti consegnati e uniti in `main`; worktree rimossi.

## Rischi aperti
- Memoria del PC (~8 GB): Claude Code ha interrotto due volte i lavori in background per memoria bassa. Chiudere i programmi secondari prima di prove con Chrome headless e lavorare una risoluzione alla volta.
- Limite d'uso di Sonnet (5 ore): un subagent si è fermato a metà; il lavoro resta nel worktree e si può completare o riprendere.
- Comportamento su dispositivi reali non ancora provato (solo emulazione).
- Licenza dei panorami ESA.
- Copie della repo scaricate prima della riscrittura possono contenere ancora pptx ed email.
