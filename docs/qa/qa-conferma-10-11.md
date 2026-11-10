# QA di conferma v0.9.4 — 10/11/2026

Build di produzione (`npm run build`, `vite preview` porta 5194), Chrome 157 headless via CDP a 1280x720, 1440x900, 1920x1080. Screenshot in `docs/qa/screens/conferma-*.jpg`.
Console: nessun errore, nessun 404/HTTP>=400 in tutti i giri. Solo un avviso `THREE.Clock deprecated` (innocuo, minore).

## Esito per punto

### 1. Finale "Dallo spazio alla Terra" — RISOLTO con 2 riserve
- Testo del luogo presente, 4 punti visibili e cliccabili a 1280/1440/1920 (finale-maglev, finale-obiettivo9, finale-trasformatore, finale-art32); schede leggibili, scroll interno, X di chiusura funzionante. Nessuna sovrapposizione con il portello "Verso Cupola". (`conferma-finale-1440`, `-1920`, `-1280-scheda`)
- `/audio/luoghi/finale.mp3` 200/206; `/audio/poi/finale-maglev|obiettivo9|art32.mp3` 200 audio/mpeg; "Ascolta" parte (art32 verificato: paused=false, t avanza).
- **NON RISOLTO (importante)**: `finale-trasformatore.mp3` NON esiste in `public/audio/poi/` (ci sono solo maglev, obiettivo9, art32). Il server risponde 200 con `text/html` (fallback SPA), quindi `assetExists` nasconde il pulsante "Ascolta": la scheda "Dalla centrale alla città" non ha voce. Il CHANGELOG dice "4 punti con le voci registrate": non è vero per questo punto. Correzione: generare/inserire `public/audio/poi/finale-trasformatore.mp3` (ElevenLabs, prova breve) oppure togliere l'affermazione dal CHANGELOG.
- **NON RISOLTO (minore)**: etichetta portello in Cupola ancora "Verso Dallo spazio alla Terra" (`conferma-cupola-etichetta-portello-1440`); la pillola è "verso Dallo spazio alla Terra". Suggerito: "Verso il finale" o "Verso la Terra".
- **REGRESSIONE (importante)**, solo a 1280x720: il pulsante "Ricomincia dall'inizio" (basso a sinistra, y≈565) si sovrappone alla lista "Punti di interesse" e copre la quarta voce "La salute, un diritto" (`conferma-finale-1280-ricomincia-copre-lista`). A 1440 e 1920 non succede. Correzione: ancorare il pulsante sotto la lista o nascondere/spostarlo quando l'altezza è < 800 px.

### 2. EML — RISOLTO
- Scheda aperta (es. "La goccia di metallo") sostituisce il pannello "Cosa succede nel campione": nessuna sovrapposizione, testo leggibile (`conferma-eml-scheda-1440`). Chiusa la scheda, il pannello ritorna.
- "Avvia esperimento": finestra a passi (1-6) senza marcatori sopra, pillola "torna a Columbus" nascosta, il bottone non è coperto (`conferma-eml-passo3-1280`, `-passo6-1280`).
- Badge "Modello 3D" presente nella scheda luogo espansa (in fondo allo scroll interno; con scheda chiusa si vede solo il credito "Modello 3D concettuale dell'EML"). Nella finestra a passi c'è "Simulazione concettuale".
- Riserva (minore), 1280x720, passo 5 "Oscillazione": la goccia è dietro la lista "Punti di interesse" (cerchio grigio sotto "La goccia di metallo"), quindi il fenomeno dell'oscillazione non si vede bene (`conferma-eml-passo5-1280-goccia-nascosta`). Passi 3, 4, 6: goccia visibile sopra la finestra.

### 3. Panorami — RISOLTO
Scheda opaca sopra marcatori e indicatori (Harmony 1280: `conferma-panorama-scheda-1280`); X cliccabile (verificato anche nel finale). I marcatori sotto la scheda sono coperti, come previsto.

### 4. Simulazioni a 1280x720 — RISOLTO con riserve (minori)
- Energia: tutto visibile, pannello "Cosa si vede" intero (`conferma-sim-energia-1280`).
- Autoinduzione senza finestra a passi: il grafico I(t) in alto a destra copre la "Bobina L" e parte del circuito (`conferma-sim-autoinduzione-1280-grafico-su-bobina`). Con la finestra a passi il circuito è visibile e "Cosa si vede" è intero, ma i pulsanti Voce/Chiudi si sovrappongono al bordo superiore del circuito.
- Motore: la lampadina finisce sotto il grafico (senza passi) e sotto "Chiudi · Esc" (con passi); spira e magneti visibili; "Cosa si vede" intero.
- EML (finestra a passi): vedi punto 2, "Cosa si vede" intero in tutti i passi (anche il passo 6, il più lungo).

### 5. Crediti e testi — NON RISOLTO (parziale)
- Crediti nel sito: completi per panorami, foto, Terra/Blue Marble, modello ISS, video Cupola/finale, voli IA (Seedance/Kling con nota "non riprese reali"), voce ElevenLabs, render Blender, modello EML. Non ho potuto verificare file per file la licenza delle 8 immagini `img/poi` (dichiarate "NASA pubblico dominio", la GIF ESA/DLR).
- **NON RISOLTO (importante, brief "niente pptx nella UI")**: ogni scheda mostra in fondo "Fonte: Panorama ESA (Harmony); **teoria pptx 5LSA, slide 23** · Teoria: slide 23" (verificato in harmony-cavi, `conferma-scheda-fonte-pptx-1440`). Origine: campo `fonte` in `content/hotspot-v3.json` (righe 39, 72, 106, 219, 248, 324, 355, 400, 435 e altre), mostrato da `src/ui/HotspotCard.tsx` riga 110 insieme a `slide_pptx`. Il filtro `pulisci.ts` non lo toglie. Correzione: sostituire con "teoria di fisica 5LSA" o togliere il pezzo; valutare anche "Teoria: slide N" (HotspotCard.tsx:110, SimulazioneShell.tsx:205).
- **Minore**: i testi parlano ancora di "slide" (es. harmony-cavi: "È il ragionamento della slide sul trasporto dell'energia"; `simulazioni.json` righe 131, 149; `ambienti.json` riga 40) e di "teoria che elenca": fa sembrare il sito una presentazione.
- KaTeX: Larmor (f = γ/2π B0) e mutua induzione nella scheda "La salute, un diritto" resi bene (2 formule, 0 `.katex-error`; `conferma-finale-formula-larmor-1920`). Rayleigh (ω² = 8σ/ρr³) reso bene nel passo 5 dell'EML (`conferma-eml-passo5-1280-goccia-nascosta`).

### 6. Voli e console — RISOLTO
Voli Harmony→Destiny (↑), ritorno (↓), nuovo ↑ verso Columbus; tappe Harmony→Destiny→Unity→Tranquility→Cupola→Finale e Columbus→EML senza blocchi. Console pulita, nessuna richiesta fallita, audio dei luoghi 200/206.

## Riepilogo
Esito: **ok con riserve**. Da correggere prima della consegna: (1) voce mancante finale-trasformatore.mp3, (2) "teoria pptx" visibile nelle schede, (3) "Ricomincia dall'inizio" copre la 4a voce a 1280x720. Minori: etichetta "Verso Dallo spazio alla Terra", goccia nascosta al passo 5 EML a 1280x720, grafici che coprono bobina/lampadina nelle simulazioni a 1280x720, riferimenti a "slide" nei testi.
