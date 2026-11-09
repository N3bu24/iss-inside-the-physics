# EML v2 - video dei fenomeni (ricostruzioni concettuali). Eevee, 1280x720, 24 fps.
# Uso:
#   blender -b assets/blender/eml.blend --python render_phenomena.py -- --name joule [--secs 7] [--samples 32]
#        [--frame K]  (singolo frame di prova in assets/renders/test/)  [--out DIR]
# Nomi: campo-variabile | correnti-indotte | joule | fusione | solidificazione
# I frame PNG vanno in assets/renders/test/<name>/ ; poi encode con ffmpeg (vedi encode_videos.sh).
# NOTA SCIENTIFICA: tutte le scene sono ricostruzioni concettuali (frequenze e ampiezze rallentate/esagerate).
import bpy, os, math, sys
from math import pi, sin, cos, exp

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []


def arg(k, d=None):
    return argv[argv.index(k) + 1] if k in argv else d


NAME = arg("--name", "joule")
SECS = float(arg("--secs", 7))
SAMPLES = int(arg("--samples", 32))
ONE = arg("--frame")
FPS = 24
N = int(round(SECS * FPS))
OUT = arg("--out", os.path.join(ROOT, "renders", "test", NAME))
os.makedirs(OUT, exist_ok=True)

sc = bpy.context.scene
sc.render.fps = FPS
sc.frame_start, sc.frame_end = 1, N
sc.render.resolution_x, sc.render.resolution_y = 1280, 720
sc.render.resolution_percentage = 100
sc.render.image_settings.file_format = 'PNG'
sc.render.use_overwrite = False
sc.eevee.taa_render_samples = SAMPLES
sc.view_settings.view_transform = 'AgX'
for k, v in (("use_raytracing", True), ("shadow_ray_count", 2), ("shadow_step_count", 8)):
    try:
        setattr(sc.eevee, k, v)
    except Exception:
        pass
try:
    sc.eevee.ray_tracing_options.use_denoise = True
except Exception:
    pass

OBJ = bpy.data.objects
R = 0.325  # raggio campione (cm), D = 6.5 mm


def tau(f):
    """tempo normalizzato 0..1 sul frame f (1..N)"""
    return (f - 1) / max(1, N - 1)


def smooth(a, b, x):
    t = min(1, max(0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)


def kv(node, f, v):
    node.outputs[0].default_value = v
    node.outputs[0].keyframe_insert("default_value", frame=f)


# ---------- nodi ----------
def nodes_of(mat):
    mat.use_nodes = True
    nt = mat.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    return nt


def nd(nt, t, **kw):
    n = nt.nodes.new(t)
    for k, v in kw.items():
        if k == "op":
            n.operation = v
        else:
            setattr(n, k, v)
    return n


def math_(nt, op, a=None, b=None):
    n = nd(nt, "ShaderNodeMath", op=op)
    for i, x in enumerate((a, b)):
        if x is None:
            continue
        if isinstance(x, (int, float)):
            n.inputs[i].default_value = x
        else:
            nt.links.new(x, n.inputs[i])
    return n.outputs[0]


def val(nt, v, label=None):
    n = nd(nt, "ShaderNodeValue")
    n.outputs[0].default_value = v
    if label:
        n.label = n.name = label
    return n


def maprange(nt, x, a, b, c, d, clamp=True):
    n = nd(nt, "ShaderNodeMapRange")
    n.clamp = clamp
    nt.links.new(x, n.inputs["Value"])
    for k, v in (("From Min", a), ("From Max", b), ("To Min", c), ("To Max", d)):
        n.inputs[k].default_value = v
    return n.outputs[0]


def hide_orig_sample():
    OBJ["sample"].hide_render = True
    OBJ["sample"].hide_viewport = True


# ---------- campione con shape key ----------
def make_sample(shape=False):
    import bmesh
    me = bpy.data.meshes.new("pheno_sample_mesh")
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=5, radius=R)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    o = bpy.data.objects.new("pheno_sample", me)
    bpy.context.collection.objects.link(o)
    if shape:
        o.shape_key_add(name="Basis")
        sks = {}
        for nm, fn in (("P2", lambda x, y, z: 0.5 * (3 * z * z - 1)),
                       ("P3", lambda x, y, z: 0.5 * (5 * z ** 3 - 3 * z)),
                       ("Y22", lambda x, y, z: x * x - y * y)):
            sk = o.shape_key_add(name=nm)
            for i, v in enumerate(me.vertices):
                n = v.co.normalized()
                sk.data[i].co = n * R * (1 + fn(n.x, n.y, n.z))
            sks[nm] = sk
    return o


