# QA v0.9.0, 9 novembre 2026

Revisore: qa-reviewer. Build `npm run build` (ok, 12 s) e `vite preview` su porta 5185 (chiuso a fine prova). Browser: Chrome headless (Playwright, WebGL software), viewport 1440x810. Codice e contenuti NON modificati. Screenshot in `docs/qa/screens/qa-*.png`.

**Esito: NON PRONTO** (2 problemi bloccanti, facili da correggere). Totale: 2 bloccanti, 7 importanti, 10 minori.

---

## BLOCCANTI

### B1. Quattro simulazioni su otto mostrano "Simulazione in arrivo" (errore React #306)
- Dove: `src/ui/Simulazioni.tsx`, funzione `cerca` (circa r. 20-33) e `componentePer` (circa r. 55-60); registro in `src/simulazioni/index.ts` r. 21 (`Componente: lazy(d.load)`).
- Riproduzione (build di produzione): Esplora -> apri una scheda con simulazione -> "Avvia simulazione". Falliscono: `eml` (dalla scheda "Il rack dell'EML"), `motore` ("Il joystick di comando"), `autoinduzione` ("Interruttori e autoinduzione"), `aurora` ("Aurore dall'alto"). Console: `Minified React error #306` (lazy che risolve in un altro lazy). Schermata: `qa-sim-motore-a.png`. Funzionano `campo`, `energia`, `levitazione`, `rmn` (passano dal registro `src/ambienti/index.ts`, che restituisce funzioni) e l'"Avvia esperimento" nel nodo EML (usa `EmlScene` direttamente).
- Impatto: 11 hotspot su 28 portano a una simulazione rotta (columbus-rack-eml, eml-bobina, eml-correnti, eml-joule, eml-campione, eml-induttore, harmony-attrezzi, destiny-interruttori, kibo-joystick, unity-ventole, cupola-aurora). Il bottone principale delle schede EML non funziona.
- Correzione proposta: in `cerca`, se la voce ha `load`, restituire `(await v.load()).default` invece di `v.Componente`; oppure rendere direttamente `Componente` senza il secondo `lazy`. Rifare la prova per tutte e 8.

### B2. 31 etichette di lavoro "[DA VERIFICARE]" / "[da riscontrare]" visibili sul sito
- Dove: `content/hotspot-v3.json` (21 occorrenze, es. r. 118, 120, 139, 261, 452, 516, 545, 556, 619, 620, 685, 715, 716, 731, 773, 813, 879, 907) e `content/simulazioni.json` (10, es. r. 9, 70, 73, 102, 178, 260, 278, 284, 313). Sono incluse nel bundle (`dist/assets/passi-*.js`). Esempio visibile: passo 5 della simulazione RMN, `qa-sim-rmn-c.png`.
- Impatto: un professore le legge; il sito sembra una bozza.
- Correzione: eliminare i tag e inserire i valori verificati (sotto, sezione "Valori verificati"). Nei campi `fonte` e `didascalia` togliere anche "[da riscontrare]" e "URL preso da docs/research/eml.md, non riverificato in questa sessione" (eml-campione, r. 459).

---

## IMPORTANTI

### I1. Sovrapposizioni nelle simulazioni (1440x810)
- Nelle simulazioni energia e rmn i comandi in basso (cursore "Rapporto spire", "Impulso RF", "...la rotazione") sono coperti dalla finestra dei passi e dal pulsante "Fine"; il titolo della finestra è tagliato ("PASSO 5..."). Schermate: `qa-sim-energia-c.png`, `qa-sim-rmn-c.png`.
- Correzione: spostare la barra dei controlli sotto o a lato della finestra dei passi; titolo con `truncate` più corto o a due righe.

