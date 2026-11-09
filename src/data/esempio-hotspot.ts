import type { Provenienza, Categoria } from './types'
export type { Categoria }
import type { NodoId } from './stazione'

/**
 * Formato dei contenuti (lo stesso che il content-writer scrive in content/hotspot.json e content/luoghi.json).
 * Questi dati di esempio servono finché i file reali non hanno il campo `categoria`.
 * Facoltativi: `yaw`/`pitch` (gradi, panorami), `x`/`y` (0..1, immagini), `oggetto3d` (scena EML).
 * Senza coordinate il sito sceglie una posizione libera del luogo (src/data/stazione.ts, `slot`).
 */

export interface FormulaScheda { latex: string; spiegazione?: string }
export interface ImmagineScheda { src: string; didascalia?: string; credito?: string }

export interface HotspotScheda {
  id: string
  luogo: NodoId
  categoria: Categoria
  titolo: string
  breve: string
  punti: string[]
  formula?: string
  /** formato esteso (opzionale, compatibile con i campi sopra) */
  paragrafi?: string[]
  formule?: FormulaScheda[]
  immagini?: ImmagineScheda[]
  /** id di una simulazione da aprire con "Avvia simulazione" */
  simulazione?: string
  slide_pptx: number[]
  badge: Provenienza
  fonte: string
  yaw?: number; pitch?: number
  x?: number; y?: number
  oggetto3d?: string
  spostamento3d?: [number, number, number]
}

export interface Luogo {
  id: NodoId
  nome: string
  sottotitolo: string
  punti: string[]
  /** testo della voce breve (sottotitoli); l'audio è public/audio/luoghi/<id>.mp3 */
  voce?: string
  badge: Provenienza
  fonte?: string
  slide_pptx?: number[]
}

export const luoghiEsempio: Luogo[] = [
  { id: 'harmony', nome: 'Harmony', sottotitolo: 'Node 2: lo snodo verso i laboratori', badge: 'foto', fonte: 'NASA, ESA',
    punti: ['Collega Destiny, Columbus e Kibo.', 'Distribuisce energia e dati ai laboratori.', 'Ospita le cabine dell\'equipaggio.'],
    voce: 'Siamo in Harmony, il nodo che collega i tre grandi laboratori della stazione.' },
  { id: 'columbus', nome: 'Columbus', sottotitolo: 'Il laboratorio europeo (ESA)', badge: 'foto', fonte: 'ESA',
    punti: ['Il contributo europeo alla ricerca in orbita.', 'Biologia, fluidi, materiali e fisica.', 'Qui vive l\'EML, il levitatore elettromagnetico.'],
    voce: 'Columbus è il laboratorio europeo. In uno dei suoi rack c\'è il levitatore elettromagnetico.' },
  { id: 'eml', nome: 'EML', sottotitolo: 'Levitare, fondere, solidificare', badge: 'modello3d', fonte: 'ESA, DLR',
    punti: ['Un campo magnetico alternato induce correnti nel campione.', 'Le correnti lo riscaldano per effetto Joule.', 'Le forze di Lorentz lo tengono sospeso, senza contatto.'],
    voce: 'Nell\'EML un campione metallico levita e fonde senza toccare nulla.' },
  { id: 'kibo', nome: 'Kibo', sottotitolo: 'Il laboratorio giapponese (JAXA)', badge: 'foto', fonte: 'JAXA',
    punti: ['Il modulo singolo più grande della stazione.', 'Laboratorio pressurizzato e piattaforma esterna.', 'Tra le ricerche: materiali e processi di solidificazione.'] },
  { id: 'destiny', nome: 'Destiny', sottotitolo: 'Il laboratorio statunitense', badge: 'foto', fonte: 'NASA',
    punti: ['Il laboratorio principale del segmento americano.', 'Ventiquattro posizioni per rack scientifici.', 'Da qui si prosegue verso Unity.'] },
  { id: 'unity', nome: 'Unity', sottotitolo: 'Node 1: il primo modulo americano', badge: 'foto', fonte: 'NASA',
    punti: ['Il primo elemento statunitense, lanciato nel 1998.', 'Collega i segmenti americano e russo.', 'Da qui si raggiunge Tranquility.'] },
  { id: 'tranquility', nome: 'Tranquility', sottotitolo: 'Node 3: l\'accesso alla Cupola', badge: 'foto', fonte: 'NASA, ESA',
    punti: ['Ospita i sistemi che riciclano acqua e aria.', 'Sul lato rivolto alla Terra si apre la Cupola.', 'Guarda in basso e scendi verso le finestre.'] },
  { id: 'cupola', nome: 'Cupola', sottotitolo: 'Lo sguardo sulla Terra', badge: 'foto', fonte: 'NASA',
    punti: ['Sette finestre aperte sul pianeta.', 'Qui si osservano la Terra e il suo campo magnetico.', 'È il punto da cui si guarda alle ricadute sulla Terra.'] },
  { id: 'finale', nome: 'Dallo spazio alla Terra', sottotitolo: 'Innovazione, infrastrutture, salute', badge: 'foto', fonte: 'NASA',
    punti: ['L\'induzione che fonde un metallo in orbita è la stessa che muove treni, motori e reti elettriche.', 'Tocca i punti luminosi per scoprire i collegamenti.'] },
]

