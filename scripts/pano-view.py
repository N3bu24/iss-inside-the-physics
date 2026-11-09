"""Estrae una vista prospettica da un panorama equirettangolare.

Uso:
  python scripts/pano-view.py <panorama.jpg> <out.jpg> --yaw 0 --pitch 0 --fov 90 [--w 1280 --h 720]

Convenzione (uguale a Photo Sphere Viewer): yaw 0 = centro dell'immagine, yaw positivo verso destra,
pitch positivo verso l'alto. Serve per le immagini di partenza/arrivo dei voli Higgsfield.
"""
import argparse
import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None


def vista(pano: Image.Image, yaw: float, pitch: float, fov: float, w: int, h: int) -> Image.Image:
    src = np.asarray(pano.convert("RGB"))
    H, W = src.shape[:2]
    f = (w / 2) / np.tan(np.radians(fov) / 2)
    xs, ys = np.meshgrid(np.arange(w) - w / 2 + 0.5, np.arange(h) - h / 2 + 0.5)
    # direzioni nel sistema della camera: x destra, y su, z avanti
    d = np.stack([xs, -ys, np.full_like(xs, f)], axis=-1)
    d /= np.linalg.norm(d, axis=-1, keepdims=True)
    p, y = np.radians(pitch), np.radians(yaw)
    # rotazione: prima pitch (attorno a x), poi yaw (attorno a y)
    rx = np.array([[1, 0, 0], [0, np.cos(p), np.sin(p)], [0, -np.sin(p), np.cos(p)]])
    ry = np.array([[np.cos(y), 0, np.sin(y)], [0, 1, 0], [-np.sin(y), 0, np.cos(y)]])
    d = d @ rx.T @ ry.T
    lon = np.arctan2(d[..., 0], d[..., 2])
    lat = np.arcsin(np.clip(d[..., 1], -1, 1))
    u = ((lon / (2 * np.pi) + 0.5) * W).astype(int) % W
    v = np.clip(((0.5 - lat / np.pi) * H).astype(int), 0, H - 1)
    return Image.fromarray(src[v, u])


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("pano"); ap.add_argument("out")
    ap.add_argument("--yaw", type=float, default=0); ap.add_argument("--pitch", type=float, default=0)
    ap.add_argument("--fov", type=float, default=90)
    ap.add_argument("--w", type=int, default=1280); ap.add_argument("--h", type=int, default=720)
    a = ap.parse_args()
    vista(Image.open(a.pano), a.yaw, a.pitch, a.fov, a.w, a.h).save(a.out, quality=92)
    print("ok", a.out)
