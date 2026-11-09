# Costruisce il modello schematico dell'EML. Unita': 1 unit = 1 cm. Asse del sistema = Z.
# Uso: blender -b --python build_eml.py   (salva eml.blend, export/eml.glb, preview PNG)
# Opzione: aggiungere "-- --norender" per saltare i render.
import bpy, bmesh, math, os, sys
from math import pi, sin, cos
from mathutils import Vector

# ---- PARAMETRI MODIFICABILI (da verificare con la ricerca) ----
CHAMBER_R = 8.0      # raggio camera (cm)
CHAMBER_H = 17.0      # altezza camera
WALL_T = 0.5          # spessore parete
CUT_ANGLE = 110       # gradi di sezione frontale (apertura per vedere dentro)
SAMPLE_D = 0.65       # diametro campione (cm) ~7 mm
COIL_TURNS_UP = 4     # spire bobina superiore
COIL_TURNS_LO = 4     # spire bobina inferiore
COIL_R_OUT, COIL_R_IN = 3.2, 1.6
COIL_GAP = 1.3        # distanza dal centro al primo piano di spire
WIRE_R = 0.18
CAROUSEL_N = 18
CAROUSEL_R = 4.6
CAROUSEL_Z = -5.2
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
OUT_BLEND = os.path.join(ROOT, "blender", "eml.blend")
OUT_GLB = os.path.join(ROOT, "blender", "export", "eml.glb")
PREV = os.path.join(ROOT, "renders", "preview")
DO_RENDER = "--norender" not in sys.argv

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def mat(name, base, metal=0.0, rough=0.5, emis=None, es=0.0, alpha=1.0, aniso=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = base
    b.inputs["Metallic"].default_value = metal
    b.inputs["Roughness"].default_value = rough
    if emis:
        b.inputs["Emission Color"].default_value = emis
        b.inputs["Emission Strength"].default_value = es
    if alpha < 1:
        b.inputs["Alpha"].default_value = alpha
    if aniso:
        b.inputs["Anisotropic"].default_value = aniso
    return m

M_COPPER = mat("copper", (0.95, 0.45, 0.28, 1), 1, 0.22)
M_STEEL = mat("steel_brushed", (0.30, 0.32, 0.36, 1), 1, 0.38, aniso=0.6)
M_GRAPH = mat("graphite", (0.04, 0.045, 0.055, 1), 0.6, 0.45)
M_GLASS = mat("glass", (0.8, 0.9, 1, 1), 0, 0.03, alpha=0.18)
M_GLASS.node_tree.nodes["Principled BSDF"].inputs["Transmission Weight"].default_value = 1.0
M_SAMPLE = mat("sample_metal", (0.75, 0.77, 0.8, 1), 1, 0.12, emis=(1, 0.35, 0.05, 1), es=0.0)
M_CERAMIC = mat("ceramic_alumina", (0.88, 0.85, 0.78, 1), 0, 0.55)
M_RHENIUM = mat("rhenium", (0.45, 0.46, 0.5, 1), 1, 0.3)
M_CYAN = mat("cyan_accent", (0.0, 0.7, 1, 1), 0, 0.3, emis=(0.0, 0.75, 1, 1), es=3.0)
M_NAVY = mat("navy_panel", (0.02, 0.06, 0.16, 1), 0.3, 0.5)
M_FLOOR = mat("floor", (0.015, 0.02, 0.03, 1), 0.2, 0.35)


def assign(o, m, smooth=True):
    o.data.materials.append(m)
    if smooth and o.type == 'MESH':
        for p in o.data.polygons:
            p.use_smooth = True
    return o


def named(o, n):
    o.name = n
    o.data.name = n + "_mesh"
    return o


def cyl(n, r, h, loc, m, rot=(0, 0, 0), v=64):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, rotation=rot, vertices=v)
    return assign(named(bpy.context.object, n), m)


def box(n, size, loc, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rot)
    o = bpy.context.object
    o.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    bpy.ops.object.transform_apply(scale=True)
    return assign(named(o, n), m, False)


def parent(children, name):
    e = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(e)
    for c in children:
        c.parent = e
    return e


def strip_caps(o):
    bm = bmesh.new()
    bm.from_mesh(o.data)
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if abs(f.normal.z) > 0.9], context='FACES')
    bm.to_mesh(o.data)
    bm.free()


