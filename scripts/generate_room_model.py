import math
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets" / "room" / "room.glb"
KENNEY_OBJ = ROOT / "public" / "assets" / "room" / "vendor" / "kenney_furniture-kit" / "Models" / "OBJ format"


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()


def mat(name, color, roughness=0.75, metallic=0.0, emission=None, strength=0.0):
    material = bpy.data.materials.new(name)
    material.diffuse_color = color
    material.use_nodes = True
    bsdf = None
    for node in material.node_tree.nodes:
        if node.type == "BSDF_PRINCIPLED":
            bsdf = node
            break
    if bsdf:
        if "Base Color" in bsdf.inputs:
            bsdf.inputs["Base Color"].default_value = color
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = roughness
        if "Metallic" in bsdf.inputs:
            bsdf.inputs["Metallic"].default_value = metallic
        if emission:
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = emission
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = strength
            if "Emission" in bsdf.inputs:
                bsdf.inputs["Emission"].default_value = emission
    return material


MATS = {}


def get_mats():
    global MATS
    MATS = {
        "wall": mat("midnight star wall", (0.055, 0.075, 0.13, 1)),
        "wall_side": mat("side shadow wall", (0.04, 0.055, 0.1, 1)),
        "floor": mat("warm oak floor", (0.72, 0.62, 0.48, 1)),
        "wood": mat("honey wood", (0.78, 0.54, 0.31, 1)),
        "dark_wood": mat("dark walnut", (0.32, 0.22, 0.15, 1)),
        "cream": mat("aged cream plastic", (0.77, 0.72, 0.62, 1)),
        "black": mat("soft black", (0.018, 0.018, 0.018, 1), 0.58),
        "charcoal": mat("charcoal fabric", (0.07, 0.075, 0.082, 1), 0.92),
        "green_screen": mat("crt phosphor glass", (0.025, 0.12, 0.06, 1), 0.42, emission=(0.25, 0.95, 0.06, 1), strength=0.35),
        "lcd": mat("lcd green", (0.46, 0.6, 0.12, 1), 0.55, emission=(0.3, 0.45, 0.08, 1), strength=0.18),
        "paper": mat("typed paper", (0.9, 0.84, 0.72, 1)),
        "record": mat("black vinyl", (0.004, 0.004, 0.005, 1), 0.35),
        "accent": mat("acid accent", (0.58, 0.92, 0.08, 1), 0.4, emission=(0.58, 0.92, 0.08, 1), strength=0.35),
        "metal": mat("brushed metal", (0.66, 0.63, 0.57, 1), 0.34, metallic=0.55),
        "plant": mat("plant green", (0.22, 0.48, 0.26, 1)),
        "rug": mat("muted woven rug", (0.38, 0.36, 0.38, 1), 0.96),
        "lamp": mat("warm lamp glow", (1.0, 0.72, 0.38, 1), 0.45, emission=(1.0, 0.48, 0.16, 1), strength=1.15),
        "star": mat("tiny star", (0.9, 0.92, 1.0, 1), emission=(0.82, 0.88, 1.0, 1), strength=0.85),
    }


