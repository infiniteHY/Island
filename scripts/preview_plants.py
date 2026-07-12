# 预览渲染 make_plants.py 产出的 GLB：三视角各出一张 PNG 到 /tmp
# 用法: Blender --background --python scripts/preview_plants.py -- orchid.glb 0.55
import bpy, math, os, sys

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
name = argv[0] if argv else "orchid.glb"
height = float(argv[1]) if len(argv) > 1 else 0.55  # 主体高度，用来取景

base = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "assets", "room", "plants"))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(base, name))

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 640
scene.render.resolution_y = 720
scene.world = bpy.data.worlds.new("w")
scene.world.use_nodes = True
bg = scene.world.node_tree.nodes["Background"]
bg.inputs[0].default_value = (0.85, 0.88, 0.9, 1)
bg.inputs[1].default_value = 1.0

sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
sun.data.energy = 3.5
sun.rotation_euler = (math.radians(50), 0, math.radians(-35))
scene.collection.objects.link(sun)

cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
scene.collection.objects.link(cam)
scene.camera = cam

cz = height * 0.55
dist = height * 2.3
stem = os.path.splitext(name)[0]
for label, ang in (("front", math.radians(-90)), ("three", math.radians(-45)), ("side", 0.0)):
    cam.location = (dist * math.cos(ang), dist * math.sin(ang), cz + height * 0.35)
    d = cam.location - bpy.mathutils_vector if False else None
    look = cam.location - type(cam.location)((0, 0, cz))
    cam.rotation_euler = look.to_track_quat("Z", "Y").to_euler()
    scene.render.filepath = f"/tmp/plant-{stem}-{label}.png"
    bpy.ops.render.render(write_still=True)
    print("saved", scene.render.filepath)
