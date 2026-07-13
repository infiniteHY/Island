# Blender 5.x headless 建模房间黑猫的躯干与四腿并导出 GLB。
# 用法: /Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/make_cat.py
#
# 方法：沿脊线放样椭圆截面（loft）+ Catmull-Clark 细分曲面。
# 截面尺寸沿轴单调平滑过渡（臀宽/收腰/深胸/颈部上扬），细分后表面
# 连续光滑——不会出现元球融合那种局部鼓包。
# 只导出 body / leg_front / leg_hind 三个部件（头部仍由 Cat.tsx 程序化球体
# 生成，脸部贴装不变）。部件顶点以各自动画枢轴为原点：
#   body → 猫组原点     leg → 髋点 [±0.05, 0.12, ±0.1]（左右在 React 侧克隆）
# 躯干尾端包住尾根挂点 (0, 0.2, -0.16)，颈端伸入头球 (0, 0.27, 0.16, r=0.078)。

import bpy
import bmesh
import math
import os
from mathutils import Vector

OUT = os.path.normpath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "assets", "room", "cat.glb")
)

BLACK = "#26242a"
BLACK_SOFT = "#312e36"
RING_SEGS = 16


def T(x, y, z):
    """three.js Y-up → Blender Z-up（导出 +Y up 后还原）"""
    return Vector((x, -z, y))


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_color(h):
    h = h.lstrip("#")
    return tuple(srgb_to_linear(int(h[i : i + 2], 16) / 255) for i in (0, 2, 4))


_mats = {}


def mat(name, hexstr, rough):
    if name not in _mats:
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
        b.inputs["Base Color"].default_value = (*hex_color(hexstr), 1.0)
        b.inputs["Roughness"].default_value = rough
        _mats[name] = m
    return _mats[name]


def smooth(me):
    me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))


def loft(name, rings, pole_start, pole_end, material, subdiv=2):
    """放样：rings = [(center三坐标, half_x, half_up)]，截面为椭圆（法向沿环序轴）。
    两端以极点封口，加 Catmull-Clark 细分后转 mesh。
    环内点在 三.x（左右）× 三.y（上下）平面展开，环沿 三.z / 三.y 轴堆叠均可，
    因为每环独立给中心，方向由相邻环连线自然决定。"""
    bm = bmesh.new()
    ring_verts = []
    for center, hx, hup in rings:
        c = T(*center)
        ring = []
        for j in range(RING_SEGS):
            a = 2 * math.pi * j / RING_SEGS
            # 椭圆在 Blender x（三 x）与 z（三 y）平面内，沿堆叠轴（三 z → Blender y）扫过
            ring.append(bm.verts.new(c + Vector((math.cos(a) * hx, 0, math.sin(a) * hup))))
        ring_verts.append(ring)
    v0 = bm.verts.new(T(*pole_start))
    v1 = bm.verts.new(T(*pole_end))
    for ra, rb in zip(ring_verts, ring_verts[1:]):
        for j in range(RING_SEGS):
            bm.faces.new((ra[j], ra[(j + 1) % RING_SEGS], rb[(j + 1) % RING_SEGS], rb[j]))
    for j in range(RING_SEGS):
        bm.faces.new((ring_verts[0][(j + 1) % RING_SEGS], ring_verts[0][j], v0))
        bm.faces.new((ring_verts[-1][j], ring_verts[-1][(j + 1) % RING_SEGS], v1))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    mod = ob.modifiers.new("subsurf", "SUBSURF")
    mod.levels = subdiv
    mod.render_levels = subdiv
    dg = bpy.context.evaluated_depsgraph_get()
    me2 = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    me2.name = name
    ob.modifiers.clear()
    old = ob.data
    ob.data = me2
    bpy.data.meshes.remove(old)
    me2.materials.append(material)
    smooth(me2)
    print(f"[make_cat] {name}: {len(me2.polygons)} faces")
    return ob


def loft_leg(name, rings, pole_end_y, material):
    """腿：环沿 三.y 向下堆叠，环面在 三.x × 三.z 平面（水平圆），底端极点收口"""
    bm = bmesh.new()
    ring_verts = []
    for (y, cz, r) in rings:
        c = T(0, y, cz)
        ring = []
        for j in range(RING_SEGS):
            a = 2 * math.pi * j / RING_SEGS
            # 水平圆：Blender x × y 平面（三 x × -z）
            ring.append(bm.verts.new(c + Vector((math.cos(a) * r, math.sin(a) * r, 0))))
        ring_verts.append(ring)
    v0 = bm.verts.new(T(0, rings[0][0] + 0.012, rings[0][1]))
    v1 = bm.verts.new(T(0, pole_end_y, rings[-1][1]))
    for ra, rb in zip(ring_verts, ring_verts[1:]):
        for j in range(RING_SEGS):
            bm.faces.new((ra[j], ra[(j + 1) % RING_SEGS], rb[(j + 1) % RING_SEGS], rb[j]))
    for j in range(RING_SEGS):
        bm.faces.new((ring_verts[0][(j + 1) % RING_SEGS], ring_verts[0][j], v0))
        bm.faces.new((ring_verts[-1][j], ring_verts[-1][(j + 1) % RING_SEGS], v1))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    mod = ob.modifiers.new("subsurf", "SUBSURF")
    mod.levels = 2
    dg = bpy.context.evaluated_depsgraph_get()
    me2 = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    me2.name = name
    ob.modifiers.clear()
    old = ob.data
    ob.data = me2
    bpy.data.meshes.remove(old)
    me2.materials.append(material)
    smooth(me2)
    print(f"[make_cat] {name}: {len(me2.polygons)} faces")
    return ob


