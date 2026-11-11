# QA v1.1 — 11/11/2026

Revisore: qa-reviewer (Sonnet). Branch `main`, commit c95b023. Avvio con `npm run dev` (porta 5173), Chrome headless (swiftshader), una risoluzione per volta.
Screenshot e script di prova in `docs/qa/v1.1/` (script `q-*.mjs`; uscite in `*.png` e nelle cartelle per risoluzione).
Non ho modificato il codice. Console: 0 errori in tutte le prove (file `docs/qa/v1.1/errori.txt`).

Risoluzioni provate: desktop 1280x720 (completa), 1440x900 e 1920x1080 (X/Esc, Cupola, Indice, sezioni, EML), tablet 768x1024 (touch), telefono 390x844 e 844x390 (touch). Non provate per mancanza di tempo: 1366x1024 e simili, 1024x768.

## Esito per nota

| # | Nota | Esito |
|---|------|-------|
| 1 | Una sola voce | OK con riserva (P-05: sovrapposizione di 0,3-0,8 s in dissolvenza) |
| 2 | X in ogni simulazione e nell'EML, Esc | OK. Tutte e 7 le simulazioni: «Esci» in alto a destra (20 px dal bordo a 1280/1920), Esc chiude. EML: «Esci» presente, Esc ritorna al modulo e con i passi aperti chiude prima i passi. Su telefono/tablet «Esci» è in alto accanto alla mini-mappa |
| 3 | Simbolo ▶ unico per colore | OK. Legenda «Punto con simulazione» coerente; Indice usa gli stessi colori |
| 4 | Passi EML a pose assolute | OK. Verificato spostando la camera (zoom forte, lontano): ogni passo riporta a posizione/target fissi (es. passo 1 = 3.6,1.7,8). Bobina e campione sempre visibili. Ma vedi P-01 |
| 5-6 | EML unico, niente copie, link | OK. Nessuna simulazione «eml» nel registro, la scheda `columbus-rack-eml` porta nell'EML. Indice: 48 bottoni Vai/Apri/Avvia, nessun errore |
| 7 | Cono mini-mappa su telefono | OK. 390x844, 5 navigazioni con rotazione: cono sempre pieno (gradiente presente, ID univoci), mai due linee |
| 8 | Valori | OK nei limiti di P-09/P-10 (plausibilità) e P-07 (sovrapposizioni) |
| 9 | Cupola in diretta | OK con riserve (P-02, P-03, P-04) |
| 10 | Sezioni in Aurora | OK. Pillole «Particella nel campo» / «La Terra e la ISS»: cambiano scena senza aprire i passi, ritorno funzionante |
| 11 | Muto immediato | OK. Tempo clic→silenzio misurato ~50 ms con voce in corso |
| 12 | Voce delle simulazioni | OK. Con policy autoplay stretta, dopo il «Inizia» la voce parte in aurora, motore, rmn (il «Tocca per ascoltare» non è stato necessario) |
| 13 | Musica con dissolvenza | OK per codice e file (`public/audio/ambient/simulazioni.mp3`, `ambient.ts` effettivo()/impostaInSimulazione, credito presente). Non ho potuto ascoltare né misurare il livello in headless: da verificare a orecchio |
| 14 | Nomi strumenti | OK con riserva: nei panorami le etichette si nascondono se si sovrappongono (corretto); in EML si sovrappongono (P-07), su telefono EML non ci sono (P-08) |
| 15 | Versione | PARZIALE: P-06 (si sovrappone ad altri elementi) e il numero è ancora v1.0.0 (package.json) |

## Problemi

Gravità: nessun bloccante. 2 medi alti, 6 medi, 4 minori.

### P-01 — MEDIO (priorità alta): la legenda dei gesti copre «Indietro» e «Automatico» nei passi dell'EML
- Dispositivo: desktop 1280x720 e 1440x900 (probabile anche 1920x1080).
- Riprodurre: `eml` → «Avvia esperimento» → in basso a sinistra la legenda «Avanti / indietro · Rotella · Trascina · Punto con simulazione» copre i bottoni «Indietro» e «Automatico» del pannello dei passi. Con `document.elementFromPoint` al centro dei due bottoni risponde la legenda: il clic non arriva (Indietro non raggiungibile col mouse; restano le frecce da tastiera). Screenshot: `docs/qa/v1.1/eml/1280x720-passo3.png`.
- File probabile: `src/explore/Legenda.tsx` + posizione del pannello passi (`src/simulazioni/Layout.tsx` o il pannello passi EML). Correzione: nascondere/comprimere la legenda mentre i passi sono aperti, oppure alzare il pannello.