# ---- Camera di processo: guscio cilindrico con apertura a settore (sezione) ----
bpy.ops.mesh.primitive_cylinder_add(radius=CHAMBER_R, depth=CHAMBER_H, location=(0, 0, 0), vertices=96)
ch = bpy.context.object
strip_caps(ch)
sol = ch.modifiers.new("shell", 'SOLIDIFY')
sol.thickness = WALL_T
sol.offset = -1
bpy.context.view_layer.objects.active = ch
bpy.ops.object.modifier_apply(modifier="shell")
# cuneo di taglio centrato sul lato -Y (verso la camera di vista)
wm = bpy.data.meshes.new("wedge")
w = bpy.data.objects.new("wedge", wm)
bpy.context.collection.objects.link(w)
bm = bmesh.new()
R2 = CHAMBER_R * 3
pts = [(0, 0)] + [(R2 * cos(-pi / 2 + (-CUT_ANGLE / 2 + i * CUT_ANGLE / 12) * pi / 180),
                   R2 * sin(-pi / 2 + (-CUT_ANGLE / 2 + i * CUT_ANGLE / 12) * pi / 180)) for i in range(13)]
n = len(pts)
vs = [bm.verts.new((x, y, -CHAMBER_H)) for x, y in pts] + [bm.verts.new((x, y, CHAMBER_H)) for x, y in pts]
bm.faces.new(vs[:n][::-1])
bm.faces.new(vs[n:])
for i in range(n):
    bm.faces.new((vs[i], vs[(i + 1) % n], vs[n + (i + 1) % n], vs[n + i]))
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
bm.to_mesh(wm)
bm.free()
bpy.context.view_layer.objects.active = ch
bo = ch.modifiers.new("cut", 'BOOLEAN')
bo.object = w
bo.operation = 'DIFFERENCE'
bo.solver = 'EXACT'
bpy.ops.object.modifier_apply(modifier="cut")
bpy.data.objects.remove(w)
named(ch, "chamber")
assign(ch, M_STEEL)

fl = [cyl("chamber_flange_top", CHAMBER_R + 1.2, 1.0, (0, 0, CHAMBER_H / 2 + 0.5), M_STEEL),
      cyl("chamber_flange_bottom", CHAMBER_R + 1.2, 1.0, (0, 0, -CHAMBER_H / 2 - 0.5), M_STEEL)]
for k in range(24):
    a = 2 * pi * k / 24
    for z in (CHAMBER_H / 2 + 1.05, -CHAMBER_H / 2 - 1.05):
        fl.append(cyl("bolt", 0.35, 0.3, ((CHAMBER_R + 0.6) * cos(a), (CHAMBER_R + 0.6) * sin(a), z), M_GRAPH, v=6))
parent(fl + [ch], "chamber_assembly")

# oblo' laterali (ghiera)
ports = []
for ang in (20, 90, 160):
    a = ang * pi / 180
    d = CHAMBER_R + 1
    ports.append(cyl("port_ring", 2.6, 2.0, (d * cos(a), d * sin(a), 0), M_STEEL, rot=(0, pi / 2, a), v=48))
parent(ports, "ports")


# ---- Bobina SUPOS: tubo di rame raffreddato ad acqua, spirale conica, 3 spire sopra e 3 sotto ----
TUBE_R = 0.22          # raggio esterno del tubo (cm)
R_IN_C = 1.8           # raggio interno (spira piu' vicina al campione)
DR_TURN = 0.62         # incremento radiale per spira
DZ_TURN = 0.45         # incremento verticale per spira
TURNS = 3
LEAD_ANG = {+1: 195, -1: 345}   # gradi: uscita radiale degli adduttori
M_WATER = mat("water_fitting", (0.0, 0.45, 0.8, 1), 0.2, 0.3, emis=(0.0, 0.6, 1, 1), es=1.0)


def tube(name, pts, r, m, cap=True, res=12):
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = r
    cu.bevel_resolution = 8
    cu.use_fill_caps = cap
    cu.resolution_u = res
    sp = cu.splines.new('POLY')
    sp.points.add(len(pts) - 1)
    for i, p in enumerate(pts):
        sp.points[i].co = (p[0], p[1], p[2], 1)
    o = bpy.data.objects.new(name, cu)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(m)
    return o


