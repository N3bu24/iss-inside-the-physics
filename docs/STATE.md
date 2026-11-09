# STATE — ISS: Inside the Physics

**Ultimo aggiornamento:** lunedì 9 novembre 2026, ore 12:50 (sessione 1, fase di pianificazione)
**Scadenza:** giovedì 12 novembre 2026, sera
**Fase attuale:** Lunedì 9, preparazione del progetto. Nessun codice scritto, nessun asset generato, nessuna spesa API.

## Fatto
- Brief del progetto scritto e completo in `CLAUDE.md` (sezioni 1-16).
- Consegna scolastica (Fisica ed Educazione Civica, 5 LSA, primo quadrimestre) inserita alla lettera in `CLAUDE.md`, sezione 0.
- Decisioni dell'autore raccolte con domande chiuse e registrate in `CLAUDE.md` (sezione 17) e in `docs/DECISIONS.md`.
- Modo di lavorare, calendario, regola sui crediti e regola di taglio in `CLAUDE.md` (sezione 18).
- Orchestratore e subagent definiti (`CLAUDE.md` sezione 19, definizioni in `.claude/agents/`).
- Skill `/close-session` creata in `.claude/skills/close-session/SKILL.md`.
- `TASKS.md` creato con la lista dei lavori per giorno e priorità.
- Notifiche Telegram: script `scripts/notify.mjs` (messaggi, approvazioni con bottoni, hook di Claude Code), provato con un server finto; **non ancora provato con il bot vero** (serve il token dell'autore). Regole in `CLAUDE.md` sezione 21.

## In corso / a metà
- Niente di avviato.

## Prossimo passo preciso
Se il bot Telegram è configurato, provarlo con `node scripts/notify.mjs "Test"`. Poi lavorare in **plan mode**. Leggere `CLAUDE.md` e il pptx `L'induzione elettromagnetica 5LSA.pptx`. Lanciare il subagent `researcher` per verificare Street View della ISS (panorami disponibili, embed, API, policy) e le API di Higgsfield ed ElevenLabs. Verificare che Blender si avvii da terminale e che le chiavi in `.env` funzionino con una prova minima (nessuna generazione costosa). Poi presentare all'autore **un piano di una pagina** con il calendario adattato alla realtà tecnica e aspettare l'approvazione prima di scrivere codice.

## Prossimi passi dopo
1. Scaffold del progetto con `.gitignore` che esclude `.env`.
2. Prototipo: schermata iniziale, 1-2 ambienti, hotspot, prima versione dell'EML.
3. Martedì: produzione degli asset (Blender, Higgsfield, ElevenLabs, audio ambient).
4. Mercoledì: sviluppo completo del sito.
5. Giovedì: test, relazione scritta, pubblicazione su Vercel.

## Bloccato / serve l'autore
- Account **Vercel** non ancora creato: va creato e collegato a GitHub prima della pubblicazione.
- File `.env` con le chiavi Higgsfield ed ElevenLabs da mettere nella cartella di lavoro (modello in `.env.example`).
- Bot Telegram: l'autore deve crearlo con @BotFather, mettere `TELEGRAM_BOT_TOKEN` nel `.env`, scrivere /start al bot, ottenere il chat id con `node scripts/notify.mjs --find-chat-id` e metterlo in `TELEGRAM_CHAT_ID`.
- Verificare che il comando `blender` funzioni da terminale.
- Approvazione del piano di una pagina prima di partire con lo sviluppo.

## File e cartelle importanti
- `CLAUDE.md`: regole e decisioni (leggere per primo).
- `TASKS.md`: lista dei lavori.
- `docs/STATE.md`, `docs/DECISIONS.md`, `docs/SESSION-LOG.md`, `docs/costi.md`: stato e storico.
- `.claude/agents/`: definizione dei subagent.
- `.claude/skills/close-session/SKILL.md`: skill di chiusura sessione.
- `L'induzione elettromagnetica 5LSA.pptx`: teoria da seguire (da copiare nella cartella di lavoro se non c'è).

## Come avviare il progetto
Non ancora applicabile: il codice non esiste. Aggiornare questa sezione appena c'è lo scaffold.

## Stato dei subagent
Nessun subagent è ancora stato lanciato.

## Rischi aperti
- Tempo: versione completa (6-8 ambienti, render Blender) in circa 3 giorni. Mitigazione: sviluppo per priorità e regola di taglio (`CLAUDE.md` sezione 18).
- Street View degli interni ISS potrebbe non essere incorporabile o collegabile liberamente. Mitigazione: panorami collegati a mano (decisione già presa).
- Budget API limitato (circa 20-30 €). Mitigazione: prove brevi, conferma dell'autore sopra circa 5 €.
- Blender non ancora verificato da terminale.
- Vercel non ancora pronto.
