# QA voli Kling 3.0 (10/11/2026): rifare con Seedance o lasciare?

Metodo: ffprobe; 12 fotogrammi equidistanti per volo; viste attese generate con `scripts/pano-view.py` (fov 80, pitch 0, yaw da `docs/voli-v2.md` e `stazione.ts`, arrivo = yawArrivo+180 come in `Esplora.tsx`); confronto con i frame primo/ultimo; riferimento Seedance `columbus__harmony`. Nessun credito speso, nessun file modificato.
Tecnica: tutti e 5 i file sono 1280x720, 24 fps, 121 frame, 5,042 s (ok, coerenti con i Seedance).
Immagini: `docs/qa/screens/kling/<volo>.jpg` (12 frame, da sinistra a destra e dall'alto in basso) e `docs/qa/screens/kling/aggancio-fine-inizio.jpg` (sinistra video, destra vista attesa: tranquility__unity inizio, unity__destiny fine, kibo__harmony fine, harmony__destiny fine).

## Risultato

Sorpresa: i 5 voli Kling sono stati generati con gli stessi frame di start/end dei Seedance, e l'aggancio e' molto buono su tutti. Il confronto a occhio mostra inquadrature quasi sovrapponibili (stessa posizione di portello, etichette, cavi). La differenza di MAD pixel (6-35 contro 6-8 del Seedance) e' dovuta a texture fini e colore, non a spostamenti: non e' un indice di disallineamento.

| Volo | Voto | Aggancio inizio | Aggancio fine | Difetti | Verdetto | Priorita' |
|---|---|---|---|---|---|---|
| harmony__destiny | 3,5/5 | ottimo (hatch "PORT/OVHD" identico) | ottimo, inquadratura leggermente piu' stretta (zoom ~10%) | Fra 1,8 s e 3,5 s attraversa Destiny con forte motion blur e scie fantasma su rack e pareti (sx e dx), un oggetto marrone si deforma a dx; moto avanti corretto, portello giusto | LASCIARE (rifare solo se avanzano crediti) | bassa-media (1a fra i 5 se se ne rifa' uno) |
| harmony__kibo | 4/5 | ottimo (parete camere/"To JEM") | ottimo (portello Kibo con bandiere/JAXA, quasi identico) | Una fotocamera appesa alla parete si stacca e fluttua davanti al portello ingrandendosi (leggero morphing, ~0,5 s); resto pulito | LASCIARE | nessuna |
| kibo__harmony | 4/5 | molto buono (corridoio con portello blu "AIR", bandierine) | buono: portello/OVHD a destra, framing spostato di pochi gradi | Frame ~4,0-4,5 s: profilo del portello ondulato/elastico; blur laterale a meta' volo; testo "To Nop" illeggibile ma non inventato (c'e' anche nel panorama) | LASCIARE | bassa |
| tranquility__unity | 4/5 | ottimo (panno bianco, sacche blu, portello Unity) | ottimo (portello "To A/L" con le 2 tute EMU, stessa vista) | Attraversamento corretto e direzione giusta (nessun errore di rollio come nel vecchio unity->tranquility); lieve blur a sinistra a ~2,5 s; nessuna deformazione grave | LASCIARE | nessuna |
| unity__destiny | 3,5/5 | ottimo (portello di Destiny con astronauta nel panorama) | ottimo (Destiny, polo e rack marroni a sinistra, portello centrale, quasi identico) | L'astronauta ripreso dal panorama (parte dell'immagine originale, non inventato) vaga a mezz'aria, capovolto sul soffitto dal frame ~2 s al ~3,5 s: puo' sembrare un artefatto; fra 3,5 s e 4,5 s sinistra molto sfocata/smagliata (schermi, cavi); nessun testo inventato visibile | LASCIARE (secondo candidato al rifacimento) | bassa-media |

Confronto con i Seedance: i Seedance (es. columbus__harmony) hanno movimento piu' regolare e meno blur di scena nelle fasi di passaggio; i Kling mostrano piu' scie nelle parti veloci, ma nessuno ha geometria rotta, portelli sbagliati, flicker, loop o testi inventati. Tutti terminano nella posa attesa da `Esplora.tsx` (lo stacco video->panorama dovrebbe essere quasi invisibile). Non e' stato fatto un test visivo nel browser.

## Raccomandazione

LASCIARE tutti e 5: qualita' accettabile (3,5-4/5) con aggancio ottimo e nessun difetto bloccante. Se si vuole comunque spendere (~3,40 $ a volo Seedance 1080p), l'ordine e': 1) harmony__destiny (blur/scie piu' evidenti, volo che il visitatore vedra' per primo da Harmony), 2) unity__destiny (astronauta che fluttua capovolto e sfocature laterali). Gli altri tre non rendono il costo. Costo massimo consigliato: 2 voli, ~6,80 $.