def coil_half(name, sign):
    objs = []
    N = TURNS * 96
    lead = LEAD_ANG[sign] * pi / 180
    a0 = lead - TURNS * 2 * pi
    pts = []
    for i in range(N + 1):
        t = i / N
        ang = a0 + t * TURNS * 2 * pi
        r = R_IN_C + DR_TURN * TURNS * t
        z = sign * (COIL_GAP + DZ_TURN * TURNS * t)
        pts.append((r * cos(ang), r * sin(ang), z))
    objs.append(tube(name + "_spiral", pts, TUBE_R, M_COPPER, res=2))
    # adduttore radiale che attraversa la parete
    pe = pts[-1]
    xe = 9.2
    ld = [pe, (pe[0] + 0.5 * cos(lead), pe[1] + 0.5 * sin(lead), pe[2]),
          (xe * cos(lead), xe * sin(lead), pe[2])]
    objs.append(tube(name + "_feed", ld, 0.3, M_COPPER, res=4))
    # passante in parete + attacco acqua
    fd = cyl(name + "_feedthrough", 0.75, 1.6, (0, 0, 0), M_STEEL, rot=(0, pi / 2, lead), v=32)
    fd.location = ((CHAMBER_R + 0.3) * cos(lead), (CHAMBER_R + 0.3) * sin(lead), pe[2])
    objs.append(fd)
    wr = cyl(name + "_water_ring", 0.55, 0.35, (0, 0, 0), M_WATER, rot=(0, pi / 2, lead), v=24)
    wr.location = ((xe + 0.5) * cos(lead), (xe + 0.5) * sin(lead), pe[2])
    objs.append(wr)
    # supporti ceramici (solo bobina superiore: scendono dalla flangia)
    if sign > 0:
        for k, pa in enumerate((60, 300, 120 + 120)):
            pa = pa * pi / 180
            rr = R_IN_C + DR_TURN * TURNS + 0.1
            z1 = COIL_GAP + DZ_TURN * TURNS + 0.2
            objs.append(tube("%s_post%d" % (name, k), [(rr * cos(pa), rr * sin(pa), z1),
                                                      (rr * cos(pa), rr * sin(pa), CHAMBER_H / 2)], 0.2, M_CERAMIC, res=2))
    return parent(objs, name)


# SUPOS: un'unica bobina (avvolgimento superiore + inferiore) con correnti RF sovrapposte 140 kHz (quadrupolo) e 380 kHz (dipolo)
cu_u = coil_half("coil_upper", +1)
cu_l = coil_half("coil_lower", -1)
parent([cu_u, cu_l], "coil_supos")

# ---- Campione ----
bpy.ops.mesh.primitive_uv_sphere_add(radius=SAMPLE_D / 2, location=(0, 0, 0), segments=64, ring_count=32)
smp = assign(named(bpy.context.object, "sample"), M_SAMPLE)

# ---- Carosello portacampioni ----
disc = cyl("carousel_disc", CAROUSEL_R + 1.0, 0.6, (0, 0, CAROUSEL_Z), M_RHENIUM, v=96)
cparts = [disc, cyl("carousel_hub", 1.2, 1.5, (0, 0, CAROUSEL_Z - 0.5), M_STEEL, v=32),
          cyl("carousel_axis", 0.5, 6, (0, 0, CAROUSEL_Z - 3.5), M_STEEL, v=24)]
for k in range(CAROUSEL_N):
    a = 2 * pi * k / CAROUSEL_N
    x, y = CAROUSEL_R * cos(a), CAROUSEL_R * sin(a)
    cparts.append(cyl("cup", 0.5, 0.7, (x, y, CAROUSEL_Z + 0.5), M_CERAMIC, v=24))
    cparts.append(cyl("cup_rim", 0.52, 0.08, (x, y, CAROUSEL_Z + 0.88), M_RHENIUM, v=24))
    bpy.ops.mesh.primitive_uv_sphere_add(radius=SAMPLE_D / 2, location=(x, y, CAROUSEL_Z + 0.95), segments=24, ring_count=12)
    cparts.append(assign(named(bpy.context.object, "stored_sample"), M_SAMPLE))
parent(cparts, "carousel")

# ---- Telecamera assiale (sopra, guarda in basso) ----
cam_p = [box("cam_body", (4.5, 4.5, 6), (0, 0, CHAMBER_H / 2 + 4.5), M_NAVY),
         cyl("cam_lens", 1.6, 3, (0, 0, CHAMBER_H / 2 + 1.9), M_GRAPH, v=32),
         cyl("cam_lens_glass", 1.3, 0.1, (0, 0, CHAMBER_H / 2 + 0.35), M_GLASS, v=32),
         cyl("cam_led", 0.2, 0.2, (2.3, 0, CHAMBER_H / 2 + 6), M_CYAN, v=12)]
parent(cam_p, "camera_axial")

# ---- Camera radiale (laterale, oblo' a 60 gradi) ----
a = 20 * pi / 180
rp = [box("camr_body", (4.2, 4.2, 6), (0, 0, 0), M_NAVY),
      cyl("camr_lens", 1.5, 3, (0, 0, 0), M_GRAPH, v=32)]
for o, d in zip(rp, (CHAMBER_R + 7.2, CHAMBER_R + 4.7)):
    o.rotation_euler = (0, pi / 2, a)
    o.location = (d * cos(a), d * sin(a), 0)
parent(rp, "camera_radial")

# ---- Pirometro (oblo' a 300 gradi) ----
a = 160 * pi / 180
py = [cyl("pyro_tube", 1.1, 7, (0, 0, 0), M_GRAPH, rot=(0, pi / 2, a), v=32),
      cyl("pyro_head", 1.6, 2, (0, 0, 0), M_NAVY, rot=(0, pi / 2, a), v=32),
      cyl("pyro_led", 0.25, 0.3, (0, 0, 0), M_CYAN, rot=(0, pi / 2, a), v=12)]
