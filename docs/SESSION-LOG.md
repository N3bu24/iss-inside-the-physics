# SESSION LOG — ISS: Inside the Physics

Diario cronologico delle sessioni. **Si aggiunge solo in fondo.**

---

## Sessione 1 — lunedì 9 novembre 2026, 12:05-12:50 circa (preparazione, in chat)

**Fatto**
- L'autore (Alessandro Bettinelli, 5ALSA) ha fornito il brief del progetto, il pptx di teoria e la consegna di Fisica ed Educazione Civica.
- Consegna inserita alla lettera nel file di istruzioni `CLAUDE.md` (sezione 0), senza analisi.
- Domande chiuse all'autore su obiettivo Agenda 2030, panorami, lingua, voce, durata, ambienti, realismo dell'EML, simulazioni, hosting, budget, audio, scope, Blender, approvazione, uso e dispositivo, educazione civica, teoria, account, consegne extra, provenienza, priorità.
- Decisioni registrate in `CLAUDE.md` (sezione 17) e in `docs/DECISIONS.md`.
- Creati `TASKS.md`, la sezione 18 (modo di lavorare), la sezione 19 (orchestratore e subagent) e la sezione 20 (continuità e `/close-session`).
- Creati i subagent in `.claude/agents/` e la skill `/close-session`.

**File principali toccati:** `CLAUDE.md`, `TASKS.md`, `docs/*`, `.claude/agents/*`, `.claude/skills/close-session/SKILL.md`.

**Problemi incontrati:** nessuno di rilievo. Segnalato all'autore che la versione completa in 3 giorni è molto ambiziosa e che l'account Vercel non è ancora pronto.

**Chiesto all'autore:** tutte le scelte elencate sopra. **Risposte:** vedi `docs/DECISIONS.md`.

**Spesa API:** 0 €.

---

## Sessioni 2-3 — 9 novembre 2026 mattina → 10 novembre 2026 mattina (orchestratore, con contesto riassunto più volte)

**Fatto**
- Fattibilità (Street View scartato, panorami ESA), piano approvato, scaffold Vite/React/TS, git e GitHub con SemVer (v0.1.0 → v0.9.5, 13 tag).
- EML in Blender (v0.5.0), 5 video dei fenomeni, scena 3D con "Avvia esperimento" in 6 passi.
- Esplorazione "fluttuante" su 6 panorami ESA + Cupola, 10 voli IA tra i moduli (Kling 3.0, poi 5 rifatti con Seedance 2.0), mini-mappa, 32 punti di interesse, 8 simulazioni, 4 ambienti interattivi, finale Obiettivi 3/7/9 e Art. 32.
- Voce ElevenLabs (Thomas A.) ~52 clip con sottotitoli; crediti completi.
- Notte 10/11: test (Opus navigazione + Sonnet scienza), correzioni v0.9.4, test di conferma, correzioni v0.9.5, relazione di avanzamento su Telegram (~85%, 7-9 ore rimaste).

**File principali toccati:** `src/**`, `content/*-v3.json`, `public/{panorami,voli,audio,video}/`, `scripts/media/`, `docs/qa/`, `docs/relazione/avanzamento-10-11.md`, `docs/costi.md`, `CHANGELOG.md`.

**Problemi incontrati:** crediti Higgsfield esauriti dal lotto Seedance 1080p (brief "rifai tutti"); panorama Tranquility ruotato di ~90°; micro-scatti dei voli Kling a 30 fps; errore React #306 nelle simulazioni; timeout occasionali di Telegram.

**Chiesto all'autore / risposte:** approvazioni su Telegram per voce, lotto voli e voce v3; test spostato alle 2:00 (orario indicativo, voli prima); rigenerare solo gli asset difettosi; usare un po' di Opus nel test; spese Higgsfield nella relazione. Ancora da ricevere: account Vercel.

**Spesa API:** Higgsfield ~21,6 $; ElevenLabs dentro il piano Starter.
