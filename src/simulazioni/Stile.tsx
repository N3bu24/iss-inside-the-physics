/** Stile condiviso delle simulazioni (slider, barra di scorrimento sottile, hotspot 3D da 56 px, formule senza scroll). */
const CSS = `
.sim-scroll{overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;scrollbar-color:rgba(53,224,255,.45) transparent}
.sim-scroll::-webkit-scrollbar{width:5px;height:0}
.sim-scroll::-webkit-scrollbar-track{background:transparent}
.sim-scroll::-webkit-scrollbar-thumb{background:rgba(53,224,255,.4);border-radius:3px}
.sim-scroll::-webkit-scrollbar-thumb:hover{background:rgba(53,224,255,.7)}
.sim-formula{overflow:hidden;max-width:100%}
.sim-formula .katex-display{overflow:visible;margin:.35em 0}
.sim-formula .katex{font-size:1.08em;white-space:normal}
.amb-range{-webkit-appearance:none;appearance:none;width:100%;height:22px;background:transparent;cursor:pointer}
.amb-range::-webkit-slider-runnable-track{height:3px;border-radius:2px;background:linear-gradient(90deg,rgba(53,224,255,.8),rgba(255,255,255,.18))}
.amb-range::-moz-range-track{height:3px;border-radius:2px;background:rgba(255,255,255,.2)}
.amb-range::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;margin-top:-7.5px;border-radius:50%;background:#35e0ff;border:3px solid #05101c;box-shadow:0 0 14px rgba(53,224,255,.9)}
.amb-range::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#35e0ff;border:3px solid #05101c;box-shadow:0 0 14px rgba(53,224,255,.9)}
.amb-range.heat::-webkit-slider-thumb{background:#ff8a2a;box-shadow:0 0 14px rgba(255,138,42,.9)}
.sim-hs{position:relative;width:56px;height:56px;border-radius:9999px;display:grid;place-items:center;cursor:pointer;
  color:var(--c,#35e0ff);background:rgba(5,8,18,.88);border:2px solid var(--c,#35e0ff);
  box-shadow:0 0 0 1px rgba(0,0,0,.6),0 0 20px color-mix(in srgb,var(--c,#35e0ff) 55%,transparent);transition:transform .2s ease}
.sim-hs:hover,.sim-hs:focus-visible,.sim-hs.attivo{transform:scale(1.1);outline:none}
.sim-hs::after{content:'';position:absolute;inset:-8px;border-radius:inherit;border:1.5px solid var(--c,#35e0ff);opacity:0;animation:simring 3s ease-out infinite;pointer-events:none}
@keyframes simring{0%{transform:scale(.82);opacity:.7}100%{transform:scale(1.4);opacity:0}}
.sim-hs-tip{position:absolute;bottom:calc(100% + 12px);left:50%;transform:translateX(-50%);white-space:nowrap;padding:5px 12px;border-radius:9999px;font-size:13px;color:#fff;background:rgba(4,8,20,.92);border:1px solid rgba(255,255,255,.35);opacity:0;pointer-events:none;transition:opacity .18s}
.sim-hs:hover .sim-hs-tip,.sim-hs:focus-visible .sim-hs-tip,.sim-hs.attivo .sim-hs-tip{opacity:1}
.sim-win{animation:simwin .35s cubic-bezier(.2,.8,.2,1) both}
@keyframes simwin{from{opacity:0;transform:translate(-50%,16px)}to{opacity:1;transform:translate(-50%,0)}}
.sim-avvia{background:linear-gradient(135deg,rgba(53,224,255,.95),rgba(40,150,255,.9));color:#04101c;font-weight:600;border-radius:999px;padding:.8rem 1.7rem;box-shadow:0 0 30px rgba(53,224,255,.4);transition:transform .25s,box-shadow .25s;display:inline-flex;gap:.55rem;align-items:center}
.sim-avvia:hover{transform:translateY(-2px);box-shadow:0 0 46px rgba(53,224,255,.6)}
`

export default function Stile() {
  return <style>{CSS}</style>
}
