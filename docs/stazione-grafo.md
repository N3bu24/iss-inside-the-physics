# Grafo della stazione (portelli misurati sui panorami ESA)

Convenzione: yaw 0 = centro del panorama, positivo verso destra; pitch positivo verso l'alto. Valori ±10°.

| Nodo (file) | Modulo | Portello → destinazione | yaw | pitch |
|---|---|---|---|---|
| nodo.jpg | Harmony (Node 2) | → Destiny (poppa, si vede il corridoio) | 0 | 0 |
| nodo.jpg | Harmony | → Columbus (cartello "To COL") | -155 | 0 |
| nodo.jpg | Harmony | → Kibo (cartello "To JEM") | +150 | 0 |
| columbus.jpg | Columbus | → Harmony (portello "FWD") | +90 | 0 |
| columbus.jpg | Columbus | rack EML (European Drawer Rack) → scena 3D EML | circa +8 | +20 |
| materiali.jpg | Kibo | → Harmony | 180 | 0 |
| destiny.jpg | Destiny | → Unity ("HATCH EXIT TO NOD 1") | 0 | 0 |
| destiny.jpg | Destiny | → Harmony | 180 | 0 |
| unity.jpg | Unity (Node 1) | → Destiny ("To LAB") | 180 | 0 |
| unity.jpg | Unity | → Tranquility ("To NOD3") | +90 | 0 |
| unity.jpg | Unity | (Quest airlock "To AL", non percorribile) | -90 | 0 |
| unity.jpg | Unity | (Zarya "To FGB", non percorribile) | 0 | 0 |
| cupola.jpg | Tranquility (Node 3) | → Unity | circa -100 | 0 |
| cupola.jpg | Tranquility | → Cupola ("To CUP", nadir) | 0 | -70 |

Percorso guidato: Harmony → Columbus → (EML) → Columbus → Harmony → Kibo → Harmony → Destiny → Unity → Tranquility → Cupola → finale.
Strumento: `python scripts/pano-view.py <pano> <out.jpg> --yaw Y --pitch P --fov F` per estrarre viste prospettiche.
