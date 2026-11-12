# STATE — ISS: Inside the Physics

**Ultimo aggiornamento:** giovedì 12 novembre 2026, sera (consegna)
**Fase e giorno:** fase 6 conclusa: **versione consegnata 1.2.0**.
**Versione:** tag `v1.2.0` su `main`; release GitHub v1.2.0 con zip per l'uso in locale e relazione PDF.
**Sito:** https://iss-inside-the-physics.vercel.app
**Repository:** https://github.com/N3bu24/iss-inside-the-physics, pubblico, solo il branch `main`.

## Fatto (12/11 sera)
- Approvazioni arretrate chiuse (volo harmony→destiny lasciato, zip rigenerato, `.env.local` lasciato, licenza ESA tenuta).
- Link discreto «Codice su GitHub» nella schermata iniziale e nei Crediti; README e relazione PDF aggiornati (link grande + QR); release v1.2.0; PDF inviato su Telegram.

## Fatto (11/11, 4:00 → mattina)
- v1.1.0: le 15 note dell'autore (piano in `docs/piano-v1.1.md`): voce unica (`src/lib/audioGlobale.ts`), muto immediato, voce delle simulazioni affidabile, musica nelle simulazioni (`public/audio/ambient/simulazioni.mp3`), simbolo ▶ colorato per i punti con simulazione, cono della mini-mappa riparato, nomi brevi degli strumenti (`content/v11.json`, `src/data/nomiBrevi.ts`), versione nell'interfaccia (`__APP_VERSION__`), EML unico (simulazione 'eml' eliminata, X, pose assolute in `src/simulazioni/passi.ts`, `ValoriEml.tsx`, `EmlAnticollisione.tsx`), sezioni di Aurora, valori nelle simulazioni (`src/simulazioni/Valore.tsx`), Cupola in diretta (`src/data/diretta.ts`, `src/explore/MappaIss.tsx`, opzione nelle Impostazioni).
- QA Sonnet (`docs/qa/qa-v1.1.md`): 0 bloccanti, 12 rifiniture corrette (salvo P-11 accettato); verifica dell'orchestratore a 1920/1440/1280, tablet e telefono, rifiniture mobile della Cupola e dell'EML.
- v1.1.1: il deploy Vercel falliva da web B in poi (mancava `@types/node` in un ambiente pulito); corretto e verificato con un clone pulito.

## In corso / a metà
- Nessun lavoro a metà nel codice; nessun subagent attivo.

## Prossimo passo preciso
Progetto consegnato. Solo correzioni se l'autore o il professore segnalano problemi (versioni PATCH 1.2.x); `/close-session` finale.

## Prossimi passi dopo
1. Correggere ciò che l'autore segnala (desktop prima; telefono/tablet solo nelle varianti `compatto:`/`tel:`/`tab:`), poi QA rapido una risoluzione alla volta e versione PATCH (1.1.2…).
2. Se richiesto: zip per l'uso in locale della 1.1 da allegare alla release v1.1.1.
3. Aggiornare README/relazione PDF se cambia qualcosa di visibile (oggi citano la 1.0: valutare se serve).
4. Giovedì 12 dalle 17: solo correzioni; `/close-session` finale.

## Bloccato / serve l'autore
- ID della diretta NASA (`ID_STREAM_NASA` in `src/data/diretta.ts`): cambia se NASA riavvia lo stream; se la diretta non parte, aggiornarlo (pagina del canale NASA /live).
- Consumo reale di ElevenLabs Music da verificare sulla dashboard (i caratteri non sono cambiati).
- Rifiniture minori: telefono orizzontale, nell'EML un marcatore sfiora l'intestazione; nella Cupola su telefono orizzontale etichette lunghe vicine; posizione di «Esci» su tablet/telefono (P-11).

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
- Diretta NASA: l'ID dello stream può cambiare in qualsiasi momento (ripiego: link al canale e video registrato).
- Build: verificare sempre con un clone pulito se si aggiungono import di Node in `vite.config.ts` (lezione del deploy fallito 11/11).
- Memoria del PC (~8 GB): Claude Code ha interrotto due volte i lavori in background per memoria bassa. Chiudere i programmi secondari prima di prove con Chrome headless e lavorare una risoluzione alla volta.
- Limite d'uso di Sonnet (5 ore): un subagent si è fermato a metà; il lavoro resta nel worktree e si può completare o riprendere.
- Comportamento su dispositivi reali non ancora provato (solo emulazione).
- Licenza dei panorami ESA.
- Copie della repo scaricate prima della riscrittura possono contenere ancora pptx ed email.
