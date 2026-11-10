# QA automatico v0.11 — ISS — Inside the Physics

Data: 2026-11-10
Revisore: qa-reviewer (controlli automatici e di contenuto, nessuna modifica a codice o contenuti)
Branch: main
Ambito: compilazione, riferimenti a file, icone, contenuti delle simulazioni, correttezza scientifica (fonti web), crediti, sicurezza.
Non eseguito: test nel browser (console, navigazione, audio, video in riproduzione). Vedi nota finale.

## Tabella dei controlli

| # | Controllo | Esito | Dettaglio (file:riga) |
|---|---|---|---|
| 1a | `npx tsc --noEmit -p .` | OK | Nessun errore (exit 0). |
| 1b | `npm run build` | OK | Build completata senza avvisi (exit 0). |
| 1c | Peso chunk iniziale | OK con riserva | `dist/assets/index-Bv-OZCiQ.js`: 299,40 kB raw, 99,4 kB gzip. `dist/index.html` precarica solo `react-sySUN5R7.js` (3,28 kB gzip). Vedi problema m3. |
| 1d | Chunk più grandi | Info | `three.module-NnT90BWc.js` 744 kB (188 gzip); `katex.min-BU0w39hb.js` 259 kB (78 gzip); `react-three-fiber.esm-B2ltmM5K.js` 178 kB (57 gzip); `Esplora-C-B7sO5s.js` 168 kB (51 gzip); `EmlScene-BO5v5FDZ.js` 72 kB (26 gzip). |
| 2a | Percorsi statici `/panorami/`, `/img/`, `/models/`, `/ambienti/`, `/hdr/` in `src/` e `content/` | OK | Tutti presenti in `public/`. Eccezioni: `/video/intro-bg.mp4` (segnaposto, vedi m2). `/hdr/` non usato. |
| 2b | Percorsi `/video/` in `src/` | OK | `/video/terra-cupola.mp4`, `/video/terra-cupola-poster.jpg`, `/video/fenomeni/{campo-variabile,correnti-indotte,fusione,joule,solidificazione}.mp4` (usati da `src/simulazioni/passi.ts:22,33,44,64`), tutti presenti. |
| 2c | Percorsi `/audio/simulazioni/<id>.mp3` (8 id) | OK | `eml, campo, energia, levitazione, rmn, motore, autoinduzione, aurora` presenti, più `manifest.json`. Template in `src/simulazioni/Voce.tsx:9`. |
| 2d | `/audio/ambient/rientro.mp3` e `stazione.mp3` | OK | Presenti (`src/lib/ambient.ts:18-19`). |
| 2e | `/audio/poi/<id>.mp3` per i 32 hotspot | OK | Tutti e 32 presenti (template `src/ui/HotspotCard.tsx:16,20`). |
| 2f | `/audio/luoghi/<luogo>.mp3` per le 8 simulazioni | OK | Tutti presenti. |
| 2g | `/voli/<da>__<a>.mp4` | OK | Le 5 coppie di archi con volo (`src/data/stazione.ts:103-107`, più `Esplora.tsx:167`) hanno i due versi: harmony↔destiny, harmony↔columbus, harmony↔kibo, destiny↔unity, unity↔tranquility (10 file in `public/voli/`). Gli archi `columbus→eml`, `tranquility→cupola`, `cupola→finale` non hanno file: vale la transizione procedurale, nessun errore di percorso. Vedi m2 per la probe HEAD. |
| 2h | `/video/intro-bg.mp4` | Riserva | Non esiste. È un segnaposto (`src/components/IntroScreen.tsx:8`), usato solo se la probe risponde OK (righe 17, 29). Vedi m2. |
| 3a | Icone delle 8 simulazioni diverse | OK | `src/data/iconeSim.ts`: Atom, Compass, Zap, TrainFront, Brain, Cog, ToggleRight, Sparkles. Nomi e colori distinti. Ripiego generico `FlaskConical` non usato dagli 8 id. |
| 3b | Valori `simulazione` in `content/hotspot-v3.json` | OK | 32 punti, 29 con simulazione, 3 con `null` (`harmony-comunicazioni`, `columbus-cavi`, `tranquility-eclss`). Tutti i valori non nulli sono uno degli 8 id. Elenco: harmony-cavi→energia; harmony-attrezzi→autoinduzione; harmony-laptop→campo; columbus-rack-eml→eml; columbus-laptop→energia; eml-bobina→eml; eml-correnti→eml; eml-joule→eml; eml-induttore→autoinduzione; eml-faraday→levitazione; eml-campione→eml; kibo-elf→levitazione; kibo-joystick→motore; kibo-ricadute→levitazione; destiny-interruttori→autoinduzione; destiny-alimentazione→energia; destiny-cavi-cc→energia; unity-zarya→energia; unity-airlock→campo; unity-ventole→motore; tranquility-ared→rmn; tranquility-portello-cupola→campo; cupola-terra→campo; cupola-pannelli→energia; cupola-aurora→aurora; finale-maglev→levitazione; finale-obiettivo9→motore; finale-trasformatore→energia; finale-art32→rmn. |
| 4a | `guida` in `content/simulazioni.json` per 8 simulazioni | OK | `come_si_usa`, `comandi` (2-4 voci ciascuna) e `cosa_dimostra` non vuoti per eml, campo, energia, levitazione, rmn, motore, autoinduzione, aurora. |
| 4b | Nomi in `guida.comandi` presenti nel codice | Riserva | Trovati: Avvia esperimento, Avanti, Indietro, Automatico, Velocità orbitale, Inclinazione orbita, Segui la ISS, Rapporto spire, Ferma la rotazione, Riavvia, Velocità del carrello, Confronta con l'EML, Impulso RF, Campo B₀, Alternatore, Motore, Velocità, Induttanza L, Resistenza R, Protone, Elettrone, Campo B. Nome non identico: "Chiudi/Apri l'interruttore" (vedi m1). "Segui la ISS / Vista d'insieme" è presente come due etichette alternate (`AmbienteCampo.tsx:315`), quindi OK. |
| 4c | `content/moduli-chiusi.json`: 5 voci complete | OK | 5 voci (zvezda, zarya, pma1, pma2, quest), nessun campo vuoto. |
| 4d | Stringhe "ingrandita" e "(ridotta)" | OK | "ingrandita" solo in testo: `src/simulazioni/passi.ts:76` (testo di passo, corretto) e commento `src/ambienti/AmbienteCampo.tsx:18`. "(ridotta)" non trovato come etichetta. `src/simulazioni/Colonna.tsx:60` usa la variabile `ridotta`, non un testo. Nessuna occorrenza in `content/`. |
| 5a | PMA-2 "oggi, con un adattatore internazionale, accoglie le capsule…" | OK | Fonti: NASA/Wikipedia PMA-2 e IDA. IDA-2 montato su PMA-2 nel 2016 dopo la perdita di IDA-1; Dragon e Starliner attraccano lì. Frase corretta. |
| 5b | Dal 2007 PMA-2 sul portello frontale di Harmony | OK | Harmony installato a novembre 2007 (STS-120) e PMA-2 spostato sul suo portello frontale; in precedenza era su Destiny (2001-2007). Coerente con `content/moduli-chiusi.json`. |
| 5c | PMA-2 lanciato con Unity | OK | Confermato: Unity (con PMA-1 e PMA-2) volato con STS-88, 4 dicembre 1998. |
| 5d | Zvezda, luglio 2000 | OK | Lancio 12 luglio 2000 (Proton); attracco a Zarya il 26 luglio 2000. |
| 5e | Zarya, novembre 1998 | OK | Lancio 20 novembre 1998 (Proton). |
| 5f | Quest, luglio 2001 | OK | Installato con STS-104, lancio 12 luglio 2001. |
| 5g | PMA-1 / Unity, dicembre 1998 | OK | STS-88, 4 dicembre 1998; PMA-1 sul portello posteriore di Unity, collega a Zarya (6-7 dicembre 1998). |
| 5h | Testo del plasma di rientro in `content/capsula.json` | OK | Paragrafo 2: aria compressa e riscaldata davanti alla capsula, ionizzazione e plasma luminoso, frenata atmosferica. Fisicamente corretto a livello divulgativo. Nota: il testo della nota di provenienza è coerente con la licenza (ricostruzione e simulazione concettuale). |
| 6a | `src/data/crediti.ts`: nessun uso del video NASA nel finale | OK | Il video `video/terra-cupola.mp4` è citato solo per la Cupola (`src/explore/ImmagineNodo.tsx:7`). Il finale non lo usa (nessun riferimento in `CapsulaRientro.tsx`). |
| 6b | Crediti della capsula e del rombo del rientro | OK | `creditiAltri` (`crediti.ts` righe 26-27 circa): "Capsula di rientro (finale)" con modello Blender e plasma concettuale; "Audio di sottofondo" con "Il rombo del rientro: ElevenLabs Sound Effects + sintesi". |
| 6c | `content/strumenti.json` letto da un componente | OK | `src/data/extra.ts:2` importa il file; `src/components/Crediti.tsx:2` lo usa. |
| 7a | `git ls-files` con "env" | OK | Solo `.env.example` (e `src/vite-env.d.ts`, che non è un file di ambiente). `.gitignore` contiene `.env` e `.env.*`, con `!.env.example`. |
| 7b | Stringhe da chiave (`sk_`, `xi-api-key`, `Bearer `, `hf_`) in `src/`, `public/`, `content/`, `dist/`, `index.html`, `vite.config.*` | OK | Nessuna occorrenza. `import.meta.env` usato solo per flag `DEV` (`CapsulaRientro.tsx:159,246`, `Esplora.tsx:529`, `simulazioni/Layout.tsx:78`). Script con chiavi solo in `scripts/media/` e `scripts/notify.mjs`, fuori dal bundle. |

