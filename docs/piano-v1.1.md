# Piano v1.1.0 — correzioni dell'autore (10/11 sera), esecuzione programmata 11/11 ore 04:00

Fonte: messaggio dell'autore del 10/11/2026 sera. Esecuzione autonoma dell'orchestratore con i subagent; resoconto finale su Telegram.
Regole sempre valide: CLAUDE.md (§18 crediti, §19 subagent, §21 Telegram e git). Desktop: le modifiche richieste qui valgono anche per il desktop (non è più un lavoro "solo mobile").

## Le 14 note dell'autore (riferimento, numerate)
1. **Voci sovrapposte:** se la voce del modulo sta parlando e apro una simulazione, le voci si sovrappongono. Una sola voce alla volta.
2. **X di uscita:** ogni simulazione deve avere sempre la X in alto a destra (nell'EML non c'è).
3. **Icone secondarie delle simulazioni:** troppo simili/uguali a quelle del punto di interesse generico. Simbolo unico per i punti di simulazione, differenziati per colore.
4. **Camera guidata dell'EML:** inquadrature sbagliate (troppo zoom, focus nei punti sbagliati); allontanare la visuale. Ogni passo deve portare la camera a **coordinate assolute** (posizione + target), non a movimenti relativi, perché l'utente può aver spostato la vista.
5. **Icone dentro l'esperimento EML** portano a una simulazione identica all'EML ma senza icone: strano, da risolvere.
6. **Ambiente EML e simulazione EML:** unirli, deve esisterne uno solo (con hotspot, passi guidati, X, fenomeni).
7. **Mini-mappa su mobile:** a un certo punto il cono di luce è diventato due linee grigie (bug).
8. **Valori sugli elementi:** nelle simulazioni che lo permettono, piccole etichette con un valore utile (es. temperatura del campione nell'EML). Massimo 1-2 per elemento, discrete, non invadenti.
9. **Cupola in tempo reale:** opzione nelle Impostazioni per sostituire il render fisso della Terra con la visuale in diretta dalla ISS (altrimenti resta il render). Nella Cupola: scritta che è la diretta + piccola mini-mappa del planisfero, ingrandibile, con la posizione attuale della ISS e data e ora sotto.
10. **Sezioni delle simulazioni:** se una simulazione ha più sezioni (es. Aurora: particella e campo in 2D / Terra con la ISS che orbita), un pulsante per passare dall'una all'altra senza avviare l'esperimento guidato.
11. **Tasto muto:** a volte non funziona o risponde con molto ritardo.
12. **Audio delle simulazioni:** a volte parte, a volte no.
13. **Musica delle simulazioni:** dentro le simulazioni, al posto del sottofondo della stazione, una musica sottile e calma con suoni sintetici che suggerisce curiosità (dissolvenza incrociata in entrata/uscita).
15. **Numero di versione nell'interfaccia (aggiunta dell'autore):** mostrare la versione (es. «v1.1.0») in un punto poco visibile, piccola e a bassa opacità (es. angolo in basso, ~30-40%), letta da `package.json` a build time (Vite `define`, niente valori scritti a mano), anche su telefono/tablet senza coprire nulla.
14. **Nomi degli strumenti:** mettere il nome (es. ARED) vicino al punto luminoso di ogni strumento che ha un punto di interesse.

Alla fine: QA completo (anche altri dispositivi e risoluzioni), push, versioni GitHub (tag + release), resoconto su Telegram.

## Squadre (ondata 1, in parallelo, worktree e branch propri)
| Subagent | Branch | Note | File principali |
|---|---|---|---|
| researcher (Sonnet) | `research/iss-live` | 9 (solo fonti): stream ufficiale NASA incorporabile (iframe), API posizione ISS https con CORS, licenze; anche come mostrare il planisfero (immagine NASA pubblico dominio) | `docs/research/iss-live.md` |
| media-producer (Haiku) | `media/musica-sim` | 13: una prova breve, poi UNA traccia in loop (ElevenLabs Music o SFX), dentro il piano Starter già pagato (0 € extra; saldo 10/11 sera: 13.683/40.000 caratteri usati, ~26k liberi; non superare ~3.000 caratteri per la musica), registrare in `docs/costi.md` tramite rapporto | `assets/audio/musica/` |
| web A (Sonnet) | `web/eml-unico` | 2, 4, 5, 6, 8 (EML) | `src/simulazioni/Eml.tsx`, `src/components/EmlScene.tsx`, `src/ambienti/AmbienteLevitazione.tsx`, `src/simulazioni/passi.ts` |
| web B (Sonnet) | `web/audio-icone` | 1, 3, 7, 11, 12, 13 (integrazione), 14, 15 | `src/lib/audioGlobale.ts`, `ambient.ts`, `silenzia.ts`, `src/components/AudioToggle.tsx`, `src/simulazioni/Voce.tsx`, `src/ui/Hotspot.tsx`, `src/explore/Indicatore.tsx`, `src/ui/MiniMappa.tsx`, `src/data/iconeSim.ts` |
| web C (Sonnet) | `web/sezioni-diretta` | 8 (altre simulazioni), 9 (dopo il researcher), 10 | `src/simulazioni/{Aurora,Autoinduzione,Motore}.tsx`, `src/ambienti/*` (escluso Levitazione), `src/ui/Impostazioni.tsx`, `src/lib/preferenze.ts`, scena Cupola |
| content-writer (Sonnet) | `content/v1.1` | testi brevi: nomi degli strumenti (14), scritta e didascalie della diretta (9), etichette dei valori (8), nomi delle sezioni (10) | `content/*.json` |

Conflitti attesi su `SimulazioneShell.tsx` / `Layout.tsx` (X di A, audio di B, sezioni di C): li risolve l'orchestratore al merge, in ordine A → B → C.

## Ondata 2
- Merge in `main` (`--no-ff`), build, prova in Chrome dell'orchestratore.
- QA: qa-reviewer **Sonnet** (controllo importante): le 14 note una per una + regressioni; schermate con `scripts/qa/schermate.mjs` una risoluzione alla volta (desktop, tablet, telefono; il PC ha ~8 GB).
- Correzioni, poi **v1.1.0** (CHANGELOG, `package.json`, tag, release GitHub; zip rigenerato se il tempo lo permette), push, verifica del sito su Vercel.
- Aggiornare TASKS.md, STATE.md, DECISIONS.md, SESSION-LOG.md, costi.md.
- Resoconto finale su Telegram (cosa è fatto, cosa no, link, versione), con qualche schermata.
- **Richiesta dell'autore:** mandare su Telegram l'mp3 della musica delle simulazioni (`scripts/send-media.mjs`), appena pronta e verificata.
- **Richiesta dell'autore:** la release v1.1.0 si fa la mattina dell'11/11, a lavoro finito e verificato.
