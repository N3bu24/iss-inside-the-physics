# Panorama equirettangolare 360 interno capsula di rientro (ispirata Soyuz).
# Uso: blender -b -P build_capsula.py -- LARGHEZZA CAMPIONI OUT.png [save.blend]
import bpy, bmesh, math, random, sys
from mathutils import Vector, Euler

argv = sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
W = int(argv[0]) if len(argv) > 0 else 2048
SAMPLES = int(argv[1]) if len(argv) > 1 else 48
OUT = argv[2] if len(argv) > 2 else 'C:/tmp/capsula.png'
BLEND = argv[3] if len(argv) > 3 else None
H = W//2
R = 1.1
PI = math.pi
random.seed(7)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
col = sc.collection

# ---------- materiali ----------
def new_mat(name, base=(0.5,0.5,0.5,1), metal=0.0, rough=0.5, emit=None, emit_s=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = base
    b.inputs['Metallic'].default_value = metal
    b.inputs['Roughness'].default_value = rough
    if emit:
        b.inputs['Emission Color'].default_value = emit
        b.inputs['Emission Strength'].default_value = emit_s
    return m

def quilt_material(name, base, rough=0.75, coord='UV', N=40, M=20, f=22.0, bump=0.9):
    m = new_mat(name, base, 0, rough)
    nt = m.node_tree; n = nt.nodes; l = nt.links
    b = n['Principled BSDF']
    tc = n.new('ShaderNodeTexCoord')
    sep = n.new('ShaderNodeSeparateXYZ')
    l.new(tc.outputs['UV' if coord == 'UV' else 'Object'], sep.inputs[0])
    def mth(op, a=None, b_=None):
        nd = n.new('ShaderNodeMath'); nd.operation = op
        if a is not None:
            if isinstance(a, (int, float)): nd.inputs[0].default_value = a
            else: l.new(a, nd.inputs[0])
        if b_ is not None:
            if isinstance(b_, (int, float)): nd.inputs[1].default_value = b_
            else: l.new(b_, nd.inputs[1])
        return nd
    if coord == 'UV':
        p = mth('MULTIPLY', sep.outputs[0], float(N)); q = mth('MULTIPLY', sep.outputs[1], float(M))
    else:
        p = mth('MULTIPLY', sep.outputs[0], f); q = mth('MULTIPLY', sep.outputs[2], f)
    s = mth('ADD', p.outputs[0], q.outputs[0]); d = mth('SUBTRACT', p.outputs[0], q.outputs[0])
    s1 = mth('MULTIPLY', s.outputs[0], PI); d1 = mth('MULTIPLY', d.outputs[0], PI)
    a1 = mth('SINE', s1.outputs[0]); a2 = mth('SINE', d1.outputs[0])
    pr = mth('MULTIPLY', a1.outputs[0], a2.outputs[0])
    ab = mth('ABSOLUTE', pr.outputs[0])
    h = mth('POWER', ab.outputs[0], 0.5)
    bp = n.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump; bp.inputs['Distance'].default_value = 0.012
    l.new(h.outputs[0], bp.inputs['Height'])
    l.new(bp.outputs['Normal'], b.inputs['Normal'])
    ramp = n.new('ShaderNodeMix'); ramp.data_type = 'RGBA'
    ramp.inputs['A'].default_value = [c*0.45 for c in base[:3]] + [1]
    ramp.inputs['B'].default_value = base
    l.new(h.outputs[0], ramp.inputs['Factor'])
    nz = n.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 6; nz.inputs['Detail'].default_value = 8
    l.new(tc.outputs['Object'], nz.inputs['Vector'])
    dirt = n.new('ShaderNodeMix'); dirt.data_type = 'RGBA'
    dirt.inputs['B'].default_value = (0.05,0.045,0.04,1)
    l.new(ramp.outputs['Result'], dirt.inputs['A'])
    thr = n.new('ShaderNodeMapRange'); thr.inputs['From Min'].default_value = 0.45; thr.inputs['From Max'].default_value = 0.8
    thr.inputs['To Max'].default_value = 0.5
    l.new(nz.outputs['Fac'], thr.inputs['Value'])
    l.new(thr.outputs['Result'], dirt.inputs['Factor'])
    l.new(dirt.outputs['Result'], b.inputs['Base Color'])
    return m

def metal_mat(name, base, rough=0.4, metal=0.9):
    m = new_mat(name, base, metal, rough)
    nt = m.node_tree; n = nt.nodes; l = nt.links; b = n['Principled BSDF']
    nz = n.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 14; nz.inputs['Detail'].default_value = 10
    tc = n.new('ShaderNodeTexCoord'); l.new(tc.outputs['Object'], nz.inputs['Vector'])
    mr = n.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = 0.4; mr.inputs['From Max'].default_value = 0.7
    mr.inputs['To Min'].default_value = rough*0.7; mr.inputs['To Max'].default_value = min(1.0, rough*1.8)
    l.new(nz.outputs['Fac'], mr.inputs['Value']); l.new(mr.outputs['Result'], b.inputs['Roughness'])
    bp = n.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.08
    l.new(nz.outputs['Fac'], bp.inputs['Height']); l.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m

BEIGE = (0.25, 0.23, 0.20, 1)
M_wall = quilt_material('wall_quilt', (0.10,0.115,0.105,1), 0.85, 'UV', 40, 20)
M_seat = quilt_material('seat_quilt', (0.07,0.075,0.08,1), 0.7, 'OBJ', f=26.0, bump=1.0)
M_seat2 = quilt_material('seat_liner', (0.11,0.115,0.12,1), 0.75, 'OBJ', f=20.0, bump=0.7)
M_bag = quilt_material('bag', (0.62,0.62,0.6,1), 0.9, 'OBJ', f=10.0, bump=0.3)
M_panel = metal_mat('panel_paint', (0.23,0.25,0.26,1), 0.45, 0.6)
M_metal = metal_mat('metal', (0.55,0.56,0.58,1), 0.3, 1.0)
M_dark = metal_mat('dark_metal', (0.06,0.065,0.07,1), 0.35, 0.8)
M_rubber = new_mat('rubber', (0.02,0.02,0.022,1), 0, 0.6)
M_strap = new_mat('strap', (0.12,0.13,0.15,1), 0, 0.8)
M_hose = new_mat('hose', (0.55,0.5,0.4,1), 0, 0.6)
M_cable = new_mat('cable', (0.03,0.03,0.035,1), 0, 0.4)
M_orange = new_mat('orange', (0.8,0.25,0.04,1), 0, 0.5)
M_off = new_mat('btn_off', (0.03,0.03,0.035,1), 0, 0.4)
M_amb = new_mat('btn_amb', (0.1,0.05,0.01,1), 0, 0.4, (1,0.45,0.08,1), 6)
M_cy = new_mat('btn_cy', (0.02,0.05,0.07,1), 0, 0.4, (0.25,0.8,1,1), 5)
M_red = new_mat('btn_red', (0.1,0.01,0.01,1), 0, 0.4, (1,0.08,0.05,1), 6)
M_grn = new_mat('btn_grn', (0.02,0.06,0.02,1), 0, 0.4, (0.2,1,0.3,1), 4)
M_btns = [M_off, M_off, M_off, M_amb, M_cy, M_red, M_grn, M_cy]
M_hazard = new_mat('hazard', (0.7,0.55,0.05,1), 0, 0.5)

def screen_mat(name, color, s_):
    m = new_mat(name, (0.01,0.02,0.03,1), 0, 0.2, color, s_)
    nt = m.node_tree; n = nt.nodes; l = nt.links; b = n['Principled BSDF']
    tc = n.new('ShaderNodeTexCoord')
    wv = n.new('ShaderNodeTexWave'); wv.inputs['Scale'].default_value = 40; wv.inputs['Distortion'].default_value = 3
    l.new(tc.outputs['UV'], wv.inputs['Vector'])
    mx = n.new('ShaderNodeMix'); mx.data_type = 'RGBA'
    mx.inputs['A'].default_value = [c*0.25 for c in color[:3]] + [1]; mx.inputs['B'].default_value = color
    l.new(wv.outputs['Fac'], mx.inputs['Factor'])
    l.new(mx.outputs['Result'], b.inputs['Emission Color'])
    return m
M_scr1 = screen_mat('scr1', (0.2,0.75,1.0,1), 5)
M_scr2 = screen_mat('scr2', (0.3,1.0,0.7,1), 4)
M_scr3 = screen_mat('scr3', (1.0,0.6,0.2,1), 4)

# ---------- helper ----------
def link(o, mat=None, smooth=True, bevel=0.0, seg=3):
    if o.users_collection and o.users_collection[0] != col:
        o.users_collection[0].objects.unlink(o); col.objects.link(o)
    if mat: o.data.materials.append(mat)
    if smooth and o.type == 'MESH':
        for p in o.data.polygons: p.use_smooth = True
    if bevel > 0:
        md = o.modifiers.new('bv', 'BEVEL'); md.width = bevel; md.segments = seg; md.limit_method = 'ANGLE'
    return o

def box(loc, size, mat, rot=(0,0,0), bevel=0.01, name='box'):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object; o.name = name; o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    return link(o, mat, True, bevel)

def cyl(loc, r, d, mat, rot=(0,0,0), bevel=0.0, verts=24, name='cyl'):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=d, location=loc, rotation=rot, vertices=verts)
    o = bpy.context.active_object; o.name = name
    return link(o, mat, True, bevel)

