# TASKS — ISS: Inside the Physics

Scadenza: **giovedì 12 novembre 2026, sera**.
Regole e decisioni: vedi `CLAUDE.md`. Questo file è la lista viva dei lavori: Claude Code lo aggiorna a ogni passo (spuntando `[x]`), segnando cosa è stato tagliato e perché.

Stato e storico: `docs/STATE.md` (a che punto siamo), `docs/DECISIONS.md`, `docs/SESSION-LOG.md`, `docs/costi.md`. Alla chiusura della sessione usare `/close-session`.
Lavoro in parallelo: l'orchestratore lancia i subagent di `.claude/agents/` (vedi `CLAUDE.md` sezione 19). Solo l'orchestratore spunta questa lista.

Legenda priorità: **P1** = non si taglia mai, **P2** = importante, **P3** = si taglia per primo.

---

## Lunedì 9 — Fattibilità, piano, prototipo

- [x] P1 Leggere `CLAUDE.md` e il pptx (testo estratto in `docs/pptx-teoria.md`); riassunto vincoli
- [x] P1 Verificare Street View della ISS → non utilizzabile, fallback con panorami ESA collegati a mano (`docs/research/`)
- [x] P1 Verificare che Blender si avvii da terminale (5.2.3 LTS, percorso completo in `BLENDER_PATH`, non nel PATH)
- [x] P1 Verificare che le chiavi in `.env` funzionino (ElevenLabs Starter OK, Higgsfield auth OK senza spesa)
- [x] P1 Provare il bot Telegram (messaggi e `--ask` funzionanti)
- [x] P1 Presentare il piano di una pagina e ottenere l'approvazione (9/11)
- [x] P1 Scaffold del progetto (Vite + React + TS + Tailwind 4, `.gitignore` con `.env`), git e GitHub
- [x] P1 Modello EML prima versione (v0.2.0)
- [x] P1 Prototipo: schermata iniziale + ambienti + hotspot + prima versione dell'EML (v0.2.0)

## Martedì 10 — Produzione degli asset

- [x] P1 Modello 3D dell'EML (bobina SUPOS conica, `eml.glb` 0,28 MB, v0.5.0)
- [x] P1 Render dei fenomeni: campo variabile, correnti indotte, Joule, fusione, solidificazione (`public/video/fenomeni/`)
- [x] P1 Voce narrante sezioni EML (ElevenLabs, Thomas A.)
- [x] P2 Video Higgsfield: 10 voli tra i moduli (5 Seedance + 5 Kling). Intro con foto NASA, senza video IA
- [x] P2 Voci degli ambienti principali (voce v3, ~52 clip)
- [x] P2 Audio ambient spaziale con ronzio della stazione (v0.10.0)
- [x] P2 Raccolta di foto reali ESA/NASA/DLR con crediti e licenze (`public/panorami/CREDITI.md`, `src/data/crediti.ts`)
- [x] P3 Voci e clip degli ambienti secondari
- [x] Aggiornare `docs/costi.md` dopo ogni generazione

## Mercoledì 11 — Sviluppo completo (anticipato a lunedì-martedì)

- [x] P1 Sezione EML completa (modello, fenomeni, "Avvia esperimento" in 6 passi, voce, hotspot con teoria)
- [x] P1 Navigazione tra ambienti con voli senza stacchi (↑/↓, rotella, trascinamento)
- [x] P1 Percorso guidato ("Tappe suggerite") con esplorazione libera
- [x] P1 Sezione finale: Obiettivi 3/7/9 e Art. 32 (v0.9.4)
- [x] P1 Badge di provenienza su ogni contenuto
- [x] P2 Mini-mappa della ISS in alto a destra
- [x] P2 Sottotitoli e trascrizioni, pulsante audio on/off
- [x] P2 Sezione ricerca sui materiali (Kibo, simulazioni)
- [x] P3 Ambienti oltre i primi 4-5 (6 moduli + Cupola + 4 ambienti interattivi + 8 simulazioni)
- [x] P3 Rifiniture grafiche (etichetta del finale spostata, avviso THREE.Clock filtrato; v0.10.0)

## Giovedì 12 — Test, relazione, pubblicazione

