# ISS — Inside the Physics

**Relazione di accompagnamento al sito**

Alessandro Bettinelli, classe 5ALSA
Fisica ed Educazione civica, primo quadrimestre, a.s. 2026/27
Sito: [LINK DEL SITO]

---

## 1. Obiettivo del progetto e consegna

La consegna chiedeva di partire dall'induzione elettromagnetica (legge di Faraday-Neumann-Lenz) e di collegarla a un obiettivo dell'Agenda 2030. Ho scelto l'**Obiettivo 9, Imprese, innovazione e infrastrutture**, e ho trattato anche l'**Obiettivo 3** (salute), l'**Obiettivo 7** (energia pulita e accessibile) e l'**Articolo 32 della Costituzione**, ma solo dove il collegamento nasceva in modo naturale.

Invece di una presentazione ho costruito una **visita virtuale della Stazione Spaziale Internazionale (ISS)**, che porta a un esperimento reale che si svolge a bordo: l'**EML, Electromagnetic Levitator**. L'EML è un forno europeo installato nel laboratorio Columbus. Fonde e tiene sospesi piccoli campioni di metallo senza toccarli, usando soltanto campi magnetici variabili. È induzione elettromagnetica applicata, e rende visibili cose che di solito si studiano solo sulla carta: il flusso che cambia, le correnti indotte, la forza di Lenz, il riscaldamento per effetto Joule.

Il sito segue questo percorso:

- si entra nella stazione e si attraversano i moduli, fino a Columbus;
- si arriva all'EML e si osserva come funziona;
- si ritorna sulla Terra con la sezione finale **«Dallo spazio alla Terra»**. Qui la stessa fisica che sostiene un campione in orbita sostiene un treno Maglev (Obiettivo 9), trasporta l'energia nelle reti elettriche (Obiettivo 7) ed è alla base della risonanza magnetica (Obiettivo 3, Articolo 32).

Non ci sono quiz né esercizi. Le formule compaiono nelle schede dei punti di interesse, in forma espandibile, e non sono mai obbligatorie.

## 2. Contenuti scientifici

