# Changelog — ISS: Inside the Physics

Versioni secondo [SemVer](https://semver.org/lang/it/): `0.MINOR.PATCH` fino alla consegna.
- **MINOR**: un blocco di lavoro completato e unito in `main` (nuova sezione, asset, funzionalità).
- **PATCH**: correzioni e piccoli aggiornamenti.
- **1.0.0**: versione consegnata e pubblicata su Vercel (giovedì 12/11).

## [0.9.4] — 2026-11-10
### Corretto (test della notte)
- Finale "Dallo spazio alla Terra" completo: 4 punti (Obiettivi 3/7/9, Art. 32) con le voci registrate.
- EML: scheda e pannello non si sovrappongono più; durante "Avvia esperimento" marcatori, porta e pillola nascosti.
- Badge per tipo di nodo (EML = Modello 3D); schede opache sopra marcatori e indicatori.
- Finestra a passi compatta sotto 800 px di altezza.
- Crediti completi nel sito; "due bobine" corretto; niente "pptx" nella UI.
- Voli: 5 Kling a 24 fps nativi (niente micro-scatti); i voli attendono canplaythrough.
- Testi: cifre verificate, ±20/±40 V chiariti.

## [0.9.3] — 2026-11-10
### Cambiato
- 5 voli rifatti con Seedance 2.0 a 1080p (unity→tranquility, columbus→harmony, destiny→harmony, destiny→unity, harmony→columbus); gli altri 5 restano Kling 3.0 (crediti API esauriti).
- Arrivo in Tranquility corretto (yaw 180, pitch 0): il panorama è ruotato di circa 90°, il vecchio arrivo inquadrava un rack di sbieco.
- Crediti dei voli aggiornati.

## [0.9.2] — 2026-11-10
### Corretto (QA v0.9.0)
- Le simulazioni si aprono tutte dalle schede (niente più errore React #306 da doppio lazy): 8 simulazioni, 21 punti verificati.
- Layout delle simulazioni senza sovrapposizioni a 1280, 1440 e 1920: finestra a passi in colonna, marcatori 3D nascosti sotto i pannelli, titoli EML a capo.
- Testi solo da `content/` v3 (hotspot, luoghi, simulazioni, ambienti); tolti i testi provvisori, Art. 9/41 e i dati di esempio.
- Filtro `src/lib/pulisci.ts` contro note interne rimaste; voce di harmony-comunicazioni rigenerata.
- Errore in console della scena EML eliminato; `dedupe: ['three']`.

## [0.9.1] — 2026-11-10
### Corretto
- Campo magnetico: la Terra NASA Blue Marble ora si vede bene (lo shader che la nascondeva è stato tolto, l'atmosfera è sottile). La camera "segui ISS" mostra la stazione con la superficie terrestre sotto.

## [0.9.0] — 2026-11-10
### Aggiunto
- Movimento in un unico gesto: la camera si allinea al primo fotogramma del volo (FOV orizzontale 80°) e il video subentra in circa 200 ms. ↓ vola in avanti lungo l'arco inverso; niente più video al contrario.
- Cupola: zoom dal portello che sfocia nella Terra NASA, senza cornice.
- Indicatori dei punti di interesse ai bordi e lista laterale (il clic ruota piano la vista e apre la scheda). Marker da 58 px senza sovrapposizioni.
- Schede estese: paragrafi, formule KaTeX con spiegazione, immagini NASA/ESA, voce, pulsante "Avvia simulazione".
- Intestazione "ISS — Inside the Physics · Alessandro Bettinelli" su ogni schermata. Intro con il solo pulsante "Inizia l'esplorazione" e Tappe suggerite in alto.
- Voce v3: 51 clip, circa 15 minuti. Sottotitoli da 12-20 parole, più lenti.
- EML: "Avvia esperimento" con una sequenza di 6 passi in una finestra centrale; la camera si sposta in sincrono.
- Guscio comune per le simulazioni e 8 simulazioni: eml, campo, energia, levitazione, rmn, motore, autoinduzione, aurora.
- Campo magnetico con la Terra NASA Blue Marble e il modello NASA della ISS (ingrandito, 3,7% del raggio terrestre).
### Rimosso
- Video al contrario, volo IA verso la Cupola, cornice poligonale, scelta tra visita guidata e libera.

## [0.8.0] — 2026-11-09
### Aggiunto
- 11 voli reali tra i moduli, generati con Higgsfield Kling 3.0 dai panorami ESA: Harmony↔Columbus, Harmony↔Kibo, Harmony↔Destiny, Destiny↔Unity, Unity↔Tranquility, Tranquility→Cupola. Più le versioni `_rev` per ↓ (41 MB in tutto).

## [0.7.0] — 2026-11-09
### Aggiunto
- **Esplorazione fluttuante:** grafo di 6 moduli ESA reali (Harmony, Columbus, Kibo, Destiny, Unity, Tranquility) più la Cupola. ↑/W vola verso il portello inquadrato, ↓/S torna indietro, rotella = zoom, trascinamento = rotazione. Legenda dei comandi discreta.
- Voli tra moduli generati con Higgsfield (Kling 3.0, prima e ultima immagine dai panorami veri) e transizione procedurale di riserva.
- Cupola: video NASA reale 4K della Terra in loop, con la cornice delle 7 finestre.
- Hotspot grandi, con icone diverse per categoria; schede luogo e schede hotspot leggibili.
- Mini-mappa SVG di tutta la ISS, con cono di sguardo, moduli visitati e volo con un clic.
- 4 ambienti 3D interattivi: campo magnetico terrestre, energia di bordo, levitazione EML→Maglev, RMN.
- Contenuti v2 centrati sul pptx (23 slide mappate) e voce ridotta a una clip breve per luogo (12 clip, ~91 s).
### Da migliorare
- Chunk iniziale salito a 294 KB gzip.

## [0.6.0] — 2026-11-09
### Aggiunto
- Panorami ESA reali (Columbus, Harmony, Kibo, Tranquility), con hotspot sugli oggetti veri e collegamenti sui portelli.
- Intro e finale come foto NASA a schermo intero con effetto Ken Burns.
- Credito discreto in basso a destra, diverso per ogni tappa, e pannello "Crediti" completo.
- Precaricamento della tappa successiva e caricamento con dissolvenza.

## [0.5.0] — 2026-11-09
### Aggiunto
- EML v2: la bobina SUPOS è un tubo di rame a spirale conica (3+3 spire), con adduttori, passanti e supporti ceramici. Render senza rumore (AgX, denoise). Nuovo `eml.glb` (0,28 MB) nel sito.
- 5 video dei fenomeni (7 s, 1280x720), "Simulazione concettuale": campo variabile, correnti indotte, Joule, fusione, solidificazione. Sono in `public/video/fenomeni/`.

## [0.4.0] — 2026-11-09
### Aggiunto
- Voce narrante: 14 clip ElevenLabs (voce Thomas A., eleven_v4), 5 min 46 s in totale, in `assets/audio/clip/` e copiate in `public/audio/`.
- `scripts/send-media.mjs`: invio di render, video e audio su Telegram.

## [0.3.0] — 2026-11-09
### Aggiunto
- Contenuti veri nel sito: 27 hotspot con badge e fonte, 14 clip con sottotitoli e trascrizione.
- Modello EML reale (glb Draco locale), con hotspot 3D sui componenti. I fenomeni cambiano il materiale del campione e mostrano linee di campo e anelli di corrente.
### Migliorato
- Code-splitting: chunk iniziale da 2,3 MB a 344 KB (115 KB gzip).

## [0.2.0] — 2026-11-09
### Aggiunto
- Prototipo del sito (Vite + React + TS + Tailwind 4): intro cinematografica con stelle, viewer 360° (Photo Sphere Viewer) con hotspot e transizioni, scena 3D dell'EML (React Three Fiber), pannello dei 5 fenomeni, pannello hotspot con KaTeX, mini-mappa, barra visita guidata/esplorazione libera, narrazione con sottotitoli. Testi e panorami ancora segnaposto.
- Modello Blender dell'EML v1 (`assets/blender/`): camera sezionata, bobina SUPOS unica, campione da 6,5 mm, carosello con 18 campioni, telecamere e pirometro; export `eml.glb` (0,31 MB, Draco); anteprime.
### Da migliorare
- Bundle JS da circa 2,3 MB (serve code-splitting); spire della bobina troppo intrecciate e render rumorosi.

## [0.1.0] — 2026-11-09
### Aggiunto
- Setup del progetto: brief (`CLAUDE.md`), lista lavori, file di stato, subagent, notifiche Telegram.
- Ricerca di fattibilità: Street View (si usa il fallback), dati tecnici EML, licenze e API (`docs/research/`).
- Contenuti: struttura delle 7 tappe, 14 copioni voce (5.195 caratteri), 27 testi hotspot (`content/`).
- Testo della teoria estratto dal pptx (`docs/pptx-teoria.md`).
