#!/bin/bash
# Lancia in parallelo i voli v2 (Seedance 2.0). Uso: bash scripts/media/voli-v2-batch.sh  (dal worktree)
# Formato riga: nome|pano_da|yaw_da|pano_a|yaw_a
export ENV_FILE="C:/Users/Alessandro/Desktop/Lavoro edc ISS/.env"
F=assets/voli/v2/frame
O=assets/voli/originali-v2
P="The camera floats slowly and continuously forward through the open hatch of the International Space Station into the adjacent module, then gently turns until it settles on the final view. Photorealistic interior, constant white lighting, no people, cables and equipment stay rigid and unchanged, single continuous shot, no cuts."
LINES="${@:-columbus__harmony|columbus|90|nodo|30
destiny__harmony|destiny|180|nodo|180
destiny__unity|destiny|0|unity|0
harmony__columbus|nodo|-150|columbus|-90
harmony__destiny|nodo|0|destiny|0
harmony__kibo|nodo|150|materiali|0
kibo__harmony|materiali|180|nodo|-30
tranquility__unity|cupola|-92|unity|-90
unity__destiny|unity|180|destiny|180}"
echo "$LINES" | while IFS='|' read n a ya b yb; do
  [ -z "$n" ] && continue
  python scripts/pano-view.py public/panorami/$a.jpg $F/s_$n.jpg --yaw $ya --pitch 0 --fov 80 --w 1920 --h 1080 >/dev/null
  python scripts/pano-view.py public/panorami/$b.jpg $F/e_$n.jpg --yaw $yb --pitch 0 --fov 80 --w 1920 --h 1080 >/dev/null
  node scripts/media/volo-seedance.mjs $F/s_$n.jpg $F/e_$n.jpg $O/$n.mp4 "$P" > $F/log_$n.txt 2>&1 &
done
wait
echo finito