### P-02 — MEDIO: nota della diretta troncata e coperta nella Cupola (desktop)
- 1280x720 e 1440x900. Opzione «Vista dalla Cupola in diretta» accesa → il banner «IN DIRETTA DALLA ISS» ha il testo lungo («...trasmesse in tempo reale dalle telecamere...») più largo dello spazio: a sinistra inizia con «lla NASA...» perché sta sotto il pannello «Cupola/Punti di interesse», a destra arriva alla mini-mappa. Il marcatore «Verso il finale» finisce sopra al banner. Screenshot: `docs/qa/v1.1/cupola-diretta-1440x900.png`.
- File probabile: componente della scena Cupola (banner diretta, vicino a `src/data/diretta.ts` / `src/explore/Esplora.tsx`). Correzione: larghezza massima ~ 520 px centrata, testo su più righe o accorciato; spostare il marcatore.

### P-03 — MEDIO: planisfero ingrandito, titolo coperto dal pannello laterale
- 1440x900. Clic su «Ingrandisci la mappa della ISS»: il titolo «Dove si trova ora la ISS» è parzialmente sotto il pannello «Punti di interesse» (si legge «...va ora la ISS»); il sipario scuro lascia anche vedere la mini-mappa piccola in basso a destra. Screenshot: `docs/qa/v1.1/cupola-planisfero-grande-1440x900.png`. Correzione: z-index più alto del modale o centratura.
- Funziona invece: punto ISS in posizione corretta (lon/lat coincidono con l'API: -160,3° O, 11,8° N → x=5,5%, y=43%), data e ora che si aggiornano, Esc chiude.

### P-04 — MINORE: ora della diretta senza fuso orario
- «11 novembre 2026 · 04:29:09» è in UTC (in Italia sono le 05:29). Aggiungere «UTC» o convertire all'ora locale del visitatore.

### P-05 — MINORE: sovrapposizione residua delle voci in apertura simulazione
- Misurato (1280x720): voce del modulo e voce della simulazione suonano insieme per 0,15-0,75 s mentre la prima scende in dissolvenza (volume 0,88→0,25 prima di fermarsi). Causa: `fermaVoce()` viene chiamata solo quando la simulazione (lazy) monta `Voce`, dopo il caricamento del codice. Non è una sovrapposizione prolungata, ma si sente. File: `src/simulazioni/Voce.tsx` e `src/explore/Esplora.tsx` (chiamare `fermaVoce()` già al clic che apre la simulazione).

### P-06 — MEDIO: «v1.0.0» si sovrappone ad altri elementi, e la versione non è 1.1.0
- Telefono 390x844 e 844x390, tablet 768x1024: il numero è sotto/dentro il pulsante centrale della barra («freccia su»); in Aurora su telefono finisce sopra il testo del pannello in basso; in 844x390 sopra la barra dei comandi della simulazione. Desktop: ok (in basso al centro, anche se sotto il pannello a sinistra non copre nulla).
- Il valore viene da `package.json` (corretto, nessun testo a mano) ma è ancora `1.0.0`: ricordare di portarlo a 1.1.0 con il rilascio.
- File: elemento che usa `__APP_VERSION__` (cercare in `src/App.tsx`). Correzione: sul compatto spostarlo sopra la barra o nell'angolo vuoto in alto; mai sopra ai pulsanti.

### P-07 — MEDIO: nell'EML i marcatori e le etichette si sovrappongono
- Desktop 1280x720 vista libera: l'etichetta «Correnti parassite e legge di Lenz» è tagliata dal marcatore «Il calore dall'interno»; «La bobina è un induttore» tocca «Levitazione magnetica»; il marcatore in alto («La goccia di metallo») è tagliato dal bordo superiore. Screenshot: `docs/qa/v1.1/eml/1280x720-libera.png`.
- Nei panorami l'anti-sovrapposizione delle etichette funziona (`PanoStage.tsx` righe ~130-144); nell'EML 3D no. Anche su altre simulazioni i marcatori coprono i valori: Motore («Velocità ... giri/min» coperto da un marcatore, `sim-motore-1280x720.png`), Autoinduzione («RESISTORE R» sotto un marcatore, «Corrente 4,5 A» sopra «BOBINA L» su tablet, `tablet-768x1024/sim-autoinduzione-passi.png`).
- Su Aurora il valore «Campo magnetico 10 mT» e la scritta «B USCENTE» finiscono sotto/ vicino a «Esci» e al pulsante voce (telefono e desktop).

### P-08 — MEDIO: EML su telefono e tablet affollato
- 390x844: 6-7 marcatori grandi sopra il modello, senza etichette (`.eml-compatto .hs2-tip {display:none}` in `responsive.css:128`), l'etichetta «Levitazione magne…» è tagliata dal bordo destro e il marcatore rosa è mezzo sotto la mini-mappa (anche su 768x1024).
- 844x390 (orizzontale): «Avvia esperimento» e «torna a Columbus» coprono i marcatori in basso; la lista dei fenomeni è tagliata («Solidificazione» a metà). Screenshot: `docs/qa/v1.1/telefono-orizzontale-844x390/eml.png`.
- Telefono è fuori target per il brief (tablet «accettabile»), quindi priorità inferiore a P-01/P-02.

### P-09 — MINORE (scientifico): fem del Motore non plausibile
- `Motore`: alternatore a 19 giri/min con una sola spira dà «Fem −3,5 V» e accende la lampadina. Con ω ≈ 2 rad/s servirebbe B·A ≈ 1,7 Wb. È una simulazione concettuale (badge presente) ma il valore con unità reali è fuorviante. Suggerimento: indicare «fem indotta» in unità arbitrarie oppure aumentare i giri/min (centinaia/migliaia) e il numero di spire.

### P-10 — MINORE (scientifico): valori da chiarire
- Energia: «Perdite per effetto Joule 100 %» con N2/N1 = 1: è un riferimento, non una perdita assoluta; scrivere «rispetto alla linea a 230 V» o mostrare il valore relativo con spiegazione. «Tensione 230 V» all'uscita dell'alternatore in una stazione che lavora a 120-160 V cc: contesto non ISS (didattico), accettabile.
- Aurora: «Raggio dell'elica 1,00 mm» corrisponde a un protone a ~1 km/s in 10 mT: non è l'ordine di grandezza del vento solare (centinaia di km/s) né del campo terrestre (~50 µT). Concettuale; eventualmente cambiare l'etichetta in «Raggio (unità di scena)».
- Verificati OK: EML 1250 °C riscaldamento, ~1450 °C liquido, sottoraffreddamento ~1340 °C e ricalescenza a ~1400 °C (fusione lega di nichel ~1400 °C); frequenze 140 kHz posizionamento e 380 kHz riscaldamento (coerenti con `docs/research/eml.md` e le fonti DLR/arXiv); RMN 1,5 T → 63,9 MHz (42,58 MHz/T, esatto); Autoinduzione E=½LI² (4,5 A, 3 H → 30,4 J, mostrato 30,3 J; limite ε/R = 5 A coerente con 10 V/2 Ω); Campo: ε = B·l·v = 30 µT·100 m·7,7 km/s ≈ 23 V (testo coerente con l'ordine citato dalla NASA; il valore a schermo parte da 6 V perché dipende dalla geometria).

### P-11 — MINORE: livelli di «Esci» non sempre in alto a destra su tablet e telefono
- Su 768x1024 e 390x844 «Esci» è accanto alla mini-mappa (spostato verso il centro) e nell'EML non è nell'angolo. Accettabile (sempre visibile e identico), ma la nota 2 dice «in alto a destra».

### P-12 — MINORE: altro
- L'ultima riga dell'impostazione Cupola in 1280x720 richiede scorrimento (il pannello scorre, corretto).
- Sull'EML desktop due «X» vicine: «Esci» (esce dall'EML) e la X del pannello dei passi (chiude i passi): possibile confusione; l'aiuto «Esc: il primo chiude i passi, il secondo...» spiega il comportamento ma solo nelle simulazioni.

## Regressioni
- Intro, esplora (Harmony), scheda, mini-mappa e viaggio rapido, Indice (Vai funziona, link `Simulazioni` coerenti, nessuna voce EML separata), Impostazioni (nuova opzione Cupola, interruttori, Ripristina predefinite), capsula/finale (schermata ok): nessuna regressione visibile.
- Cupola senza opzione: video registrato (badge «Foto reale», credito «Video: NASA Johnson – ISS View of Planet Earth»). Con opzione: iframe youtube-nocookie dello stream NASA (verificato oggi: `isLiveNow=true`, `oembed` ok), planisfero con punto ISS; «Torna al video registrato» ripristina il video e toglie l'iframe. Badge «Ripresa reale in diretta» e credito «Video: NASA · Mappa: NASA Earth Observatory (Blue Marble)» presenti.
- Attenzione alla prova: lo stato `cupola-video` di `scripts/qa/schermate.mjs` eredita `localStorage` dallo stato `cupola-diretta` (stesso profilo) e mostra la diretta; la prova pulita (localStorage vuoto) è in `docs/qa/v1.1/q-cupola-indice.mjs`.
- Rischio da conoscere: l'ID dello stream NASA (`ROboUHfPUrU` in `src/data/diretta.ts`) può cambiare; esiste il ripiego «Apri su YouTube / torna al video». Durante la notte orbitale l'immagine è nera (già avvisato nel banner).

## Sicurezza
- `.env` è ignorato (`git check-ignore .env`), nessun `.env` tracciato (solo `.env.example`), nessuna chiave nei sorgenti/`public`/`dist` (ricerca di pattern e nomi variabile). `git status`: restano non tracciati `assets/audio/musica/genera-musica.mjs`, `saldo.mjs` e `sorgenti/` (controllare che non contengano chiavi prima di committare; non li ho letti).
- Il server di sviluppo è stato chiuso a fine prova e non restano processi Chrome.