def hot_material(mode="uniform"):
    """Materiale metallico incandescente guidato da temperatura T (Blackbody).
    Ritorna (materiale, nodo T, nodo melt, nodo fronte c)"""
    m = bpy.data.materials.new("pheno_hot")
    nt = nodes_of(m)
    out = nd(nt, "ShaderNodeOutputMaterial")
    bs = nd(nt, "ShaderNodeBsdfPrincipled")
    nt.links.new(bs.outputs[0], out.inputs[0])
    nT = val(nt, 300, "T")
    nM = val(nt, 0.0, "melt")
    nC = val(nt, 2.0, "front")
    Tloc = nT.outputs[0]
    step = None
    if mode == "front":
        tc = nd(nt, "ShaderNodeTexCoord")
        nrm = nd(nt, "ShaderNodeVectorMath", operation='NORMALIZE')
        nt.links.new(tc.outputs["Object"], nrm.inputs[0])
        dot = nd(nt, "ShaderNodeVectorMath", operation='DOT_PRODUCT')
        nt.links.new(nrm.outputs[0], dot.inputs[0])
        d = Vector3((0.35, -0.9, 0.25))
        dot.inputs[1].default_value = d
        x = math_(nt, 'SUBTRACT', dot.outputs["Value"], nC.outputs[0])
        step = maprange(nt, x, 0.0, 0.06, 0.0, 1.0)
        xp = math_(nt, 'MAXIMUM', x, 0.0)
        dec = math_(nt, 'POWER', 2.718, math_(nt, 'MULTIPLY', xp, -2.0))
        dT = math_(nt, 'MULTIPLY', math_(nt, 'MULTIPLY', step, dec), 560.0)  # ricalescenza (+560 K, esagerata)
        Tloc = math_(nt, 'ADD', nT.outputs[0], dT)
    if mode == "noise":
        tc = nd(nt, "ShaderNodeTexCoord")
        no = nd(nt, "ShaderNodeTexNoise", noise_dimensions='4D')
        no.inputs["Scale"].default_value = 7.0
        no.inputs["Detail"].default_value = 2.0
        nt.links.new(tc.outputs["Object"], no.inputs["Vector"])
        nW = val(nt, 0.0, "noiseW")
        nt.links.new(nW.outputs[0], no.inputs["W"])
        dT = math_(nt, 'MULTIPLY', math_(nt, 'SUBTRACT', no.outputs["Fac"], 0.5), 320.0)
        Tloc = math_(nt, 'ADD', nT.outputs[0], dT)
    bb = nd(nt, "ShaderNodeBlackbody")
    nt.links.new(Tloc, bb.inputs["Temperature"])
    hot = maprange(nt, Tloc, 650, 3000, 0.0, 1.0)
    strength = math_(nt, 'MULTIPLY', math_(nt, 'POWER', hot, 2.5), 3.0)   # emissione limitata: niente sovraesposizione
    gray = (0.72, 0.74, 0.78, 1)
    mixc = nd(nt, "ShaderNodeMix", data_type='RGBA')
    mixc.inputs[0].default_value = 0.0
    nt.links.new(maprange(nt, hot, 0.0, 0.3, 0.0, 1.0), mixc.inputs[0])
    mixc.inputs["A"].default_value = gray
    mixc.inputs["B"].default_value = (0.03, 0.012, 0.008, 1)
    nt.links.new(mixc.outputs["Result"], bs.inputs["Base Color"])
    nt.links.new(bb.outputs[0], bs.inputs["Emission Color"])
    nt.links.new(strength, bs.inputs["Emission Strength"])
    nt.links.new(maprange(nt, hot, 0.0, 0.6, 1.0, 0.0), bs.inputs["Metallic"])
    rough = maprange(nt, nM.outputs[0], 0.0, 1.0, 0.32, 0.06)
    if step is not None:
        rough = maprange(nt, step, 0.0, 1.0, 0.06, 0.32)
    nt.links.new(rough, bs.inputs["Roughness"])
    return m, nT, nM, nC, nt, Tloc, hot


