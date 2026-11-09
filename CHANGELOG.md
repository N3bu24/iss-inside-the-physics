# Changelog — ISS: Inside the Physics

Versioni secondo [SemVer](https://semver.org/lang/it/): `0.MINOR.PATCH` fino alla consegna.
- **MINOR**: un blocco di lavoro completato e unito in `main` (nuova sezione, asset, funzionalità).
- **PATCH**: correzioni e piccoli aggiornamenti.
- **1.0.0**: versione consegnata e pubblicata su Vercel (giovedì 12/11).

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