- [x] P1 Test di navigazione su desktop (QA fino a v0.11 + confronto automatico del layout dopo il responsive)
- [x] P1 Verifica della correttezza scientifica dei testi (test notturno Sonnet; restano FDA 2008 e OMS da confermare)
- [x] P1 Verifica fonti e crediti (crediti completi, fonti dei moduli chiusi verificate; resta aperta la scelta sulla licenza dei panorami ESA)
- [x] P1 Pubblicazione su Vercel e controllo del link pubblico (https://iss-inside-the-physics.vercel.app)
- [x] P1 Relazione scritta di accompagnamento (PDF di 2 pagine con il link del sito)
- [x] P2 Prestazioni alleggerite (v0.10.0)
- [ ] P2 Prova su tablet (a metà: verificata in emulazione a 4 risoluzioni tablet; manca la prova su un dispositivo reale)
- [x] P2 Verifica che il sito sia comprensibile senza spiegazioni esterne (test Opus di navigazione)
- [ ] Dalle 17: **stop nuove funzionalità**, solo correzioni

---

## Tagli e problemi

(Claude Code scrive qui cosa è stato tagliato o non è riuscito, con data e motivo.)

### 10/11 notte (orchestratore)
- [x] Voli v2: 5 voli Seedance + 5 Kling a 24 fps; arrivo in Tranquility corretto (v0.9.3)
- [x] Test notturno: Opus (navigazione, voli: tutti corretti) + Sonnet (scienza, fonti, sicurezza)
- [x] Correzioni: finale completo, EML senza sovrapposizioni, badge, crediti, finestra a passi a 720 (v0.9.4)
- [x] Test di conferma e ultime correzioni: fonti senza "pptx", finale a 1280, etichette, voce finale-trasformatore (v0.9.5)
- [x] Vercel, relazione scritta, peso del bundle (fatti il 10/11); prova tablet solo in emulazione
- Problema 10/11: crediti Higgsfield esauriti dai voli Seedance 1080p (~3,40 $/volo, 8× Kling). Rifacimenti futuri solo dei voli difettosi e previa conferma.
- Taglio 10/11: audio ambient (ronzio della stazione) non prodotto; priorità più bassa della pubblicazione. Si fa solo se avanza tempo.
- Taglio 9/11: video IA dell'intro e volo IA verso la Cupola sostituiti da foto e video NASA reali (decisione dell'autore).

### 10/11 mattina (orchestratore)
- [x] Relazione PDF di 2 pagine (presentazione + scheda tecnica) e README su GitHub
- [x] QA voli Kling: tutti accettabili (3,5-4/5)
- [x] Rifatti con Seedance 3 voli (kibo→harmony, tranquility→unity, unity→destiny), v0.9.6, ~10,2 $
- Rimandata su richiesta dell'autore: pubblicazione Vercel (repo già importato; serve la verifica dell'identità via email)
- [x] Pulizia codice, peso (panorami 29→12 MB, video Terra 8,8→3,9 MB, chunk 372→100 KB gzip), worktree vecchi rimossi (v0.10.0)
- [x] P2 Audio ambient della stazione con ducking sotto la voce (ElevenLabs SFX, 0 € extra)
- [x] QA rapido Sonnet v0.10.0: OK, nessun problema bloccante (`docs/qa/qa-rapido-v0.10.0.md`)

### 10/11 pomeriggio (orchestratore, chiusura 13:15)
- [x] Pacchetto per provare il sito in locale senza installare nulla: zip con `sito/`, `server.ps1`, `Avvia ISS.bat`, `LEGGIMI.txt`, pubblicato come asset della release GitHub v0.10.0 (76 MB). Istruzioni inviate su Telegram.
- Problema 10/11: Telegram non accetta file sopra 50 MB, quindi lo zip sta nella release GitHub. Il server di prova si è chiuso per memoria bassa dopo che il test era già finito.

