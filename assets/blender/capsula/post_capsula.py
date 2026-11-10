# Post-produzione: jpg con oblo neri, maschera, info json. Uso: python post_capsula.py
import json, math
import numpy as np
from PIL import Image, ImageFilter
D = 'C:/Users/Alessandro/Desktop/Lavoro edc ISS/assets/renders/capsula/'
im = Image.open(D+'capsula-pano.png').convert('RGBA')
a = np.array(im)
alpha = a[..., 3]
print('alfa min/max', alpha.min(), alpha.max(), 'frazione trasparente', (alpha < 128).mean())
rgb = (a[..., :3].astype(float) * (alpha[..., None]/255.0)).astype(np.uint8)
Image.fromarray(rgb).save(D+'capsula-pano.jpg', quality=88)
m = Image.fromarray(255-alpha).resize((2048, 1024), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
m.save(D+'capsula-maschera.png')
Image.fromarray(rgb).resize((2048, 1024), Image.LANCZOS).save(D+'capsula-anteprima.jpg', quality=88)
ports = [(-78, 8, 11.0), (78, 8, 11.0), (150, 15, 8.0)]
info = {
    'risoluzione': [im.width, im.height],
    'convenzione': 'lon 0 = centro immagine (pannello strumenti), positivo verso destra; lat positivo verso l\'alto; gradi',
    'oblo': [{'lon': lo, 'lat': la, 'raggio': r} for lo, la, r in ports],
    'icone': [{'lon': 0, 'lat': 30}, {'lon': -48, 'lat': 8}, {'lon': 48, 'lat': 8},
              {'lon': -112, 'lat': 12}, {'lon': 112, 'lat': 12}],
    'note': 'oblo con alfa 0 nel PNG; nel jpg riempiti di nero',
}
json.dump(info, open(D+'capsula-info.json', 'w'), indent=2, ensure_ascii=False)