def torus(loc, R_, r_, mat, rot=(0,0,0), name='torus'):
    bpy.ops.mesh.primitive_torus_add(major_radius=R_, minor_radius=r_, location=loc, rotation=rot,
                                     major_segments=48, minor_segments=12)
    o = bpy.context.active_object; o.name = name
    return link(o, mat)

def dirv(lon, lat):
    lo, la = math.radians(lon), math.radians(lat)
    return Vector((math.sin(lo)*math.cos(la), math.cos(lo)*math.cos(la), math.sin(la)))

def on_wall(o, lon, lat, rad=R, roll=0.0):
    """Posiziona o sulla parete; asse locale Z verso il centro."""
    d = dirv(lon, lat)
    o.location = d*rad
    q = (-d).to_track_quat('Z', 'Y')
    o.rotation_euler = q.to_euler()
    if roll:
        o.rotation_euler.rotate_axis('Z', roll)
    return o

# ---------- involucro ----------
bpy.ops.mesh.primitive_uv_sphere_add(radius=R, segments=96, ring_count=48, location=(0,0,0))
wall = bpy.context.active_object; wall.name = 'parete'
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.flip_normals()
bpy.ops.object.mode_set(mode='OBJECT')
link(wall, M_wall)

PORTS = [(-78, 8, 11.0), (78, 8, 11.0), (150, 15, 8.0)]
nt = M_wall.node_tree; n = nt.nodes; l = nt.links
out = n['Material Output']; quilt_p = n['Principled BSDF']
met = n.new('ShaderNodeBsdfPrincipled'); met.inputs['Metallic'].default_value = 0.55
uvn = n.new('ShaderNodeTexCoord'); sp = n.new('ShaderNodeSeparateXYZ'); l.new(uvn.outputs['UV'], sp.inputs[0])
br = n.new('ShaderNodeTexBrick')
br.inputs['Scale'].default_value = 1.0
br.inputs['Color1'].default_value = (0.13,0.15,0.14,1); br.inputs['Color2'].default_value = (0.09,0.105,0.10,1)
br.inputs['Mortar Size'].default_value = 0.012
br.inputs['Brick Width'].default_value = 0.125; br.inputs['Row Height'].default_value = 0.2
l.new(uvn.outputs['UV'], br.inputs['Vector'])
bbp = n.new('ShaderNodeBump'); bbp.inputs['Strength'].default_value = 1.0; bbp.inputs['Distance'].default_value = 0.004
l.new(br.outputs['Fac'], bbp.inputs['Height']); l.new(bbp.outputs['Normal'], met.inputs['Normal'])
wn = n.new('ShaderNodeTexNoise'); wn.inputs['Scale'].default_value = 5; wn.inputs['Detail'].default_value = 10
l.new(uvn.outputs['Object'], wn.inputs['Vector'])
wr = n.new('ShaderNodeMapRange'); wr.inputs['From Min'].default_value = 0.35; wr.inputs['From Max'].default_value = 0.65
wr.inputs['To Min'].default_value = 0.35; wr.inputs['To Max'].default_value = 0.85
l.new(wn.outputs['Fac'], wr.inputs['Value']); l.new(wr.outputs['Result'], met.inputs['Roughness'])
mc = n.new('ShaderNodeMix'); mc.data_type = 'RGBA'
mc.inputs['B'].default_value = (0.04,0.04,0.04,1)
l.new(br.outputs['Color'], mc.inputs['A']); l.new(wn.outputs['Fac'], mc.inputs['Factor'])
l.new(mc.outputs['Result'], met.inputs['Base Color'])
us = n.new('ShaderNodeMath'); us.operation = 'MULTIPLY'; us.inputs[1].default_value = 2*PI*7
l.new(sp.outputs[0], us.inputs[0])
sn = n.new('ShaderNodeMath'); sn.operation = 'SINE'; l.new(us.outputs[0], sn.inputs[0])
bm_ = n.new('ShaderNodeMapRange'); bm_.inputs['From Min'].default_value = 0.35; bm_.inputs['From Max'].default_value = 0.5
l.new(sn.outputs[0], bm_.inputs['Value'])
band = n.new('ShaderNodeMixShader')
l.new(bm_.outputs['Result'], band.inputs['Fac']); l.new(met.outputs[0], band.inputs[1]); l.new(quilt_p.outputs[0], band.inputs[2])
princ = band
tcn = n.new('ShaderNodeTexCoord')
nrm = n.new('ShaderNodeVectorMath'); nrm.operation = 'NORMALIZE'
l.new(tcn.outputs['Object'], nrm.inputs[0])
mask = None
for i, (lo, la, rd) in enumerate(PORTS):
    dp = n.new('ShaderNodeVectorMath'); dp.operation = 'DOT_PRODUCT'
    dp.inputs[1].default_value = dirv(lo, la)
    l.new(nrm.outputs[0], dp.inputs[0])
    gt = n.new('ShaderNodeMath'); gt.operation = 'GREATER_THAN'
    gt.inputs[1].default_value = math.cos(math.radians(rd))
    l.new(dp.outputs['Value'], gt.inputs[0])
    if mask is None: mask = gt
    else:
        mx = n.new('ShaderNodeMath'); mx.operation = 'MAXIMUM'
        l.new(mask.outputs[0], mx.inputs[0]); l.new(gt.outputs[0], mx.inputs[1]); mask = mx
