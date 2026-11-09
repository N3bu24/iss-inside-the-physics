"""Contact sheet di un video: python sheet.py video.mp4 out.jpg [start.jpg end.jpg]
Mostra 5 fotogrammi (0, 25, 50, 75, 100%) e, se dati, la vista di partenza e di arrivo attese."""
import subprocess, sys, tempfile, os, json
from PIL import Image
v, out = sys.argv[1], sys.argv[2]
extra = sys.argv[3:5]
d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', v]).decode().strip())
tmp = tempfile.mkdtemp()
ims = []
for i, f in enumerate([0, .25, .5, .75, .99]):
    p = os.path.join(tmp, f'{i}.jpg')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(d * f), '-i', v, '-frames:v', '1', '-vf', 'scale=640:360', p], check=True)
    ims.append(Image.open(p))
for e in extra:
    ims.append(Image.open(e).resize((640, 360)))
cols = 3
rows = (len(ims) + cols - 1) // cols
m = Image.new('RGB', (640 * cols, 360 * rows))
for i, im in enumerate(ims):
    m.paste(im, ((i % cols) * 640, (i // cols) * 360))
m.save(out, quality=80)
print('dur', d)