I contenuti di fisica seguono la teoria del corso («L'induzione elettromagnetica 5LSA», 23 slide). Ogni scheda indica le slide a cui si riferisce. Ecco i concetti principali.

**Flusso e legge di Faraday-Neumann-Lenz.** Il flusso del campo magnetico attraverso una superficie $S$ è $\Phi_B = \vec B\cdot\vec S$. Quando il flusso varia nel tempo, nel circuito nasce una forza elettromotrice indotta:

$$\varepsilon = -\frac{d\Phi_B}{dt}$$

Il segno meno è la **legge di Lenz**: la corrente indotta ha un verso tale da generare un campo che si oppone alla variazione di flusso che l'ha prodotta. Per la prima legge di Ohm, la corrente indotta è $i = \varepsilon / R$. Il flusso può cambiare in tre modi: cambia il campo, cambia l'area, cambia l'orientamento. Sono i casi dei quattro esperimenti di Faraday della teoria.

**Correnti parassite (di Foucault).** In un conduttore massiccio, e non in una spira, un flusso variabile induce correnti che si chiudono dentro il materiale. Per Lenz, queste correnti generano un campo opposto alla variazione. Quindi il conduttore è respinto da un campo magnetico variabile. Questo vale per un campione metallico nell'EML e per le guide di un Maglev.

**Effetto Joule.** Le stesse correnti, nel metallo che oppone resistenza, dissipano potenza in calore: $P_J = R\,i^2$. È anche il motivo per cui il trasporto dell'energia avviene ad alta tensione. A parità di potenza trasportata $P$, la corrente è $i = P/V$ e le perdite sono $P_J = R\,(P/V)^2$: raddoppiando la tensione le perdite diventano un quarto.

**Come funziona l'EML.** In una bobina in rame passa corrente alternata ad alta frequenza, e il campione si trova al suo interno.

1. Il campo magnetico alternato attraversa il campione conduttore. Per Faraday-Neumann-Lenz vi inducono correnti parassite.
2. Nella regione dove il campo è non uniforme, le correnti indotte producono per la legge di Lenz una forza che respinge il campione verso la zona dove il campo si annulla. Così il campione resta sospeso e centrato, senza contatto.
3. Le correnti incontrano la resistenza del metallo e lo riscaldano per effetto Joule, fino a fonderlo. Le temperature raggiungono oltre 2000 °C.
4. Il sistema usa due campi sovrapposti, con frequenze diverse: circa 140 kHz per il posizionamento e circa 380 kHz per il riscaldamento. Così le due funzioni si regolano in modo indipendente (la fonte è secondaria, vedi la sezione 6).

**Perché in microgravità.** A terra, per sostenere un campione contro il peso, servono campi molto intensi: il campione si deforma, si scalda troppo e il fuso si agita. In orbita basta un campo molto più debole, il campione resta quasi sferico e quasi fermo, e si possono misurare con precisione proprietà come la tensione superficiale, la viscosità e la conducibilità elettrica. Si può anche osservare la **solidificazione di un liquido sottoraffreddato**, cioè raffreddato sotto la temperatura di fusione senza che si cristallizzi, perché non ci sono pareti a innescare la cristallizzazione. I dati ottenuti servono a migliorare i modelli di colata delle leghe usate nell'industria.

**Maglev.** Nel sistema giapponese i magneti del treno, muovendosi, fanno variare il flusso attraverso le bobine della guida. Vi nascono correnti indotte e la legge di Lenz fa il resto: i campi indotti respingono il treno. Oltre una certa velocità il treno si solleva di circa 10 cm e non ha più attrito di contatto. Il record documentato è di 603 km/h, nel 2015. Siamo nell'Obiettivo 9: infrastruttura innovativa, senza emissioni locali.

**Altre applicazioni collegate** (come previsto dalla consegna e dalla teoria):

- *Energia (Obiettivo 7).* Alternatore (spira in rotazione in un campo magnetico, corrente alternata) e trasformatore (mutua induzione tra due bobine, $V_1/V_2 = N_1/N_2$).
- *Motori elettrici.* Sono il principio inverso dell'alternatore: forza di Lorentz $F = i\,l\,B\sin\theta$.
- *Salute (Obiettivo 3, Art. 32).* La risonanza magnetica nucleare (RMN) usa un campo intenso e onde radio per mappare i tessuti molli senza radiazioni ionizzanti; i nuclei di idrogeno precedono a frequenza $f = \frac{\gamma}{2\pi}B_0$ (circa 64 MHz con 1,5 T) e il loro segnale si rileva per induzione. La stimolazione magnetica transcranica (TMS) usa impulsi di campo variabili per indurre correnti deboli nella corteccia; pacemaker e dispositivi impiantabili possono essere ricaricati per mutua induzione.
- *Fem di moto sulla ISS.* La stazione, che si muove a circa 7,7 km/s nel campo magnetico terrestre, è un conduttore in moto: $\varepsilon = B\,l\,v$. Con circa 30 µT e 100 m si ottengono circa 23 V, lo stesso ordine di grandezza citato dalla NASA. Un'altra sezione del sito affronta l'autoinduzione con il circuito RL ($\varepsilon = -L\,di/dt$).

**Articolo 32.** Il sito riporta il testo dell'articolo e il suo doppio carattere: diritto del singolo verso lo Stato e interesse della collettività (prevenzione, sanità pubblica, sicurezza sul lavoro, tutela dell'ambiente), con la libertà di cura. Lo collega a una macchina diagnostica più efficiente e meno costosa, che può ridurre le differenze territoriali nell'accesso alle cure (vedi il paragrafo 5 per i riferimenti).

## 3. Struttura dell'esperienza

**Ingresso.** La schermata iniziale ha un solo pulsante, «Inizia l'esplorazione», e una voce «Tappe suggerite» in alto. Chi visita il sito da solo può quindi seguire un percorso guidato di circa 12-15 minuti, o muoversi liberamente.

