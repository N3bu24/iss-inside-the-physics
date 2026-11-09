// Testi provvisori degli ambienti interattivi.
// Verranno sostituiti/integrati da content/ambienti.json (content-writer).

export type TestoAmbiente = {
  titolo: string
  intro: string
  formula: string // LaTeX
  formulaNota: string
  agenda: string
  slide: string
  didascalie: Record<string, string>
}

export const TESTI = {
  campo: {
    titolo: 'La ISS nel campo magnetico terrestre',
    intro:
      "La Stazione orbita a circa 7,7 km/s dentro il campo magnetico della Terra, che si comporta come un enorme dipolo. Un conduttore che si muove in un campo magnetico diventa un generatore: tra le sue estremità nasce una forza elettromotrice di moto.",
    formula: '\\varepsilon = B\\,l\\,v',
    formulaNota:
      'B: campo magnetico, l: lunghezza del traliccio, v: velocità. Conta solo la parte di campo perpendicolare al moto e al traliccio: quella che il conduttore "taglia".',
    agenda: 'Agenda 2030, Obiettivo 9 · Costituzione, Art. 9 (ricerca scientifica)',
    slide: 'Slide 2 (spira in moto in un campo) e slide 8 (legge di Faraday-Neumann)',
    didascalie: {
      ferma:
        'La Stazione è ferma: il traliccio non taglia più le linee di campo, il flusso non varia e la fem è zero. Per Faraday serve un moto o una variazione.',
      reale:
        'Alla velocità reale il traliccio taglia le linee di campo e il segnale pulsa: è massimo dove il campo è più perpendicolare al moto e si annulla all\'equatore magnetico. Il segno si inverte a ogni emisfero.',
      esagerata:
        'Con una velocità esagerata la fem cresce in proporzione: raddoppiando v, raddoppia ε. A bordo i plasma contactor scaricano verso lo spazio le cariche che si accumulano sulla struttura.',
    },
  },
  energia: {
    titolo: "L'energia di bordo: alternatore e trasformatore",
    intro:
      "Una spira che ruota in un campo magnetico vede variare il flusso e produce una corrente alternata. Il trasformatore cambia la tensione senza parti in movimento, sfruttando il flusso variabile in un nucleo di ferro.",
    formula: '\\frac{V_2}{V_1}=\\frac{N_2}{N_1}\\qquad \\varepsilon=-\\frac{d\\Phi_B}{dt}',
    formulaNota:
      'A parità di potenza trasportata, alzando la tensione la corrente cala; le perdite per effetto Joule valgono P = R I² e calano con il quadrato della corrente.',
    agenda: 'Agenda 2030, Obiettivo 7 (energia pulita e accessibile) · Costituzione, Art. 41',
    slide: 'Slide 18 (alternatore), slide 20 (trasformatore) e slide 21 (centrali)',
    didascalie: {
      abbassa:
        'Rapporto basso: la tensione in linea è bassa, quindi serve una corrente grande. Il cavo si scalda e si arrossa: l\'energia si disperde in calore (effetto Joule).',
      pari:
        'Rapporto uno a uno: la tensione resta uguale. Il cavo scalda in modo moderato.',
      eleva:
        'Rapporto alto: la tensione in linea sale e la corrente scende. Il cavo resta freddo e arriva più energia alle utenze. Per questo le linee elettriche usano l\'alta tensione. Sulla ISS i convertitori fanno lo stesso lavoro a scala ridotta.',
    },
  },
  levitazione: {
    titolo: "Dall'EML al Maglev",
    intro:
      "Un magnete in moto sopra un conduttore induce nel metallo correnti a vortice. Per la legge di Lenz queste generano un campo che si oppone al moto del magnete: più si va veloci, più la spinta verso l'alto aumenta.",
    formula: '\\varepsilon=-\\frac{d\\Phi_B}{dt}\\qquad \\vec F\\ \\text{si oppone alla variazione di flusso}',
    formulaNota:
      'Le correnti parassite (o di Foucault) nascono ovunque in un conduttore massiccio sottoposto a un flusso variabile. Dissipano energia per effetto Joule, ma qui producono anche una forza di sollevamento.',
    agenda: 'Agenda 2030, Obiettivo 9 (industria, innovazione, infrastrutture) · Costituzione, Art. 9',
    slide: 'Slide 4 (magnete e bobina) e slide 11 (legge di Lenz)',
    didascalie: {
      fermo:
        'Il carrello è fermo: nessuna variazione di flusso, nessuna corrente indotta, nessuna spinta. Appoggia sulle ruote.',
      medio:
        'Il carrello accelera: nella guida compaiono vortici di corrente. Il loro campo si oppone a quello dei magneti e comincia a sollevarlo.',
      veloce:
        'Ad alta velocità il carrello levita: le ruote non toccano più la guida e l\'attrito di contatto sparisce, resta solo quello dell\'aria.',
      eml:
        'Nell\'Electromagnetic Levitator della ISS un campione metallico fuso è sospeso da un campo alternato: le correnti indotte nella sfera sono le stesse dei vortici nella guida, e le stesse leggi le sollevano senza contenitore.',
    },
  },
  rmn: {
    titolo: 'Risonanza magnetica e medicina spaziale',
    intro:
      "I nuclei di idrogeno del corpo si comportano come minuscoli magneti che precedono attorno a un campo intenso. Un impulso a radiofrequenza li inclina; mentre tornano all'equilibrio la loro magnetizzazione induce un segnale in una bobina.",
    formula: '\\varepsilon=-\\frac{d\\Phi_B}{dt}\\qquad \\omega_L=\\gamma B_0',
    formulaNota:
      'La frequenza di precessione (di Larmor) è proporzionale al campo B₀. Il segnale FID decade perché gli spin perdono la sincronia (defasamento) e tornano all\'allineamento (rilassamento).',
    agenda: 'Agenda 2030, Obiettivo 3 (salute e benessere) · Costituzione, Art. 32 (tutela della salute)',
    slide: 'Slide 6 e slide 8 (legge di Faraday-Neumann)',
    didascalie: {
      riposo:
        'Gli spin precedono attorno a B₀, ma con fasi casuali: la magnetizzazione netta è lungo il campo e la bobina non vede nulla.',
      impulso:
        'L\'impulso RF inclina gli spin e li mette in fase: la magnetizzazione ruota nel piano trasversale.',
      fid:
        'La magnetizzazione ruota e cambia il flusso nella bobina ricevente: per Faraday-Neumann nasce una fem oscillante che decade (FID).',
      rilassa:
        'Il segnale si è spento: gli spin hanno perso la fase e tornano lentamente lungo B₀. La RMN non usa radiazioni ionizzanti: serve anche a studiare perdita ossea e muscolare degli astronauti in orbita.',
    },
  },
} satisfies Record<string, TestoAmbiente>

export type IdAmbiente = keyof typeof TESTI