def Vector3(t):
    from mathutils import Vector
    return Vector(t)


def add_halo(parent, nt_src, Tnode, gain, rscale=2.6):
    """Alone leggero: guscio trasparente additivo, luminoso al centro e sfumato ai bordi."""
    bpy.ops.mesh.primitive_uv_sphere_add(radius=R * rscale, location=(0, 0, 0), segments=48, ring_count=24)
    h = bpy.context.object
    h.name = "pheno_halo"
    for p in h.data.polygons:
        p.use_smooth = True
    h.parent = parent
    h.visible_shadow = False
    m = bpy.data.materials.new("pheno_halo")
    m.surface_render_method = 'BLENDED'
    m.use_backface_culling = True
    nt = nodes_of(m)
    out = nd(nt, "ShaderNodeOutputMaterial")
    tr = nd(nt, "ShaderNodeBsdfTransparent")
    em = nd(nt, "ShaderNodeEmission")
    mix = nd(nt, "ShaderNodeAddShader")
    g = nd(nt, "ShaderNodeNewGeometry")
    dt = nd(nt, "ShaderNodeVectorMath", operation='DOT_PRODUCT')
    nt.links.new(g.outputs["Normal"], dt.inputs[0])
    nt.links.new(g.outputs["Incoming"], dt.inputs[1])
    d_ = dt.outputs["Value"]
    s_ = math_(nt, 'SQRT', math_(nt, 'MAXIMUM', math_(nt, 'SUBTRACT', 1.0, math_(nt, 'MULTIPLY', d_, d_)), 0.0))
    # alone: nullo davanti al campione (s < R/Rh), massimo al bordo, sfuma verso l'esterno
    f = math_(nt, 'MULTIPLY', maprange(nt, s_, 1.0 / rscale - 0.12, 1.0 / rscale + 0.05, 0.0, 1.0),
              math_(nt, 'POWER', math_(nt, 'SUBTRACT', 1.0, s_), 1.6))
    nT = val(nt, 300, "T")
    bb = nd(nt, "ShaderNodeBlackbody")
    nt.links.new(nT.outputs[0], bb.inputs["Temperature"])
    hot = maprange(nt, nT.outputs[0], 650, 3000, 0.0, 1.0)
    nt.links.new(bb.outputs[0], em.inputs["Color"])
    nt.links.new(math_(nt, 'MULTIPLY', f, math_(nt, 'MULTIPLY', math_(nt, 'POWER', hot, 2.0), gain)), em.inputs["Strength"])
    nt.links.new(tr.outputs[0], mix.inputs[0])
    nt.links.new(em.outputs[0], mix.inputs[1])
    nt.links.new(mix.outputs[0], out.inputs[0])
    h.data.materials.append(m)
    return nT


def dim_lights(k):
    for o in OBJ:
        if o.type == 'LIGHT':
            o.data.energy *= k


