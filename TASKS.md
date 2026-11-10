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

- [ ] P1 Test di navigazione su desktop (a metà: QA fino a v0.10.0 fatti; manca il test finale sul link Vercel)
- [x] P1 Verifica della correttezza scientifica dei testi (test notturno Sonnet; restano FDA 2008 e OMS da confermare)
- [ ] P1 Verifica fonti e crediti (a metà: crediti completi; licenza panorami ESA da chiarire)
- [ ] P1 Pubblicazione su Vercel e controllo del link pubblico (rimandata dall'autore il 10/11; repo già importato, serve la verifica d'identità via email fatta dall'autore)
- [ ] P1 Relazione scritta di accompagnamento (a metà: PDF di 2 pagine `docs/relazione/ISS-Inside-the-Physics-relazione.pdf` + README fatti; manca solo il link Vercel al posto di `[LINK DEL SITO]` in PDF, README e `relazione-finale.md`)
- [x] P2 Prestazioni alleggerite (v0.10.0)
- [ ] P2 Prova su tablet
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
- [ ] Vercel (serve l'account dell'autore), relazione scritta, peso del bundle, prova tablet
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
- [ ] P2 Indice di tutti i contenuti (web B) — unito in main, da provare nel QA
- [ ] P2 Impostazioni + crediti con strumenti usati (web B + content) — unito in main, da provare nel QA
- [x] P2 Testi: guide, moduli chiusi, capsula, strumenti (content)
- [ ] P2 Panorama 360 dell'interno della capsula di rientro (blender) — v1 consegnata ma troppo chiara e uniforme; v2 in render
- [x] P2 Rombo del rientro, loop (media, ElevenLabs SFX)
Ondata 2:
- [ ] P2 Finale nella capsula: panorama, plasma animato, tremolio, cambio di sottofondo; voce delle simulazioni nell'audio globale (web C)
Ondata 3:
- [ ] QA delle 17 voci (qa-reviewer Sonnet), correzioni, v0.11.0, push, nuovo zip
