"""Render the shipped enemy GLBs for How to play, without reauthoring the models.

Run: blender --background --python scripts/render-enemy-portraits.py
"""

import math
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
COLORS = {
    "firewall": "ff4d45", "virus": "ff9c2f", "ping": "68ff72",
    "spam": "b87cff", "lag": "ffe24d",
}


def linear_color(hex_color):
    values = [int(hex_color[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
                 for v in values) + (1,)


for kind, color in COLORS.items():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 48
    scene.cycles.use_denoising = True
    scene.render.resolution_x = scene.render.resolution_y = 256
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.compression = 100
    scene.view_settings.view_transform = "Standard"
    scene.render.fps = 30
    bpy.ops.import_scene.gltf(filepath=str(ROOT / "public/assets/models/enemies" / (kind + ".glb")))
    scene.frame_set(23)
    # Runtime overrides the GLBs' saved scared weight for their normal expression.
    for obj in scene.objects:
        if obj.type == "MESH" and obj.data.shape_keys:
            scared = obj.data.shape_keys.key_blocks.get("scared")
            if scared:
                scared.value = 0
    # ArcadeAssets applies these same identity and accent colors at runtime.
    for material in bpy.data.materials:
        if material.name.startswith(("identity", "accent")):
            shader = material.node_tree.nodes.get("Principled BSDF")
            shader.inputs["Base Color"].default_value = linear_color(color)
            if material.name.startswith("accent"):
                shader.inputs["Emission Color"].default_value = linear_color(color)
                shader.inputs["Emission Strength"].default_value = 1

    bpy.context.view_layer.update()
    corners = [obj.matrix_world @ Vector(corner)
               for obj in scene.objects if obj.type == "MESH" for corner in obj.bound_box]
    center = Vector(tuple((min(v[i] for v in corners) + max(v[i] for v in corners)) / 2
                          for i in range(3)))
    tilt, lean = math.radians(20), math.radians(5)
    direction = Vector((math.cos(tilt) * math.sin(lean), -math.sin(tilt),
                        math.cos(tilt) * math.cos(lean)))
    bpy.ops.object.camera_add(location=center + direction * 40)
    camera = bpy.context.object
    camera.rotation_euler = (-direction).to_track_quat("-Z", "Y").to_euler()
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 15
    scene.camera = camera

    scene.world = bpy.data.worlds.new("Portrait ambient")
    scene.world.use_nodes = True
    background = scene.world.node_tree.nodes.get("Background")
    background.inputs["Color"].default_value = linear_color("a7c5ff")
    background.inputs["Strength"].default_value = 0.6
    bpy.ops.object.light_add(type="SUN", location=(-150, -100, 300))
    light = bpy.context.object
    light.rotation_euler = (-light.location).to_track_quat("-Z", "Y").to_euler()
    light.data.energy = 1.4
    light.data.color = linear_color("c7dfff")[:3]
    light.data.angle = math.radians(10)

    output = ROOT / "public/assets/images/enemies" / (kind + ".png")
    output.parent.mkdir(parents=True, exist_ok=True)
    scene.render.filepath = str(output)
    bpy.ops.render.render(write_still=True)
