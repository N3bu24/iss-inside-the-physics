# STATE — ISS: Inside the Physics

**Ultimo aggiornamento:** martedì 10 novembre 2026, 13:15 (chiusura sessione)
**Fase e giorno:** fase 6 (test e rifinitura); martedì 10. Il calendario è in anticipo: manca soprattutto la pubblicazione.
**Versione:** v0.10.0 su `main`, con tag, pushata (GitHub privato `N3bu24/iss-inside-the-physics`). Release GitHub v0.10.0 con lo zip per l'uso in locale.
**Scadenza:** giovedì 12 novembre 2026, sera. Avanzamento stimato ~93%.

## Fatto
- **Sito completo:** 6 panorami ESA + Cupola (video NASA), 10 voli IA (`public/voli/`), 28+4 punti di interesse, 8 simulazioni, 4 ambienti interattivi, scena EML 3D con "Avvia esperimento", finale Obiettivi 3/7/9 e Art. 32, mini-mappa, tappe suggerite, badge, crediti.
- **Voli:** 8 Seedance 2.0 + 2 Kling 3.0 (harmony→destiny, harmony→kibo, lasciati dopo il QA `docs/qa/qa-voli-kling-10-11.md`). Tabella aggiornata in `docs/voli-v2.md`. Originali in `assets/voli/originali*/` (fuori da git).
- **Audio:** ~52 clip voce + sottofondo della stazione `public/audio/ambient/stazione.mp3` (loop 108 s, -30,5 LUFS), gestito da `src/lib/ambient.ts` (highpass 60 Hz, lowpass 12,5 kHz, ducking al 32% sotto la voce, segue il pulsante audio).
- **Prestazioni (v0.10.0):** panorami 6144×3072 q70 (29→12 MB), video Terra 3,9 MB, chunk iniziale ~100 KB gzip, `Esplora` caricato con React.lazy, codice morto rimosso.
- **Relazione:** PDF di 2 pagine `docs/relazione/ISS-Inside-the-Physics-relazione.pdf` (pagina 1 presentazione, pagina 2 scheda tecnica; sorgente in `docs/relazione/pdf-sorgente/relazione.html`, si rigenera con Chrome headless `--print-to-pdf`). Versione lunga in `docs/relazione/relazione-finale.md`. `README.md` per GitHub con immagini in `docs/readme/`.
- **QA:** ultimo report `docs/qa/qa-rapido-v0.10.0.md`: OK, nessun errore in console né 404.
- **Uso in locale:** release https://github.com/N3bu24/iss-inside-the-physics/releases/tag/v0.10.0 con `ISS-Inside-the-Physics-v0.10.0.zip` (si estrae e si apre `Avvia ISS.bat`, server PowerShell su localhost:8173). Istruzioni inviate su Telegram.
- Worktree vecchi ripuliti: `git worktree list` mostra solo la cartella principale.

## In corso / a metà
- Nessun lavoro a metà nel codice.
- Il segnaposto `[LINK DEL SITO]` è ancora in `README.md`, `docs/relazione/relazione-finale.md` e nel PDF (`docs/relazione/pdf-sorgente/relazione.html`): va sostituito quando c'è l'URL Vercel.

## Prossimo passo preciso
Chiedere all'autore se vuole pubblicare ora su Vercel. Il progetto è già importato su Vercel (team "Nebula", preset Vite, build `npm run build`, output `dist`): all'ultimo tentativo Vercel chiedeva una verifica d'identità con un codice via email, che **deve inserire l'autore** (Claude non inserisce codici). Dopo la pubblicazione: mandare l'URL su Telegram, sostituire `[LINK DEL SITO]` nei tre file, rigenerare il PDF da `docs/relazione/pdf-sorgente/relazione.html`, commit e push.

## Prossimi passi dopo
1. QA finale sul link pubblico (`qa-reviewer` Sonnet): navigazione completa, passi 4-6 dell'EML (non ritestati nel QA rapido), audio e ducking, tempi di caricamento.
2. Prova su tablet (viewport 1024×768, touch).
3. Correzioni dal QA, poi v1.0.0 (CHANGELOG, package.json, tag) e push. Dalle 17 di giovedì solo correzioni.
4. `/close-session` finale.

## Bloccato / serve l'autore
- **Vercel:** decidere quando pubblicare e fare la verifica d'identità via email.
- **Volo harmony→destiny** (Kling, il più debole, 3,5/5 con scie): rifarlo con Seedance? Costa circa 3,40 $ e porterebbe il totale sopra il budget. Serve l'ok esplicito.
- **Licenza panorami ESA:** su Flickr risultano "All rights reserved"; oggi sono usati per uso educativo con credito. Decide l'autore se basta.
- Cancellare `_duplicati/` e `.env.local`? Serve l'ok.

## File e cartelle importanti
- Codice: `src/` (`explore/`, `components/`, `simulazioni/`, `ambienti/`, `ui/`, `data/`, `lib/`); testi: `content/*.json`.
- Media: `public/panorami/`, `public/voli/`, `public/audio/` (con `ambient/`), `public/video/`, `public/models/eml.glb`.
- Sorgenti media fuori da git: `assets/voli/originali*/`, `assets/voli/v3/frame/`, `assets/audio/ambient/` (sorgenti e prompt del sottofondo).
- Blender: `assets/blender/`; render: `assets/renders/`.
- Script: `scripts/notify.mjs`, `scripts/send-media.mjs`, `scripts/media/` (voli Higgsfield, `volo-resume.mjs <id> <out>` per recuperare un lavoro dall'ID), `scripts/pano-view.py` (si esegue senza `-I`, serve numpy).
- Relazione e README: `docs/relazione/`, `README.md`, `docs/readme/`.
- Registri: `docs/costi.md`, `docs/DECISIONS.md`, `docs/SESSION-LOG.md`, `CHANGELOG.md`.

## Come avviare il progetto
- `npm install` → `npm run dev` → http://localhost:5173
- `npm run build` (output `dist/`), `npm run preview` per provarla.
- Senza Node: zip della release v0.10.0 → `Avvia ISS.bat` → http://localhost:8173.
- Nessun server o processo in background attivo alla chiusura.

## Stato dei subagent
Nessuno attivo. Ultimi consegnati e uniti in `main`: content-writer (relazione), media (voli v3, sottofondo), web-developer (pulizia e ambient), qa-reviewer (QA voli Kling e QA rapido v0.10.0).

## Rischi aperti
- **Vercel:** P1, mai da tagliare. Se la pubblicazione slitta a giovedì pomeriggio resta poco margine per il QA sul link pubblico. Piano B: lo zip della release funziona in locale.
- Peso totale dei media (~100 MB): il primo caricamento su rete lenta può essere lungo.
- Budget Higgsfield già ~31,8 $ (~29 €), al limite alto: nessuna nuova generazione senza ok esplicito.
- Licenza ESA dei panorami non del tutto chiarita.
