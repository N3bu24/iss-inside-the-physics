# Panorami 360 equirettangolari degli interni ISS con licenza (9/11/2026)

Legenda: [V] verificato in questa sessione, [S] da fonte secondaria, [?] non verificato / non trovato.
Complementa `street-view.md` (Google escluso per ToS).

## Sintesi
- **Trovato il candidato principale**: l'album Flickr ufficiale ESA "Space Station 360" (europeanspaceagency, aprile 2016, scatti di S. Cristoforetti ricuciti). 8 panorami 2:1 a risoluzione altissima: **Columbus, Kibo, Harmony (Node 2), Unity (Node 1), Destiny, Tranquility (Node 3)**, più Zvezda e Zarya (russi). [V]
- **Problema di licenza**: su Flickr sono marcati **"All rights reserved"** (credito "ESA/NASA"). Non sono CC e non sono pubblico dominio. [V] Non ho potuto leggere il testo ufficiale dell'ESA Standard Licence (le pagine Terms/Copyright dell'ESA hanno risposto 404 a WebFetch). Dalle sintesi di ricerca [S]: la ESA Standard Licence ammette uso educativo/informativo con credito visibile all'ESA, esclude uso commerciale e non copre immagini di terzi. Per un sito scolastico pubblico non commerciale l'uso è plausibile, ma **non è una licenza aperta**: serve credito e, per sicurezza, una mail di richiesta a ESA (vedi sotto).
- **Cupola**: nessun fermo immagine equirettangolare riusabile trovato. Ripiego: fotogramma da video 360 ESA (licenza ESA Standard). [V sui video]
- **Wikimedia Commons** (ricerca via API: "ISS panorama", "Columbus module panorama", "International Space Station 360"; categoria "Panoramas of the International Space Station" vuota/inesistente): **nessun panorama interno ISS**. [V]
- **NASA Image Library** (query 360/panorama/spherical/cupola): unico 360 equirettangolare è `jsc2013e095202`, 4096x2048, ma è la **sala di controllo Bldg 30 FCR-1**, non la ISS. Nessun interno ISS. [V] Per i panorami NASA, pubblico dominio in generale [S], ma qui non ce ne sono.

