import { useMemo, useState } from 'react'
import LayoutSimulazione from './Layout'
import { Cursore, Pulsante } from './controlli'
import { passiSimulazione } from './passi'
import { metaSimulazione } from './contenuto'
import { EmlCanvas } from '../components/EmlScene'

/**
 * Simulazione "eml": la scena 3D dell'EML con la stessa struttura delle altre simulazioni
 * (colonna di testo, voce, Esci, "Come si usa") e la sequenza di 6 passi.
 * Funziona anche aperta sopra il nodo EML: la scena ha una copia propria del modello.
 */
export default function SimulazioneEml({ onClose }: { onClose: () => void }) {
  const passi = useMemo(() => passiSimulazione('eml'), [])
  const [potenza, setPotenza] = useState<number | null>(null)
  const [campo, setCampo] = useState(true)
  const meta = metaSimulazione('eml')

  return (
    <LayoutSimulazione
      id="eml"
      titolo="L'esperimento nell'EML"
      intro="Dentro il laboratorio Columbus, l'Electromagnetic Levitator tiene sospeso un campione metallico con un campo magnetico alternato, lo scalda con le correnti indotte fino a fonderlo e ne misura le proprietà senza alcun contenitore. Premi «Avvia esperimento» per seguire le sei fasi."
      agenda={meta.agenda}
      slide={meta.slide}
      passi={passi}
      onClose={onClose}
      etichettaAvvia="Avvia esperimento"
      controlli={
        <>
          <Cursore
            etichetta="Potenza di riscaldamento"
            valore={potenza ?? 0.5}
            min={0}
            max={1}
            calore
            onChange={setPotenza}
            testo={potenza === null ? 'automatica' : `${Math.round(potenza * 100)} %`}
            sinistra="spento"
            destra="fuso"
          />
          <Pulsante onClick={() => setCampo(!campo)} attivo={campo}>
            Linee di campo
          </Pulsante>
        </>
      }
      scena={({ passo, sinistraPx }) => (
        <EmlCanvas hotspot={[]} attivo={null} fenomeno={null} calore={potenza} mostraCampo={campo} onHotspot={() => {}} passo={passo} sinistraPx={sinistraPx} />
      )}
    />
  )
}