tr = n.new('ShaderNodeBsdfTransparent')
mix = n.new('ShaderNodeMixShader')
l.new(mask.outputs[0], mix.inputs['Fac']); l.new(princ.outputs[0], mix.inputs[1]); l.new(tr.outputs[0], mix.inputs[2])
l.new(mix.outputs[0], out.inputs['Surface'])

# ---------- oblo ----------
for lo, la, rd in PORTS:
    d = dirv(lo, la); a = math.radians(rd)
    rr = R*math.sin(a); dist = R*math.cos(a)
    q = d.to_track_quat('Z', 'Y').to_euler()
    t = cyl(d*(dist+0.06), rr, 0.12, M_dark, q, 0, 48, 'oblo_tubo')
    bm = bmesh.new(); bm.from_mesh(t.data)
    caps = [f for f in bm.faces if len(f.verts) > 4]
    bmesh.ops.delete(bm, geom=caps, context='FACES_ONLY'); bm.to_mesh(t.data); bm.free()
    torus(d*dist*0.995, rr, 0.016, M_metal, q, 'oblo_bordo')
    fr = R*math.sin(a+math.radians(2.6)); fd = R*math.cos(a+math.radians(2.6))
    torus(d*fd*0.99, fr, 0.022, M_panel, q, 'oblo_flangia')
    nb = 14
    for k in range(nb):
        th = 2*PI*k/nb
        o = Vector((math.cos(th)*fr, math.sin(th)*fr, 0)); o.rotate(Euler(q))
        cyl(d*fd*0.985 + o, 0.011, 0.014, M_metal, q, 0.002, 6, 'bullone')
    torus(d*(dist+0.015), rr*0.995, 0.01, M_rubber, q, 'oblo_guarnizione')

