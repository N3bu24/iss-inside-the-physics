# QA notturno — navigazione ed esperienza (v0.9.3, `main`)

Data: 10/11/2026, notte. Revisore: qa-reviewer.
Build testata: `dist/` (generata il 10/11 alle 02:00, dopo l'ultimo commit `18045de`), servita con `npx vite preview --port 5191`.
Browser: Chrome 157 headless (porta 9341, WebGL SwiftShader), pilotato via CDP. Risoluzioni: 1280x720, 1440x900, 1920x1080.
Screenshot e fotogrammi: `docs/qa/screens/notte-*.jpg` (95 file, circa 13 MB).

## Verdetto generale: NON PRONTO

Un solo problema bloccante, ma grave: **la sezione finale "Dallo spazio alla Terra" è vuota**. Non c'è niente sull'Obiettivo 9 né sull'Art. 32: nessun testo, nessun hotspot, nessuna voce. Si vedono solo il titolo e la Terra. È il collegamento con l'Agenda 2030 che CLAUDE.md dice di non tagliare mai.
Dopo la correzione di B1 e dei due problemi ALTI sulla scena EML (A1, A2), il sito è presentabile.
Navigazione, voli, simulazioni, ambienti, audio e sottotitoli funzionano. In console non ci sono errori.

**Voli: 10 su 10 CORRETTI.** In nessun volo il primo o l'ultimo fotogramma si stacca dal panorama, e nel sito nessun passaggio ha stacchi o salti di orientamento.

---

## Problemi in ordine di gravità

### BLOCCANTE

**B1. La sezione finale "Dallo spazio alla Terra" non ha contenuti (Obiettivo 9, Art. 32)**
- Come riprodurlo: Inizia l'esplorazione → tappa "Finale" (oppure Cupola → ↑). La scheda mostra solo "Dallo spazio alla Terra — Innovazione, infrastrutture, salute" e il badge "Foto reale". Non ci sono punti di interesse né voce. Restano solo "Verso Cupola" e "Ricomincia dall'inizio". Vedi `notte-finale-1280.jpg`, `notte-finale-1440.jpg`, `notte-finale-1920.jpg`.
- Causa:
  - `src/data/contenuti.ts:99-106` prende hotspot e luoghi **solo** da `content/hotspot-v3.json` e `content/luoghi-v3.json`.
  - In nessuno dei due file c'è `finale`: luoghi-v3 ha harmony…cupola e amb-*; hotspot-v3 non ha voci con `luogo: finale`.
  - Gli esempi `finale-*` in `src/data/esempio-hotspot.ts:72,122-126` non si usano più.
  - Manca anche la voce. `src/ui/Voce.tsx:7` cerca `/audio/luoghi/finale.mp3`, che non esiste. Esistono invece `public/audio/finale-01..03.mp3` e i testi in `content/copioni.json` (finale-01 Maglev, ecc.).
- Correzione consigliata:
  - Aggiungere il luogo `finale` a `content/luoghi-v3.json` (punti e testo `voce`).
  - Aggiungere a `content/hotspot-v3.json` 4-6 hotspot `luogo: "finale"` con `x`/`y`: Maglev e correnti parassite (Ob. 9), motori industriali (Ob. 9), trasformatore (Ob. 7), RMN e Art. 32 (Ob. 3). I testi ci sono già in `content/copioni.json` e nel vecchio `content/hotspot.json`.
  - Unire `finale-01..03.mp3` in `public/audio/luoghi/finale.mp3` (oppure registrarlo nel manifest).
  - Verificare a 1280x720 che gli hotspot non coprano "Ricomincia dall'inizio" e "Verso Cupola".

### ALTO

**A1. Nella scena EML la scheda di un punto si sovrappone al pannello "Cosa succede nel campione": il testo non si legge**
- Come riprodurlo: tappa EML → lista "Punti di interesse" → "Correnti parassite e legge di Lenz". La scheda si apre a destra sopra il pannello dei fenomeni. Entrambi sono traslucidi, quindi i numeri e le voci del pannello (1 Campo magnetico variabile…) si leggono attraverso il testo della scheda. In più il marcatore "Levitazione magnetica" finisce sopra la scheda. Vedi `notte-eml-scheda-correnti.jpg`.
- File probabili: `src/components/FenomeniPanel.tsx` (aside `right-4 top-[15.5rem] z-30`) e `src/ui/HotspotCard.tsx:55` (stessa posizione, `z-[31]`); `src/explore/Esplora.tsx:433-436`.
- Correzione: con una scheda aperta, nascondere o ridurre FenomeniPanel (oppure spostarlo a sinistra), rendere la scheda più opaca nella scena EML e nascondere il marcatore della porta "Levitazione magnetica".

**A2. Nella scena EML, "Avvia esperimento" ha la finestra a passi coperta da marcatori ed etichette**
- Come riprodurlo: tappa EML → "Avvia esperimento". Al passo 1 e al passo 3, i marcatori 3D (es. "La bobina è un induttore", "Da Faraday all'EML") e la porta "Levitazione magnetica" si disegnano sopra il testo della finestra, che resta in parte illeggibile. La pillola "↓ torna a Columbus" copre il fondo della finestra. Prima dell'avvio copre anche il pulsante "Avvia esperimento", a tutte e tre le risoluzioni. Vedi `notte-eml-avvia-passo1.jpg`, `notte-eml-avvia-passo3.jpg`, `notte-eml-1280.jpg`, `notte-eml-1440.jpg`.
- File probabili:
  - `src/explore/Esplora.tsx:434-436`: porta ambiente a `bottom-[13rem] right-[26.5rem]`, `z-30`;
  - `src/explore/Indicatore.tsx`: pillola ↓ centrata in basso;
  - `src/components/EmlScene.tsx`: marcatori degli hotspot e sequenza alle righe 179-290.
- Correzione:
  - a sequenza aperta, nascondere i marcatori 3D e la porta ambiente (o portarli sotto la finestra);
  - nel nodo EML, spostare l'Indicatore (es. in basso a sinistra, vicino alla legenda) o nasconderlo mentre la sequenza è aperta;
  - alzare lo `z-index` della finestra.
- È la scena protagonista: va sistemata per prima dopo B1.

### MEDIO

**M1. I marcatori del panorama e gli indicatori ai bordi coprono la scheda del punto**
- Come riprodurlo: Columbus → "Il rack dell'EML". Gli indicatori del bordo destro finiscono sopra la scheda, accanto alla X di chiusura e quasi sopra. Le etichette dei marcatori sotto la scheda si leggono in trasparenza: in Harmony, "energia da conservare" compare sopra il testo della scheda del laptop. Vedi `notte-scheda-rack-eml-1280.jpg`, `notte-scheda-rack-eml-1440.jpg`, `notte-lista-rotazione-sequenza.jpg`.
- File: `src/explore/PanoStage.tsx`, funzione `proietta` (righe ~140-175: gli indicatori sono limitati a `x1` = bordo schermo); `src/ui/HotspotCard.tsx:55`.
- Correzione: con una scheda aperta, ridurre l'area utile degli indicatori a `W - 30rem - margine` e nascondere i marcatori che cadono sotto la scheda; sfondo della scheda più opaco (es. `bg-[rgba(6,10,22,.92)]`).

**M2. A 1280x720 la finestra a passi delle simulazioni copre il fenomeno e taglia "Cosa si vede"**
- Come riprodurlo: Harmony → "Cavi lungo il soffitto" → Avvia simulazione → Avvia. Al passo 2 la finestra copre trasformatore e linea, e "Cosa si vede" e la formula vanno scorsi dentro la finestra. Succede lo stesso in Motore, Autoinduzione ed EML. In Autoinduzione le etichette 3D ("GENERATORE 10 V", "INTERRUTTORE (CLICCA LA LEVA)") si disegnano sopra il testo della finestra. Vedi `notte-sim-energia-passo2.jpg`, `notte-sim-motore-passo2.jpg`, `notte-sim-autoinduzione-passo2.jpg`, `notte-sim-eml-passo2.jpg`.
- File: `src/simulazioni/SimulazioneShell.tsx` (zona in basso, `left-[400px]`), `src/simulazioni/FinestraSequenza.tsx`, `src/simulazioni/OffsetVista.tsx`; etichette `Html` di drei nei singoli file di simulazione.
- Correzione:
  - sotto ~800 px di altezza, finestra compatta (titolo e testo in 2-3 righe; "Cosa si vede" e formula in un espandibile) oppure finestra laterale a destra;
  - nascondere le etichette `Html` a sequenza aperta (o abbassare `zIndexRange`).

**M3. I crediti nel sito sono incompleti**
- Come riprodurlo: pulsante "Crediti" in basso a destra (`notte-crediti.jpg`). Fra i panorami mancano **Destiny** e **Unity**. Mancano anche il modello 3D della ISS (NASA, `ambienti/iss.glb`) e la Terra Blue Marble usati nell'ambiente "campo magnetico". Le foto NASA/ESA-DLR delle schede (`/img/poi/*`) compaiono solo nelle didascalie.
- File: `src/data/crediti.ts`. Le voci giuste sono già in `public/panorami/CREDITI.md`.
- Correzione: copiare in `crediti.ts` le righe Destiny (flickr 26121878046), Unity (flickr 25827604346), iss.glb, Blue Marble, e aggiungere una riga "Foto delle schede: NASA; ESA/DLR (GIF del campione)". Nella riga dei voli, nominare Kling 3.0 e Seedance 2.0 come in CREDITI.md.

**M4. Il requisito sul potenziale della ISS non è coerente fra due schede**
- `content/hotspot-v3.json`, `harmony-laptop` (paragrafo 3): "un margine di circa ±20 volt nei requisiti".
- `unity-airlock` (paragrafo 3): "mantenendone il potenziale entro ±40 volt, secondo il requisito di progetto".
- Nessuno dei due valori compare in `docs/research/`.
- Correzione: ricontrollare i documenti NTRS citati (19980201237, 20090028688) e usare un solo valore, citandolo (il valore di solito citato per i PCU è ±40 V).

**M5. Prestazioni: i panorami sono pesanti e i video non sono bufferizzati abbastanza prima dello scambio**
- Pagina iniziale: circa 6,3 MB. JS 363 KB gzip (1,3 MB non compressi), CSS 11 KB, `intro.jpg` 0,9 MB e `nodo.jpg` 5,1 MB caricato dietro l'introduzione.
- Ogni panorama pesa 3,8-6,2 MB (8192x4096), ogni volo 1,2-3 MB.
- In 9 voli su 10 il video ha emesso `waiting` (buffering) tra 0,2 e 0,8 s. Il test era in locale, ma con CPU satura da SwiftShader: in parte l'effetto è dell'ambiente. Su una rete scolastica, però, il rischio di un fermo-immagine all'inizio del volo è reale.
- File: `src/explore/Esplora.tsx:60-70` (`preparaVideo` aspetta solo `loadeddata`), `373-383` (precarico dei vicini dopo 1,5 s: in Harmony circa 15 MB di panorami + 7 MB di video).
- Correzione:
  - in `preparaVideo` aspettare `canplaythrough` (con timeout di 2-3 s);
  - generare panorami a 6144x3072 o 4096x2048 in JPEG progressivo (circa 1,5-2,5 MB);
  - precaricare prima il vicino "avanti" del percorso guidato.

**M6. Brief: alcune simulazioni sembrano esercizi**
- In Autoinduzione ci sono slider con valori numerici e risultati calcolati: L = 3,0 H, R = 2,0 Ω, "ε/R = 5,0 A, τ = L/R = 1,50 s", "E = ½Li² = 29,4 J". In Motore c'è "15 giri/min".
- Si aggiungono i contatori "0/4" e le spunte su punti e tappe.
- CLAUDE.md §6.2 e §12 chiedono di evitare "slider, formule e risultati numerici" e i "progressi in stile videogioco". È una valutazione, non un errore tecnico.
- Correzione: togliere dai pannelli i risultati numerici, lasciando solo le grandezze qualitative (es. "salita lenta/rapida"), e valutare se nascondere i contatori n/N.

### BASSO

- **L1. Cupola, etichette.**
  - Il riquadro dei sottotitoli copre l'etichetta del portello "Verso Tranquility" (`notte-cupola-1280.jpg`).
  - L'etichetta "Verso Dallo spazio alla Terra" è sgrammaticata.
  - File: `src/explore/Esplora.tsx:50` e `ImmagineNodo.tsx`. Correzione: usare "Verso il finale" o "Dallo spazio alla Terra", e alzare i portelli di `ImmagineNodo` o abbassare il sottotitolo.
- **L2. Marcatori sotto l'intestazione.** Marcatori ed etichette vicini al bordo alto finiscono sotto l'intestazione "ISS — Inside the Physics · Alessandro Bettinelli" e la barra delle tappe. Esempi: Harmony guardando in alto ("Il display delle comunicazioni", pitch 75); "ISS (INGRANDITA)" nell'ambiente campo; il marcatore in alto in Aurora. Correzione: in `PanoStage.proietta` (e nello shell delle simulazioni) limitare y ≥ circa 90 px.
- **L3. Suggerimento coperto.** "Guarda un portello… e premi ↑" resta coperto dalla scheda quando è aperta (`Esplora.tsx:457`, `z-30` contro la scheda `z-[31]`). Correzione: centrarlo nell'area libera o alzarne lo z.
- **L4. Sottotitoli.**
  - I numeri sono scritti in lettere, come nel copione TTS ("millenovecentonovantotto", "sette virgola sette").
  - I tempi sono stimati (2,8 parole/s scalate sulla durata), non presi dal file audio: possono andare fuori sincrono.
  - A volte un blocco finisce con ":" (Harmony).
  - File: `src/ui/Voce.tsx:17-44` e `public/audio/luoghi/manifest.json`. Correzione: una versione "da leggere" del testo con le cifre e, se possibile, i timestamp di ElevenLabs.
  - Leggibilità buona: box nero all'80%, 16 px, al massimo 2 righe.
- **L5. Micro-scatti nei 5 voli Kling a 30 fps** (harmony→destiny, harmony→kibo, kibo→harmony, tranquility→unity, unity→destiny). Un fotogramma ogni 5 è duplicato (conversione 24→30): diff fra fotogrammi consecutivi pari a 0,0 ogni 5. Correzione senza crediti: ricodificare a 24 fps, per esempio `ffmpeg -i in.mp4 -vf "decimate=cycle=5" -r 24 …`, e verificare.
- **L6. Artefatti IA a metà volo** (accettabili con il badge "Ricostruzione IA"):
  - unity→destiny: astronauta capovolto e deformato verso 3 s;
  - tranquility→unity: grande oggetto bianco sfocato a sinistra verso 1,5 s;
  - harmony→destiny: parete destra "spalmata" tra 2 e 3 s.
- **L7. Mini-mappa.** Le etichette dei moduli sono minuscole (circa 7 px) a 1280 e 1440 (`src/ui/MiniMappa.tsx`).
- **L8. Unity.** L'etichetta "Zarya (segmento russo): non percorribile" è troncata.
- **L9. Simulazione levitazione.** La guida traslucida attraversa il pannello di spiegazione e ne disturba la lettura (`notte-sim-levitazione-0.jpg`). Il carrello "Maglev" ha le ruote, in contrasto con il testo "senza ruote a contatto".
- **L10. Barra delle tappe.** L'etichetta "TAPPE SUGGERITE" si vede solo a 1920. A 1280 e 1440 manca e la barra non si capisce come percorso guidato (`src/ui/TappeBar.tsx`).
- **L11. Audio ambient.** L'audio ambient con il ronzio della stazione (DECISIONS riga 51, TASKS P2) non c'è: in pagina c'è solo l'audio della voce. Se è un taglio, va annotato in TASKS.md.
- **L12. Accessibilità.** Sotto l'introduzione i pulsanti dei marcatori di Harmony sono già nel DOM e raggiungibili con Tab.
- **L13. Testo RMN.** In `tranquility-ared`, "i protoni… precedono con frequenza f" va corretto in "compiono un moto di precessione" (o "precessano").
- **L14. Console.** Ci sono solo avvisi `THREE.Clock: This module has been deprecated` (da R3F/drei, innocui) e nessun errore JS. Un `ERR_CONNECTION_REFUSED` su `nodo.jpg` in un'esecuzione è dovuto all'ambiente di test (preview in ascolto solo su `::1`) e non si è ripetuto.

---

## Tabella dei 10 voli

Metodo:
- primo, 33%, 66% e ultimo fotogramma estratti con ffmpeg;
- confronto con la vista del panorama al portello (partenza) e con lo sguardo d'arrivo ricavato da `stazione.ts` (`yawArrivo + 180`, pitch 0, oppure `arrivo`), calcolato con `scripts/pano-view.py --fov 80`;
- in più: foglio a 2 fps, rilevamento dei tagli (scene score), diff fra fotogrammi consecutivi;
- registrazione nel sito con screencast, con gli istanti di scambio panorama→video→panorama.

Composizioni: `notte-volo-<volo>.jpg` (video contro panorama) e `notte-sito-<volo>.jpg` (passaggio nel sito).

| Volo | Motore | Partenza (yaw) → arrivo (yaw) | 1° fotogramma contro panorama | Ultimo fotogramma contro panorama | Nel sito | Verdetto |
|---|---|---|---|---|---|---|
| harmony → destiny | Kling, 30 fps | 0 → 0 | identico | identico | scambio invisibile, nessun salto | CORRETTO (L5 micro-scatti, L6 parete spalmata) |
| destiny → harmony | Seedance | 180 → 180 | identico | identico | invisibile | CORRETTO |
| harmony → columbus | Seedance | −150 → −90 | identico (portello COL fuori centro, il video gira a destra) | identico | invisibile | CORRETTO |
| columbus → harmony | Seedance | 90 → 30 | identico | identico | invisibile | CORRETTO (dopo il portello gira di circa 90° verso Destiny: plausibile) |
| harmony → kibo | Kling, 30 fps | 150 → 0 | identico (portello JEM a sinistra del centro) | identico | invisibile | CORRETTO (L5) |
| kibo → harmony | Kling, 30 fps | 180 → −30 | identico | identico | invisibile | CORRETTO (L5) |
| destiny → unity | Seedance | 0 → 0 | identico | identico | invisibile | CORRETTO |
| unity → destiny | Kling, 30 fps | 180 → 180 | identico | identico | invisibile | CORRETTO (L5, L6 astronauta deformato) |
| unity → tranquility | Seedance | 90 → 180 (`arrivoAvanti`) | identico | identico | invisibile | CORRETTO |
| tranquility → unity | Kling, 30 fps | −92 → −90 (Quest, geometricamente giusto) | identico | identico | invisibile | CORRETTO (L5, L6 oggetto sfocato) |

**Voli DA RIFARE: nessuno.**
- Nessun video "guarda indietro" e nessuno va nella direzione sbagliata.
- Nessun taglio: l'unico scene score alto è sul fotogramma 1 dei video Seedance (0,32), ma la diff media resta in linea con il resto, quindi non è uno stacco.
- Nel sito la dissolvenza di 200 ms e la compensazione della scala danno uno scambio invisibile a tutte e tre le proporzioni testate. Il FOV del video (`object-fit: cover`) è gestito bene anche a 16:10.
- Durata di un volo nel sito: circa 7-9 s, dal clic alla fine dello zoom.

---

## Cosa funziona (verificato)

- **Avvio.** Introduzione con un solo pulsante "Inizia l'esplorazione" e foto NASA accreditata. L'intestazione "ISS — Inside the Physics · Alessandro Bettinelli" c'è su ogni schermata, anche dentro simulazioni e ambienti. La barra "Tappe suggerite" è in alto. A tutte le risoluzioni non ci sono overflow né scrollbar della pagina.
- **Ingresso.** Dissolvenza e zoom morbido nel panorama di Harmony; la voce parte con i sottotitoli.
- **Comandi.**
  - Legenda (↑/↓, rotella, trascina) presente e comprimibile.
  - ↑ verso il portello inquadrato vola a Destiny; ↓ torna ad Harmony.
  - ↑ senza un portello inquadrato mostra il suggerimento "Guarda un portello…".
- **Lista dei punti.** Il clic su una voce fa ruotare la visuale in circa 1,2 s fino a centrare il punto, poi apre la scheda (`notte-lista-rotazione-sequenza.jpg`). Gli indicatori ai bordi ci sono e sono cliccabili.
- **Mini-mappa.** Evidenzia il modulo corrente, si ingrandisce, e il clic su Kibo vola fin lì (`notte-dopo-clic-mappa.jpg`).
- **Tappe.** Il volo passa per i moduli intermedi; le spunte compaiono sui moduli visitati. Il pulsante Home riporta all'introduzione.
- **Schede.**
  - Tutte le schede provate (Harmony 4, Columbus 3, EML 6, Kibo 2, Tranquility 1, Cupola 1) hanno KaTeX senza errori (0 `.katex-error`).
  - Le immagini si caricano, con didascalia e credito.
  - Badge di provenienza, fonte e slide del pptx sono presenti.
  - Lo scorrimento interno ha scrollbar sottili personalizzate: non ci sono scrollbar HTML di default (regola globale in `src/index.css:111-114`, nessun elemento con scrollbar standard).
- **8 simulazioni** (energia, autoinduzione, campo, eml, levitazione, motore, rmn, aurora): tutte si aprono dalle schede, hanno il badge "Simulazione concettuale" e la voce, "Avvia" con 5-6 passi fino a "Fine", e si chiudono con Esc.
- **"Avvia esperimento" dell'EML:** 6 passi, con lo stato della scena che cambia (vedi però A2).
- **4 ambienti interattivi** (RMN in Columbus, Energia in Unity, Levitazione nell'EML, Campo nella Cupola): si aprono e si chiudono con Esc.
- **Cupola.** Il video NASA della Terra (1920 px, `terra-cupola.mp4`) va in loop (readyState 4). Lo zoom verso il nadir di Tranquility con dissolvenza funziona.
- **Audio.**
  - L'interruttore Audio silenzia la voce ("Audio disattivato").
  - Il pulsante dei sottotitoli si attiva e disattiva.
  - La trascrizione si apre ed è riascoltabile (`notte-trascrizione.jpg`).
- **Provenienza.**
  - Durante i voli compaiono il badge "Ricostruzione IA" e la riga "Volo: ricostruzione IA (Higgsfield) da panorami ESA".
  - Panorami con "Foto reale"; EML con "Modello 3D"; simulazioni con "Simulazione concettuale".
- **Sicurezza.**
  - In `dist/`, `src/` e `public/` non ci sono chiavi né variabili di API.
  - `.env` è ignorato da git; è tracciato solo `.env.example`.
- **Brief.** Niente quiz, punteggi, missioni o tutorial obbligatori (vedi però M6).

## Correttezza scientifica (controllo a campione su `content/hotspot-v3.json` contro `docs/research/eml.md` e il pptx)

- I dati dell'EML coincidono con `docs/research/eml.md`:
  - oltre 50 campioni e più di 2000 cicli;
  - quadrupolo circa 140 kHz e dipolo circa 380 kHz (nel testo "135-155" e "365-390");
  - 18 campioni da 5-8 mm, portacampioni in ceramica e renio;
  - fino a 2000/2200 °C (Airbus/ESA), 30 000 fps secondo Airbus;
  - installazione di Gerst nel 2014, EDR, 360 kg.
- Le formule sono corrette:
  - Faraday-Neumann-Lenz, fem di moto B l v (30 µT · 100 m · 7,7 km/s ≈ 23 V);
  - P = R i² = ε²/R, L = μ₀N²S/l, E = ½Li², circuito RL e τ = L/R;
  - trasformatore ideale, T = 2πr/v ≈ 92 min;
  - Rayleigh ω² = 8σ/(ρr³) e Lamb τ = ρr²/(5η) per il modo l = 2;
  - f = γB₀/2π, F = qv×B, r = mv/(qB).
- Da correggere: M4 (±20 contro ±40 V) e L13 ("precedono").
- Semplificazioni accettabili, da rivedere solo se c'è tempo:
  - le antenne a spira (le antenne della ISS sono parabole e trombe; il testo lo dice in modo generico);
  - il DDCU descritto solo con il rapporto spire, mentre è un convertitore a commutazione con regolazione.

## Comprensibilità per il professore che arriva da solo

Buona nella stazione:
- la voce dice cosa fare ("Tocca i punti luminosi", "cliccalo per entrare nella scena tridimensionale");
- la legenda dei comandi è sempre visibile;
- la barra delle tappe offre il percorso guidato;
- la lista dei punti con rotazione automatica è molto chiara.

Tre punti deboli:
1. il finale vuoto (B1): il professore arriva alla fine e non trova il collegamento con l'educazione civica;
2. le sovrapposizioni nella scena EML (A1, A2), che è il cuore del progetto;
3. a 1280 e 1440 manca l'etichetta "Tappe suggerite" (L10).

## Note sul test

- I processi avviati per il test (preview su 5191 e Chrome su 9341) sono stati chiusi per PID. Il dev server su 5173 e gli altri Chrome non sono stati toccati.
- La CPU satura dovuta a SwiftShader può aver esagerato le pause di buffering (M5) e i tempi di caricamento. La resa visiva non ne dipende.
