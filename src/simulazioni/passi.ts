// Sequenze a passi PROVVISORIE di ogni simulazione (testi definitivi: content/simulazioni.json, vedi contenuto.ts).
// `stato` è letto dalla scena della simulazione; `camera`/`ancora` guidano la telecamera.
import { passiDi, type Passo } from './contenuto'

const V = '/video/fenomeni/'

const EML: Passo[] = [
  {
    titolo: 'Carico del campione',
    stato: 'carico',
    ancora: 'carousel',
    distanza: 3.9,
    testo:
      "Un magazzino a revolver porta 18 campioni sferici di 5-8 mm (alluminio, rame, leghe di nichel). Un meccanismo ne preleva uno e lo porta nella camera di processo, riempita di gas inerte.",
    cosaSiVede: 'Il carosello dei campioni e la camera di processo al centro.',
  },
  {
    titolo: 'Posizionamento: campo quadrupolare',
    stato: 'posizionamento',
    ancora: 'sample',
    distanza: 3.1,
    video: V + 'campo-variabile.mp4',
    testo:
      "La bobina di rame, con avvolgimenti sovrapposti per il posizionamento e per il riscaldamento, porta una corrente alternata a circa 140 kHz e genera un campo quadrupolare, nullo al centro. Le correnti indotte nel campione spingono verso il punto in cui il campo si annulla: il campione galleggia senza contatto.",
    cosaSiVede: 'Le linee di campo e il campione sospeso al centro della bobina.',
    formula: '\\varepsilon=-\\frac{d\\Phi_B}{dt}',
  },
  {
    titolo: 'Riscaldamento: campo dipolare',
    stato: 'riscaldamento',
    ancora: 'sample',
    distanza: 2.6,
    video: V + 'joule.mp4',
    testo:
      "Una seconda corrente, a circa 380 kHz, produce un campo dipolare che induce nel metallo correnti parassite (di Foucault). Incontrando la resistenza del materiale dissipano energia per effetto Joule e il campione si scalda, fino a oltre 2000 °C.",
    cosaSiVede: 'Anelli di corrente sulla superficie e il campione che passa da grigio a rosso e arancione.',
    formula: 'P = R\\,I^{2}',
  },
  {
    titolo: 'Fusione',
    stato: 'fusione',
    ancora: 'sample',
    distanza: 2.35,
    video: V + 'fusione.mp4',
    testo:
      "Raggiunta la temperatura di fusione il solido diventa una goccia liquida. In microgravità nulla la schiaccia sul fondo e nessun contenitore la inquina: la tensione superficiale la mantiene quasi sferica.",
    cosaSiVede: 'Il campione bianco incandescente, ora liquido.',
  },
  {
    titolo: 'Oscillazione della goccia e misure',
    stato: 'misure',
    ancora: 'camera_radial',
    distanza: 3.1,
    testo:
      "Una piccola perturbazione fa vibrare la goccia: dalla frequenza delle oscillazioni si ricava la tensione superficiale, dallo smorzamento la viscosità. Una telecamera ad alta velocità riprende la forma, un pirometro misura la temperatura dalla luce emessa.",
    cosaSiVede: 'La goccia che pulsa leggermente e le due ottiche puntate su di essa.',
    formula: '\\omega^{2}=\\frac{8\\,\\sigma}{\\rho\\,R^{3}}',
  },
  {
    titolo: 'Raffreddamento e solidificazione',
    stato: 'raffreddamento',
    ancora: 'sample',
    distanza: 2.6,
    video: V + 'solidificazione.mp4',
    testo:
      "Spegnendo il riscaldamento il liquido si raffredda anche sotto la temperatura di fusione, perché senza pareti non ha dove iniziare a cristallizzare. Quando parte la solidificazione il calore latente fa risalire di colpo la temperatura: è la ricalescenza.",
    cosaSiVede: 'Il campione che torna scuro; sul pirometro un picco improvviso di temperatura.',
  },
]