# ---------- pannello strumenti ----------
PY = 0.80
TILT = math.radians(-8)
box((0, PY+0.12, -0.14), (0.98, 0.26, 0.52), M_panel, (TILT,0,0), 0.025, 'pannello')
box((0, PY+0.02, 0.20), (1.0, 0.22, 0.09), M_dark, (math.radians(-20),0,0), 0.02, 'visiera')
fy = PY - 0.012
def fyz(z): return fy + (z+0.14)*0.14
def plane_screen(x, z, w, h, mat):
    bpy.ops.mesh.primitive_plane_add(size=1, location=(x, fyz(z)-0.002, z), rotation=(math.radians(90-8),0,0))
    o = bpy.context.active_object; o.scale = (w, h, 1); link(o, mat, False)
    box((x, fyz(z)+0.001, z), (w+0.02, 0.012, h+0.02), M_dark, (TILT,0,0), 0.004, 'cornice')
plane_screen(-0.27, 0.0, 0.26, 0.17, M_scr1)
plane_screen(0.27, 0.0, 0.26, 0.17, M_scr2)
plane_screen(0.0, 0.07, 0.16, 0.10, M_scr3)
gz = -0.14
torus((0, fyz(gz)-0.004, gz), 0.075, 0.012, M_metal, (math.radians(90-8),0,0), 'globo_anello')
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.07, location=(0, fyz(gz)+0.01, gz)); g = bpy.context.active_object; g.name = 'globo'
gm = new_mat('globo_mat', (0.05,0.12,0.2,1), 0, 0.3, (0.2,0.6,1,1), 0.6); link(g, gm)
for r in range(4):
    for c in range(14):
        x = -0.43 + c*0.066; z = -0.26 - r*0.04
        cyl((x, fyz(z)-0.005, z), 0.013, 0.014, random.choice(M_btns), (math.radians(90-8),0,0), 0.002, 12, 'tasto')