**Ambienti.**

- **Sei panorami a 360° ESA** della stazione: Harmony, Columbus, Kibo, Destiny, Unity, Tranquility. Si ruota la visuale trascinando, si fa zoom con la rotella, si passa da un modulo all'altro con i portelli (↑/↓).
- **La Cupola**, con un video reale della Terra ripreso dalla ISS.
- **La scena 3D dell'EML**, il centro del progetto: un modello tridimensionale dell'apparato, che si può ruotare e avvicinare, con i componenti selezionabili. Il pulsante «Avvia esperimento» apre una sequenza in sei passi.
- **Otto simulazioni** nello stile dell'EML, con una finestra «a passi», di cui quattro sono veri e propri ambienti interattivi: campo magnetico terrestre, energia di bordo, levitazione/Maglev, RMN.
- **Il finale «Dallo spazio alla Terra»**, che lega Obiettivo 9, Obiettivi 3 e 7 e Articolo 32.

**Voli tra i moduli.** Tra un panorama e l'altro c'è un breve volo senza stacchi (10 in tutto). La prima e l'ultima immagine di ogni volo sono prese dai panorami veri; il movimento in mezzo è generato con intelligenza artificiale.

**Punti di interesse.** Sono 32, discreti, con icone per categoria, indicatori ai bordi dello schermo e una lista laterale. Ogni scheda ha una descrizione breve, una spiegazione scientifica, una curiosità, immagini e, se serve, le formule in forma espandibile.

**Mini-mappa.** Schematizza tutta la stazione, mostra il modulo in cui ci si trova e quelli già visitati, e permette di volare direttamente a un altro ambiente.

**Voce narrante e sottotitoli.** Ogni ambiente ha una breve clip vocale (circa 52 clip in tutto, comprese quelle dei punti di interesse e delle simulazioni). La voce è sempre disattivabile e c'è il sottotitolo, con la trascrizione. Un sottofondo sonoro minimale accompagna la visita.

**Badge di provenienza.** Ogni contenuto porta un badge discreto con la sua natura: **Foto reale**, **Ricostruzione IA**, **Modello 3D**, **Simulazione concettuale**. Così il visitatore sa sempre che cosa sta guardando.

## 4. Metodo e strumenti

- **Sito:** React, TypeScript e Vite. Il sito è pensato per computer; su tablet è utilizzabile, ma non è ottimizzato.
- **Panorami:** Photo Sphere Viewer, per mostrare le immagini sferiche con punti cliccabili.
- **Scena 3D:** Three.js, per l'EML e per le scene della Terra e della stazione.
- **Modello dell'EML e simulazioni:** Blender. I fenomeni (correnti indotte, riscaldamento Joule, fusione, solidificazione) sono stati realizzati come video renderizzati, non come simulazioni numeriche interattive.
- **Video dei voli:** Higgsfield, con i modelli Seedance 2.0 (5 voli) e Kling 3.0 (5 voli). Servono solo come transizioni e sono dichiarati ricostruzioni IA.
- **Voce:** ElevenLabs, voce maschile sintetica, in italiano.
- **Pubblicazione:** Vercel, collegato al repository GitHub del progetto. Le chiavi delle API sono usate solo durante lo sviluppo e non compaiono nel sito.

**Perché non Street View.** Google ha pubblicato nel 2017 i panorami interni della ISS («Outer Space View», foto di Thomas Pesquet). Li ho verificati in fase di ricerca. Si possono incorporare solo con un iframe (Maps Embed API, con chiave), che non consente di inserire punti di interesse propri, di controllare la navigazione né di personalizzare le transizioni. Scaricare le immagini per mostrarle in un altro visualizzatore non è consentito dai termini di Google Maps Platform. Ho quindi scelto di non usarle e di usare i panorami dell'ESA (album «Space Station 360», Samantha Cristoforetti, 2016), che sono scaricabili e hanno credito e condizioni d'uso chiari.

