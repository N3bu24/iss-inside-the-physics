import { useState, type ReactNode } from 'react'
import { ArrowUp, BookOpen, Captions, FileText, Hand, Home, Info, Map as MapIcon, MapPin, MoreHorizontal, Settings, Volume2, VolumeX, X } from 'lucide-react'
import { preferenze, usePreferenza } from '../lib/preferenze'
import { useVista } from '../explore/vista'
import Waveform from '../components/Waveform'

interface Props {
  luogoAperto: boolean
  daVedere: number
  onLuogo: () => void
  onMappa: () => void
  onAvanti: () => void
  audioOn: boolean
  onAudio: () => void
  onIndice: () => void
  onImpostazioni: () => void
  onHome: () => void
  onCrediti: () => void
  onComandi: () => void
  trans: boolean
  onTrans: () => void
}

function Tasto({ icona, etichetta, attivo, onClick, pressed, extra }: { icona: ReactNode; etichetta: string; attivo?: boolean; onClick: () => void; pressed?: boolean; extra?: ReactNode }) {
  return (
    <button
      onClick={onClick} aria-label={etichetta} aria-pressed={pressed}
      className={`relative flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[10.5px] leading-none active:bg-white/10 ${attivo ? 'text-cyan-200' : 'text-white/80'}`}
    >
      <span className="flex items-center gap-1.5">{icona}{extra}</span>
      <span className="barra-etichetta">{etichetta}</span>
    </button>
  )
}

/**
 * Barra inferiore compatta per telefono e tablet: Luogo, Mappa, Avanti (verso il portello inquadrato), Audio e «Altro».
 * «Altro» apre un menu con Indice, Impostazioni, sottotitoli, trascrizione, comandi, crediti e ritorno all'introduzione.
 */
export default function BarraCompatta(p: Props) {
  const [menu, setMenu] = useState(false)
  const cc = usePreferenza('sottotitoli')
  const pronto = useVista((v) => !!v.portello)
  const voce = (icona: ReactNode, testo: string, f: () => void, stato?: boolean) => (
    <button key={testo} role="menuitem" onClick={() => { setMenu(false); f() }} className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] text-white/90 active:bg-white/10">
      <span className="text-cyan-200">{icona}</span><span className="flex-1">{testo}</span>
      {stato !== undefined && <span className={`rounded-full px-2 py-0.5 text-[11px] ${stato ? 'bg-cyan-300/20 text-cyan-100' : 'bg-white/10 text-white/50'}`}>{stato ? 'Attivi' : 'Spenti'}</span>}
    </button>
  )
  return (
    <>
      {menu && (
        <>
          <div className="absolute inset-0 z-[33]" onClick={() => setMenu(false)} aria-hidden />
          <div role="menu" aria-label="Altro" className="glass fade-in absolute right-2 z-[35] w-[min(19rem,calc(100vw-1rem))] overflow-y-auto rounded-2xl p-1.5"
            style={{ bottom: 'var(--barra-spazio)', maxHeight: 'calc(100dvh - var(--barra-spazio) - 2.2rem)', background: 'rgba(7,12,26,.97)' }}>
            {voce(<BookOpen size={20} />, 'Indice dei contenuti', p.onIndice)}
            {voce(<Settings size={20} />, 'Impostazioni', p.onImpostazioni)}
            {voce(<Captions size={20} />, 'Sottotitoli', () => preferenze.set({ sottotitoli: !cc }), cc)}
            {voce(<FileText size={20} />, 'Trascrizione della voce', p.onTrans)}
            {voce(<Hand size={20} />, 'Come muoversi', p.onComandi)}
            {voce(<Info size={20} />, 'Crediti e fonti', p.onCrediti)}
            {voce(<Home size={20} />, "Torna all'introduzione", p.onHome)}
          </div>
        </>
      )}
      <nav aria-label="Comandi dell'esplorazione" className="glass absolute inset-x-2 z-[34] mx-auto flex max-w-[34rem] items-stretch gap-0.5 rounded-2xl px-1.5"
        style={{ height: 'var(--barra-h)', bottom: 'max(.4rem, env(safe-area-inset-bottom, 0px))' }}>
        <Tasto icona={<MapPin size={22} />} etichetta="Luogo" attivo={p.luogoAperto} onClick={p.onLuogo}
          extra={p.daVedere > 0 ? <span className="grid h-4 min-w-4 place-items-center rounded-full bg-cyan-300 px-1 text-[10px] font-semibold text-[#04101c]">{p.daVedere}</span> : undefined} />
        <Tasto icona={<MapIcon size={22} />} etichetta="Mappa" onClick={p.onMappa} />
        <div className="flex flex-1 items-center justify-center">
          <button
            onClick={p.onAvanti} aria-label="Avanti verso il portello inquadrato"
            className={`grid h-[calc(var(--barra-h)-8px)] w-[calc(var(--barra-h)+8px)] place-items-center rounded-full transition-colors ${pronto ? 'bg-gradient-to-br from-cyan-300 to-sky-500 text-[#04101c] shadow-[0_0_22px_rgba(53,224,255,.5)]' : 'border border-white/25 bg-white/5 text-white/70'}`}
          ><ArrowUp size={26} strokeWidth={2.6} /></button>
        </div>
        <Tasto
          icona={p.audioOn ? <Volume2 size={22} /> : <VolumeX size={22} />} etichetta={p.audioOn ? 'Audio' : 'Muto'} pressed={p.audioOn} onClick={p.onAudio}
          extra={<Waveform attivo={p.audioOn} className="hidden !h-5 !w-12 tab:block" />}
        />
        <Tasto icona={menu ? <X size={22} /> : <MoreHorizontal size={22} />} etichetta="Altro" attivo={menu || p.trans} onClick={() => setMenu(!menu)} />
      </nav>
    </>
  )
}