### I2. Scena EML: titolo tagliato e tooltip sovrapposti
- `qa-06-eml-esperimento.png`: titolo "EML, Electromagnetic Le..." tagliato; i tooltip "Da Faraday all'EML" e "Levitazione magnetica" coprono voci della lista e del pannello fenomeni; un marcatore copre "Correnti parassite e legge di Lenz".
- Correzione: titolo breve ("EML") nella scheda compatta; tooltip posizionati dal lato libero.

### I3. Testi provvisori duplicati e incoerenti negli ambienti (campo, energia, levitazione, rmn)
- Dove: `src/ambienti/testi.ts` (intestazione "Testi provvisori"), mostrati nei pannelli a sinistra delle simulazioni; i passi vengono invece da `content/simulazioni.json`.
- Incoerenze: RMN "Slide 6 e slide 8" (testi.ts r. ~75) contro `slide_pptx` [8, 12-17]; energia "Costituzione, Art. 41" (r. 40) e campo/levitazione "Art. 9": collegamenti costituzionali non previsti da CLAUDE.md (solo Art. 32 e Ob. 9 salvo integrazione naturale); l'Art. 41 (iniziativa economica) è un legame debole con l'energia. RMN: "serve anche a studiare perdita ossea e muscolare degli astronauti": la perdita ossea si misura soprattutto con DXA/QCT; la RMN è usata per cervello, colonna, muscolo.
- Correzione: far leggere agli ambienti `content/` (o riallineare testi.ts); togliere Art. 41 o motivarlo; correggere il riferimento slide; riformulare la frase sulla RMN.

### I4. "Le onde radio ... funzionano per induzione" (harmony-comunicazioni)
- `content/hotspot-v3.json` r. 49 (`breve`), r. 52, voce r. 67. Un'antenna a dipolo risponde soprattutto al campo elettrico; il quadro "flusso magnetico che induce fem" vale per l'antenna a spira. Affermazione generale troppo forte.
- Correzione: "Un'antenna a spira riceve il segnale per induzione: il campo magnetico dell'onda varia e induce una fem alla stessa frequenza". Togliere "funzionano per induzione" dal `breve`.

### I5. Numeri del trasporto attribuiti alla slide 23 ma non corrispondenti
- `hotspot-v3.json` r. 10 ("è il ragionamento della slide sul trasporto ... con linee a 10, 100 e 380 kV"), `simulazioni.json` r. 149-150. La slide 23 (due immagini, ho aperto `image54.png`) mostra: centrale a 10 kV, elevatore verso 220-380 kV, sottostazione 20-132 kV, 380 V industria, 220 V casa. "100 kV" non c'è.
- Correzione: usare 10 kV / 132 kV / 380 kV (o dire "ispirato alla slide") e non attribuire i valori alla slide.

### I6. Descrizione RMN per gli astronauti da correggere con fonte (tranquility-ared, passo 5 RMN)
- `hotspot-v3.json` r. 773 e `simulazioni.json` r. 260. Il testo "sulla ISS non c'è una risonanza, gli astronauti sono esaminati a terra prima e dopo il volo" è corretto, ma va citato: studio NASA/MUSC su 34 astronauti (Roberts et al., New England Journal of Medicine 2017): RMN del cervello prima e dopo il volo, cambiamenti strutturali dopo missioni lunghe.
- Correzione: sostituire `[DA VERIFICARE per quali protocolli]` con questa fonte.

### I7. Fem di moto: valori da qualificare
- `hotspot-v3.json` r. 118-120, 714-716, 879-885; `simulazioni.json` r. 90, 102. 30 µT x 100 m x 7,7 km/s = 23,1 V: aritmetica esatta. Fonti NASA (v. sotto): fino a circa 30 V su un traliccio di 100 m, e budget di circa ±20 V nei requisiti del contactor. Il "-120/-140 V senza protezione" è una previsione di modello per le configurazioni iniziali, non una misura. La modifica del campo da 20 a 50 µT negli slider è coerente con 25-45 µT lungo l'orbita.
- Correzione: scrivere "dell'ordine di 20-30 V" e "i modelli NASA prevedevano circa -140 V senza contactor"; togliere i tag.