for c in range(10):
    x = -0.40 + c*0.09; z = -0.40
    cyl((x, fyz(z)-0.004, z), 0.017, 0.012, M_metal, (math.radians(90-8),0,0), 0, 10, 'base_lev')
    cyl((x, fyz(z)-0.022, z), 0.005, 0.03, M_metal, (math.radians(90-8+random.choice([-25,25])),0,0), 0, 8, 'leva')
for x in (-0.44, 0.44):
    cyl((x, fy-0.01, 0.12), 0.022, 0.02, M_dark, (math.radians(90),0,0), 0.003, 16, 'manopola')
for (x, z) in ((-0.38, 0.12), (0.38, 0.14)):
    bpy.ops.mesh.primitive_plane_add(size=1, location=(x, fyz(z)+0.012, z), rotation=(math.radians(82),0,0))
    p = bpy.context.active_object; p.scale = (0.1, 0.03, 1); link(p, M_hazard, False)

# ---------- sedili ----------
def seat(x):
    ang = math.radians(28)
    box((x, -0.42, -0.20), (0.44, 0.13, 0.78), M_seat, (-ang,0,0), 0.05, 'schienale')
    box((x, -0.405, -0.20), (0.34, 0.03, 0.66), M_seat2, (-ang,0,0), 0.03, 'schienale_liner')
    for s in (-1, 1):
        box((x+s*0.245, -0.36, -0.18), (0.08, 0.26, 0.70), M_seat, (-ang,0,s*math.radians(-5)), 0.035, 'ala')
    box((x, -0.50, 0.18), (0.30, 0.12, 0.24), M_seat2, (-ang,0,0), 0.04, 'poggiatesta')
    box((x, -0.02, -0.50), (0.44, 0.52, 0.12), M_seat, (math.radians(6),0,0), 0.04, 'seduta')
    box((x, -0.02, -0.435), (0.34, 0.44, 0.03), M_seat2, (math.radians(6),0,0), 0.02, 'seduta_liner')
    box((x, 0.42, -0.46), (0.40, 0.42, 0.10), M_seat, (math.radians(22),0,0), 0.04, 'poggiagambe')
    for s in (-1, 1):
        box((x+s*0.22, 0.0, -0.62), (0.03, 0.9, 0.04), M_dark, (0,0,0), 0.006, 'telaio')
        box((x+s*0.11, -0.352, -0.10), (0.045, 0.01, 0.62), M_strap, (-ang,0,s*math.radians(-8)), 0.002, 'cinghia')
    box((x, -0.36, -0.20), (0.07, 0.025, 0.05), M_metal, (-ang,0,0), 0.006, 'fibbia')
    box((x, 0.12, -0.425), (0.40, 0.04, 0.015), M_strap, (math.radians(6),0,0), 0.002, 'cinghia_bacino')