def cube(name, loc, scale, material, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(material)
    if bevel:
        modifier = obj.modifiers.new("soft bevel", "BEVEL")
        modifier.width = bevel
        modifier.segments = 3
        obj.modifiers.new("weighted normals", "WEIGHTED_NORMAL")
    return obj


def cyl(name, loc, radius, depth, material, vertices=32, rotation=(0, 0, 0), bevel=False):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(material)
    if bevel:
        modifier = obj.modifiers.new("edge bevel", "BEVEL")
        modifier.width = 0.015
        modifier.segments = 2
        obj.modifiers.new("weighted normals", "WEIGHTED_NORMAL")
    return obj


def cone(name, loc, radius, depth, material, vertices=8, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius, radius2=0, depth=depth, location=loc, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(material)
    obj.modifiers.new("weighted normals", "WEIGHTED_NORMAL")
    return obj


def import_kenney(name, loc, scale=(1, 1, 1), rotation=(0, 0, 0), label=None):
    path = KENNEY_OBJ / f"{name}.obj"
    if not path.exists():
        raise FileNotFoundError(path)

    before = set(bpy.context.scene.objects)
    if hasattr(bpy.ops.wm, "obj_import"):
        bpy.ops.wm.obj_import(filepath=str(path))
    else:
        bpy.ops.import_scene.obj(filepath=str(path))
    imported = [obj for obj in bpy.context.scene.objects if obj not in before]

    empty = bpy.data.objects.new(label or f"kenney_{name}", None)
    bpy.context.collection.objects.link(empty)
    empty.location = loc
    empty.rotation_euler = rotation
    empty.scale = scale

    for obj in imported:
        obj.parent = empty
        obj.name = f"{empty.name}_{obj.name}"
        if hasattr(obj.data, "materials"):
            for material in obj.data.materials:
                if material:
                    material.use_nodes = True
        if obj.type == "MESH":
            obj.visible_shadow = True

    return empty


def plane(name, loc, scale, material, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(material)
    return obj


def add_room_shell():
    # A simple L-shaped room: two walls and a floor, no ceiling, so it reads as an interior stage.
    cube("floor_slab", (0, -0.055, 0), (6.8, 0.11, 6.8), MATS["floor"], 0.015)
    for z in [-2.8, -1.9, -1.0, -0.1, 0.8, 1.7, 2.6]:
        cube("floor_board_line", (0, 0.012, z), (6.55, 0.012, 0.018), MATS["dark_wood"])
    for x in [-2.7, -1.35, 0, 1.35, 2.7]:
        cube("floor_board_end_grain", (x, 0.014, 0), (0.018, 0.012, 6.55), MATS["dark_wood"])

    cube("back_star_wall", (0, 2.0, -3.26), (6.8, 4.12, 0.12), MATS["wall"], 0.012)
    cube("left_star_wall", (-3.26, 2.0, 0), (0.12, 4.12, 6.8), MATS["wall_side"], 0.012)
    cube("back_base_light", (0, 0.09, -3.16), (6.35, 0.04, 0.04), MATS["lamp"], 0.008)
    cube("left_base_light", (-3.16, 0.09, 0), (0.04, 0.04, 6.35), MATS["lamp"], 0.008)
    cube("rug", (-0.35, 0.018, 0.86), (3.45, 0.035, 2.15), MATS["rug"], 0.12)

    # Window centered above the desk, with a real frame and warm emissive glass.
    cube("window_frame_outer", (-1.2, 2.38, -3.16), (1.22, 1.02, 0.08), MATS["dark_wood"], 0.025)
    cube("window_glass_glow", (-1.2, 2.38, -3.105), (1.02, 0.82, 0.025), MATS["lamp"], 0.02)
    cube("window_mullion_vertical", (-1.2, 2.38, -3.06), (0.04, 0.9, 0.04), MATS["dark_wood"], 0.006)
    cube("window_mullion_horizontal", (-1.2, 2.38, -3.055), (1.08, 0.04, 0.04), MATS["dark_wood"], 0.006)

    # Sparse stars only above eye level; lower walls stay usable as a room surface.
    for i in range(72):
        x = -3.0 + ((i * 37) % 600) / 100
        y = 1.28 + ((i * 53) % 250) / 100
        radius = 0.008 + ((i * 11) % 4) * 0.003
        plane(f"back_star_{i:03d}", (x, y, -3.205), (radius, radius, 1), MATS["star"])
    for i in range(34):
        z = -3.0 + ((i * 41) % 600) / 100
        y = 1.35 + ((i * 47) % 235) / 100
        radius = 0.007 + ((i * 13) % 3) * 0.003
        plane(f"left_star_{i:03d}", (-3.205, y, z), (radius, radius, 1), MATS["star"], (0, math.pi / 2, 0))


def add_furniture():
    convert = (-math.pi / 2, 0, 0)

    # Kenney CC0 furniture kit: use finished furniture models instead of handmade boxes.
    import_kenney("desk", (-1.48, 0.78, -2.06), (2.7, 2.7, 2.7), convert, "kenney_desk")
    import_kenney("chairDesk", (-1.62, 0.42, -0.92), (2.25, 2.25, 2.25), convert, "kenney_desk_chair")
    import_kenney("cabinetTelevisionDoors", (2.35, 0.3, -2.3), (1.62, 1.62, 1.62), convert, "kenney_media_cabinet")
    import_kenney("bookcaseOpen", (-2.95, 0.92, -1.55), (2.15, 2.15, 2.15), convert, "kenney_bookcase")
    import_kenney("rugRectangle", (-0.35, 0.025, 0.86), (3.4, 3.4, 3.4), convert, "kenney_rug")
    import_kenney("benchCushionLow", (2.55, 0.1, 1.54), (1.2, 1.2, 1.2), convert, "kenney_low_bench")
    import_kenney("pillowBlue", (2.62, 0.34, 1.24), (0.78, 0.78, 0.78), convert, "kenney_pillow")
    import_kenney("books", (-2.66, 1.36, -1.38), (1.6, 1.6, 1.6), convert, "kenney_books")
    import_kenney("pottedPlant", (2.38, 1.98, -2.86), (1.3, 1.3, 1.3), convert, "kenney_potted_plant")
    import_kenney("lampSquareTable", (-0.28, 0.9, -2.38), (1.25, 1.25, 1.25), convert, "kenney_table_lamp")
    import_kenney("radio", (2.72, 0.7, -2.22), (0.74, 0.74, 0.74), convert, "kenney_radio")
    import_kenney("speaker", (2.94, 0.7, -2.54), (0.72, 0.72, 0.72), convert, "kenney_speaker")

    # Small wall decor remains procedural so it aligns with the room shell.
    cube("pinned_map_frame", (-2.18, 1.92, -3.12), (1.2, 0.72, 0.055), MATS["dark_wood"], 0.018)
    cube("pinned_map_paper", (-2.18, 1.92, -3.075), (1.04, 0.56, 0.025), MATS["paper"], 0.01)


def add_interactive_objects():
    convert = (-math.pi / 2, 0, 0)

    # A. Computer: Kenney finished props plus an emissive screen for the site UI.
    import_kenney("computerScreen", (-1.92, 1.04, -2.02), (1.75, 1.75, 1.75), convert, "kenney_computer_screen")
    import_kenney("computerKeyboard", (-1.92, 0.86, -1.56), (1.75, 1.75, 1.75), convert, "kenney_computer_keyboard")
    import_kenney("computerMouse", (-1.28, 0.86, -1.56), (1.75, 1.75, 1.75), convert, "kenney_computer_mouse")
    cube("computer_screen_glass", (-1.92, 1.08, -1.82), (0.54, 0.31, 0.025), MATS["green_screen"], 0.025)

    # B. Typewriter: moved to its own small side-table area so it does not hide the desk or record player.
    cube("typewriter_body", (0.58, 0.78, -1.45), (0.72, 0.24, 0.5), MATS["charcoal"], 0.06)
    cyl("typewriter_roller", (0.58, 0.98, -1.62), 0.078, 0.76, MATS["black"], 22, (0, math.pi / 2, 0))
    page = cube("typewriter_paper", (0.58, 1.19, -1.68), (0.54, 0.48, 0.022), MATS["paper"], 0.012)
    page.rotation_euler[0] = -0.16
    cube("typewriter_spacebar", (0.58, 0.89, -1.18), (0.42, 0.032, 0.052), MATS["cream"], 0.008)
    for row in range(3):
        for col in range(7):
            x = 0.33 + col * 0.08 + row * 0.018
            z = -1.35 + row * 0.08
            cyl("typewriter_key", (x, 0.9 + row * 0.017, z), 0.025, 0.018, MATS["cream"], 16)
    lever = cube("typewriter_return_lever", (0.98, 1.03, -1.58), (0.032, 0.3, 0.032), MATS["metal"], 0.008)
    lever.rotation_euler[2] = -0.58

    # C. Record player: on media cabinet, with visible turntable geometry and tonearm.
    cube("record_player_base", (2.24, 0.72, -1.95), (0.72, 0.12, 0.56), MATS["wood"], 0.045)
    cyl("record_disc", (2.1, 0.8, -1.95), 0.2, 0.024, MATS["record"], 72, (math.pi / 2, 0, 0), True)
    cyl("record_label", (2.1, 0.816, -1.95), 0.064, 0.01, MATS["accent"], 36, (math.pi / 2, 0, 0))
    cyl("record_spindle", (2.1, 0.835, -1.95), 0.014, 0.04, MATS["metal"], 16)
    arm = cube("record_arm", (2.43, 0.88, -1.85), (0.03, 0.03, 0.36), MATS["metal"], 0.01)
    arm.rotation_euler[1] = -0.38
    cube("record_head", (2.48, 0.86, -1.66), (0.076, 0.034, 0.062), MATS["black"], 0.012)
    for x in [2.4, 2.5]:
        cyl("record_knob", (x, 0.81, -2.14), 0.032, 0.026, MATS["black"], 18)

    # D. Handheld console: rests on the open rug area, away from fixed UI overlays.
    body = cube("console_body", (0.56, 0.28, 0.32), (0.56, 0.78, 0.11), MATS["cream"], 0.08)
    body.rotation_euler = (-0.62, 0.08, -0.12)
    screen = cube("console_screen", (0.56, 0.4, 0.38), (0.37, 0.29, 0.032), MATS["lcd"], 0.022)
    screen.rotation_euler = body.rotation_euler
    dpad1 = cube("console_dpad_horizontal", (0.42, 0.14, 0.42), (0.19, 0.04, 0.03), MATS["black"], 0.006)
    dpad2 = cube("console_dpad_vertical", (0.42, 0.14, 0.43), (0.04, 0.19, 0.03), MATS["black"], 0.006)
    dpad1.rotation_euler = body.rotation_euler
    dpad2.rotation_euler = body.rotation_euler
    for x in [0.68, 0.8]:
        btn = cyl("console_button", (x, 0.135, 0.43), 0.047, 0.026, MATS["accent"], 18, (math.pi / 2, 0, 0))
        btn.rotation_euler = body.rotation_euler


def add_lights_and_camera():
    bpy.ops.object.light_add(type="AREA", location=(-2.2, 4.4, 2.1))
    light = bpy.context.object
    light.name = "large soft window light"
    light.data.energy = 450
    light.data.size = 5

    bpy.ops.object.light_add(type="POINT", location=(0.2, 0.32, -2.8))
    glow = bpy.context.object
    glow.name = "baseboard warm glow"
    glow.data.energy = 120
    glow.data.color = (1.0, 0.58, 0.24)
    glow.data.shadow_soft_size = 2.0

    bpy.ops.object.camera_add(location=(2.85, 2.05, 3.35), rotation=(math.radians(62), 0, math.radians(37)))
    camera = bpy.context.object
    bpy.context.scene.camera = camera
    direction = Vector((-0.58, 0.94, -1.62)) - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    camera.data.lens = 28


def export():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(OUT),
        export_format="GLB",
        export_apply=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
    )


def main():
    reset_scene()
    get_mats()
    add_room_shell()
    add_furniture()
    add_interactive_objects()
    add_lights_and_camera()
    export()


if __name__ == "__main__":
    main()