---

## MINORI

- M1. "quasi ventisettemila chilometri all'ora" (`hotspot-v3.json` r. 878): 7,66-7,7 km/s = 27.600-27.700 km/h. Scrivere "circa 27.600".
- M2. Unità del flusso, il weber (slide 7), non compare mai in `content/` (nessuna occorrenza di "weber"/"Wb"). Aggiungerlo nella spiegazione della formula di `eml-bobina` o `eml-faraday`.
- M3. Slide 19 (circuiti in c.a., v = V0 sin ωt) solo accennata (eml-induttore, "reattanza"); slide 22 (sei tipi di centrali) copre solo pannello e turbina nel selettore della simulazione `energia`, mentre `content/mappa-pptx.md` r. 28 dichiara "selettore delle sei tipologie". Allineare la mappa o la simulazione.
- M4. `mappa-pptx.md` r. 12: "quattro mini-animazioni" per slide 6 non verificate in scena (non le ho trovate nel nodo EML).
- M5. Etichetta provenienza: l'immagine ESA/DLR della lega Al-Ni (eml-campione) è materiale reale ma la scheda ha badge "Simulazione concettuale"; i hotspot senza oggetto fotografato (tranquility-eclss, kibo-joystick con foto di Destiny, kibo-ricadute) hanno badge "Foto reale" riferito al panorama. Specificare nel badge/didascalia.
- M6. Finale: il pulsante "Ricomincia dall'inizio" copre il marcatore del portello e la sua etichetta (`qa-12-finale.png`). Cupola: i sottotitoli coprono le etichette "Aurore dall'alto" e "Le ali solari" (`qa-11-cupola.png`). Scheda hotspot: i sottotitoli passano sotto la card e il testo risulta tagliato (`qa-card-energia.png`).
- M7. Etichette troncate: mini-mappa "DALLO SPAZI...", marcatore "Il campo magnetico terre...", "Verso Dallo spazio alla Te...".
- M8. Avvisi console (non errori): "THREE.WARNING: Multiple instances of Three.js being imported" (sim energia, aurora) e "THREE.Clock deprecated". Un'altra copia di three nel bundle: verificare con `npm ls three`.
- M9. Errore isolato: `pageerror NotFoundError: Failed to execute 'removeChild'` durante l'arrivo al nodo EML (una volta, dopo il fallimento di B1). Rivedere dopo la correzione di B1.
- M10. Prestazioni: chunk JS principale 1,08 MB (310 KB gzip) e `passi-*.js` 1,0 MB (274 KB gzip, contiene tutto il contenuto JSON): avviso Vite sui chunk >900 KB. `dist` 92 MB (panorami 31 MB, audio 20 MB, voli 20 MB, video 12 MB). Carico iniziale locale rapido (load 0,6-0,9 s). Font Inter da Google Fonts (dipendenza esterna, privacy/offline). Suggerito: caricamento differito di `passi`, panorami e video solo alla visita del nodo.

---

## Verifiche positive (navigazione e interfaccia)