for x in (-0.62, 0.0, 0.62):
    seat(x)

# ---------- portello superiore ----------
cyl((0,0,0.985), 0.30, 0.04, M_dark, (0,0,0), 0.006, 48, 'portello')
torus((0,0,0.96), 0.31, 0.03, M_metal, (0,0,0), 'portello_anello')
torus((0,0,0.935), 0.12, 0.012, M_metal, (0,0,0), 'volantino')
for k in range(4):
    cyl((0,0,0.935), 0.008, 0.24, M_metal, (PI/2, 0, k*PI/4+0.2), 0, 8, 'raggio')
cyl((0,0,0.94), 0.03, 0.04, M_metal, (0,0,0), 0.003, 16, 'mozzo')
for k in range(12):
    th = 2*PI*k/12
    cyl((0.255*math.cos(th), 0.255*math.sin(th), 0.96), 0.012, 0.018, M_metal, (0,0,0), 0.002, 6, 'bullone')

# ---------- borse con rete ----------
def bag(lon, lat, sz, roll=0.0):
    b = box((0,0,0), sz, M_bag, (0,0,0), 0.05, 'borsa')
    on_wall(b, lon, lat, R - sz[2]/2 - 0.005, roll)
    nx, ny = 4, 3
    for i in range(nx):
        s = box((0,0,0), (0.012, sz[1]+0.02, 0.012), M_strap, (0,0,0), 0.002, 'rete')
        on_wall(s, lon, lat, R - sz[2]-0.004, roll)
        off = Vector(((i-(nx-1)/2)*sz[0]/nx, 0, 0)); off.rotate(s.rotation_euler); s.location += off
    for j in range(ny):
        s = box((0,0,0), (sz[0]+0.02, 0.012, 0.012), M_strap, (0,0,0), 0.002, 'rete')
        on_wall(s, lon, lat, R - sz[2]-0.004, roll)
        off = Vector((0, (j-(ny-1)/2)*sz[1]/ny, 0)); off.rotate(s.rotation_euler); s.location += off
bag(172, 8, (0.34, 0.30, 0.20), math.radians(6))
bag(-172, 20, (0.30, 0.26, 0.18), math.radians(3))
bag(-138, 2, (0.30, 0.38, 0.22), math.radians(-4))
bag(-158, 38, (0.28, 0.22, 0.16), 0.2)
bag(158, 44, (0.26, 0.26, 0.15), -0.1)

# ---------- maniglie ----------
def handle(lon, lat, length=0.26):
    root = bpy.data.objects.new('maniglia_root', None); col.objects.link(root)
    on_wall(root, lon, lat, R)
    bar = cyl((0,0,0), 0.011, length, M_metal, (0, PI/2, 0), 0.0, 12, 'maniglia')
    bar.parent = root; bar.location = (0,0,0.075)
    for s in (-1, 1):
        p = cyl((0,0,0), 0.009, 0.075, M_metal, (0,0,0), 0.0, 8, 'montante')
        p.parent = root; p.location = (s*length/2, 0, 0.0375)
for lo, la in ((-78, -17), (78, -17), (-47, -24), (47, -24), (180, 4), (-100, 28), (100, 28)):
    handle(lo, la)

# ---------- tubi e cavi ----------
def run(points, radius, mat, rr=R-0.035, name='tubo'):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(points)-1)
    for i, (lo, la) in enumerate(points):
        bp = sp.bezier_points[i]; bp.co = dirv(lo, la)*rr
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
    cu.bevel_depth = radius; cu.bevel_resolution = 6; cu.resolution_u = 24
    o = bpy.data.objects.new(name, cu); col.objects.link(o); o.data.materials.append(mat)
