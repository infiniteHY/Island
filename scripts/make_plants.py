# Blender 5.x headless 程序化生成房间里的两盆植物（蝴蝶兰 / 垂蔓绿萝）并导出 GLB。
# 用法: /Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/make_plants.py
#
# 相比 three.js 手拼几何体，这里用参数化叶片曲面（真实叶形轮廓 + 中脉折叠 +
# 沿长度方向的自然下垂弧线）、旋转体花盆（束腰/翻唇曲线）、平行传输扫掠茎管，
# 并全部平滑着色。坐标按 three.js 习惯书写(T() 转成 Blender Z-up)，
# 导出后在 R3F 里与原手拼版本同尺寸同锚点，可直接替换。

import bpy
import bmesh
import math
import os
import random
from mathutils import Vector, Matrix, noise

OUT_DIR = os.path.normpath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "assets", "room", "plants")
)

rnd = random.Random(7)


def T(x, y, z):
    """three.js Y-up 坐标 → Blender Z-up（导出 +Y up 后还原）"""
    return Vector((x, -z, y))


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_color(hexstr):
    h = hexstr.lstrip("#")
    return tuple(srgb_to_linear(int(h[i : i + 2], 16) / 255) for i in (0, 2, 4))


_materials = {}


def mat(name, hexstr, rough=0.6, metallic=0.0):
    if name in _materials:
        return _materials[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = (*hex_color(hexstr), 1.0)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metallic
    m.use_backface_culling = False  # 薄叶片导出 doubleSided
    _materials[name] = m
    return m


_groups = {}


def emit(bm, mat_name, matrix=None):
    """把一个部件 bmesh 变换后并入按材质分组的总网格（减少 draw call）"""
    if matrix is not None:
        bm.transform(matrix)
    tmp = bpy.data.meshes.new("_tmp")
    bm.to_mesh(tmp)
    bm.free()
    target = _groups.setdefault(mat_name, bmesh.new())
    target.from_mesh(tmp)
    bpy.data.meshes.remove(tmp)


def finalize(prefix):
    for name, bm in _groups.items():
        me = bpy.data.meshes.new(f"{prefix}_{name}")
        bm.to_mesh(me)
        bm.free()
        me.materials.append(_materials[name])
        me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
        ob = bpy.data.objects.new(me.name, me)
        bpy.context.scene.collection.objects.link(ob)
    _groups.clear()


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _materials.clear()
    _groups.clear()


def export_glb(filename):
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, filename)
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", export_animations=False, export_yup=True)
    print(f"[make_plants] wrote {path} ({os.path.getsize(path)} bytes)")


# ---------------------------------------------------------------- 几何原语


def prof(keys, u):
    """叶形半宽轮廓：关键点间 smoothstep 插值"""
    if u <= keys[0][0]:
        return keys[0][1]
    for (u0, w0), (u1, w1) in zip(keys, keys[1:]):
        if u <= u1:
            t = (u - u0) / (u1 - u0) if u1 > u0 else 0.0
            t = t * t * (3 - 2 * t)
            return w0 + (w1 - w0) * t
    return keys[-1][1]