## Problemi in ordine di gravità

### Bloccanti
Nessuno.

### Importanti
Nessuno confermato con i controlli automatici.

### Minori

**m1. Nome del comando «Chiudi/Apri l'interruttore» non corrisponde all'etichetta del pulsante**
- Dove: `content/simulazioni.json:432`; etichetta reale in `src/simulazioni/Autoinduzione.tsx:297` («Apri l'interruttore» / «Chiudi l'interruttore», a seconda dello stato).
- Riproduzione: aprire la simulazione Autoinduzione, leggere la guida «Comandi» e cercare il nome: il pulsante ha un'altra etichetta.
- Correzione: in `content/simulazioni.json:432` usare «Apri / chiudi l'interruttore» oppure «Interruttore (apri/chiudi)» e, se serve, lasciare la descrizione invariata. Il contenuto è di `content-writer`.

**m2. Richieste HEAD verso file inesistenti: possibili errori 404 in console**
- Dove: `src/lib/assets.ts:7-11` (`assetExists` usa `fetch(..., HEAD)`). Chiamate su file assenti:
  - `/video/intro-bg.mp4`: `src/components/IntroScreen.tsx:8,17` (la probe parte a ogni caricamento della schermata iniziale).
  - `/voli/<da>__<a>.mp4` per i portelli senza volo: `src/explore/Esplora.tsx:491` (e `:167`). Coppie senza file: `columbus__eml`, `eml__columbus`, `tranquility__cupola`, `cupola__tranquility`, `cupola__finale`, `finale__cupola` (verificare la lista esatta nel browser).