def sample_camera(dist=8.8, lens=85, z=0.25, fstop=2.8):
    from mathutils import Vector
    cd = bpy.data.cameras.new("cam_sample")
    cd.lens = lens
    cd.dof.use_dof = True
    cd.dof.aperture_fstop = fstop
    o = bpy.data.objects.new("cam_sample", cd)
    bpy.context.collection.objects.link(o)
    o.location = (0.9, -dist, z)
    tgt = Vector((0, 0, 0))
    o.rotation_euler = (tgt - o.location).to_track_quat('-Z', 'Y').to_euler()
    cd.dof.focus_distance = (tgt - o.location).length
    sc.camera = o
    return o


def backdrop():
    """Fondale navy scuro dietro al campione (la parete interna della camera e' troppo chiara a campo stretto)."""
    bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 3.0, 0), rotation=(pi / 2, 0, 0))
    p = bpy.context.object
    p.name = "pheno_backdrop"
    m = bpy.data.materials.new("pheno_backdrop")
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (0.004, 0.008, 0.02, 1)
    b.inputs["Roughness"].default_value = 0.9
    b.inputs["Emission Color"].default_value = (0.006, 0.016, 0.04, 1)
    b.inputs["Emission Strength"].default_value = 1.0
    p.data.materials.append(m)


def no_volume():
    wt = bpy.data.worlds[0].node_tree if bpy.data.worlds else None
    sc.world = bpy.data.worlds[0]
    nt = sc.world.node_tree
    for l in list(nt.links):
        if l.to_socket.name == "Volume":
            nt.links.remove(l)


# =====================================================================
def scene_thermal(kind):
    """joule / fusione / solidificazione"""
    hide_orig_sample()
    no_volume()
    dim_lights(0.9)
    mode = {"joule": "uniform", "fusione": "noise", "solidificazione": "front"}[kind]
    o = make_sample(shape=(kind == "fusione"))
    m, nT, nM, nC, nt, Tloc, hot = hot_material(mode)
    o.data.materials.append(m)
    halo_gain = {"joule": 3.0, "fusione": 4.0, "solidificazione": 3.5}[kind]
    hT = add_halo(o, nt, None, halo_gain, rscale=2.2)
    sample_camera(dist=8.8 if kind == "joule" else 9.5)
    backdrop()
    nW = nt.nodes.get("noiseW")
    for f in range(1, N + 1):
        t = tau(f)
        if kind == "joule":
            T = 300 + 1400 * (t ** 1.15)
            M = 0
            c = 2
        elif kind == "fusione":
            T = 1650 + 600 * smooth(0.05, 0.6, t)
            M = smooth(0.30, 0.50, t)
            c = 2
        else:
            if t < 0.55:
                T = 2200 - 200 * t / 0.55
            else:
                T = 450 + 1550 * exp(-(t - 0.55) * 5.5)
            c = 1.1 - 2.2 * smooth(0.18, 0.55, t)
            M = 0
        kv(nT, f, T)
        kv(hT, f, T)
        kv(nM, f, M)
        kv(nC, f, c)
        if nW is not None:
            kv(nW, f, t * 6.0)
        # levitazione: leggero galleggiamento / rotazione lenta
        o.location.z = 0.025 * sin(2 * pi * 0.7 * t * SECS)
        o.location.x = 0.012 * sin(2 * pi * 1.1 * t * SECS + 1)
        o.rotation_euler.z = 0.5 * t * (1 if kind != "solidificazione" else 0.4)
        o.keyframe_insert("location", frame=f)
        o.keyframe_insert("rotation_euler", frame=f)
        if kind == "fusione" and o.data.shape_keys:
            amp = smooth(0.30, 0.55, t)
            ts = t * SECS
            ks = o.data.shape_keys.key_blocks
            ks["P2"].value = 0.17 * amp * sin(2 * pi * 1.25 * ts)
            ks["Y22"].value = 0.10 * amp * sin(2 * pi * 1.7 * ts + 1.0)
            ks["P3"].value = 0.07 * amp * sin(2 * pi * 2.3 * ts + 2.0)
            for k in ("P2", "Y22", "P3"):
                ks[k].keyframe_insert("value", frame=f)