const CAMPO: Passo[] = [
  {
    titolo: 'La ISS e la Terra',
    stato: 'insieme',
    testo:
      "La Terra è un enorme magnete a dipolo e le sue linee di campo avvolgono l'orbita della Stazione, a circa 400 km di quota. La ISS è ingrandita per essere visibile: in scala reale sarebbe un puntino.",
    cosaSiVede: 'Il globo, le linee di campo in azzurro e l\'etichetta "ISS".',
  },
  {
    titolo: 'Stazione ferma: nessuna fem',
    stato: 'ferma',
    testo:
      'Se la Stazione fosse ferma, il traliccio non taglierebbe le linee di campo: il flusso non varia e la forza elettromotrice è zero. Per la legge di Faraday serve un moto o una variazione.',
    cosaSiVede: 'Il traliccio spento e il segnale della fem piatto.',
  },
  {
    titolo: 'Velocità reale: 7,7 km/s',
    stato: 'reale',
    testo:
      "In moto, il traliccio conduttore taglia le linee di campo e fra le sue estremità nasce una fem di moto. È massima dove campo, moto e traliccio sono perpendicolari e il segno si inverte passando da un emisfero all'altro.",
    cosaSiVede: 'Cariche che scorrono lungo il traliccio e il segnale che pulsa.',
    formula: '\\varepsilon = B\\,l\\,v',
  },
  {
    titolo: 'Cambia l\'orbita',
    stato: 'polare',
    testo:
      "Un'orbita più inclinata porta la Stazione a incrociare campi diversi: cambia il modo in cui il moto e il campo si dispongono, quindi cambia il segnale.",
    cosaSiVede: 'L\'orbita tratteggiata che si inclina verso i poli.',
  },
  {
    titolo: 'Velocità esagerata',
    stato: 'esagerata',
    testo:
      'Raddoppiando v raddoppia la fem. A bordo i plasma contactor scaricano verso lo spazio le cariche che si accumulano sulla struttura.',
    cosaSiVede: 'Il segnale molto più ampio e i portatori di carica più numerosi.',
    formula: '\\varepsilon \\propto v',
  },
]

const ENERGIA: Passo[] = [
  {
    titolo: "L'alternatore",
    stato: 'ruota',
    testo:
      "Una spira ruota in un campo magnetico: il flusso concatenato cambia e ai capi nasce una fem alternata. È lo stesso principio delle centrali e, in piccolo, dei generatori di bordo.",
    cosaSiVede: 'La spira in rotazione e il segnale sinusoidale.',
    formula: '\\varepsilon=-\\frac{d\\Phi_B}{dt}',
  },
  {
    titolo: 'Il trasformatore',
    stato: 'pari',
    testo:
      'Due bobine sullo stesso nucleo di ferro: il flusso variabile della prima induce una fem nella seconda, senza parti in movimento. Con lo stesso numero di spire la tensione resta uguale.',
    cosaSiVede: 'Il nucleo di ferro con le due bobine e la linea elettrica.',
    formula: '\\frac{V_2}{V_1}=\\frac{N_2}{N_1}',
  },
  {
    titolo: 'Alta tensione, poche perdite',
    stato: 'eleva',
    testo:
      'Alzando la tensione a parità di potenza la corrente cala; le perdite per effetto Joule dipendono dal quadrato della corrente, quindi il cavo resta freddo e arriva più energia.',
    cosaSiVede: 'Il cavo che rimane scuro.',
    formula: 'P = R\\,I^{2}',
  },
  {
    titolo: 'Bassa tensione, cavo caldo',
    stato: 'abbassa',
    testo: 'Con tensione bassa serve una corrente grande: il cavo si scalda e si arrossa, e l\'energia si disperde in calore.',
    cosaSiVede: 'Il cavo che si arrossa.',
  },
]

