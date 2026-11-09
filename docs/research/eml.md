# EML, Electromagnetic Levitator (ricerca del 9/11/2026)

Legenda: [V] fonte ufficiale (ESA/DLR/Airbus), [S] fonte secondaria o paper, [?] non trovato/incerto.

## 1. Cos'è, chi, dove, quando
- Facility multiutente per lavorare metalli/semiconduttori liquidi senza contenitore, in microgravità. [V] https://www.dlr.de/en/fm/research-and-transfer/research-infrastructure/electromagnetic-levitator-iss-1
- Costruttore: consorzio guidato da Airbus Defence and Space (Friedrichshafen) come prime contractor, con contratti paralleli ESA e DLR Space Administration. [V] https://www.ukspace.org/space-furnace-to-test-materials-of-the-future-on-the-iss/ (riproduce comunicato Airbus 27/2/2014); https://iafastro.directory/iac/archive/browse/IAC-18/A2/6/45629/
- Posizione: European Drawer Rack (EDR) nel laboratorio Columbus. Installato da Alexander Gerst nel 2014 (lancio su ATV-5). [V]
- Prima accensione 31/10/2014 [V, DLR: https://dlr.de/en/mp/latest/news/anniversary-10-years-eml-onboard-the-iss, come riportato da ricerca]; primi esperimenti scientifici da aprile 2015 [V IAC]. Operato dal MUSC di Colonia (DLR). [V]
- Stato: oltre 50 campioni e più di 2000 cicli sperimentali; batch 1-2 finiti, batch 3 in corso. [V DLR]

## 2. Descrizione fisica per il modellatore 3D
- **Massa totale ~360 kg, 4 moduli** progettati per entrare nei cassetti dell'EDR; il più importante è l'Experiment Module (EXM). [V Airbus] Altri moduli (elettronica, ecc.): nomi non trovati.
- **Dimensioni esterne dell'unità e della camera di processo: NON TROVATE** in fonti accessibili. Va dedotto dalle foto ESA (rack ISPR standard, cassetti EDR) e dichiarato come stima. Fonte da cercare: paper Diefenbach/Soellner (core.ac.uk/download/335287851.pdf, non leggibile via fetch).
- **Bobina**: un solo sistema di bobine in rame che porta due correnti RF sovrapposte: campo di **quadrupolo ~140 kHz** per il posizionamento e **dipolo ~380 kHz** per il riscaldamento. [S: review arXiv https://arxiv.org/pdf/1605.03511 e Spaceflight101 https://spaceflight101.com/iss/?p=567; DLR conferma "due campi indipendenti"] Confronto: il predecessore TEMPUS usava due bobine separate. [S]
- Bobina con apertura laterale ~8 mm usata per la telecamera radiale. [S]
- **Campioni**: sferici, 5-8 mm di diametro; **18 campioni per magazzino** (tipo revolver) con alluminio, rame, leghe di nichel. [V Airbus/DLR: 18; S: 5-8 mm]
- **Portacampioni**: contenitori/cartucce in ceramica e renio; esistono versioni "cup" e "cage" con fessure per l'osservazione. [V Airbus; S per cup/cage]. Cambio camera campioni fatto dall'equipaggio (foto NASA 2024 di O. Kononenko). 
- **Diagnostica**: telecamera ad alta velocità (fino a 30.000 fps secondo Airbus; "fino a 40 kHz" secondo DLR), pirometro (spot ~0,8 mm [S]), videocamera digitale. [V/S] Numero e posizione esatta delle telecamere: non trovato (radiale e assiale/dall'alto citate in S).
- **Atmosfera**: gas inerte (nelle prove 2021 ESA parla di argon [V: https://www.esa.int/ESA_Multimedia/Images/2021/03/Electromagnetic_levitator_in_Columbus]); l'unità dispone di generazione di alto vuoto e linee di vuoto/sfiato del rack. Elio: non confermato.
- **Temperature**: fino a 2000 °C [V Airbus], fino a 2200 °C [V ESA 2024]. Quindi dichiarare "oltre 2000 °C".
- **Sample Coupling Electronics (SCE)**: aggiunta per misurare resistività elettrica ed espansione termica. [V]
- Interfacce del rack: 28 V e 120 V, raffreddamento ad acqua e aria, dati/video. [S]
- Telemetria: gli esperimenti sono comandati da Colonia.

## 3. Fisica (fonti per i testi; i meccanismi sono standard)
- Un campo magnetico alternato attraversa il campione conduttore; per Faraday-Neumann-Lenz il flusso variabile induce f.e.m. e **correnti parassite (di Foucault)** nel metallo. [Fisica standard; coerente con DLR "heating and positioning by two fields"]
- Le correnti indotte, nel campo del quadrupolo, producono forza di Lorentz/di Lenz che respinge il campione verso il centro (campo nullo): posizionamento senza contatto. Il dipolo riscalda per **effetto Joule**. Le due funzioni sono separate in frequenza. [S]
- In microgravità servono campi molto più deboli che a terra, quindi minore riscaldamento e minore agitazione (convezione) del fuso. [V DLR: "lower magnetic field strengths than ground-based"]
- Sottoraffreddamento e solidificazione: il liquido resta sotto la temperatura di fusione senza nucleazione (niente pareti) finché parte la cristallizzazione; il fronte dendritico si misura con la camera veloce. [V DLR: camera fino a 40 kHz per velocità di crescita]
- Misure: tensione superficiale e viscosità con la tecnica delle oscillazioni della goccia (oscillating drop), calore specifico per calorimetria a modulazione, conducibilità elettrica via SCE. [V DLR]

## 4. Perché la microgravità; ricadute
- A terra la levitazione richiede campi forti che deformano, scaldano e mescolano il campione; in orbita il campione è quasi sferico, sono poco influenzati i flussi. [V DLR/ESA]
- Ricadute: dati termofisici affidabili per simulazioni di colata e solidificazione di leghe (turbine, aerospazio, automotive). ESA: https://www.esa.int/Our_Activities/Human_Spaceflight/International_Space_Station/Material_Science_Laboratory_Electromagnetic_Levitator_MSL-EML (404 al momento del fetch; esiste via ricerca). Collegamento a Obiettivo 9: [interpretazione]. Esempi industriali specifici (aziende, prodotti): non trovati in questa sessione.

## 5. Foto e media ufficiali (riferimento visivo)
| Contenuto | Credito | Licenza | URL |
|---|---|---|---|
| EML nella Columbus (Gerst, 2014) | ESA/NASA-A.Gerst | ESA Standard Licence | https://www.esa.int/ESA_Multimedia/Images/2019/11/Electromagnetic_Levitator_on_Space_Station ; file: https://media.esa.int/legacy/web/images/esa_multimedia/images/2019/11/electromagnetic_levitator_on_space_station/21482150-2-eng-GB/Electromagnetic_Levitator_on_Space_Station.jpg?dl (2,3 MB) |
| EML in Columbus (2021) | ESA/NASA | ESA Standard Licence | https://www.esa.int/ESA_Multimedia/Images/2021/03/Electromagnetic_levitator_in_Columbus ; file: https://media.esa.int/legacy/web/images/esa_multimedia/images/2021/03/electromagnetic_levitator_in_columbus/23214168-1-eng-GB/Electromagnetic_levitator_in_Columbus.jpg?dl (2,8 MB) |
| Lega Al-Ni che solidifica (GIF accelerata) | ESA/DLR | ESA Standard Licence | https://esa.int/ESA_Multimedia/Images/2024/05/Aluminium_and_nickel_alloy_solidifying_in_the_Electromagnetic_Levitator ; file: https://media.esa.int/legacy/web/images/esa_multimedia/images/2024/05/aluminium_and_nickel_alloy_solidifying_in_the_electromagnetic_levitator/26082150-1-eng-GB/Aluminium_and_nickel_alloy_solidifying_in_the_Electromagnetic_Levitator.gif (3,7 MB) |
| "EML onboard the ISS" | DLR | CC BY-NC-ND 3.0 (no modifiche: non adatta a rielaborazioni, ok uso tal quale non commerciale) | https://www.dlr.de/en/fm/media/pictures/pictures/eml-onboard-the-iss |
| Upgrade EML (DLR 2018) | NASA/ESA | licenza non indicata | https://www.dlr.de/en/images/2018/3/upgrade-for-electromagnetic-levitator-eml |
| Altre ESA: Activating Electromagnetic Levitator; Electromagnetic levitator in Columbus2 | ESA/NASA | ESA Standard Licence (da confermare) | https://www.esa.int/ESA_Multimedia/Images/2021/03/Activating_Electromagnetic_Levitator ; https://www.esa.int/ESA_Multimedia/Images/2021/03/Electromagnetic_levitator_in_Columbus2 |
| NASA: Kononenko cambia camere campioni (2024); installazione Gerst iss040e108044 (2014); EML cable install iss041e096097 | NASA | pubblico dominio USA | https://nasa-img-viewer.pages.dev/image/iss040e108044 ; https://nasa-img-viewer.pages.dev/image/iss041e096097 (viewer di terzi: cercare l'ID su images.nasa.gov) |
Risoluzioni in pixel: non riportate nelle pagine.

## 6. Tre cose per il modellatore
1. Il cuore visivo è la bobina in rame con due segnali sovrapposti (140 e 380 kHz) attorno a una sfera di 5-8 mm, con aperture laterali (~8 mm) per camera/pirometro; ceramica/renio per i portacampioni.
2. 18 campioni in cartuccia a revolver; unità da 4 moduli, 360 kg, installata in un cassetto dell'EDR (dimensioni esatte da stimare dalle foto: non trovate).
3. Segnale visivo realistico: campione che brilla (fino a 2000-2200 °C), fusione, oscillazioni di superficie, sottoraffreddamento e fronte di solidificazione che avanza (clip ESA/DLR come riferimento).

Dati mancanti: dimensioni, forma della camera di processo, numero telecamere, elio.