def blade_bm(length, width, keys, nu=14, nv=6, tilt0=0.6, droop=1.2, fold=0.2, cup=0.0, lobe=0.0):
    """参数化叶片/花瓣：沿 +X 伸出的曲面网格。
    tilt0 起始仰角，droop 沿长度累计下垂量（越靠叶尖越弯），
    fold 中脉 V 形折叠，cup 边缘上卷，lobe>0 时基部后掠出心形裂片。"""
    bm = bmesh.new()
    ang = tilt0
    cx = cz = 0.0
    centers = [(cx, cz, ang)]
    for i in range(1, nu + 1):
        u = i / nu
        ang -= droop / nu * (0.35 + 1.3 * u)
        step = length / nu
        cx += math.cos(ang) * step
        cz += math.sin(ang) * step
        centers.append((cx, cz, ang))
    rows = []
    for i in range(nu + 1):
        u = i / nu
        cxi, czi, a = centers[i]
        hw = 0.5 * width * prof(keys, u)
        nx, nz = -math.sin(a), math.cos(a)
        row = []
        for j in range(nv + 1):
            v = j / nv * 2 - 1
            lift = fold * abs(v) * hw + cup * v * v * hw
            px = cxi + nx * lift
            pz = czi + nz * lift
            if lobe > 0 and u < 0.14:
                back = lobe * (1 - u / 0.14) * abs(v)
                px -= back * math.cos(a)
                pz -= back * math.sin(a)
            row.append(bm.verts.new((px, v * hw, pz)))
        rows.append(row)
    for i in range(nu):
        for j in range(nv):
            bm.faces.new((rows[i][j], rows[i][j + 1], rows[i + 1][j + 1], rows[i + 1][j]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def catmull(points, samples_per_seg=8):
    P = [Vector(p) for p in points]
    P = [P[0]] + P + [P[-1]]
    out = []
    for i in range(len(P) - 3):
        for s in range(samples_per_seg):
            t = s / samples_per_seg
            out.append(
                0.5
                * (
                    2 * P[i + 1]
                    + (-P[i] + P[i + 2]) * t
                    + (2 * P[i] - 5 * P[i + 1] + 4 * P[i + 2] - P[i + 3]) * t * t
                    + (-P[i] + 3 * P[i + 1] - 3 * P[i + 2] + P[i + 3]) * t * t * t
                )
            )
    out.append(P[-2])
    return out


def sweep_bm(points, r0, r1, nsides=8, cap=True):
    """沿采样折线扫掠圆截面（平行传输标架，半径线性收细）"""
    pts = [Vector(p) for p in points]
    n = len(pts)
    tangents = []
    for i in range(n):
        if i == 0:
            t = pts[1] - pts[0]
        elif i == n - 1:
            t = pts[-1] - pts[-2]
        else:
            t = pts[i + 1] - pts[i - 1]
        tangents.append(t.normalized())
    up = Vector((0, 0, 1))
    if abs(tangents[0].dot(up)) > 0.92:
        up = Vector((1, 0, 0))
    normals = [(up - tangents[0] * up.dot(tangents[0])).normalized()]
    for i in range(1, n):
        v = normals[-1] - tangents[i] * normals[-1].dot(tangents[i])
        if v.length < 1e-8:
            v = tangents[i].orthogonal()
        normals.append(v.normalized())
    bm = bmesh.new()
    rings = []
    for i, p in enumerate(pts):
        u = i / (n - 1)
        rad = r0 + (r1 - r0) * u
        b1 = normals[i]
        b2 = tangents[i].cross(b1).normalized()
        ring = [
            bm.verts.new(p + (b1 * math.cos(a) + b2 * math.sin(a)) * rad)
            for a in [2 * math.pi * j / nsides for j in range(nsides)]
        ]
        rings.append(ring)
    for i in range(n - 1):
        for j in range(nsides):
            bm.faces.new((rings[i][j], rings[i][(j + 1) % nsides], rings[i + 1][(j + 1) % nsides], rings[i + 1][j]))
    if cap:
        bm.faces.new(list(reversed(rings[0])))
        bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def lathe_bm(profile, seg=48):
    """旋转体：profile 为 (radius, z) 列表，radius≈0 时收成极点"""
    bm = bmesh.new()
    rings = []
    for rr, zz in profile:
        if rr <= 1e-6:
            rings.append(bm.verts.new((0, 0, zz)))
        else:
            rings.append(
                [bm.verts.new((math.cos(a) * rr, math.sin(a) * rr, zz)) for a in [2 * math.pi * j / seg for j in range(seg)]]
            )
    for a, b in zip(rings, rings[1:]):
        if isinstance(a, list) and isinstance(b, list):
            for j in range(seg):
                bm.faces.new((a[j], a[(j + 1) % seg], b[(j + 1) % seg], b[j]))
        elif isinstance(a, list):
            for j in range(seg):
                bm.faces.new((a[j], a[(j + 1) % seg], b))
        else:
            for j in range(seg):
                bm.faces.new((a, b[(j + 1) % seg], b[j]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def sphere_bm(r, scale=(1, 1, 1), useg=12, vseg=10):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=useg, v_segments=vseg, radius=r)
    bm.transform(Matrix.Diagonal((*scale, 1.0)))
    return bm


def torus_bm(R, r, nmaj=18, nmin=8):
    bm = bmesh.new()
    rings = []
    for i in range(nmaj):
        a = 2 * math.pi * i / nmaj
        c = Vector((math.cos(a) * R, math.sin(a) * R, 0))
        t1 = Vector((math.cos(a), math.sin(a), 0))
        t2 = Vector((0, 0, 1))
        rings.append(
            [c + (t1 * math.cos(b) + t2 * math.sin(b)) * r for b in [2 * math.pi * j / nmin for j in range(nmin)]]
        )
    verts = [[bm.verts.new(p) for p in ring] for ring in rings]
    for i in range(nmaj):
        r0, r1 = verts[i], verts[(i + 1) % nmaj]
        for j in range(nmin):
            bm.faces.new((r0[j], r0[(j + 1) % nmin], r1[(j + 1) % nmin], r1[j]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def place(loc=(0, 0, 0), yaw=0.0, quat=None, scale=1.0):
    m = Matrix.Translation(Vector(loc))
    if quat is not None:
        m = m @ quat.to_matrix().to_4x4()
    if yaw:
        m = m @ Matrix.Rotation(yaw, 4, "Z")
    if scale != 1.0:
        m = m @ Matrix.Scale(scale, 4)
    return m


# ---------------------------------------------------------------- 蝴蝶兰

PETAL_KEYS = [(0, 0.30), (0.25, 0.85), (0.55, 1.0), (0.8, 0.8), (1, 0.06)]
SEPAL_KEYS = [(0, 0.25), (0.3, 0.8), (0.6, 1.0), (0.85, 0.6), (1, 0.05)]
ORCHID_LEAF_KEYS = [(0, 0.30), (0.12, 0.44), (0.45, 0.5), (0.75, 0.42), (0.92, 0.25), (1, 0.02)]
LIP_KEYS = [(0, 0.5), (0.4, 1.0), (0.8, 0.75), (1, 0.1)]


def orchid_blossom(matrix):
    """单朵蝴蝶兰：3 萼片(后层) + 2 蝶翼大瓣 + 三裂唇瓣 + 蕊柱，面朝 +Z"""
    # 萼片：上 / 左下 / 右下
    for ang in (math.pi / 2, math.pi / 2 + 2 * math.pi / 3, math.pi / 2 - 2 * math.pi / 3):
        bm = blade_bm(0.038, 0.02, SEPAL_KEYS, nu=10, nv=5, tilt0=0.1, droop=0.5, fold=0.12)
        emit(bm, "sepal", matrix @ Matrix.Translation((0, 0, -0.004)) @ Matrix.Rotation(ang, 4, "Z"))
    # 左右大瓣：宽圆如蝶翼，微微前倾后再回卷
    for ang in (0.17, math.pi - 0.17):
        bm = blade_bm(0.036, 0.046, PETAL_KEYS, nu=10, nv=6, tilt0=0.28, droop=0.6, fold=0.1)
        emit(bm, "petal", matrix @ Matrix.Rotation(ang, 4, "Z"))
    # 唇瓣中裂片：向前下强烈卷曲
    bm = blade_bm(0.021, 0.014, LIP_KEYS, nu=8, nv=4, tilt0=0.95, droop=2.5, fold=-0.25)
    emit(bm, "lip", matrix @ Matrix.Translation((0, -0.002, 0.004)) @ Matrix.Rotation(-math.pi / 2, 4, "Z"))
    # 唇瓣两侧小裂片：上翘
    for side in (-1, 1):
        bm = blade_bm(0.012, 0.011, LIP_KEYS, nu=6, nv=4, tilt0=1.3, droop=0.5, fold=-0.2)
        emit(bm, "lip", matrix @ Matrix.Translation((0, -0.001, 0.004)) @ Matrix.Rotation(-math.pi / 2 + side * 0.8, 4, "Z"))
    # 蕊柱 + 喉部红斑
    emit(sphere_bm(1, (0.0045, 0.0045, 0.0075), 10, 8), "column", matrix @ Matrix.Translation((0, -0.0015, 0.009)))
    emit(sphere_bm(1, (0.003, 0.002, 0.0025), 8, 6), "throat", matrix @ Matrix.Translation((0, -0.007, 0.0085)))


def orchid_spike(ctrl_pts_three, blossoms, buds, stake):
    """花剑：扫掠茎 + 花梗 + 花朵 + 顶端花苞 + 支撑杆/卡扣"""
    pts = catmull([T(*p) for p in ctrl_pts_three], 10)
    emit(sweep_bm(pts, 0.0045, 0.0028), "stem")

    def curve_at(t):
        return pts[min(int(t * (len(pts) - 1)), len(pts) - 1)]

    for t, out, scale in blossoms:
        p = curve_at(t)
        off = T(*out)
        pos = p + off
        scale *= 1.25  # 房间远景下花朵读得清
        face = Vector((off.x, off.y, 0))
        face = (face.normalized() if face.length > 1e-6 else Vector((1, 0, 0))) + Vector((0, 0, -0.18))
        face.normalize()
        quat = face.to_track_quat("Z", "Y")
        # 花梗：茎 → 花朵背面
        pedicel = catmull([p, (p + pos) / 2 + Vector((0, 0, 0.004)), pos - face * 0.008], 4)
        emit(sweep_bm(pedicel, 0.0028, 0.002, 6), "stem")
        orchid_blossom(place(pos, quat=quat, scale=scale))
    for t, out, r in buds:
        p = curve_at(t) + T(*out)
        emit(sphere_bm(r, (1, 1, 1.35), 10, 8), "bud", place(p))
        emit(sweep_bm([curve_at(t), p], 0.002, 0.0016, 5), "stem")
    # 支撑杆：底插入水苔，顶端卡扣环贴茎
    base = T(stake["x"], 0.26, stake["z"])
    top = curve_at(stake["t"]) + Vector((0, 0, -0.006))
    emit(sweep_bm([base, base * 0.4 + top * 0.6, top], 0.0042, 0.0038, 8), "stake")
    emit(torus_bm(0.011, 0.0035), "clip", place(top))


def build_orchid():
    # 白瓷釉盆：束腰 + 外翻圆唇 + 内壁 + 圈足
    mat("pot", "#f0ece4", 0.22)
    mat("moss", "#6f5e40", 0.95)
    mat("leaf_a", "#3f6b3c", 0.48)
    mat("leaf_b", "#4d7d47", 0.48)
    mat("stem", "#5a7a42", 0.7)
    mat("petal", "#f7f3ec", 0.42)
    mat("sepal", "#efe9df", 0.5)
    mat("lip", "#a83a7f", 0.42)
    mat("column", "#e3bd5a", 0.4)
    mat("throat", "#7c2a55", 0.5)
    mat("bud", "#cfd8b4", 0.6)
    mat("stake", "#4c6b3a", 0.6)
    mat("clip", "#7d9459", 0.6)
    mat("root", "#9aa688", 0.72)

    emit(
        lathe_bm(
            [
                (0.0, 0.004),
                (0.088, 0.004),
                (0.098, 0.0),
                (0.103, 0.012),
                (0.098, 0.045),
                (0.104, 0.09),
                (0.118, 0.16),
                (0.13, 0.235),
                (0.138, 0.268),
                (0.141, 0.282),
                (0.135, 0.291),
                (0.126, 0.286),
                (0.12, 0.268),
                (0.116, 0.252),
            ]
        ),
        "pot",
    )
    # 盆口水苔：噪声起伏的鼓面
    bm = sphere_bm(1, (0.117, 0.117, 0.03), 20, 12)
    for v in bm.verts:
        if v.co.z > 0:
            v.co.z += (noise.noise(v.co * 38) + 0.4) * 0.008
    emit(bm, "moss", place((0, 0, 0.262)))

    # 基生宽叶：肉质带状、中脊 V 形折叠、先扬后垂
    leaves = [
        (0.3, 0.30, 1.0, 0.55, 1.45),
        (1.35, 0.34, 1.1, 0.42, 1.3),
        (2.5, 0.28, 0.95, 0.6, 1.6),
        (3.6, 0.33, 1.05, 0.38, 1.25),
        (4.7, 0.30, 1.0, 0.55, 1.5),
        (5.7, 0.26, 0.9, 0.62, 1.7),
    ]
    for i, (yaw, ln, w, tilt0, droop) in enumerate(leaves):
        psi = yaw - math.pi / 2 + rnd.uniform(-0.06, 0.06)
        bm = blade_bm(ln, 0.105 * w, ORCHID_LEAF_KEYS, nu=18, nv=8, tilt0=tilt0, droop=droop, fold=0.35, cup=-0.06)
        base = Vector((math.cos(psi), math.sin(psi), 0)) * 0.015 + Vector((0, 0, 0.272))
        emit(bm, "leaf_a" if i % 2 else "leaf_b", place(base, yaw=psi))

    # 气生根：从水苔翻过盆沿探出的短根（银绿色、微弯）
    for sx, sy in ((0.35, 0.75), (-0.8, 0.4), (0.55, -0.7)):
        d = Vector((sx, sy, 0)).normalized()
        root_pts = [
            Vector((0, 0, 0.27)) + d * 0.04,
            Vector((0, 0, 0.295)) + d * 0.105,
            Vector((0, 0, 0.272)) + d * 0.148,
            Vector((0, 0, 0.225)) + d * 0.157 + Vector((0.006 * sy, 0, 0)),
        ]
        emit(sweep_bm(catmull(root_pts, 6), 0.0042, 0.0022, 7), "root")

    # 花剑一：向右前方拱起，5 朵盛放 + 2 苞
    orchid_spike(
        [(0.01, 0.3, 0.01), (0.03, 0.5, 0.03), (0.09, 0.68, 0.06), (0.19, 0.78, 0.1), (0.3, 0.8, 0.14)],
        blossoms=[
            (0.52, (0.02, 0.015, 0.03), 0.92),
            (0.64, (0.03, 0.02, 0.02), 1.0),
            (0.76, (0.025, 0.025, 0.03), 1.05),
            (0.87, (0.02, 0.02, 0.035), 1.0),
            (0.96, (0.015, 0.015, 0.03), 0.9),
        ],
        buds=[(0.99, (0.012, 0.01, 0.012), 0.011), (1.0, (0.024, 0.004, 0.02), 0.009)],
        stake={"x": 0.05, "z": 0.03, "t": 0.5},
    )
    # 花剑二：向左后方低一点拱起，3 朵 + 2 苞
    orchid_spike(
        [(-0.02, 0.3, -0.01), (-0.05, 0.46, -0.04), (-0.12, 0.58, -0.08), (-0.21, 0.63, -0.11)],
        blossoms=[
            (0.55, (-0.025, 0.02, -0.02), 0.85),
            (0.72, (-0.03, 0.02, -0.025), 0.95),
            (0.88, (-0.025, 0.02, -0.03), 0.9),
        ],
        buds=[(0.97, (-0.012, 0.008, -0.01), 0.01), (1.0, (-0.022, 0.002, -0.018), 0.008)],
        stake={"x": -0.04, "z": -0.03, "t": 0.55},
    )
    finalize("orchid")


# ---------------------------------------------------------------- 绿萝

HEART_KEYS = [(0, 0.42), (0.06, 0.55), (0.18, 0.6), (0.4, 0.52), (0.65, 0.36), (0.85, 0.16), (1, 0.01)]
POTHOS_TONES = ["leaf_a", "leaf_b", "leaf_c"]


def pothos_leaf(base, psi, tilt0, scale, tone, droop=1.0):
    """心形叶 + 叶柄：base 为叶柄根（藤蔓/株心上的点）"""
    d = Vector((math.cos(psi), math.sin(psi), 0))
    leaf_base = base + d * 0.014 + Vector((0, 0, -0.004 if tilt0 < 0.2 else 0.004))
    petiole = catmull([base, (base + leaf_base) / 2 + Vector((0, 0, 0.004)), leaf_base], 4)
    emit(sweep_bm(petiole, 0.0028, 0.002, 6), "stem")
    bm = blade_bm(
        0.062 * scale,
        0.054 * scale,
        HEART_KEYS,
        nu=14,
        nv=6,
        tilt0=tilt0,
        droop=droop,
        fold=0.2,
        cup=0.06,
        lobe=0.007 * scale,
    )
    emit(bm, tone, place(leaf_base, yaw=psi + rnd.uniform(-0.07, 0.07)))


def pothos_vine(ctrl_pts_three, leaves):
    pts = catmull([T(*p) for p in ctrl_pts_three], 10)
    emit(sweep_bm(pts, 0.0038, 0.0022, 7), "stem")
    # 节点叶 + 相邻节点间的插叶（左右交错），叶距贴近真实绿萝
    dense = []
    for a, b in zip(leaves, leaves[1:]):
        dense.append(a)
        dense.append(((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 1.5, (a[2] + b[2]) / 2, min(a[3], b[3]) * 0.82, (a[4] + 2) % 3))
    dense.append(leaves[-1])
    for t, yaw, tilt, scale, tone in dense:
        p = pts[min(int(t * (len(pts) - 1)), len(pts) - 1)]
        psi = yaw - math.pi / 2
        tilt0 = 0.55 - 0.95 * tilt  # 数据里的前倾角 → 叶片起始仰角（挂叶朝下）
        pothos_leaf(p, psi, tilt0, scale * 1.4, POTHOS_TONES[tone % 3], droop=1.35)


def build_pothos():
    mat("pot", "#c17a55", 0.35)
    mat("soil", "#4a3826", 0.95)
    mat("leaf_a", "#4e8a4a", 0.48)
    mat("leaf_b", "#3c6f3a", 0.48)
    mat("leaf_c", "#66a35c", 0.48)
    mat("stem", "#5d7f43", 0.68)

    # 釉面陶盆：束腰 + 翻唇
    emit(
        lathe_bm(
            [
                (0.0, 0.003),
                (0.05, 0.003),
                (0.056, 0.0),
                (0.058, 0.012),
                (0.06, 0.04),
                (0.068, 0.08),
                (0.077, 0.115),
                (0.082, 0.126),
                (0.085, 0.132),
                (0.082, 0.138),
                (0.075, 0.133),
                (0.071, 0.124),
                (0.068, 0.116),
            ],
            seg=40,
        ),
        "pot",
    )
    # 表土
    bm = sphere_bm(1, (0.071, 0.071, 0.016), 16, 10)
    for v in bm.verts:
        if v.co.z > 0:
            v.co.z += (noise.noise(v.co * 55) + 0.3) * 0.004
    emit(bm, "soil", place((0, 0, 0.118)))

    # 顶部叶冠：外圈朝外垂 + 内圈直立新叶，株心饱满
    for i, yaw in enumerate([0.2, 1.1, 2.0, 2.9, 3.8, 4.8, 5.6]):
        psi = yaw - math.pi / 2
        d = Vector((math.cos(psi), math.sin(psi), 0))
        base = d * 0.018 + Vector((0, 0, 0.128 + (i % 3) * 0.008))
        pothos_leaf(base, psi, 0.62 - (i % 2) * 0.22, 1.25 + (i % 3) * 0.2, POTHOS_TONES[i % 3], droop=1.55)
    for i, yaw in enumerate([0.65, 1.75, 3.1, 4.3, 5.3]):
        psi = yaw - math.pi / 2
        d = Vector((math.cos(psi), math.sin(psi), 0))
        base = d * 0.008 + Vector((0, 0, 0.138))
        pothos_leaf(base, psi, 1.0 - (i % 2) * 0.15, 0.9 + (i % 3) * 0.14, POTHOS_TONES[(i + 1) % 3], droop=1.1)

    # 四条藤蔓：沿用原布局（前长垂 / 右前中垂 / 左后短垂 / 绕盆短枝）
    pothos_vine(
        [(0.02, 0.14, 0.01), (0.1, 0.12, 0.04), (0.17, 0.02, 0.07), (0.2, -0.18, 0.09), (0.22, -0.4, 0.06)],
        [
            (0.16, 0.5, 0.5, 0.9, 0),
            (0.34, 1.4, 0.7, 1.0, 1),
            (0.52, 0.2, 0.9, 0.85, 2),
            (0.7, 1.1, 1.0, 0.95, 0),
            (0.86, 0.4, 1.1, 0.8, 1),
            (0.98, 0.9, 1.2, 0.7, 2),
        ],
    )
    pothos_vine(
        [(0.0, 0.13, 0.03), (0.06, 0.1, 0.11), (0.11, -0.02, 0.17), (0.13, -0.22, 0.2)],
        [
            (0.2, 2.2, 0.6, 0.85, 2),
            (0.45, 1.6, 0.85, 0.95, 0),
            (0.68, 2.5, 1.0, 0.8, 1),
            (0.92, 1.9, 1.15, 0.7, 2),
        ],
    )
    pothos_vine(
        [(0.01, 0.13, -0.02), (0.05, 0.09, -0.09), (0.09, -0.03, -0.15), (0.1, -0.16, -0.18)],
        [
            (0.25, -1.8, 0.6, 0.8, 1),
            (0.55, -2.4, 0.9, 0.9, 2),
            (0.85, -2.0, 1.1, 0.72, 0),
        ],
    )
    pothos_vine(
        [(-0.02, 0.13, 0.0), (-0.09, 0.14, 0.03), (-0.14, 0.09, 0.06)],
        [
            (0.4, -0.8, 0.5, 0.85, 0),
            (0.8, -1.3, 0.7, 0.95, 2),
        ],
    )
    finalize("pothos")


# ---------------------------------------------------------------- main

reset_scene()
build_orchid()
export_glb("orchid.glb")

reset_scene()
build_pothos()
export_glb("pothos.glb")

print("[make_plants] done")