bpy.ops.wm.read_factory_settings(use_empty=True)
black = mat("cat_black", BLACK, 0.75)

# ── 躯干：尾根→臀→腰→腹→胸腔→肩→颈（入头球）。臀/肩最宽（包住关节球），
#    腰部微收出曲线，背线平缓、腹线平直
body = loft(
    "body",
    [
        ((0, 0.180, -0.162), 0.044, 0.046),
        ((0, 0.172, -0.118), 0.084, 0.078),
        ((0, 0.168, -0.058), 0.070, 0.072),
        ((0, 0.165, -0.002), 0.070, 0.073),
        ((0, 0.168, 0.054), 0.074, 0.075),
        ((0, 0.175, 0.098), 0.081, 0.072),
        ((0, 0.196, 0.130), 0.054, 0.052),
        ((0, 0.226, 0.152), 0.032, 0.034),
    ],
    (0, 0.180, -0.175),
    (0, 0.250, 0.165),
    black,
)

# ── 腿：顶段是埋进躯干的等径锚柱（跨过枢轴上下各 ~0.02，摆腿时始终留在
#    体内、不穿模不露缝）；穿出腹面处保持近似等径——圆柱近垂直插入圆润
#    腹面，交线是干净的圆环，避免球关节在表面附近露出弧面形成生硬折痕；
#    露出体外后才开始向下平滑收细。
leg_front = loft_leg(
    "leg_front",
    [
        (0.022, 0.000, 0.0170),
        (0.000, 0.000, 0.0178),  # 枢轴处（体内）
        (-0.024, 0.000, 0.0168),  # 穿出腹面：与上环近等径
        (-0.052, 0.001, 0.0138),
        (-0.075, 0.002, 0.0124),
        (-0.095, 0.003, 0.0120),
    ],
    -0.103,
    black,
)

leg_hind = loft_leg(
    "leg_hind",
    [
        (0.024, -0.001, 0.0200),
        (0.000, -0.001, 0.0210),  # 枢轴处（体内），后腿略粗
        (-0.026, 0.000, 0.0195),  # 穿出腹面：与上环近等径
        (-0.054, 0.001, 0.0150),
        (-0.076, 0.001, 0.0128),
        (-0.095, 0.000, 0.0122),
    ],
    -0.103,
    black,
)

# ── 导出（部件对象变换为零，顶点即枢轴局部坐标）
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_animations=False, export_yup=True)
print(f"[make_cat] wrote {OUT} ({os.path.getsize(OUT)} bytes)")

# ── 预览渲染：摆好整猫（头用占位球近似 Cat.tsx 的程序化头），三视角出图
bmh = bmesh.new()
bmesh.ops.create_uvsphere(bmh, u_segments=20, v_segments=14, radius=0.078)
meh = bpy.data.meshes.new("head_preview")
bmh.to_mesh(meh)
bmh.free()
meh.materials.append(black)
smooth(meh)
headp = bpy.data.objects.new("head_preview", meh)
bpy.context.scene.collection.objects.link(headp)
headp.location = T(0, 0.27, 0.16)

hips = [(0.05, 0.12, 0.1), (-0.05, 0.12, 0.1), (0.05, 0.12, -0.1), (-0.05, 0.12, -0.1)]
for i, hip in enumerate(hips):
    src = leg_front if i < 2 else leg_hind
    if i % 2 == 0:
        src.location = T(*hip)
    else:
        dup = src.copy()
        bpy.context.scene.collection.objects.link(dup)
        dup.location = T(*hip)
        for ch in src.children:
            chd = ch.copy()
            bpy.context.scene.collection.objects.link(chd)
            chd.parent = dup

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 720
scene.render.resolution_y = 560
scene.world = bpy.data.worlds.new("w")
scene.world.use_nodes = True
bg = scene.world.node_tree.nodes["Background"]
bg.inputs[0].default_value = (0.75, 0.78, 0.82, 1)

floor_me = bpy.data.meshes.new("floor")
bmf = bmesh.new()
bmesh.ops.create_grid(bmf, x_segments=1, y_segments=1, size=1.5)
bmf.to_mesh(floor_me)
bmf.free()
floor_me.materials.append(mat("floor", "#8f7a5f", 0.9))
scene.collection.objects.link(bpy.data.objects.new("floor", floor_me))

sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
sun.data.energy = 3.0
sun.rotation_euler = (math.radians(55), 0, math.radians(-40))
scene.collection.objects.link(sun)

cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
scene.collection.objects.link(cam)
scene.camera = cam
target = Vector((0, 0, 0.15))
for label, ang, elev in (("three", math.radians(-125), 0.32), ("side", math.radians(-180), 0.22), ("front", math.radians(-90), 0.25)):
    cam.location = target + Vector((math.cos(ang) * 0.85, math.sin(ang) * 0.85, elev))
    cam.rotation_euler = (cam.location - target).to_track_quat("Z", "Y").to_euler()
    scene.render.filepath = f"/tmp/cat-{label}.png"
    bpy.ops.render.render(write_still=True)
    print("saved", scene.render.filepath)