- Intro con "Inizia l'esplorazione" funziona; nessuna barra di scorrimento predefinita (verificati `overflow-y` e `scrollWidth`); intestazione "ISS — Inside the Physics · Alessandro Bettinelli" presente in tutte le schermate, incluse le simulazioni.
- Tappe suggerite (Harmony, Columbus, EML, Kibo, Destiny, Unity, Tranquility, Cupola, Finale): tutte raggiungibili dal clic con volo tra i moduli (arrivo in 3-30 s con GPU software). Il frecce ↓ / ↑ funzionano (Finale -> Cupola -> Tranquility -> Cupola). ↑ da Harmony richiede di inquadrare un portello (suggerimento a schermo).
- Mini-mappa con modulo corrente e visitati, lista "Punti di interesse" con conteggio, schede con badge, fonte e slide; Esc chiude la scheda e le simulazioni funzionanti. Sottotitoli, trascrizione e interruttore audio presenti.
- Nessun quiz, punteggio, missione o tutorial. Le "Tappe" e le spunte "visto" sono segnaposto di percorso, non progressi da videogioco.
- 404: nessuna risposta >=400 nelle schermate percorse. Tutte le 8 immagini delle schede esistono in `public/img/poi/` con credito e licenza.
- Sicurezza: `.env` ignorato (`.gitignore` r. 1; `git check-ignore` conferma); `git ls-files` contiene solo `.env.example`; nessun pattern di chiavi nei file tracciati; `grep "sk_"` e `"Key "` in `dist/` senza risultati; nessun riferimento a ELEVENLABS/HIGGSFIELD/TELEGRAM/process.env in `src/` e `dist/assets`.
- Voce: 51 voci, 14.100 caratteri (limite 16.000); nessuna frase oltre 30 parole; nessun simbolo/numero/unità non pronunciabile nei campi `voce`. Nessun refuso evidente trovato nei testi.
- Copertura pptx: 23 slide su 23 compaiono almeno una volta (slide 10 solo come calcolo vivo, coerente con CLAUDE.md sez. 12; slide 1, 6, 10, 19, 22, 23 con una o due voci ciascuna, quindi copertura sottile).

---

## Valori verificati per i punti dubbi (A. correttezza scientifica)

| Punto | Esito | Valore/fonte |
|---|---|---|
| Campo terrestre a 400 km | ok come ordine di grandezza | 25-45 µT lungo l'orbita (circa 25 µT sull'equatore magnetico, oltre 40 µT alle latitudini alte); 30 µT è un valore medio ragionevole. Modello di riferimento IGRF (https://www.ngdc.noaa.gov/IAGA/vmod/igrf.html). |
| Fem di moto sulla ISS | ok, 23 V coerente | NASA: fino a circa 30 V su traliccio di 100 m; budget ±20 V nel requisito contactor. https://ntrs.nasa.gov/api/citations/20090028688/downloads/20090028688.pdf ; https://ntrs.nasa.gov/api/citations/19980201237/downloads/19980201237.pdf (dati da sintesi di ricerca; i PDF sono scansioni e non li ho potuti leggere direttamente) |
| Potenziale senza plasma contactor | ok con precisazione | Modello EWB: circa -140 V (stima NASA iniziale -120 V) per le configurazioni iniziali. Requisito: struttura entro ±40 V dal plasma. Stessi documenti NTRS. |
| DDCU 160 V / 124,5 V | confermato | Primario: punto di massima potenza dei pannelli, 160 V (intervallo 137-173 V). Secondario nominale 124,5 V ±1,5 V. Efficienza 95% (DDCU da 6,25 kW, NASA/IECEC 2002). https://ntrs.nasa.gov/citations/20020083039 ; https://en.wikipedia.org/wiki/Electrical_system_of_the_International_Space_Station |
| Trasformatore ad alta frequenza nel DDCU | confermato | Convertitore push-pull alimentato in corrente (Weinberg migliorato) con trasformatore di isolamento, a commutazione. Fonte: stesso documento NTRS 20020083039. Si può togliere il tag. |
| EML 140 e 380 kHz | confermato | Una sola bobina, due correnti: posizionamento 135-155 kHz (quadrupolo), riscaldamento 365-390 kHz (dipolo). https://arxiv.org/pdf/1605.03511 ; https://spaceflight101.com/iss/?p=567 |
| EML temperatura | confermato | Fino a 2000 °C (Airbus), 2200 °C (ESA 2024), 2100 °C massimo secondo Spaceflight101; riscaldamento fino a 100 K/s. "Oltre 2000 °C" va bene. |
| EML campioni | confermato | 18 per magazzino, sfere 5-8 mm; oltre 50 campioni, più di 2000 cicli (DLR). https://www.dlr.de/en/fm/research-and-transfer/research-infrastructure/electromagnetic-levitator-iss-1 |
| Soglia Maglev e record | confermato (fonti terze) | Sollevamento a circa 150 km/h (sotto: ruote), distanza circa 10 cm; record 603 km/h il 21 aprile 2015 (L0, Yamanashi), precedente 581 km/h (2003). La pagina ufficiale JR Central non è stata raggiunta: https://en.wikipedia.org/wiki/Maglev ; https://www.jrailpass.com/blog/maglev-bullet-train |
| ELF in Kibo | confermato | Levitazione elettrostatica, riscaldamento con laser, fino a circa 3000 °C (termometro 300-3000 °C), campioni sferici da circa 2 mm, installata nel 2015, operativa dal 2016. https://iss.jaxa.jp/en/kiboexp/1810_elf_en.html ; https://spaceflight101.com/iss/?p=648 |
| AGC / Ga2O3 (24 marzo 2022) | confermato | Prima misura di viscosità, tensione superficiale e densità del Ga2O3 fuso sulla ISS. https://www.agc.com/en/news/detail/1202862_2814.html |
| OGA in Tranquility | confermato | Elettrolisi dell'acqua (cella a membrana polimerica), integrato nel Node 3. https://ntrs.nasa.gov/citations/19990087366 ; https://www.nasa.gov/sites/default/files/atoms/files/g-281237_eclss_0.pdf |
| RMN e astronauti | vedi I6 | Roberts et al., NEJM 2017 (RMN cerebrale prima/dopo volo su 34 astronauti, NASA/MUSC). Nessuna risonanza a bordo. |
| Formule di fluidodinamica nell'EML | corrette | Rayleigh ω² = 8σ/(ρ r³) e Lamb τ = ρ r²/(5 η) (modo l = 2): corrette. Si può togliere "[da verificare per l'EML]". |
| Date | confermate | Zarya novembre 1998, Unity dicembre 1998; Columbus febbraio 2008 (Atlantis); Tranquility e Cupola 2010; Destiny 2001. |
| Non verificato in questa prova | - | Numero e ruolo dei due plasma contactor (ridondanza); numero dei CMG (4, nel traliccio Z1, per conoscenza del revisore); metodo di cambio magazzino da parte dell'equipaggio. |