### 10/11 pomeriggio — v0.11.0: 17 modifiche dell'autore (piano approvato)
Ondata 1 (in parallelo):
- [x] P1 EML rotto: scena clonata per istanza, niente HDR da internet, barriera d'errore, EML dentro la shell (web A, `web/sim-eml`)
- [x] P1 Simulazioni: nuovo layout dopo "Avvia" (passi nella colonna sinistra, scena libera) (web A)
- [x] P1 Pulsante "Esci" grande con tasto Esc; Esc chiude prima i passi (web A)
- [x] P2 Riquadro "Come si usa" in ogni simulazione (web A + content)
- [x] P2 Etichetta "ISS" senza parentesi (web A)
- [x] P1 Scheda: X e "Avvia simulazione" sempre visibili (web B, `web/ui-esplora`)
- [x] P1 Icone: bollino simulazione, stessa icona per la stessa simulazione, portelli a rombo (web B)
- [x] P1 Mini-mappa: meno alone, viaggio rapido, note sui moduli chiusi (web B + content)
- [x] P2 Waveform accanto al pulsante audio (web B)
- [x] P2 Indice di tutti i contenuti (web B)
- [x] P2 Impostazioni + crediti con strumenti usati (web B + content)
- [x] P2 Testi: guide, moduli chiusi, capsula, strumenti (content)
- [x] P2 Panorama 360 dell'interno della capsula di rientro (blender, v2)
- [x] P2 Rombo del rientro, loop (media, ElevenLabs SFX)
Ondata 2:
- [x] P2 Finale nella capsula: panorama, plasma animato, tremolio, cambio di sottofondo; voce delle simulazioni nell'audio globale (web C, completato dall'orchestratore)
Ondata 3:
- [x] QA delle 17 voci (verifica in Chrome dell'orchestratore + QA automatico Haiku, Sonnet bloccato dal limite), correzioni, v0.11.0, push; zip nuovo con la release 1.0.0

- Problema 10/11 pomeriggio: il web-developer del finale (Sonnet) si è fermato per il limite d'uso di 5 ore (sblocco 18:10). Il lavoro salvato nel suo worktree è stato completato dall'orchestratore. Il QA automatico va su Haiku per lo stesso motivo.
- Correzione 10/11: la waveform col solo sottofondo era quasi piatta (segnale ~-36 dB); ora la scala è in decibel.

### 10/11 sera (orchestratore)
- [x] v1.0.0: tag, release GitHub con zip per l'uso in locale, README e relazione aggiornati
- [x] Repo resa pubblica su richiesta dell'autore; prima: pptx del professore tolto da tutta la storia (resta solo in locale, *.pptx in .gitignore), email dei commit sostituita con l'indirizzo noreply di GitHub, 21 branch secondari già uniti cancellati dal remoto. Backup completo della storia precedente nello scratchpad della sessione.

### 10/11 sera — Interfaccia per telefono e tablet
- [x] Base comune (soglie, varianti, rilevamento dispositivo) e script di schermate/confronto
- [x] web A: simulazioni e scena EML; web B: esplorazione, mappa, schede, indice, impostazioni
- [x] Nodo EML su telefono: comandi impilati (orchestratore)
- [x] Desktop invariato: 30/33 situazioni a 0 differenze; scarti solo per il tremolio della capsula e il caricamento delle formule
- [x] Pubblicato su Vercel
- Problema 10/11: due interruzioni di Claude Code per memoria bassa del PC durante le schermate (Chrome headless con WebGL); risolto chiudendo programmi secondari (autorizzato dall'autore) e lavorando una risoluzione alla volta.
- Da rifinire: sul tablet orizzontale la scheda del punto copre la miniatura della mappa; nel telefono verticale il circuito dell'autoinduzione è un po' tagliato a sinistra.

### 11/11 ore 04:00 — v1.1.0: 14 note dell'autore (piano in `docs/piano-v1.1.md`, programmato)
- [ ] P1 Voci mai sovrapposte (modulo/simulazione) — nota 1
- [ ] P1 X in alto a destra in tutte le simulazioni, EML compreso — nota 2
- [ ] P2 Icone dei punti di simulazione: simbolo unico, colori diversi — nota 3
- [ ] P1 EML: camera guidata a coordinate assolute, inquadrature più larghe — nota 4
- [ ] P1 EML: ambiente e simulazione uniti in uno solo, niente simulazione-copia senza icone — note 5-6
- [ ] P2 Mini-mappa mobile: cono di luce rotto — nota 7
- [ ] P2 Valori discreti sugli elementi (es. temperatura del campione) — nota 8
- [ ] P2 Cupola: diretta dalla ISS opzionale + planisfero con posizione, data e ora — nota 9
- [ ] P2 Pulsante per cambiare sezione nelle simulazioni (Aurora...) — nota 10
- [ ] P1 Tasto muto immediato e affidabile — nota 11
- [ ] P1 Audio delle simulazioni sempre affidabile — nota 12
- [ ] P2 Musica calma e sintetica dentro le simulazioni — nota 13
- [ ] P2 Nome dello strumento accanto al punto luminoso — nota 14
- [ ] P1 QA su desktop, tablet, telefono; v1.1.0 (tag, release), push, Vercel, resoconto Telegram
