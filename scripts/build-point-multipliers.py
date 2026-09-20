"""Build five reference-inspired multiplier icons as self-contained GLBs.

Run: blender --background --python scripts/build-point-multipliers.py
Optional preview: append -- --preview /absolute/path/multipliers.png

The icons have real beveled depth, no textures, and no assigned gameplay values.
glTF coordinates: Y-up, face toward +Y, image top toward -Z, centered origin,
longest face dimension of two units. Emissive trim is exported; bloom is a
renderer effect, not part of the GLBs. The preview's second row shows depth.
"""

import argparse
import math
import sys
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
KINDS = ("bug", "key", "cloud", "wifi", "chip")


def linear_color(hex_color):
    """Convert authored sRGB colors to Blender/glTF linear RGBA."""
    channels = [int(hex_color[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
                 for c in channels) + (1,)


def material(name, color, emission=0):
    """Create one opaque, portable PBR material with optional emissive trim."""
    result = bpy.data.materials.new(name)
    result.use_nodes = True
    result.diffuse_color = linear_color(color)
    shader = result.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = linear_color(color)
    shader.inputs["Roughness"].default_value = 0.38
    shader.inputs["Metallic"].default_value = 0.15
    shader.inputs["Emission Color"].default_value = linear_color(color)
    shader.inputs["Emission Strength"].default_value = emission
    return result


def prism(name, points, bottom, top, finish, bevel=0.012):
    """Extrude a counterclockwise polygon into a closed beveled solid."""
    count = len(points)
    vertices = [(x, y, z) for z in (bottom, top) for x, y in points]
    faces = [tuple(reversed(range(count))), tuple(range(count, count * 2))]
    faces.extend((i, (i + 1) % count, (i + 1) % count + count, i + count)
                 for i in range(count))
    return solid(name, vertices, faces, finish, bevel)


def solid(name, vertices, faces, finish, bevel):
    """Build a manifold mesh, bake a small bevel, and verify outward normals."""
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    mesh.materials.append(finish)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    if bevel:
        modifier = obj.modifiers.new("Crisp edge bevel", "BEVEL")
        modifier.width = bevel
        modifier.segments = 1
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    topology = bmesh.new()
    topology.from_mesh(obj.data)
    bmesh.ops.recalc_face_normals(topology, faces=list(topology.faces))
    assert all(edge.is_manifold for edge in topology.edges), name
    assert topology.calc_volume(signed=True) > 0, name
    topology.to_mesh(obj.data)
    topology.free()
    return obj


def ring(name, outer, inner, bottom, top, finish, bevel=0.01):
    """Extrude a closed band, retaining the open center as real geometry."""
    count = len(outer)
    assert count == len(inner)
    vertices = [(x, y, z) for z in (bottom, top) for loop in (outer, inner) for x, y in loop]
    faces = []
    for i in range(count):
        j = (i + 1) % count
        faces.extend(((i, j, j + 2 * count, i + 2 * count),
                      (j + count, i + count, i + 3 * count, j + 3 * count),
                      (i + 2 * count, j + 2 * count, j + 3 * count, i + 3 * count),
                      (j, i, i + count, j + count)))
    return solid(name, vertices, faces, finish, bevel)


def polygon(radius, count=12, center=(0, 0), phase=0):
    """Return a faceted circular outline in counterclockwise order."""
    return [(center[0] + radius * math.cos(phase + i * math.tau / count),
             center[1] + radius * math.sin(phase + i * math.tau / count)) for i in range(count)]


def rectangle(x0, y0, x1, y1):
    """Return a rectangular outline for pins, eyes, and stepped details."""
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


def segment(name, start, end, width, bottom, top, finish):
    """Make one square-ended solid trace between two face-plane points."""
    delta = Vector(end) - Vector(start)
    normal = Vector((-delta.y, delta.x)).normalized() * width / 2
    a, b = Vector(start), Vector(end)
    return prism(name, [a - normal, b - normal, b + normal, a + normal], bottom, top, finish)


def build_bug():
    """Author the golden bug's round shell, angular legs, antennae, and eyes."""
    gold = material("bug-gold", "ffcd32", 1.0)
    dark = material("bug-shell", "332707")
    eyes = material("bug-eyes", "fff0a0", 1.3)
    prism("bug-body", polygon(0.60), -0.13, 0.13, dark, 0.035)
    ring("bug-rim", polygon(0.64), polygon(0.54), 0.09, 0.19, gold)
    for side in (-1, 1):
        for index, (height, tip) in enumerate(((0.32, 0.43), (0.0, 0.0), (-0.30, -0.44))):
            path = [(side * 0.49, height), (side * 0.79, tip), (side * 0.93, tip),
                    (side * 0.98, tip - 0.18)]
            for step, (a, b) in enumerate(zip(path, path[1:])):
                segment(f"bug-leg-{side}-{index}-{step}", a, b, 0.065, -0.035, 0.065, gold)
        for end in (-1, 1):
            path = [(side * 0.25, end * 0.52), (side * 0.34, end * 0.74),
                    (side * 0.29, end * 0.88), (side * 0.42, end * 0.90)]
            for step, (a, b) in enumerate(zip(path, path[1:])):
                segment(f"bug-feeler-{side}-{end}-{step}", a, b, 0.065, 0, 0.08, gold)
        prism(f"bug-eye-{side}", rectangle(side * 0.22 - 0.075, -0.05,
                                          side * 0.22 + 0.075, 0.17), 0.13, 0.21, eyes)
    segment("bug-mouth", (-0.19, -0.28), (0.19, -0.28), 0.045, 0.13, 0.16, gold)


def build_key():
    """Author a cyan octagonal key with an open bow and two solid teeth."""
    cyan = material("key-cyan", "12d9ff", 0.9)
    highlight = material("key-edge", "75efff", 1.1)
    center = (0.35, 0.35)
    phase = math.pi / 8
    ring("key-bow", polygon(0.51, 8, center, phase), polygon(0.29, 8, center, phase),
         -0.13, 0.13, cyan, 0.022)
    ring("key-bow-highlight", polygon(0.475, 8, center, phase), polygon(0.438, 8, center, phase),
         0.13, 0.145, highlight, 0.005)
    segment("key-shaft", (0.06, 0.06), (-0.73, -0.73), 0.19, -0.10, 0.10, cyan)
    for index, distance in enumerate((0.47, 0.73)):
        start = (-distance, -distance)
        segment(f"key-tooth-{index}", start, (start[0] + 0.19, start[1] - 0.19),
                0.16, -0.10, 0.10, cyan)


def build_cloud():
    """Author the cloud's stepped lobes, dark fill, and pale-blue raised rim."""
    shell = material("cloud-fill", "12354d", 0.10)
    white = material("cloud-rim", "bcEaff", 1.2)
    points = [(-0.83, -0.48), (0.72, -0.48), (0.88, -0.42), (0.99, -0.27),
              (1.0, -0.03), (0.93, 0.15), (0.78, 0.27), (0.56, 0.28),
              (0.56, 0.52), (0.44, 0.72), (0.25, 0.83), (0.0, 0.85),
              (-0.22, 0.77), (-0.37, 0.60), (-0.40, 0.35), (-0.60, 0.39),
              (-0.79, 0.32), (-0.94, 0.17), (-1.0, -0.04), (-0.98, -0.26)]
    inner = [(x * 0.88, (y - 0.1) * 0.85 + 0.1) for x, y in points]
    prism("cloud-body", points, -0.14, 0.10, shell, 0.022)
    ring("cloud-outline", points, inner, 0.10, 0.18, white, 0.012)


def build_wifi():
    """Author three separated gold signal arcs and their faceted source dot."""
    gold = material("wifi-gold", "ffd43b", 1.1)
    for index, radius in enumerate((0.46, 0.90, 1.34)):
        angles = [math.radians(42 + step * 8) for step in range(13)]
        points = [(radius * math.cos(a), radius * math.sin(a) - 0.56) for a in angles]
        points += [((radius - 0.15) * math.cos(a), (radius - 0.15) * math.sin(a) - 0.56)
                   for a in reversed(angles)]
        prism(f"wifi-arc-{index}", points, -0.10, 0.10, gold, 0.018)
    prism("wifi-dot", polygon(0.14, 8, (0, -0.61), math.pi / 8), -0.10, 0.13, gold, 0.018)


def build_chip():
    """Author a blue processor with sixteen pins and a recessed cyan core."""
    blue = material("chip-blue", "147dff", 1.0)
    cyan = material("chip-core", "43d7ff", 1.2)
    dark = material("chip-shell", "071b39")
    outer = [(-0.58, -0.69), (0.58, -0.69), (0.69, -0.58), (0.69, 0.58),
             (0.58, 0.69), (-0.58, 0.69), (-0.69, 0.58), (-0.69, -0.58)]
    prism("chip-body", outer, -0.17, 0.10, dark, 0.022)
    ring("chip-rim", outer, [(x * 0.87, y * 0.87) for x, y in outer], 0.10, 0.17, blue)
    ring("chip-core-frame", rectangle(-0.38, -0.38, 0.38, 0.38),
         rectangle(-0.28, -0.28, 0.28, 0.28), 0.10, 0.14, cyan)
    for axis in (0, 1):
        for side in (-1, 1):
            for index, offset in enumerate((-0.45, -0.15, 0.15, 0.45)):
                start, end = [offset, side * 0.66], [offset, side * 0.99]
                if axis:
                    start.reverse()
                    end.reverse()
                segment(f"chip-pin-{axis}-{side}-{index}", start, end, 0.105, -0.06, 0.055, blue)


def export_icon(kind):
    """Normalize and batch by material, then export only this icon's geometry."""
    objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    corners = [vertex.co for obj in objects for vertex in obj.data.vertices]
    low = Vector(tuple(min(v[i] for v in corners) for i in range(3)))
    high = Vector(tuple(max(v[i] for v in corners) for i in range(3)))
    center = (low + high) / 2
    scale = 2 / max(high.x - low.x, high.y - low.y)
    for obj in objects:
        for vertex in obj.data.vertices:
            vertex.co = (vertex.co - center) * scale
    for finish in sorted({obj.data.materials[0] for obj in objects}, key=lambda item: item.name):
        bpy.ops.object.select_all(action="DESELECT")
        group = [obj for obj in bpy.context.scene.objects if obj.type == "MESH" and obj.data.materials[0] == finish]
        for obj in group:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = group[0]
        if len(group) > 1:
            bpy.ops.object.join()
        bpy.context.object.name = finish.name
    bpy.ops.object.select_all(action="SELECT")
    output = ROOT / "public/assets/models/multipliers" / f"{kind}.glb"
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=str(output), export_format="GLB", use_selection=True,
                             use_active_scene=True, export_animations=False, export_yup=True,
                             export_normals=True, export_cameras=False, export_lights=False)
    print(f"Exported {kind}: {output.stat().st_size:,} bytes")


def preview(path):
    """Render front and tilted views of the exported GLBs without a browser."""
    scene = bpy.data.scenes.new("Multiplier preview")
    bpy.context.window.scene = scene
    for column, kind in enumerate(KINDS):
        for row in (0, 1):
            before = set(scene.objects)
            bpy.ops.import_scene.gltf(filepath=str(ROOT / "public/assets/models/multipliers" / f"{kind}.glb"))
            root = bpy.data.objects.new(f"{kind}-view-{row}", None)
            scene.collection.objects.link(root)
            for obj in set(scene.objects) - before - {root}:
                if obj.parent is None:
                    obj.parent = root
            root.location = ((column - 2) * 2.65, 1.55 - row * 3.0, 0)
            if row:
                root.rotation_euler = (math.radians(32), math.radians(-22), math.radians(-8))
        bpy.ops.object.text_add(location=((column - 2) * 2.65, -3.0, 0))
        label = bpy.context.object
        label.data.body = kind.upper()
        label.data.align_x = "CENTER"
        label.data.size = 0.22
        label.data.materials.append(material(f"label-{kind}", "b9cfdf", 1))
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 24
    scene.cycles.use_denoising = True
    scene.render.resolution_x, scene.render.resolution_y = 1920, 1040
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.world = bpy.data.worlds.new("Dark navy preview")
    scene.world.use_nodes = True
    scene.world.node_tree.nodes["Background"].inputs["Color"].default_value = linear_color("101b29")
    scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.5
    scene.view_settings.view_transform = "Standard"
    bpy.ops.object.light_add(type="AREA", location=(-3, 4, 7))
    bpy.context.object.data.energy = 650
    bpy.context.object.data.shape = "DISK"
    bpy.context.object.data.size = 8
    bpy.ops.object.camera_add(location=(0, -0.15, 18))
    camera = bpy.context.object
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 13.8
    scene.camera = camera
    scene.render.filepath = str(path)
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.render.render(write_still=True)


def main():
    """Build the five assets in isolated scenes, optionally rendering a preview."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--preview", type=Path)
    args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
    previous_scene = bpy.context.window.scene
    try:
        for kind, build in zip(KINDS, (build_bug, build_key, build_cloud, build_wifi, build_chip)):
            scene = bpy.data.scenes.new(f"Multiplier {kind}")
            bpy.context.window.scene = scene
            build()
            export_icon(kind)
        if args.preview:
            preview(args.preview)
    finally:
        bpy.context.window.scene = previous_scene


if __name__ == "__main__":
    main()