run([(-30,-20),(-45,-42),(-70,-38),(-100,-30)], 0.028, M_hose, name='tubo1')
run([(30,-22),(48,-44),(74,-40),(105,-34)], 0.028, M_hose, name='tubo2')
run([(-35, 22),(-52,34),(-78,38),(-110,30)], 0.016, M_cable, name='cavo1')
run([(35, 20),(55,36),(82,40),(112,34)], 0.016, M_cable, name='cavo2')
run([(-34, 18),(-60,28),(-90,30),(-120,20)], 0.012, M_orange, R-0.03, 'cavo3')
run([(-32,-8),(-60,-18),(-95,-22),(-130,-14)], 0.014, M_cable, R-0.03, 'cavo4')
run([(33,-6),(60,-14),(94,-26),(130,-18)], 0.014, M_cable, R-0.03, 'cavo5')

# ---------- targhette (senza testo) e lampade ----------
for lo, la, rl in ((-110, -6, 0), (112, -2, 0.0), (0, 34, 0), (-170, 18, 0.1)):
    bpy.ops.mesh.primitive_plane_add(size=1); p = bpy.context.active_object
    p.scale = (0.12, 0.045, 1); link(p, M_hazard, False); on_wall(p, lo, la, R-0.004, rl)
M_lamp = new_mat('lampM', (0.4,0.4,0.4,1), 0, 0.3)
for lo in (-30, 30):
    lp = cyl((0,0,0), 0.03, 0.03, M_metal, (0,0,0), 0.004, 16, 'lampada'); on_wall(lp, lo, 52, R-0.015)
    lm = cyl((0,0,0), 0.022, 0.004, M_lamp, (0,0,0), 0, 16, 'lampada_vetro'); on_wall(lm, lo, 52, R-0.03)


# ---------- attrezzatura, pavimento, bombole ----------
M_box = metal_mat('apparati', (0.17,0.18,0.17,1), 0.5, 0.5)
M_ext = new_mat('estintore', (0.25,0.05,0.04,1), 0, 0.45)
def equip(lon, lat, sz, roll=0.0):
    b = box((0,0,0), sz, M_box, (0,0,0), 0.012, 'apparato')
    on_wall(b, lon, lat, R - sz[2]/2 - 0.004, roll)
    for k in range(3):
        c = cyl((0,0,0), 0.007, 0.01, random.choice(M_btns), (0,0,0), 0, 8, 'spia')
        on_wall(c, lon, lat, R - sz[2] - 0.006, roll)
        off = Vector(((k-1)*sz[0]*0.28, sz[1]*0.3, 0)); off.rotate(c.rotation_euler); c.location += off
for lo, la, sz in ((-100,-28,(0.26,0.2,0.1)),(100,-30,(0.30,0.22,0.12)),(-130,-24,(0.22,0.3,0.1)),(130,-20,(0.22,0.26,0.1)),
                   (-22,-38,(0.2,0.14,0.08)),(22,-38,(0.2,0.14,0.08)),(-62,-8,(0.14,0.2,0.07)),(62,-6,(0.14,0.2,0.07)),
                   (-70,40,(0.3,0.16,0.08)),(70,42,(0.3,0.16,0.08)),(-150,-6,(0.24,0.2,0.1)),(-30,48,(0.22,0.12,0.06)),(30,50,(0.22,0.12,0.06))):
    equip(lo, la, sz)
def bottle(lon, lat, r, length, mat, roll=0.0):
    root = bpy.data.objects.new('bombola_root', None); col.objects.link(root); on_wall(root, lon, lat, R, roll)
    c = cyl((0,0,0), r, length, mat, (PI/2,0,0), 0.0, 16, 'bombola'); c.parent = root; c.location = (0,0,r+0.01)
    h = cyl((0,0,0), r*0.35, 0.06, M_metal, (PI/2,0,0), 0, 8, 'valvola'); h.parent = root; h.location = (0,length/2+0.03,r+0.01)
    for sgn in (-1,1):
        st = box((0,0,0),(0.012,0.04,r*2+0.02), M_strap,(0,0,0),0.002,'cinghia'); st.parent = root; st.location = (0, sgn*length*0.25, r+0.01)