Fisica e segni controllati senza errori: ε = -dΦ/dt e verso di Lenz (repulsione, campo opposto); ε = B l v con spiegazione dell'area spazzata; trasformatore V1/V2 = N1/N2 e P conservata; P_J = R (P/V)² (10 MW, 5 Ω, 10 kV: 5 MW persi; 380 kV: circa 3,5 kW, "quasi nulla"); τ = L/R e 63%; E = ½ L i²; L = μ0 N² S / l; f = γ B0 / 2π con 42,58 MHz/T (63,9 MHz a 1,5 T, 127,7 MHz a 3 T); T orbitale 2π r/v = 92 min con r = 6770 km; posizionamento di quadrupolo verso il campo nullo; forza controelettromotrice nel motore; r = m v / (q B). Il testo "si annulla all'equatore magnetico" (campo ambiente, didascalia "reale") è corretto per un traliccio perpendicolare alla velocità (la componente utile è quella verticale di B).

## Come ho provato
Script Playwright (fuori dal progetto) che apre `http://localhost:5185/`, clicca "Inizia l'esplorazione", naviga tutte le tappe, apre una scheda per ogni simulazione, preme "Avvia", avanza i passi con ←/→ ed Esc, "Avvia esperimento" nel nodo EML, ↑/↓. Un primo giro ha avuto un crash del browser a Cupola (poca memoria con rendering software) ed è stato ripetuto solo per Cupola/Aurora/Finale/frecce. Non ho testato touch, tablet, Safari/Firefox né la riproduzione effettiva dell'audio (solo presenza dei comandi).
