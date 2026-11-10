# STATE — ISS: Inside the Physics

**Ultimo aggiornamento:** martedì 10 novembre 2026, notte (dopo test notturno e correzioni)
**Versione:** v0.9.5 su `main` (GitHub privato N3bu24/iss-inside-the-physics)
**Scadenza:** giovedì 12 novembre 2026, sera

## Fatto
- Esplorazione "fluttuante": 6 panorami ESA reali (Harmony, Columbus, Kibo, Destiny, Unity, Tranquility) + Cupola (video NASA della Terra) + scena 3D EML + finale; ↑/↓ verso i portelli, rotella zoom, trascinamento; legenda comandi a schermo.
- 10 voli IA tra moduli senza stacchi (prima/ultima immagine dai panorami): 5 Seedance 2.0, 5 Kling 3.0 a 24 fps nativi. Test notturno: tutti corretti.
- Punti di interesse: 28 + 4 nel finale, icone per categoria, indicatori ai bordi, lista laterale con rotazione lenta, schede con testi, immagini e formule KaTeX, badge di provenienza.
- Mini-mappa SVG, "Tappe suggerite" in alto, unico bottone "Inizia l'esplorazione", intestazione autore.
- 8 simulazioni nello stile EML con finestra a passi; "Avvia esperimento" EML in 6 passi; 4 ambienti interattivi (campo terrestre, energia di bordo, levitazione/Maglev, RMN).
- Finale "Dallo spazio alla Terra" (Obiettivi 3/7/9, Art. 32) con voce.
- Voce narrante ElevenLabs (Thomas A.) ~52 clip con sottotitoli; crediti completi nel sito.
- QA: test notturno (Opus navigazione, Sonnet scienza) + test di conferma; correzioni in v0.9.4 e v0.9.5.

## Prossimo passo preciso
1. L'autore crea l'account Vercel e lo collega a GitHub → pubblicazione e prova del link.
2. Relazione scritta (content-writer, `docs/relazione/`), con fonti e crediti.
3. Ridurre il peso iniziale (chunk JS 367 KB gzip, panorami 4-6 MB, font Google) e prova su tablet.
4. QA finale giovedì, poi v1.0.0.

## Bloccato / serve l'autore
- Account Vercel.
- Verificare la licenza ESA dei panorami (su Flickr risultano "All rights reserved"; uso educativo con credito).
- Due frasi del finale da confermare con fonte (FDA 2008 per la TMS, OMS copertura universale).
- Cancellare `_duplicati/` e `.env.local`.

## Costi
Higgsfield ~21,6 $ (vedi `docs/costi.md`); ElevenLabs dentro il piano Starter.

## Come avviare
`npm install` → `npm run dev` (porta 5173) · `npm run build` per la build.

## Stato dei subagent
Nessuno attivo. Molti worktree vecchi in `.claude/worktrees/` da ripulire.