bottle(-118, -22, 0.055, 0.3, M_ext)
bottle(118, -24, 0.055, 0.3, M_ext)
bottle(-145, 20, 0.045, 0.26, M_metal, 0.5)
bottle(40, -34, 0.04, 0.22, M_metal, 1.57)
cyl((0,0,-0.82), 0.95, 0.03, M_dark, (0,0,0), 0.004, 48, 'pavimento')
for k in range(7):
    box((-0.75+0.25*k,0,-0.795),(0.03,1.6,0.03), M_box,(0,0,0),0.004,'nervatura_p')
for k in range(5):
    box((0,-0.6+0.3*k,-0.795),(1.6,0.03,0.03), M_box,(0,0,0),0.004,'nervatura_p2')
run([(-26,-10),(-38,-30),(-60,-46),(-85,-44)], 0.02, M_cable, R-0.03, 'fascio1')
run([(26,-10),(38,-30),(62,-46),(88,-44)], 0.02, M_cable, R-0.03, 'fascio2')
run([(-24,12),(-40,30),(-64,48),(-100,48)], 0.022, M_cable, R-0.03, 'fascio3')
run([(24,12),(40,30),(66,50),(104,48)], 0.022, M_hose, R-0.03, 'fascio4')

# ---------- luci ----------
def area(loc, tgt, size, color, power, name):
    ld = bpy.data.lights.new(name, 'AREA'); ld.shape = 'DISK'; ld.size = size; ld.color = color; ld.energy = power
    o = bpy.data.objects.new(name, ld); col.objects.link(o); o.location = loc
    d = Vector(tgt) - Vector(loc); o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    o.visible_camera = False
    return o
pl = [((1.0, 0.30, 0.06), 260), ((1.0, 0.34, 0.08), 220), ((1.0, 0.3, 0.10), 30)]
for (lo, la, rd), (c, p) in zip(PORTS, pl):
    d = dirv(lo, la)
    area(d*(R+0.30), (0,0,0), 0.45, c, p, 'plasma')
    area(d*(R+0.12), d*0.4, 0.18, (1.0,0.6,0.3), p*0.12, "plasma_vicino")
area((0, 0.35, 0.12), (0, 0.9, -0.1), 0.5, (0.45,0.8,1.0), 5, "fredda_pannello")
area((0.0, -0.1, 0.9), (0, 0, 0), 0.5, (0.6,0.75,1.0), 0.3, 'fredda_soffitto')
area((-0.25, 0.1, -0.2), (0, -0.9, 0), 0.3, (0.5,0.6,0.7), 0.5, 'fill_dietro')

wd = bpy.data.worlds.new('w'); sc.world = wd; wd.use_nodes = True
wd.node_tree.nodes['Background'].inputs['Color'].default_value = (0.01,0.012,0.018,1)
wd.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.0

# ---------- camera ----------
cam = bpy.data.cameras.new('pano'); cam.type = 'PANO'
try: cam.panorama_type = 'EQUIRECTANGULAR'
except Exception: cam.cycles.panorama_type = 'EQUIRECTANGULAR'
cam.clip_start = 0.05; cam.clip_end = 20
co = bpy.data.objects.new('pano', cam); col.objects.link(co)
co.location = (0, 0.02, 0.05); co.rotation_euler = (PI/2, 0, 0)
sc.camera = co

# ---------- render ----------
sc.render.engine = 'CYCLES'
cy = sc.cycles; cy.samples = SAMPLES; cy.use_denoising = True; cy.device = 'CPU'
cy.max_bounces = 6; cy.diffuse_bounces = 4; cy.glossy_bounces = 3; cy.transparent_max_bounces = 8
cy.use_adaptive_sampling = True; cy.adaptive_threshold = 0.02
sc.render.resolution_x = W; sc.render.resolution_y = H; sc.render.resolution_percentage = 100
sc.render.film_transparent = True
sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
sc.view_settings.view_transform = 'AgX'
sc.view_settings.exposure = -0.9
sc.render.filepath = OUT
if BLEND: bpy.ops.wm.save_as_mainfile(filepath=BLEND)
bpy.ops.render.render(write_still=True)
print('FATTO', OUT)
