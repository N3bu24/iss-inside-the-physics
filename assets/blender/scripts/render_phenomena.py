# Animazione di prova: riscaldamento del campione (grigio > rosso > arancione > bianco) con leggera levitazione.
# Uso: blender -b eml.blend --python render_phenomena.py [-- --frames N]
import bpy, os, math, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
OUT = os.path.join(ROOT, "renders", "test")
FPS, SECS = 24, 4
N = FPS * SECS
if "--frames" in sys.argv:
    N = int(sys.argv[sys.argv.index("--frames") + 1])
sc = bpy.context.scene
sc.render.fps = FPS
sc.frame_start, sc.frame_end = 1, N
sc.render.resolution_x, sc.render.resolution_y = 1280, 720
sc.render.resolution_percentage = 100
sc.camera = bpy.data.objects["cam_closeup"]
sc.render.image_settings.file_format = 'PNG'
try:
    sc.eevee.taa_render_samples = 24
except Exception:
    pass
smp = bpy.data.objects["sample"]
b = smp.data.materials[0].node_tree.nodes["Principled BSDF"]
# (frazione, colore base, colore emissione, intensita', roughness)
keys = [(0.0, (0.75, 0.77, 0.8, 1), (1, 0.05, 0.0, 1), 0.0),
        (0.3, (0.5, 0.2, 0.15, 1), (1, 0.04, 0.0, 1), 2.0),
        (0.65, (0.8, 0.3, 0.1, 1), (1, 0.3, 0.02, 1), 10.0),
        (1.0, (1, 0.9, 0.7, 1), (1, 0.85, 0.55, 1), 35.0)]
for f, base, em, s in keys:
    fr = 1 + f * (N - 1)
    b.inputs["Base Color"].default_value = base
    b.inputs["Emission Color"].default_value = em
    b.inputs["Emission Strength"].default_value = s
    for n in ("Base Color", "Emission Color", "Emission Strength"):
        b.inputs[n].keyframe_insert("default_value", frame=fr)
for i in range(N + 1):
    f = 1 + i * (N - 1) / N
    smp.location.z = 0.12 * math.sin(2 * math.pi * 1.5 * i / N)
    smp.keyframe_insert("location", index=2, frame=f)
sc.render.filepath = os.path.join(OUT, "heat_")
bpy.ops.render.render(animation=True)
