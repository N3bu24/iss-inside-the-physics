# DECISIONS — ISS: Inside the Physics

Registro delle decisioni. **Si aggiunge solo in fondo.** Se una decisione cambia, si aggiunge una nuova voce che dice cosa sostituisce, senza cancellare la vecchia.

Formato: data, decisione, motivo, alternative scartate.

---

## 2026-11-09 (sessione 1)

### D01. Tema centrale e contesto
- **Decisione:** esperienza web immersiva sulla ISS e sull'esperimento EML, con l'induzione elettromagnetica come tema scientifico centrale.
- **Motivo:** richiesta dell'autore; la consegna scolastica parte dall'induzione (Faraday-Neumann-Lenz).
- **Scartato:** sito scolastico tradizionale con quiz, esercizi, punteggi e missioni (esclusi esplicitamente).

### D02. Obiettivo Agenda 2030
- **Decisione:** Obiettivo 9 (Imprese, Innovazione, Infrastrutture): levitazione elettromagnetica, Maglev, correnti parassite. Art. 32 nella sezione finale narrativa.
- **Motivo:** il legame più naturale con l'EML (levitazione e correnti indotte).
- **Scartato:** Obiettivo 3, Obiettivo 7, più obiettivi insieme.

### D03. Fallback per i panorami 360°
- **Decisione:** se Street View non permette navigazione libera, panorami selezionati e collegati a mano con transizioni curate e hotspot propri.
- **Motivo:** il progetto non deve dipendere da una funzione che potrebbe non essere disponibile.
- **Scartato:** ambienti interamente ricostruiti in 3D; mix reale e ricostruito (restano possibili per l'EML).

### D04. Lingua
- **Decisione:** italiano per sito, voce e sottotitoli, con i termini tecnici originali (EML, Columbus).
- **Scartato:** solo italiano senza termini originali; sito bilingue.

### D05. Voce narrante
- **Decisione:** una breve clip per ogni ambiente esplorabile; voce maschile, calda, tono documentaristico pacato; sempre disattivabile, con sottotitoli e trascrizione.
- **Scartato:** solo momenti chiave; solo testo e musica; voce femminile.

### D06. Durata e ambienti
- **Decisione:** percorso guidato di circa 12-15 minuti; 6-8 ambienti esplorabili, con Columbus come fulcro.
- **Scartato:** 4-5 ambienti; 9 o più.

### D07. EML e simulazioni
- **Decisione:** modello 3D dell'EML fedele e dettagliato (foto e schemi ESA/DLR), render Blender di alta qualità; simulazioni dei fenomeni (correnti indotte, riscaldamento Joule, fusione, solidificazione) come render Blender in video, non interattive.
- **Scartato:** modello semplificato, spaccato tecnico, simulazioni interattive in Three.js, approccio ibrido.

### D08. Hosting
- **Decisione:** Vercel. Chiavi API solo lato server o variabili d'ambiente, mai nel browser.
- **Scartato:** Netlify, GitHub Pages, solo locale.

### D09. Budget API
- **Decisione:** circa 20-30 € in totale per Higgsfield ed ElevenLabs; prove brevi prima di ogni generazione; conferma dell'autore sopra circa 5 € in un passaggio o per lotti.
- **Scartato:** solo crediti gratuiti; oltre 50 €.

### D10. Audio di sottofondo
- **Decisione:** ambient spaziale minimale con ronzio realistico della stazione, sempre disattivabile.
- **Scartato:** solo suoni ambientali, musica cinematografica, nessun audio.

### D11. Scadenza e scope
- **Decisione:** consegna giovedì 12 novembre 2026, sera. Si mantiene la versione completa (6-8 ambienti) ma si sviluppa per priorità, così si può tagliare senza compromettere il resto. Priorità assoluta all'EML.
- **Motivo:** l'autore ha scelto la versione completa; la regola di taglio protegge le parti essenziali.
- **Scartato:** versione ridotta in partenza; ridotta con espansione. (Rischio segnalato all'autore: il tempo è molto poco.)

### D12. Approvazione e autonomia
- **Decisione:** plan mode con piano di una pagina; dopo l'approvazione si lavora in autonomia con un risultato visibile a fine giornata.
- **Scartato:** partenza immediata senza piano; controllo di ogni fase.

### D13. Strumenti e account
- **Decisione:** Blender installato dall'autore; Higgsfield (con crediti), ElevenLabs e GitHub pronti. Vercel da creare.

### D14. Uso e dispositivo
- **Decisione:** il professore visita il sito da solo (autoesplicativo); target desktop/laptop, tablet solo accettabile, niente ottimizzazione smartphone.

### D15. Teoria e provenienza
- **Decisione:** teoria dal pptx in hotspot e pannelli espandibili, mai obbligatoria. Badge discreto di provenienza su ogni contenuto (Foto reale, Ricostruzione IA, Modello 3D, Simulazione concettuale).

### D16. Consegne
- **Decisione:** il sito più una relazione scritta breve di accompagnamento (fonti e crediti). Nome del sito: ISS — Inside the Physics.

### D17. Gestione del lavoro
- **Decisione:** `CLAUDE.md` per le regole, `TASKS.md` per l'avanzamento, niente issue di GitHub.
- **Motivo:** in 3 giorni le issue aggiungono lavoro senza vantaggio.

### D18. Orchestratore e subagent
- **Decisione:** l'agent principale è l'orchestratore; subagent specializzati (`researcher`, `blender-artist`, `media-producer`, `web-developer`, `content-writer`, `qa-reviewer`) con una cartella ciascuno. Solo l'orchestratore aggiorna i file di stato.
- **Motivo:** velocizzare il lavoro parallelizzando; evitare conflitti sui file.

### D19. Continuità tra sessioni
- **Decisione:** skill `/close-session` che aggiorna `docs/STATE.md`, `docs/DECISIONS.md`, `docs/SESSION-LOG.md`, `docs/costi.md` e `TASKS.md`, e fornisce il prompt di ripresa.
- **Motivo:** non perdere niente tra una sessione e l'altra.

### D20. Modelli di orchestratore e subagent
- **Decisione:** orchestratore su Opus (`.claude/settings.json`); subagent mai su Opus. `researcher`, `blender-artist`, `web-developer`, `content-writer` su Sonnet con effort medio; `media-producer` e `qa-reviewer` su Haiku (il test finale di giovedì può passare a Sonnet).
- **Motivo:** la qualità serve soprattutto nella pianificazione e nel controllo; i subagent fanno lavori delimitati e in 3 giorni conta la velocità.
- **Scartato:** tutti i subagent su Opus o Fable (troppo lenti e costosi sul limite d'uso).

### D21. Notifiche e approvazioni via Telegram
- **Decisione:** bot Telegram dell'autore tramite `scripts/notify.mjs` (token e chat id nel `.env`). Avvisi su crediti esauriti, errori di API, blocchi, fine fase e chiusura sessione; approvazioni con bottoni Approva/Rifiuta per le decisioni non urgenti; hook di Claude Code che avvisano quando serve l'autore o la sessione è finita (spegnibili con `NOTIFY_HOOKS=off`).
- **Sicurezza:** solo il chat id dell'autore può rispondere ai bottoni; il token non viene mai stampato; nessun segreto nei messaggi; l'approvazione vale solo per la singola domanda e non cambia le regole di budget.
- **Scartato:** approvare i permessi degli strumenti di Claude Code da Telegram (restano in Claude Code); accettare testo libero da Telegram come istruzione.

## 9/11/2026 — Street View: si usa il fallback
- **Decisione:** non usare Google Street View. I panorami saranno collegati a mano in Photo Sphere Viewer. Le fonti sono, in ordine: fotogrammi equirettangolari dai video 360 ESA (Columbus, Cupola, Node 2), se la licenza lo permette; altrimenti ambienti ricostruiti in Blender o foto reali NASA (pubblico dominio).
- **Motivo:** l'iframe Embed non permette hotspot né navigazione controllata. Scaricare le immagini viola i ToS di Google (vedi `docs/research/street-view.md`).

## 9/11/2026 — Integrazione contenuti e modello (v0.3.0)
- I contenuti si importano a build time da `content/*.json`, con l'alias Vite `@content` e senza fetch.
- L'audio è organizzato per id di clip: `public/audio/<id-clip>.mp3`. I sottotitoli si generano dal copione invece che da file VTT.
- Il decoder Draco è locale in `public/draco/`. Il modello EML è normalizzato sulla camera di processo.
- Le posizioni degli hotspot stanno in `src/data/posizioni.ts`, separate dai testi.
- Code-splitting: il chunk iniziale pesa 115 KB gzip. PSV, la scena 3D e KaTeX si caricano solo quando servono.

## 9/11/2026 — Voce narrante
- **Decisione:** voce ElevenLabs "Thomas A. - Italian PRO Narrator Voice" (CITWdMEsnRduEUkNWXQv), modello eleven_v4.
- **Motivo:** approvata dall'autore con il bottone su Telegram dopo l'ascolto delle 3 prove.

## 9/11/2026 — Panorami ESA
- **Decisione (autore):** usare i panorami ESA "Space Station 360" (2016, S. Cristoforetti) per Columbus, Harmony (nodo), Kibo (materiali) e Tranquility (cupola). Foto NASA per intro e Cupola. Il credito deve essere visibile ma discreto.
- **Licenza:** ESA Standard Licence (uso educativo non commerciale con credito); NASA pubblico dominio. Crediti in `public/panorami/CREDITI.md`.

## 9/11/2026 sera — Feedback dell'autore sulla v0.8.0
- **Movimento:** un unico gesto. La camera si allinea alla vista del primo fotogramma del volo (FOV orizzontale 80°), poi il video subentra con una dissolvenza brevissima. Niente video al contrario: ↓ si gira e usa il volo in avanti dell'arco inverso.
- **Cupola:** niente volo IA né cornice delle finestre. Zoom dal portello "To CUP" che sfocia nel video NASA reale della Terra.
- **Interfaccia:** indicatori dei punti di interesse ai bordi dello schermo e lista laterale (il clic ruota piano la visuale e apre la scheda). Icone più grandi e senza sovrapposizioni. Niente barre di scorrimento predefinite.
- **Intestazione** "Alessandro Bettinelli" su ogni schermata. L'intro ha un solo pulsante, "Inizia l'esplorazione", e in alto compaiono le "Tappe suggerite".
- **Contenuti:** schede più corpose, con paragrafi, formule e immagini. Voce più ricca (fino a circa 16k caratteri) che spiega anche le simulazioni. Sottotitoli più lunghi e più lenti.
- **Simulazioni:** una per ogni punto che la merita, tutte nello stile della scena EML. L'EML ha il pulsante "Avvia esperimento" con la sequenza a passi in una finestra centrale. Il campo magnetico usa la Terra NASA vera e il modello NASA della ISS, con proporzioni più realistiche.

## 10/11/2026 (notte) — Voli v2 e test con Opus
- Decisione dell'autore: rifare il volo Unity→Tranquility e gli altri voli difettosi con un modello Higgsfield migliore (scelto Seedance 2.0 std 1080p con prima e ultima immagine). L'autore ha detto che il saldo non è un problema: lotto autorizzato senza bottone, sempre con max 2 tentativi per volo.
- Decisione dell'autore: per il test delle 7:00 un qa-reviewer usa Opus (solo navigazione ed esperienza), in deroga al §19; dopo l'esito, team di correzione in parallelo.