const S = 'NASA, ESA, JAXA (schede ufficiali ISS)'
export const hotspotEsempio: HotspotScheda[] = [
  { id: 'harmony-nodo', luogo: 'harmony', categoria: 'strumento', titolo: 'Un nodo di collegamento', breve: 'Harmony unisce i laboratori e distribuisce risorse.',
    punti: ['Lanciato nel 2007.', 'Collega Destiny, Columbus e Kibo.', 'Porta energia, dati e raffreddamento ai moduli vicini.'], slide_pptx: [], badge: 'foto', fonte: S },
  { id: 'harmony-vita', luogo: 'harmony', categoria: 'vita', titolo: 'Dormire senza un "sopra"', breve: 'In Harmony ci sono le cabine dell\'equipaggio.',
    punti: ['Quattro cabine individuali.', 'Si dorme fissati alla parete: in microgravità non si cade.', 'La stazione compie circa 16 orbite al giorno: 16 albe e 16 tramonti.'], slide_pptx: [], badge: 'foto', fonte: 'NASA' },
  { id: 'harmony-energia', luogo: 'harmony', categoria: 'energia', titolo: 'Da dove arriva l\'energia', breve: 'Le grandi ali solari alimentano ogni modulo.',
    punti: ['Celle fotovoltaiche: luce in corrente continua.', 'Le batterie coprono i tratti nell\'ombra della Terra.', 'Potenza complessiva dell\'ordine delle decine di kilowatt.'],
    formula: 'P = V\\,I', slide_pptx: [21], badge: 'foto', fonte: 'NASA' },
  { id: 'columbus-lab', luogo: 'columbus', categoria: 'strumento', titolo: 'Il laboratorio europeo', breve: 'Columbus è il contributo scientifico dell\'ESA.',
    punti: ['Lanciato nel 2008.', 'Dieci posizioni per rack scientifici.', 'Ospita tra l\'altro Biolab e il Fluid Science Laboratory.'], slide_pptx: [], badge: 'foto', fonte: 'ESA' },
  { id: 'columbus-rack', luogo: 'columbus', categoria: 'eml', titolo: 'Il rack dell\'EML', breve: 'Dietro questo pannello c\'è il levitatore elettromagnetico.',
    punti: ['Un campione metallico levita al centro di bobine.', 'Si scalda e fonde senza toccare le pareti.', 'Premi ↑ guardando il rack per entrare.'], slide_pptx: [2, 8], badge: 'foto', fonte: 'ESA', yaw: -12, pitch: 40 },
  { id: 'columbus-vita', luogo: 'columbus', categoria: 'vita', titolo: 'Il corpo in microgravità', breve: 'Senza peso, ossa e muscoli cambiano.',
    punti: ['In orbita si perde massa ossea.', 'In alcune zone oltre l\'1% al mese.', 'Per questo l\'equipaggio si allena ogni giorno.'], slide_pptx: [], badge: 'foto', fonte: 'NASA, ESA' },
  { id: 'kibo-lab', luogo: 'kibo', categoria: 'strumento', titolo: 'Kibo, "speranza"', breve: 'Il modulo più grande della stazione.',
    punti: ['Laboratorio pressurizzato.', 'Piattaforma esterna per esperimenti nel vuoto.', 'Un braccio robotico dedicato.'], slide_pptx: [], badge: 'foto', fonte: 'JAXA' },
  { id: 'kibo-convezione', luogo: 'kibo', categoria: 'fisica', titolo: 'Fondere senza convezione', breve: 'Senza peso il calore non crea correnti nel liquido.',
    punti: ['Sulla Terra il liquido caldo sale: è la convezione.', 'In microgravità questo moto quasi sparisce.', 'Le leghe si solidificano in modo più controllabile.'], slide_pptx: [], badge: 'simulazione', fonte: 'ESA (materials science)' },
  { id: 'destiny-lab', luogo: 'destiny', categoria: 'strumento', titolo: 'Il laboratorio americano', breve: 'Il cuore della ricerca del segmento NASA.',
    punti: ['Lanciato nel 2001.', 'Ventiquattro posizioni per rack.', 'Contiene i comandi di molti sistemi di bordo.'], slide_pptx: [], badge: 'foto', fonte: 'NASA' },
  { id: 'destiny-faraday', luogo: 'destiny', categoria: 'fisica', titolo: 'Una stazione che genera tensione', breve: 'Muovendosi nel campo terrestre, la struttura è attraversata da una f.e.m.',
    punti: ['Velocità orbitale: circa 7,7 km/s.', 'Campo terrestre a 400 km: circa 30–40 µT.', 'Su 100 m di conduttore: f.e.m. dell\'ordine di 20–30 V (stima).'],
    formula: '\\varepsilon = B\\,L\\,v', slide_pptx: [8], badge: 'simulazione', fonte: 'Stima didattica da dati NASA' },
  { id: 'unity-convertitori', luogo: 'unity', categoria: 'energia', titolo: 'Convertire la tensione', breve: 'L\'energia solare viene adattata a ciò che serve ai rack.',
    punti: ['I pannelli forniscono corrente continua a circa 160 V.', 'Convertitori la portano a circa 124 V per gli utenti.', 'Con la corrente alternata servirebbe un trasformatore.'],
    formula: '\\dfrac{V_1}{V_2}=\\dfrac{N_1}{N_2}', slide_pptx: [20], badge: 'foto', fonte: 'NASA' },
  { id: 'unity-primo', luogo: 'unity', categoria: 'strumento', titolo: 'Il primo mattone', breve: 'Unity, lanciato nel 1998, ha dato inizio all\'assemblaggio.',
    punti: ['Primo elemento americano in orbita.', 'Sei portelli di attracco.', 'Qui si intravedono Quest e Zarya, non percorribili in questa visita.'], slide_pptx: [], badge: 'foto', fonte: 'NASA' },
  { id: 'tranquility-acqua', luogo: 'tranquility', categoria: 'vita', titolo: 'Riciclare acqua e aria', breve: 'Qui si trovano i sistemi di supporto vitale.',
    punti: ['Si recupera acqua anche dall\'umidità dell\'aria.', 'Si produce ossigeno dall\'acqua.', 'Poco si butta: tutto è prezioso a 400 km di quota.'], slide_pptx: [], badge: 'foto', fonte: 'NASA' },
  { id: 'tranquility-terra', luogo: 'tranquility', categoria: 'terra', titolo: 'Un\'orbita ogni 92 minuti', breve: 'La Terra scorre sotto la stazione.',
    punti: ['Quota: circa 400 km.', 'Periodo orbitale: circa 92 minuti.', 'In caduta libera attorno alla Terra: ecco perché si fluttua.'], slide_pptx: [], badge: 'foto', fonte: 'NASA' },
  { id: 'cupola-finestre', luogo: 'cupola', categoria: 'terra', titolo: 'Sette finestre sul mondo', breve: 'Sei finestre trapezoidali e una circolare al centro.',
    punti: ['Quella centrale ha circa 80 cm di diametro.', 'Da qui si manovra il braccio robotico.', 'Il campo magnetico terrestre, invisibile, ci protegge dal vento solare.'], slide_pptx: [], badge: 'foto', fonte: 'NASA', x: 0.7, y: 0.5 },
  { id: 'eml-campo', luogo: 'eml', categoria: 'eml', titolo: 'Campo magnetico variabile', breve: 'Una corrente alternata genera un campo che cambia nel tempo.',
    punti: ['Le bobine sono percorse da corrente alternata.', 'Il campo oscilla alla stessa frequenza.', 'È la causa di tutto ciò che segue.'],
    formula: 'B(t)=B_0\\sin(\\omega t)', slide_pptx: [2, 18], badge: 'modello3d', fonte: 'ESA, modello concettuale', oggetto3d: 'coil_upper' },
  { id: 'eml-correnti', luogo: 'eml', categoria: 'fisica', titolo: 'Correnti indotte', breve: 'Il flusso variabile genera correnti nel campione.',
    punti: ['Legge di Faraday-Neumann-Lenz.', 'Il verso della corrente si oppone alla variazione di flusso.', 'Sono correnti parassite, come nei freni a induzione.'],
    formula: '\\varepsilon=-\\dfrac{d\\Phi_B}{dt}', slide_pptx: [8, 11], badge: 'modello3d', fonte: 'ESA, modello concettuale', oggetto3d: 'sample', spostamento3d: [0.35, 0.25, 0] },
  { id: 'eml-joule', luogo: 'eml', categoria: 'energia', titolo: 'Riscaldamento per effetto Joule', breve: 'Le correnti indotte dissipano energia e scaldano il metallo.',
    punti: ['La potenza dissipata cresce con il quadrato della corrente.', 'Il campione arriva fino alla fusione.', 'Nessun contatto, nessun contenitore: niente contaminazioni.'],
    formula: 'P=R\\,I^2', slide_pptx: [9], badge: 'modello3d', fonte: 'ESA, modello concettuale', oggetto3d: 'sample', spostamento3d: [-0.35, 0.25, 0] },
  { id: 'eml-strumento', luogo: 'eml', categoria: 'strumento', titolo: 'Osservare la goccia', breve: 'Telecamere e pirometro misurano forma e temperatura.',
    punti: ['Due telecamere riprendono il campione.', 'Il pirometro misura la temperatura senza toccarlo.', 'Si studiano raffreddamento e solidificazione.'], slide_pptx: [], badge: 'modello3d', fonte: 'ESA, modello concettuale', oggetto3d: 'pyrometer' },
  { id: 'finale-maglev', luogo: 'finale', categoria: 'fisica', titolo: 'Treni a levitazione', breve: 'La stessa legge di Lenz che sostiene la goccia sostiene un treno.',
    punti: ['Correnti parassite nella guida creano un campo opposto.', 'La forza respinge il treno: niente attrito di rotolamento.', 'Mobilità veloce e a basse emissioni.'], slide_pptx: [11], badge: 'foto', fonte: 'Obiettivo 9, Agenda 2030', x: 0.45, y: 0.47 },
  { id: 'finale-trasformatore', luogo: 'finale', categoria: 'energia', titolo: 'Trasportare l\'energia', breve: 'Il trasformatore riduce le perdite sulle lunghe distanze.',
    punti: ['Alta tensione = poca corrente.', 'Meno corrente = meno perdite per effetto Joule.', 'Funziona per mutua induzione tra due bobine.'], formula: 'P_{\\text{persa}}=R\\,I^2', slide_pptx: [20, 23], badge: 'foto', fonte: 'Obiettivo 7, Agenda 2030', x: 0.72, y: 0.4 },
  { id: 'finale-salute', luogo: 'finale', categoria: 'vita', titolo: 'Vedere dentro il corpo', breve: 'La risonanza magnetica usa campi e radiofrequenze, senza radiazioni ionizzanti.',
    punti: ['Campi magnetici intensi e onde radio.', 'Mappa i tessuti molli.', 'Diagnosi precoce: salute come diritto (art. 32).'], slide_pptx: [], badge: 'foto', fonte: 'Obiettivo 3, Agenda 2030', x: 0.27, y: 0.4 },
]