# =====================================================================
def cyan_material(name="field_cyan"):
    m = bpy.data.materials.new(name)
    nt = nodes_of(m)
    out = nd(nt, "ShaderNodeOutputMaterial")
    em = nd(nt, "ShaderNodeEmission")
    em.inputs["Color"].default_value = (0.0, 0.35, 1.0, 1)
    nE = val(nt, 1.0, "E")
    nP = val(nt, 0.0, "P")
    uv = nd(nt, "ShaderNodeUVMap")
    sx = nd(nt, "ShaderNodeSeparateXYZ")
    nt.links.new(uv.outputs["UV"], sx.inputs[0])
    s = math_(nt, 'SUBTRACT', math_(nt, 'MULTIPLY', sx.outputs["X"], 3.0), nP.outputs[0])
    pat = math_(nt, 'POWER', math_(nt, 'ADD', math_(nt, 'MULTIPLY', math_(nt, 'SINE', math_(nt, 'MULTIPLY', s, 2 * pi)), 0.5), 0.5), 2.0)
    k = math_(nt, 'ADD', 0.30, math_(nt, 'MULTIPLY', pat, 0.70))
    nt.links.new(math_(nt, 'MULTIPLY', nE.outputs[0], k), em.inputs["Strength"])
    nt.links.new(em.outputs[0], out.inputs[0])
    return m, nE, nP


def field_lines(cyan, loops, azimuths, radius=0.03, cone=True, cone_s=0.35):
    """Linee di campo concettuali: anelli nel piano meridiano che passano sull'asse (+z) e ritornano all'esterno."""
    from mathutils import Vector
    lines, cones = [], []
    for az in azimuths:
        ca, sa = cos(az), sin(az)
        for (r0, r1, H) in loops:
            rm, a = 0.5 * (r0 + r1), 0.5 * (r1 - r0)
            cu = bpy.data.curves.new("fl", 'CURVE')
            cu.dimensions = '3D'
            cu.bevel_depth = radius
            cu.bevel_resolution = 2
            cu.use_fill_caps = False
            sp = cu.splines.new('POLY')
            M = 96
            sp.points.add(M - 1)
            sp.use_cyclic_u = True
            for i in range(M):
                s = i / M
                rho = rm - a * cos(2 * pi * s)
                z = H * sin(2 * pi * s)
                sp.points[i].co = (rho * ca, rho * sa, z, 1)
            o = bpy.data.objects.new("fieldline", cu)
            bpy.context.collection.objects.link(o)
            o.data.materials.append(cyan)
            lines.append(o)
            if cone:
                bpy.ops.mesh.primitive_cone_add(radius1=radius * 6, depth=radius * 20, vertices=16)
                c = bpy.context.object
                c.data.materials.append(cyan)
                c.location = (r0 * ca, r0 * sa, 0.0)
                cones.append(c)
    return lines, cones


def flip_cones(cones, f, sgn):
    for c in cones:
        c.scale = (1, 1, sgn)
        c.keyframe_insert("scale", frame=f)


