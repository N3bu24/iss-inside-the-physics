# TASKS — ISS: Inside the Physics

Scadenza: **giovedì 12 novembre 2026, sera**.
Regole e decisioni: vedi `CLAUDE.md`. Questo file è la lista viva dei lavori: Claude Code lo aggiorna a ogni passo (spuntando `[x]`), segnando cosa è stato tagliato e perché.

Stato e storico: `docs/STATE.md` (a che punto siamo), `docs/DECISIONS.md`, `docs/SESSION-LOG.md`, `docs/costi.md`. Alla chiusura della sessione usare `/close-session`.
Lavoro in parallelo: l'orchestratore lancia i subagent di `.claude/agents/` (vedi `CLAUDE.md` sezione 19). Solo l'orchestratore spunta questa lista.

Legenda priorità: **P1** = non si taglia mai, **P2** = importante, **P3** = si taglia per primo.

---

## Lunedì 9 — Fattibilità, piano, prototipo

- [x] P1 Leggere `CLAUDE.md` e il pptx (testo estratto in `docs/pptx-teoria.md`); riassunto vincoli → `content-writer` in corso
- [ ] P1 Verificare Street View della ISS (panorami disponibili, embed, API, policy) → `researcher` in corso
- [x] P1 Verificare che Blender si avvii da terminale (5.2.3 LTS, percorso completo in `BLENDER_PATH`, non nel PATH)
- [x] P1 Verificare che le chiavi in `.env` funzionino (ElevenLabs Starter OK, Higgsfield auth OK senza spesa)
- [x] P1 Provare il bot Telegram: messaggio di prova inviato (`--ask` da provare)
- [x] P1 Presentare il piano di una pagina e ottenere l'approvazione (9/11)
- [ ] P1 Scaffold del progetto (frontend, struttura cartelle, `.gitignore` con `.env`) → git inizializzato, `web-developer` in corso
- [ ] P1 Modello EML prima versione → `blender-artist` in corso
- [ ] P1 Prototipo: schermata iniziale + 1-2 ambienti + hotspot + prima versione dell'EML

## Martedì 10 — Produzione degli asset

- [ ] P1 Modello 3D dell'EML (fedele a foto/schemi ESA-DLR) in Blender
- [ ] P1 Render: campo magnetico variabile, correnti indotte, riscaldamento Joule, fusione, solidificazione
- [ ] P1 Voce narrante sezioni EML (ElevenLabs, voce maschile calda)
- [ ] P2 Video Higgsfield: intro ISS, scene di transizione (prova breve prima)
- [ ] P2 Voci degli ambienti principali
- [ ] P2 Audio ambient spaziale con ronzio della stazione
- [ ] P2 Raccolta di foto reali ESA/NASA/DLR con crediti e licenze
- [ ] P3 Voci e clip degli ambienti secondari
- [ ] Aggiornare `docs/costi.md` dopo ogni generazione

## Mercoledì 11 — Sviluppo completo

- [ ] P1 Sezione EML completa (modello, fenomeni, video, voce, hotspot con teoria)
- [ ] P1 Navigazione tra ambienti con transizioni curate
- [ ] P1 Percorso guidato con possibilità di uscire in esplorazione libera
- [ ] P1 Sezione finale: collegamento con Obiettivo 9 e Art. 32
- [ ] P1 Badge di provenienza su ogni contenuto
- [ ] P2 Mini-mappa della ISS in alto a destra
- [ ] P2 Sottotitoli e trascrizioni, pulsante audio on/off
- [ ] P2 Sezione ricerca sui materiali
- [ ] P3 Ambienti oltre i primi 4-5
- [ ] P3 Rifiniture grafiche e animazioni extra

## Giovedì 12 — Test, relazione, pubblicazione

- [ ] P1 Test di navigazione su desktop (Chrome ed altri browser moderni)
- [ ] P1 Verifica della correttezza scientifica dei testi
- [ ] P1 Verifica fonti e crediti
- [ ] P1 Pubblicazione su Vercel e controllo del link pubblico
- [ ] P1 Relazione scritta di accompagnamento (con fonti e crediti)
- [ ] P2 Controllo delle prestazioni e dei tempi di caricamento
- [ ] P2 Verifica che il sito sia comprensibile senza spiegazioni esterne
- [ ] Dalle 17: **stop nuove funzionalità**, solo correzioni

---

## Tagli e problemi

(Claude Code scrive qui cosa è stato tagliato o non è riuscito, con data e motivo.)
