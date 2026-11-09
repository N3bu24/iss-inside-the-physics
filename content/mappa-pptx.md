# Mappa del pptx (23 slide) nel sito

Sigle: ambienti = `amb-campo`, `amb-energia`, `amb-levitazione`, `amb-rmn`. Gli id dei hotspot sono in `content/hotspot.json`, quelli dei luoghi in `content/luoghi.json`.

| Slide | Argomento | Dove compare | Come si vede |
|---|---|---|---|
| 1 | Titolo: l'induzione elettromagnetica | Harmony, Columbus (schede dei luoghi); Cupola | Il filo del percorso: ogni luogo mostra un'applicazione dello stesso principio |
| 2 | Esperimento 1: spira in moto in un campo uniforme | `amb-campo`; hotspot `harmony-laptop`, `tranquility-portello-cupola`, `cupola-terra`; `eml-faraday` | La ISS come conduttore che attraversa le linee del campo terrestre; freccia della fem che cresce con la velocità |
| 3 | Esperimento 2: spira che ruota | `amb-energia` (alternatore); `eml-faraday` | Spira che ruota in un campo con onda sinusoidale della fem |
| 4 | Esperimento 3: magnete e bobina | `amb-levitazione` scena 1; `eml-bobina`; `columbus-rack-eml`; `eml-faraday` | Magnete trascinato sopra una lastra: anelli di corrente e repulsione |
| 5 | Esperimento 4: due bobine su un anello di ferro | `amb-energia` (trasformatore); `columbus-cavi`; `columbus-rack-eml`; `eml-faraday` | Primaria e secondaria su un nucleo; linee di campo che si chiudono nel ferro; cavi intrecciati nel panorama |
| 6 | Conclusione dei quattro esperimenti | `eml-faraday` | Quattro mini-animazioni con la stessa etichetta: il flusso varia |
| 7 | Flusso del campo magnetico e principio di induzione | `amb-campo`; `eml-bobina` | Superficie spazzata dalla struttura; linee di campo che attraversano il campione |
| 8 | Legge di Faraday-Neumann | `amb-campo`; `amb-rmn`; hotspot `harmony-comunicazioni`, `unity-airlock`, `eml-correnti` | Valore di fem in volt in tempo reale; antenna che riceve; segnale nella bobina RMN |
| 9 | Corrente indotta e prima legge di Ohm | `amb-campo`; `amb-levitazione`; `eml-joule`, `eml-correnti`, `eml-campione` | Correnti nella lastra e nel campione; calore Joule che arancia il materiale |
| 10 | Esercizio guidato (spira, 0,46 s, 4 mΩ) | `amb-campo` come applicazione di ΔΦ/Δt e i = ε/R | L'esercizio numerico non è riportato (CLAUDE.md sezione 12); compare solo il calcolo vivo di ε |
| 11 | Legge di Lenz | `amb-levitazione`; hotspot `eml-correnti`, `kibo-elf` | Campo indotto opposto alla variazione: repulsione del magnete e del campione; confronto con l'ELF elettrostatica |
| 12 | Autoinduzione | `amb-rmn` (magnete); hotspot `destiny-interruttori`, `eml-induttore` | Interruttore e bobina: la corrente sale lentamente |
| 13 | Induttanza e henry | `amb-rmn`; `eml-induttore` | Simbolo dell'induttore sul modello 3D della bobina |
| 14 | Induttanza del solenoide | `amb-rmn`; `eml-induttore` | Magnete RMN visto come solenoide; bobina dell'EML |
| 15 | Extracorrente di chiusura (circuito RL) | `amb-rmn`; `destiny-interruttori`; `eml-induttore` | Curva di crescita della corrente dopo la chiusura; carica graduale del magnete |
| 16 | Energia del campo magnetico: bilancio | `harmony-attrezzi`; `amb-rmn`; `eml-induttore` | Confronto tra energia chimica e magnetica |
| 17 | Energia del campo magnetico: ½ L i² | `harmony-attrezzi`; `amb-rmn`; `eml-induttore` | Area sotto la curva che rappresenta l'energia accumulata |
| 18 | Alternatore e corrente alternata | `amb-energia`; `kibo-joystick`; `unity-ventole` | Spira rotante e onda sinusoidale; motori elettrici come alternatore inverso |
| 19 | Circuiti in corrente alternata | `amb-energia`; `eml-induttore` | Onda v(t) = V0 sin ωt; bobina EML alimentata in alternata |
| 20 | Trasformatore statico | `amb-energia`; `destiny-alimentazione`; `columbus-laptop` | Rapporto spire con tensioni aggiornate; DDCU della ISS; alimentatore del laptop |
| 21 | Energia elettrica: generatore, alternatore, dinamo | `amb-energia`; `destiny-cavi-cc`; `tranquility-eclss` | Sorgente a scelta: pannello (continua) o turbina+alternatore; cavi a bordo |
| 22 | Centrali elettriche: rinnovabili e non | `amb-energia`; `unity-zarya`; `cupola-pannelli` | Selettore delle sei tipologie, con indicata la parte comune: turbina e alternatore, eccetto il fotovoltaico |
| 23 | Trasporto dell'energia elettrica | `amb-energia`; `harmony-cavi` | Linea a 10, 100 e 380 kV: corrente e perdite Joule cambiano; cavo che si scalda |

## Copertura
- 23 slide su 23 compaiono almeno una volta.
- Slide 10 (esercizio): compare solo come calcolo in tempo reale, non come esercizio.
- Slide senza appiglio spaziale diretto, collocate in `amb-energia` o `amb-rmn`: 12-17 (autoinduzione, solenoide, extracorrente, energia del campo), 18-23.
- Hotspot senza slide: `tranquility-ared` (collegato a `amb-rmn`) e `cupola-aurora` (forza di Lorentz, citata nella consegna ma non nelle slide).
- Video EML (Blender): campo variabile = slide 4, 7; correnti indotte = slide 8, 9, 11; effetto Joule = slide 9; fusione e solidificazione = slide 9.