**Uso dell'intelligenza artificiale nello sviluppo.** Il progetto è stato sviluppato con l'assistenza di **Claude Code**, uno strumento di Anthropic basato sull'IA. Io ho deciso l'idea, la struttura, le scelte scientifiche e l'impostazione grafica, e ho verificato il risultato. L'assistente ha scritto gran parte del codice, ha aiutato nella ricerca delle fonti, nella stesura dei testi e nella produzione e nei controlli degli asset. Il lavoro è stato diviso in fasi, con controlli periodici (quattro cicli di test con schermate a più risoluzioni) e un repository con le versioni numerate. Anche questa relazione è stata redatta con quell'assistenza. Dichiarare questo uso fa parte della correttezza verso chi legge. I testi scientifici sono stati controllati sulle fonti indicate nella sezione 6.

## 5. Limiti e scelte

**Che cosa è reale.**

- I sei panorami dei moduli (ESA/NASA, S. Cristoforetti) e le fotografie NASA della ISS dall'esterno e dalla Cupola.
- Il video della Terra dalla ISS (NASA Johnson / NASA SVS).
- Le fotografie dell'EML e la GIF della lega che solidifica (ESA/DLR) nelle schede.
- Le informazioni sull'EML: facility europea multiutente, installata in Columbus nel 2014, operata dal centro utenti MUSC del DLR a Colonia, con campioni sferici di 5-8 mm (18 per magazzino).

**Che cosa è una ricostruzione.**

- **Voli tra i moduli:** ricostruzioni generate con IA. Non sono riprese reali e non vanno confuse con riprese NASA o ESA. Alcuni hanno piccoli artefatti, perché i modelli inventano quello che sta tra le due immagini vere.
- **Voce narrante:** sintesi vocale generata, non una persona reale.
- **Modello 3D dell'EML:** modello concettuale, realizzato per questo progetto a scopo didattico, basato sulle foto ESA/DLR e sulle informazioni pubbliche. Le dimensioni esatte dell'unità e della camera di processo non sono state trovate in fonti pubbliche: sono quindi stimate dalle foto, e dichiarate come tali. Non è una copia tecnica fedele dello strumento.
- **Simulazioni e render dei fenomeni:** simulazioni concettuali. Mostrano il comportamento qualitativo corretto (campo alternato, correnti indotte, forza di Lenz, riscaldamento, fusione, solidificazione), ma non sono calcoli numerici a elementi finiti. I valori dei parametri sono ordini di grandezza.

**Altre limitazioni.**

- *Licenza dei panorami ESA.* I panorami sono pubblicati da ESA su Flickr con «All rights reserved» e credito «ESA/NASA». Il sito li usa a scopo educativo e non commerciale, con credito visibile, secondo la ESA Standard Licence. Il testo ufficiale della licenza non ho potuto leggerlo direttamente nella fase di ricerca. Resta quindi una verifica aperta: ESA può essere contattata per una conferma.
- *Dati sull'EML da fonti secondarie.* Le frequenze di 140 e 380 kHz provengono da una rassegna scientifica e da un sito divulgativo (vedi sezione 6), non da una pagina ufficiale ESA/DLR, che parla solo di «due campi indipendenti». Le temperature indicano «oltre 2000 °C» perché le fonti ufficiali danno 2000 °C (Airbus) e 2200 °C (ESA, 2024).
- *Peso del sito.* I panorami pesano 4-6 MB ciascuno e il video della Terra 8,8 MB: il primo caricamento richiede qualche secondo.
- *Spese.* Per le generazioni di video ho speso circa 21,6 dollari su Higgsfield (prezzi di listino), dentro il budget previsto. La voce è dentro un abbonamento ElevenLabs già attivo.

**Due affermazioni del finale e il controllo sulle fonti.**

