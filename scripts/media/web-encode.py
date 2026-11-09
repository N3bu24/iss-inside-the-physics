"""Codifica per il web gli originali v2: python web-encode.py nome1 nome2 ..."""
import subprocess, sys
for n in sys.argv[1:]:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'assets/voli/originali-v2/{n}.mp4', '-an', '-vf', 'scale=1280:720',
                    '-c:v', 'libx264', '-crf', '25', '-preset', 'slow', '-movflags', '+faststart', '-pix_fmt', 'yuv420p',
                    f'public/voli/{n}.mp4'], check=True)
    print('ok', n)
