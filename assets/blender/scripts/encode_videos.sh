#!/bin/bash
# Codifica i frame PNG (assets/renders/test/<nome>/f_%04d.png) in assets/renders/fenomeni/<nome>.mp4 (H.264, 24 fps).
# Uso: encode_videos.sh <nome> [crf]
cd "$(dirname "$0")/../../renders" || exit 1
mkdir -p fenomeni
ffmpeg -y -loglevel error -framerate 24 -i "test/$1/f_%04d.png" -c:v libx264 -preset slow -crf "${2:-24}" \
  -pix_fmt yuv420p -movflags +faststart "fenomeni/$1.mp4"
ls -l "fenomeni/$1.mp4"