- *TMS e FDA, 2008.* La scheda afferma che nel 2008 la FDA ha autorizzato il primo dispositivo per la depressione maggiore non migliorata da un precedente trattamento farmacologico. L'ho controllato: la letteratura riporta il dispositivo NeuroStar (Neuronetics, pratica FDA DEN070003) come primo approvato nel 2008 per l'MDD negli adulti che non hanno risposto ad antidepressivi (vedi Fonti, sezione 6). Non ho trovato una fonte che confermi il giorno esatto, quindi nel testo rimane solo l'anno.
- *OMS e copertura sanitaria universale.* La frase sulle direttive OMS sulla copertura sanitaria universale è coerente con la consegna. La pagina OMS sulla UHC conferma che esiste questo obiettivo dell'Organizzazione, ma non dice nulla sul ruolo delle macchine diagnostiche a induzione. Il nesso tra tecnologia a induzione e riduzione delle disuguaglianze territoriali è quindi un'argomentazione mia, che riprende la consegna, e non un dato dell'OMS.

## 6. Fonti e crediti

### 6.1 Immagini, panorami, video, modelli

| Contenuto | Soggetto | Fonte | Credito | Licenza |
|---|---|---|---|---|
| Panorama | Columbus | Flickr ESA, foto 26356247791 | ESA/NASA – S. Cristoforetti | ESA Standard Licence, uso educativo non commerciale con credito |
| Panorama | Harmony (Node 2) | Flickr ESA, foto 26196096532 | ESA/NASA – S. Cristoforetti | idem |
| Panorama | Kibo (JAXA) | Flickr ESA, foto 25933880313 | ESA/NASA – S. Cristoforetti | idem |
| Panorama | Tranquility (Node 3), accesso alla Cupola | Flickr ESA, foto 26599440852 | ESA/NASA – S. Cristoforetti | idem |
| Panorama | Destiny (US Lab) | Flickr ESA, foto 26121878046 | ESA/NASA – S. Cristoforetti | idem |
| Panorama | Unity (Node 1) | Flickr ESA, foto 25827604346 | ESA/NASA – S. Cristoforetti | idem |
| Foto | ISS dall'esterno (Crew Dragon, 8/11/2021) | images.nasa.gov, iss066e080762 | NASA | Pubblico dominio (credito NASA) |
| Foto | Vista dalla Cupola | images.nasa.gov, iss025e011750 | NASA | Pubblico dominio (credito NASA) |
| Immagine | Terra, mosaico Blue Marble (ambiente del campo magnetico) | Wikimedia Commons, «Whole world - land and oceans 12000.jpg» | NASA Earth Observatory | Pubblico dominio (credito NASA) |
| Modello 3D | ISS (ambiente del campo magnetico) | science.nasa.gov/3d-resources, «international-space-station-iss-b» | NASA | NASA 3D Resources, uso libero con credito |
| Video | La Terra dalla ISS (Cupola e finale) | svs.gsfc.nasa.gov/30771, «ISS View of Planet Earth» | NASA Johnson / NASA SVS | Linee guida NASA, uso educativo con credito |
| Foto delle schede | Punti di interesse | NASA | NASA | Pubblico dominio con credito |
| GIF | Campione che solidifica nell'EML | ESA | ESA/DLR | ESA Standard Licence, uso educativo con credito |

I panorami sono stati ridimensionati a 8192×4096 pixel; le foto a un lato massimo di 3840 pixel. Il logo NASA non è usato.

### 6.2 Contenuti generati o realizzati per il progetto

- **Voli tra i moduli:** ricostruzione IA generata con Higgsfield (Seedance 2.0 e Kling 3.0) a partire da viste dei panorami ESA. Non sono riprese reali.
- **Voce narrante:** sintesi vocale ElevenLabs (voce maschile generata con intelligenza artificiale).
- **Video e animazioni dell'EML e dei fenomeni fisici:** simulazione concettuale, render Blender.
- **Modello 3D dell'EML:** modello concettuale realizzato per questo progetto a scopo didattico.

### 6.3 Fonti scientifiche e di ricerca

**EML.**