for o, d in zip(py, (CHAMBER_R + 5.5, CHAMBER_R + 10.5, CHAMBER_R + 11.7)):
    o.location = (d * cos(a), d * sin(a), 0)
parent(py, "pyrometer")

# ---- Telaio / base e pannello ----
box("rack_base", (60, 40, 3), (0, 0, -CHAMBER_H / 2 - 3.5), M_NAVY)
box("rack_back_panel", (60, 2, 45), (0, CHAMBER_R + 18, 0), M_NAVY)
bpy.ops.mesh.primitive_plane_add(size=600, location=(0, 0, -CHAMBER_H / 2 - 5.1))
assign(named(bpy.context.object, "floor"), M_FLOOR, False)

# ---- Illuminazione e mondo ----
wd = bpy.data.worlds.new("w")
scene.world = wd
wd.use_nodes = True
wd.node_tree.nodes["Background"].inputs[0].default_value = (0.02, 0.04, 0.09, 1)
wd.node_tree.nodes["Background"].inputs[1].default_value = 0.5


def area(n, loc, e, col, size):
    ld = bpy.data.lights.new(n, 'AREA')
    ld.energy = e
    ld.color = col
    ld.size = size
    o = bpy.data.objects.new(n, ld)
    bpy.context.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()


area("key", (30, -35, 30), 30000, (1, 0.95, 0.88), 14)       # key light caldo
area("rim", (-30, 28, 12), 80000, (0.2, 0.7, 1), 10)       # rim light ciano
area("rim2", (28, 30, 18), 40000, (0.2, 0.7, 1), 10)
area("fill_top", (0, -10, 45), 5000, (0.85, 0.92, 1), 25)
area("sample_light", (6, -14, 6), 5000, (1, 0.97, 0.92), 4)  # mette in risalto il campione

# atmosfera leggera (volume scatter nel mondo)
wnt = wd.node_tree
vs_ = wnt.nodes.new("ShaderNodeVolumeScatter")
vs_.inputs["Density"].default_value = 0.0006
vs_.inputs["Anisotropy"].default_value = 0.35
vs_.inputs["Color"].default_value = (0.6, 0.8, 1, 1)
wnt.links.new(vs_.outputs[0], wnt.nodes["World Output"].inputs["Volume"])


def make_cam(n, loc, target, lens):
    cd = bpy.data.cameras.new(n)
    cd.lens = lens
    o = bpy.data.objects.new(n, cd)
    bpy.context.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    return o


cam_over = make_cam("cam_overview", (26, -40, 14), (0, 0, 1), 40)
cam_close = make_cam("cam_closeup", (9.5, -19.0, 4.5), (0, 0, 0.2), 60)
cam_close.data.dof.use_dof = False
cam_close.data.dof.focus_object = smp
cam_close.data.dof.aperture_fstop = 4

scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x, scene.render.resolution_y = 1600, 900
scene.render.image_settings.file_format = 'PNG'
def eevee_quality(sc, samples=160):
    ev = sc.eevee
    ev.taa_render_samples = samples
    for k, v in (("use_shadows", True), ("shadow_ray_count", 3), ("shadow_step_count", 12),
                 ("use_raytracing", True), ("volumetric_samples", 96), ("volumetric_tile_size", '2'),
                 ("use_volumetric_shadows", True), ("volumetric_shadow_samples", 32)):
        try:
            setattr(ev, k, v)
        except Exception as e:
            print("eevee opt", k, e)
    try:
        ev.ray_tracing_options.use_denoise = True
    except Exception as e:
        print("denoise opt", e)


eevee_quality(scene)
scene.view_settings.view_transform = 'AgX'

bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND)

# ---- Export GLB (esclude pavimento, luci) ----
bpy.ops.object.select_all(action='DESELECT')
for o in scene.objects:
    if o.type in ('MESH', 'CURVE', 'EMPTY') and o.name != "floor":
        o.select_set(True)
kw = dict(filepath=OUT_GLB, export_format='GLB', use_selection=True, export_apply=True)
try:
    bpy.ops.export_scene.gltf(export_draco_mesh_compression_enable=True,
                              export_draco_mesh_compression_level=6, **kw)
except Exception as e:
    print("Draco non disponibile:", e)
    bpy.ops.export_scene.gltf(**kw)
print("GLB MB:", os.path.getsize(OUT_GLB) / 1e6)

if DO_RENDER:
    import time
    for cam, fn in ((cam_over, "eml_overview_v2.png"), (cam_close, "eml_closeup_v2.png")):
        t = time.time()
        scene.camera = cam
        scene.render.filepath = os.path.join(PREV, fn)
        bpy.ops.render.render(write_still=True)
        print("RENDER", fn, round(time.time() - t, 1), "s")
