# Changelog — ISS: Inside the Physics

Versioni secondo [SemVer](https://semver.org/lang/it/): `0.MINOR.PATCH` fino alla consegna.
- **MINOR**: un blocco di lavoro completato e unito in `main` (nuova sezione, asset, funzionalità).
- **PATCH**: correzioni e piccoli aggiornamenti.
- **1.0.0**: versione consegnata e pubblicata su Vercel (giovedì 12/11).

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