- DLR, Electromagnetic Levitator on the ISS: https://www.dlr.de/en/fm/research-and-transfer/research-infrastructure/electromagnetic-levitator-iss-1
- DLR, anniversario dei 10 anni dell'EML: https://dlr.de/en/mp/latest/news/anniversary-10-years-eml-onboard-the-iss
- Airbus Defence and Space (comunicato del 27/2/2014, riprodotto da UK Space): https://www.ukspace.org/space-furnace-to-test-materials-of-the-future-on-the-iss/
- ESA, «Electromagnetic levitator in Columbus» (2021): https://www.esa.int/ESA_Multimedia/Images/2021/03/Electromagnetic_levitator_in_Columbus
- ESA, «Electromagnetic Levitator on Space Station» (credito ESA/NASA-A. Gerst): https://www.esa.int/ESA_Multimedia/Images/2019/11/Electromagnetic_Levitator_on_Space_Station
- ESA, «Aluminium and nickel alloy solidifying in the Electromagnetic Levitator» (2024): https://esa.int/ESA_Multimedia/Images/2024/05/Aluminium_and_nickel_alloy_solidifying_in_the_Electromagnetic_Levitator
- Fonti secondarie per le frequenze dei campi: rassegna su arXiv, https://arxiv.org/pdf/1605.03511, e Spaceflight101, https://spaceflight101.com/iss/?p=567

**Stazione Spaziale.**

- NASA, immagini e linee guida d'uso: https://www.nasa.gov/nasa-brand-center/images-and-media/
- NASA SVS, ISS View of Planet Earth: https://svs.gsfc.nasa.gov/30771
- NASA NTRS 20020083039 (convertitori DDCU, IECEC 2002), per la rete elettrica di bordo.
- ESA, Condizioni d'uso del materiale multimediale (ESA Standard Licence): https://www.esa.int/ESA_Multimedia/Terms_and_Conditions
- Google, Street View della ISS («Outer Space View», 2017): https://blog.google/products/maps/welcome-outer-space-view/
- Google Maps Platform, condizioni d'uso: https://cloud.google.com/maps-platform/terms

**Salute.**

- Roberts et al., New England Journal of Medicine, 2017: studio NASA su 34 astronauti, confronto di risonanze cerebrali prima e dopo il volo (riferimento indicato nelle schede del sito).
- FDA, TMS e depressione: «A visual and narrative timeline of US FDA milestones for Transcranial Magnetic Stimulation (TMS) devices», https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8864803/ (NeuroStar, pratica DEN070003, 2008). Riassunto della 510(k) di Neuronetics: https://www.accessdata.fda.gov/cdrh_docs/pdf8/k083538.pdf
- OMS, Universal health coverage (UHC), scheda informativa: https://www.who.int/news-room/fact-sheets/detail/universal-health-coverage-(uhc)

**Teoria e consegna.**

- Materiale del corso: «L'induzione elettromagnetica 5LSA» (slide 1-23).
- Costituzione della Repubblica Italiana, art. 32.
- Agenda 2030 ONU, Obiettivi 3, 7 e 9.

**Strumenti e licenze d'uso.**

- Higgsfield, documentazione: https://docs.higgsfield.ai
- ElevenLabs, condizioni dell'abbonamento: https://elevenlabs.io/docs/overview/administration/billing.md. Le condizioni sull'attribuzione per il piano Starter non sono chiare nelle fonti consultate; in via prudenziale la voce è dichiarata come sintetica nei crediti.

### 6.4 Note sulla verifica

- Dati tecnici dell'EML non trovati in fonti pubbliche: dimensioni esterne dell'unità e della camera di processo, numero e posizione esatta delle telecamere, uso dell'elio. Nel sito non sono scritti.
- Frequenze di 140 e 380 kHz e dimensione dei campioni: fonti secondarie, che concordano con quanto dichiarato da DLR (due campi indipendenti, per posizionamento e riscaldamento).
- Informazioni sul Maglev (sollevamento di circa 10 cm, record di 603 km/h del 2015) e sull'ordine di grandezza della fem di moto della ISS: presenti nelle schede del sito; il riferimento NASA per quest'ultimo è nella scheda dell'ambiente corrispondente.
- Licenza dei panorami ESA: da confermare con ESA (vedi sezione 5).