def scene_field():
    for n in bpy.data.worlds[0].node_tree.nodes:
        if n.bl_idname == "ShaderNodeVolumeScatter":
            n.inputs["Density"].default_value = 0.0002   # atmosfera leggerissima
    hide_orig_sample()
    dim_lights(0.45)
    bpy.data.materials["steel_brushed"].node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.03, 0.035, 0.045, 1)
    bpy.data.materials["steel_brushed"].node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value = 0.4
    bpy.data.materials["steel_brushed"].node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.6
    bpy.data.materials["ceramic_alumina"].node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.35, 0.33, 0.3, 1)
    from mathutils import Vector
    cyan, nE, nP = cyan_material()
    loops = [(0.30, 4.8, 3.9), (0.80, 5.7, 4.8), (1.20, 6.8, 5.9)]
    lines, cones = field_lines(cyan, loops, [i * pi / 4 for i in range(8)], radius=0.035)
    # campione reale al centro (non riscaldato)
    o = make_sample()
    mm = bpy.data.materials.new("pheno_gray")
    mm.use_nodes = True
    b = mm.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (0.7, 0.72, 0.76, 1)
    b.inputs["Metallic"].default_value = 1
    b.inputs["Roughness"].default_value = 0.15
    o.data.materials.append(mm)
    o.scale = (1.6, 1.6, 1.6)
    # camera con lenta orbita
    cd = bpy.data.cameras.new("cam_field")
    cd.lens = 50
    cam = bpy.data.objects.new("cam_field", cd)
    pivot = bpy.data.objects.new("pivot", None)
    bpy.context.collection.objects.link(cam)
    bpy.context.collection.objects.link(pivot)
    cam.parent = pivot
    cam.location = (9.0, -27.0, 8.0)
    cam.rotation_euler = (Vector((0, 0, 0.2)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
    sc.camera = cam
    w = 2 * pi / 3.0  # periodo 3 s (concettuale: la RF reale e' a 10^5 Hz)
    for f in range(1, N + 1):
        t = tau(f) * SECS
        b_ = sin(w * t)
        kv(nE, f, 0.25 + 2.6 * abs(b_))
        kv(nP, f, -0.9 * cos(w * t))     # impulsi lungo la linea: seguono il verso del campo
        flip_cones(cones, f, b_ if abs(b_) > 0.04 else 0.04)
        pivot.rotation_euler.z = math.radians(-14 + 28 * tau(f))
        pivot.keyframe_insert("rotation_euler", frame=f)


# =====================================================================
def currents_material():
    m = bpy.data.materials.new("eddy_rings")
    m.surface_render_method = 'BLENDED'
    nt = nodes_of(m)
    out = nd(nt, "ShaderNodeOutputMaterial")
    tr = nd(nt, "ShaderNodeBsdfTransparent")
    em = nd(nt, "ShaderNodeEmission")
    mix = nd(nt, "ShaderNodeMixShader")
    tc = nd(nt, "ShaderNodeTexCoord")
    sx = nd(nt, "ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Object"], sx.inputs[0])
    zn = math_(nt, 'DIVIDE', sx.outputs["Z"], R * 1.02)
    # anelli di corrente a distanza 0.4 in z/R; piu' intensi all'equatore (J ~ distanza dall'asse)
    ring = math_(nt, 'POWER', math_(nt, 'ADD', math_(nt, 'MULTIPLY', math_(nt, 'COSINE', math_(nt, 'MULTIPLY', zn, 2 * pi / 0.4)), 0.5), 0.5), 5.0)
    eq = math_(nt, 'SQRT', math_(nt, 'MAXIMUM', math_(nt, 'SUBTRACT', 1.0, math_(nt, 'MULTIPLY', zn, zn)), 0.0))
    phi = math_(nt, 'ARCTAN2', sx.outputs["Y"], sx.outputs["X"])
    nP = val(nt, 0.0, "P")
    nA = val(nt, 1.0, "A")
    dash = math_(nt, 'POWER', math_(nt, 'ADD', math_(nt, 'MULTIPLY', math_(nt, 'SINE', math_(nt, 'SUBTRACT', math_(nt, 'MULTIPLY', phi, 4.0), nP.outputs[0])), 0.5), 0.5), 1.5)
    body = math_(nt, 'MULTIPLY', ring, math_(nt, 'ADD', 0.08, math_(nt, 'MULTIPLY', dash, 0.92)))
    inten = math_(nt, 'MULTIPLY', math_(nt, 'MULTIPLY', body, eq), nA.outputs[0])
    # colore: arancione -> giallo con l'intensita'
    ramp = nd(nt, "ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (1.0, 0.30, 0.02, 1)
    ramp.color_ramp.elements[1].color = (1.0, 0.85, 0.25, 1)
    nt.links.new(inten, ramp.inputs[0])
    nt.links.new(ramp.outputs[0], em.inputs["Color"])
    nt.links.new(math_(nt, 'MULTIPLY', inten, 2.2), em.inputs["Strength"])
    nt.links.new(math_(nt, 'MINIMUM', math_(nt, 'MULTIPLY', inten, 1.3), 1.0), mix.inputs[0])
    nt.links.new(tr.outputs[0], mix.inputs[1])
    nt.links.new(em.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs[0])
    return m, nP, nA


def scene_currents():
    hide_orig_sample()
    no_volume()
    dim_lights(0.9)
    o = make_sample()
    mm = bpy.data.materials.new("pheno_gray")
    mm.use_nodes = True
    b = mm.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (0.62, 0.64, 0.68, 1)
    b.inputs["Metallic"].default_value = 1
    b.inputs["Roughness"].default_value = 0.22
    o.data.materials.append(mm)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=R * 1.02, segments=96, ring_count=48)
    sh = bpy.context.object
    sh.name = "pheno_rings"
    sh.parent = o
    sh.visible_shadow = False
    for p in sh.data.polygons:
        p.use_smooth = True
    rm, nP, nA = currents_material()
    sh.data.materials.append(rm)
    cyan, nE, nPf = cyan_material("field_cyan_s")
    # linee di campo B assiali (cyan) attorno al campione, in primo piano
    lines = []
    for (x, y) in ((0.75, 0.5), (-0.75, 0.5), (1.25, 0.5), (-1.25, 0.5), (0.0, 0.6)):
        cu = bpy.data.curves.new("bl", 'CURVE')
        cu.dimensions = '3D'
        cu.bevel_depth = 0.012
        cu.bevel_resolution = 2
        sp = cu.splines.new('POLY')
        sp.points.add(1)
        sp.points[0].co = (x, y, -1.05, 1)
        sp.points[1].co = (x, y, 1.05, 1)
        ob = bpy.data.objects.new("bline", cu)
        bpy.context.collection.objects.link(ob)
        ob.data.materials.append(cyan)
        lines.append(ob)
    cones = []
    for (x, y) in ((0.75, 0.5), (-0.75, 0.5), (1.25, 0.5), (-1.25, 0.5), (0.0, 0.6)):
        bpy.ops.mesh.primitive_cone_add(radius1=0.045, depth=0.15, vertices=16, location=(x, y, 0.62))
        c = bpy.context.object
        c.data.materials.append(cyan)
        cones.append(c)
    sample_camera(dist=8.8, lens=85, fstop=4.0)
    backdrop()
    w = 2 * pi / 2.4
    for f in range(1, N + 1):
        t = tau(f) * SECS
        s = sin(w * t)
        kv(nE, f, 0.5 + 3.0 * abs(s))
        kv(nPf, f, -0.25 * cos(w * t))
        flip_cones(cones, f, s if abs(s) > 0.05 else 0.05)
        # Lenz: I ~ -dB/dt = -cos(wt): fase dei tratti che si muovono con velocita' ~ -cos
        kv(nP, f, -5.0 * s)
        kv(nA, f, 0.35 + 0.65 * abs(cos(w * t)))
        o.location.z = 0.02 * sin(2 * pi * 0.6 * t)
        o.keyframe_insert("location", frame=f)


{"campo-variabile": scene_field, "correnti-indotte": scene_currents}.get(
    NAME, lambda: scene_thermal(NAME))()

if ONE:
    sc.frame_set(int(ONE))
    sc.render.use_overwrite = True
    sc.render.filepath = os.path.join(ROOT, "renders", "test", "%s_f%s.png" % (NAME, ONE))
    bpy.ops.render.render(write_still=True)
else:
    sc.render.filepath = os.path.join(OUT, "f_")
    bpy.ops.render.render(animation=True)