## 1. Columbus (priorità 1) - MIGLIOR CANDIDATO
- Pagina: https://www.flickr.com/photos/europeanspaceagency/26356247791/ ("Space Station 360: Columbus", caricato 14/04/2016) [V]
- **File originale**: https://live.staticflickr.com/1656/26356247791_7d5bfc4290_o.jpg [V l'URL è quello indicato dalla pagina "sizes/o"; **non scaricato**: WebFetch ha rifiutato il file perché >10 MB]. Fallback a risoluzione minore: https://live.staticflickr.com/1656/26356247791_a087ea6e30.jpg (formato "medio", bassa risoluzione).
- Risoluzione: **20000 x 10000 px**, JPEG, rapporto 2:1 [V dimensione dichiarata da Flickr]. Descritto come panorama 360 sferico; proiezione equirettangolare [? non ispezionato visivamente, ma il 2:1 e l'uso su Flickr VR lo rendono molto probabile]. Da controllare visivamente: il nadir/zenit possono avere "toppe" di cucitura.
- Licenza: Flickr "All rights reserved". Credito: **ESA/NASA**. [V]
- Per l'uso web: ridurre a 8192x4096 (o 4096x2048 + tile) per Photo Sphere Viewer; modificare/ridimensionare l'immagine potrebbe richiedere consenso ESA se la licenza è la Standard.

## 2. Cupola (priorità 2) - nessuno still, ripiego video
- Fermo immagine equirettangolare riusabile: **non trovato**. (Quello Felix & Paul/Time su EurekAlert, https://www.eurekalert.org/multimedia/636254, ha licenza poco chiara: escluso [?].)
- **Ripiego A (consigliato)**: video 360 ESA "Cupola in 360° | Cosmic Kiss" (M. Maurer, 2021), pagina https://www.esa.int/ESA_Multimedia/Videos/2021/12/Cupola_in_360_Cosmic_Kiss [V]
  - MP4 anteprima 28,1 MB: https://media.esa.int/legacy/delivery/public/videos/2021/12/038/2112_038_AR_EN.mp4?dl
  - Sorgente MOV 2,9 GB: https://media.esa.int/legacy/delivery/public/videos/2021/12/038/orig-2112_038_AR_EN.mov?dl
  - Licenza: **ESA Standard Licence**; credito ESA/NASA. Risoluzione e proiezione: non dichiarate [?] (video 360 ESA normalmente equirettangolare 2:1, da verificare con ffprobe). Vantaggio: il fotogramma mostra anche Terra dai finestrini.
- **Ripiego A2**: "Cupola in 360° (Muninn)", M. Wandt, 2024, https://www.esa.int/ESA_Multimedia/Videos/2024/02/Cupola_in_360_Muninn [V]. MOV 489,8 MB: https://media.esa.int/legacy/delivery/public/videos/2024/02/001/orig-2402_001_AR_EN.mov?dl ; MP4 5,1 MB: https://media.esa.int/legacy/delivery/public/videos/2024/02/001/2402_001_AR_EN.mp4?dl . Licenza ESA Standard; credito **ESA-M. Wandt**. Il file da 490 MB è scaricabile in tempi ragionevoli e probabilmente a qualità sufficiente per un fotogramma.
- Nota: i video ESA possono avere vincoli aggiuntivi ("uso limitato a visione diretta/download", da fonte secondaria [S]); estrarre un fotogramma e ripubblicarlo è un uso derivato: includerlo nella richiesta a ESA.
- **Ripiego B (documentario)**: foto NASA pubblico dominio scattate dalla Cupola, es. `iss025e011750` (vista notturna del Mediterraneo da una finestra della Cupola) https://images-assets.nasa.gov/image/iss025e011750/iss025e011750~orig.jpg [V esistenza via API; l'URL ~orig.jpg segue lo schema NASA verificato su altri asset, non scaricato]. Anche `s134e008502` (Endeavour vista dalla Cupola). Da mostrare con parallasse/Ken Burns.

## 3. Nodo come ingresso (priorità 3)
Tutti dall'album ESA, stessa licenza (All rights reserved su Flickr, credito ESA/NASA) [V]:
- **Harmony (Node 2)**, **consigliato** (confinante con Columbus, ingresso naturale): https://www.flickr.com/photos/europeanspaceagency/26196096532/ ; originale **13732 x 6866**: https://live.staticflickr.com/1455/26196096532_0eb1307aaa_o.jpg
- **Unity (Node 1)**: https://www.flickr.com/photos/europeanspaceagency/25827604346/ ; **13652 x 6826**: https://live.staticflickr.com/1489/25827604346_6f22c106ca_o.jpg
- **Destiny (US Lab)**: https://www.flickr.com/photos/europeanspaceagency/26121878046/ ; **13548 x 6774**: https://live.staticflickr.com/1591/26121878046_15624525c5_o.jpg
- Tranquility (Node 3): https://www.flickr.com/photos/europeanspaceagency/26599440852/ (dimensioni non verificate)
- Alternativa video: ESA "Node 2 | Space Station 360" (Pesquet, 2021) https://esa.int/esatv/Videos/2021/08/Node_2_Space_Station_360_in_French_with_English_subtitles_available (pagina non raggiungibile da WebFetch, 404 [?]).
- Tutti i rapporti sono ~2:1 (es. 13732/6866 = 2,00) [V].

## 4. Ricerca sui materiali (priorità 4)
- **Kibo** (JAXA, ospita esperimenti di materiali): https://www.flickr.com/photos/europeanspaceagency/25933880313/ ; **13496 x 6748**: https://live.staticflickr.com/1673/25933880313_97d84d679e_o.jpg [V dimensioni]. Stessa licenza/credito.
- **Destiny**: vedi sopra (laboratorio US, MSG è dentro Columbus, non separato: il Materials Science Laboratory è in Columbus, quindi Columbus stesso copre la tappa "materiali/EML").
- Alternativa video: "Columbus, Kibo and a Dragon | Cosmic Kiss 360°" (M. Maurer, 21/02/2022), https://www.esa.int/ESA_Multimedia/Videos/2022/02/Columbus_Kibo_and_a_Dragon_Cosmic_Kiss_360 ; MP4 50,6 MB: https://media.esa.int/legacy/delivery/public/videos/2022/02/040/2202_040_AR_EN.mp4?dl ; MOV 5,3 GB: https://media.esa.int/legacy/delivery/public/videos/2022/02/040/orig-2202_040_AR_EN.mov?dl . Licenza **ESA Standard Licence**, credito ESA/NASA. Utile per fotogrammi di Columbus in più punti (un secondo punto di vista per l'EML/MSL) e Kibo. [V]

## 5. Esterno ISS per l'intro (NASA, pubblico dominio)
- **iss066e080762**: ISS fotografata dalla Crew Dragon Endeavour durante il flyaround dell'8/11/2021 (dopo lo sgancio dal porto di Harmony). 5568 x 3712 px. Centro JSC. [V metadata]
  - Pagina/API: https://images-api.nasa.gov/search?nasa_id=iss066e080762
  - File: https://images-assets.nasa.gov/image/iss066e080762/iss066e080762~orig.jpg [schema URL NASA, non scaricato]
  - Licenza: i media NASA generalmente non hanno copyright (uso educativo libero, senza endorsement) [S: linee guida NASA, non riletto oggi]. Nessun campo copyright nei metadati. Credito: "NASA".
  - Altre dello stesso flyaround: iss066e080300, iss066e081189, iss066e079547, iss066e080360 (stesso percorso URL).
- Alternativa: `iss028e005527` (Node 3 e Cupola dall'esterno, EVA) https://images-assets.nasa.gov/image/iss028e005527/iss028e005527~orig.jpg ; utile per mostrare la Cupola dall'esterno.
- Foto esterna di Columbus dall'ESA: "A lab with a view" (2025, credito NASA, **"No ESA licences available"**): non usare senza verificare. https://www.esa.int/ESA_Multimedia/Images/2025/02/A_lab_with_a_view

## Raccomandazione per tappa
| Tappa | Miglior candidato | Licenza | Stato |
|---|---|---|---|
| Columbus | Flickr ESA 26356247791 (20000x10000) | All rights reserved, credito ESA/NASA | Tecnicamente ottimo; permesso da chiarire |
| Cupola | Fotogramma da video ESA Cupola 360 (Wandt 2024 o Maurer 2021) | ESA Standard Licence | Ripiego; verificare proiezione con ffprobe |
| Nodo | Harmony 26196096532 (13732x6866) | come sopra | Ottimo |
| Materiali | Kibo 25933880313 (13496x6748); Columbus per MSL/EML | come sopra | Ottimo |
| Esterno | NASA iss066e080762 | Pubblico dominio NASA [S] | Sicuro |

## Rischi e azioni
1. **Licenza ESA**: "All rights reserved" su Flickr non equivale a permesso. Azione: usare credito "ESA/NASA" visibile su ogni panorama, mostrare il badge "Foto reale" e **scrivere a ESA** (contatto multimedia ESA, via pagina Copyright/Terms) chiedendo l'uso educativo non commerciale, citandolo nella relazione. Non riuscito a leggere il testo ufficiale della ESA Standard Licence: da aprire a mano nel browser (pagina "Terms and Conditions" di ESA Multimedia) [?].
2. Scaricare gli originali Flickr (10-40 MB ciascuno) dalla pagina "sizes/o" nel browser o con il link `photo_download.gne` (Harmony/Unity/Destiny); non tentato qui per limiti di WebFetch.
3. Se si vuole evitare ogni rischio: ripiego 3D, panorama equirettangolare renderizzato da Blender per Columbus (già in `street-view.md`, punto 5), più foto NASA in modalità documentario.
4. Verificare visivamente la proiezione (equirettangolare vs. cubica ricomposta) e le toppe al nadir/zenit prima di integrare.
5. Panorami del 2015: l'interno di Columbus è cambiato leggermente (rack); per l'EML (in Columbus, rack EML) controllare se è visibile.