const LEVITAZIONE: Passo[] = [
  {
    titolo: 'Carrello fermo',
    stato: 'fermo',
    testo: 'Nessun moto, nessuna variazione di flusso, nessuna corrente indotta: il carrello appoggia sulle ruote.',
    cosaSiVede: 'Il carrello a terra sulla guida.',
  },
  {
    titolo: 'Il carrello accelera',
    stato: 'medio',
    testo:
      'Il campo dei magneti in moto sulla guida conduttrice induce correnti a vortice. Per la legge di Lenz il loro campo si oppone a quello dei magneti: comincia una spinta verso l\'alto.',
    cosaSiVede: 'Vortici di corrente nella guida e il carrello che si solleva.',
    formula: '\\varepsilon=-\\frac{d\\Phi_B}{dt}',
  },
  {
    titolo: 'Levitazione',
    stato: 'veloce',
    testo: 'Ad alta velocità le ruote non toccano più la guida: sparisce l\'attrito di contatto e resta solo quello dell\'aria.',
    cosaSiVede: 'Il carrello sospeso sopra la guida.',
  },
  {
    titolo: "Il confronto con l'EML",
    stato: 'eml',
    testo:
      "Nell'EML della ISS un campione metallico fuso è sospeso da un campo alternato: le correnti indotte nella sfera sono le stesse dei vortici nella guida, e le stesse leggi la sollevano senza contenitore.",
    cosaSiVede: 'Il levitatore affiancato al Maglev.',
  },
]

const RMN: Passo[] = [
  {
    titolo: 'Spin a riposo',
    stato: 'riposo',
    testo: 'I nuclei di idrogeno sono piccoli magneti che precedono attorno al campo B0. Le fasi sono casuali: la magnetizzazione netta è lungo il campo e la bobina non vede nulla.',
    cosaSiVede: 'Le frecce dei nuclei che ruotano sfasate attorno a B0.',
    formula: '\\omega_L=\\gamma B_0',
  },
  {
    titolo: 'Impulso a radiofrequenza',
    stato: 'impulso',
    testo: "Un impulso RF inclina gli spin e li mette in fase: la magnetizzazione ruota nel piano trasversale.",
    cosaSiVede: 'Gli spin che si allineano in fase.',
  },
  {
    titolo: 'Il segnale FID',
    stato: 'fid',
    testo: 'La magnetizzazione che ruota cambia il flusso nella bobina ricevente: per Faraday-Neumann nasce una fem oscillante che decade.',
    cosaSiVede: 'Il segnale oscillante smorzato.',
    formula: '\\varepsilon=-\\frac{d\\Phi_B}{dt}',
  },
  {
    titolo: 'Rilassamento',
    stato: 'rilassa',
    testo: 'Gli spin perdono la fase e tornano lungo B0: il segnale si spegne. La RMN non usa radiazioni ionizzanti e in orbita serve a studiare perdita ossea e muscolare.',
    cosaSiVede: 'Gli spin che ritornano disordinati lungo il campo.',
  },
]

const FARADAY: Passo[] = [
  {
    titolo: 'Magnete fermo',
    stato: 'fermo',
    testo: 'Un magnete a riposo vicino alla bobina non fa variare il flusso: il galvanometro resta a zero, qualunque sia il campo.',
    cosaSiVede: 'L\'ago del galvanometro fermo sullo zero.',
  },
  {
    titolo: 'Il magnete entra',
    stato: 'entra',
    testo: 'Avvicinando il polo nord il flusso nella bobina cresce: nasce una corrente e l\'ago devia. Per la legge di Lenz il verso della corrente si oppone all\'aumento di flusso.',
    cosaSiVede: 'L\'ago che devia da un lato mentre il magnete entra.',
    formula: '\\varepsilon=-N\\frac{d\\Phi_B}{dt}',
  },
  {
    titolo: 'Il magnete esce',
    stato: 'esce',
    testo: 'Allontanando il magnete il flusso diminuisce: la corrente si inverte e l\'ago devia dalla parte opposta.',
    cosaSiVede: 'L\'ago che devia dall\'altro lato.',
  },
  {
    titolo: 'Più veloce, più fem',
    stato: 'veloce',
    testo: 'La fem dipende dalla rapidità con cui varia il flusso: muovendo il magnete più in fretta la deviazione cresce.',
    cosaSiVede: 'Un\'oscillazione più ampia dell\'ago.',
  },
]

const P = (stato: string, titolo: string, testo: string, camera?: Passo['camera']): Passo => ({ stato, titolo, testo, camera })