- Riproduzione: aprire il sito con la console di DevTools e osservare le risposte 404 nella scheda Rete; non eseguito in questo controllo.
- Correzione: per i portelli senza volo dichiarato non fare la probe (usare solo `video` dichiarato o un elenco statico dei voli esistenti); per l'intro, rimuovere la probe finché il file non esiste, oppure creare il file. Verificare che la console sia pulita.

**m3. Peso del primo caricamento da verificare nel browser**
- Dove: `dist/assets/index-Bv-OZCiQ.js` (99,4 kB gzip) più CSS `index-fQaJCg4B.css` (13 kB gzip, o `index-*.css` attuale 12,98 kB) più `react` (3,3 kB gzip). Il chunk `index` è il più pesante del caricamento iniziale; i chunk three/katex/Esplora risultano separati, ma non ho verificato in rete quali siano scaricati al primo avvio.
- Riproduzione: `npm run build`, poi `npx vite preview` e osservare la scheda Rete con cache disabilitata.
- Correzione: se il primo caricamento supera circa 150 kB gzip senza contare i video, valutare lazy-load di moduli non usati alla partenza. Non urgente.

### Note di controllo non eseguito
- Non ho avviato il sito nel browser: console, navigazione, audio on/off, sottotitoli e video in riproduzione restano da verificare.
- Le verifiche di fonte (sezione 5) sono fatte con ricerca web; le date e il ruolo di PMA-2 risultano confermati da più fonti, ma non da una pagina NASA citata direttamente.
- Nessun problema di sicurezza: nessuna chiave nel bundle o nei file pubblicati.