const MOTORE: Passo[] = [
  P('alternatore', 'Facciamo girare la spira', 'Una spira che ruota in un campo magnetico produce una fem alternata.', { pos: [0, 2.5, 14], target: [0, 0, 0] }),
  P('motore', 'Lo stesso, al contrario', 'Una batteria fa passare corrente nella spira: la forza di Lorentz la fa girare.', { pos: [0, 2.5, 14], target: [0, 0, 0] }),
  P('collettore', 'Il collettore', 'I semianelli invertono il verso della corrente a ogni mezzo giro.', { pos: [2.5, -0.8, 5], target: [0, -1.2, 0] }),
  P('fem', 'La fem opposta', 'Il motore in rotazione genera una fem che si oppone alla corrente.', { pos: [0, 2.5, 14], target: [0, 0, 0] }),
  P('stazione', 'Sulla stazione', 'Braccio robotico e ventole sono mossi da motori elettrici.', { pos: [0, 0.5, 12], target: [0, -1, -2] }),
]
const AUTOINDUZIONE: Passo[] = [
  P('chiudi', "Chiudiamo l'interruttore", 'Chiudendo il circuito la bobina si oppone al passaggio della corrente.'),
  P('sale', "L'extracorrente di chiusura", 'La corrente sale con andamento esponenziale e costante di tempo L/R.'),
  P('L', "Cos'è L", "L'induttanza dipende dalla geometria della bobina."),
  P('energia', "L'energia nel campo", "Nel campo magnetico della bobina è immagazzinata l'energia ½Li²."),
  P('apri', 'Aprire il circuito', "All'apertura la corrente crolla e la fem autoindotta può essere molto alta."),
]
const AURORA: Passo[] = [
  P('campo', 'Una carica in un campo', 'La forza di Lorentz curva la traiettoria senza cambiare la velocità.', { pos: [0, 1.5, 9.5], target: [0, 0, 0] }),
  P('spirale', 'Raggio e spirale', "Con una componente lungo il campo la traiettoria è un'elica.", { pos: [5, 2, 8], target: [0, 0, 0] }),
  P('vento', 'Il vento solare e la Terra', 'Il campo terrestre devia le particelle e le guida verso i poli.', { pos: [2, 5, 17], target: [0, 0, 0] }),
  P('aurora', "Si accende l'aurora", "Le particelle eccitano gli atomi dell'alta atmosfera, che emettono luce.", { pos: [4, 6.2, 6.5], target: [0, 2.9, 0] }),
  P('cupola', 'Dalla Cupola', 'La ISS orbita sopra la regione aurorale.', { pos: [3.4, 5.2, 4.2], target: [0, 3.2, 0] }),
]

/** Stato di scena per ogni passo del file di contenuto (stesso numero e ordine dei passi in content/simulazioni.json). */
const STATI: Record<string, string[]> = {
  eml: ['carico', 'posizionamento', 'riscaldamento', 'fusione', 'misure', 'raffreddamento'],
  campo: ['insieme', 'ferma', 'reale', 'polare', 'esagerata'],
  energia: ['ruota', 'ruota', 'pari', 'eleva', 'eleva'],
  levitazione: ['medio', 'medio', 'eml', 'veloce', 'fermo'],
  rmn: ['riposo', 'riposo', 'impulso', 'fid', 'rilassa'],
  motore: ['alternatore', 'motore', 'collettore', 'fem', 'stazione'],
  autoinduzione: ['chiudi', 'sale', 'L', 'energia', 'apri'],
  aurora: ['campo', 'spirale', 'vento', 'aurora', 'cupola'],
}

export const PASSI_PROVVISORI: Record<string, Passo[]> = { eml: EML, campo: CAMPO, energia: ENERGIA, levitazione: LEVITAZIONE, rmn: RMN, faraday: FARADAY, motore: MOTORE, autoinduzione: AUTOINDUZIONE, aurora: AURORA }
/** Passi della simulazione `id` (testi dal file di contenuto se esiste, altrimenti provvisori). */
export const passiSimulazione = (id: string): Passo[] => passiDi(id, PASSI_PROVVISORI[id] ?? [], STATI[id])
export const PASSI_EML = () => passiSimulazione('eml')
