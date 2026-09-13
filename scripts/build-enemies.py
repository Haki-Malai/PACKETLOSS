"""Author PACKETLOSS enemy models without modifying the supplied models or other scenes.

Run with Blender: blender --background --python scripts/build-enemies.py
The same EnemyAuthoring class can be called through Blender MCP. No renders are made.
"""

import argparse
import json
import math
import struct
import sys
from pathlib import Path

import bpy
from mathutils import Vector


KINDS = ("firewall", "virus", "ping", "spam", "lag")
COLORS = {
    "firewall": "fa345b", "virus": "ff871d", "ping": "16ec91",
    "spam": "b84bff", "lag": "ffe04a",
}
FPS = 30
LAST_FRAME = 180


def linear_color(hex_color):
    channels = [int(hex_color[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4
                 for value in channels) + (1,)


class EnemyAuthoring:
    def __init__(self, output_dir=None, blend_file=None):
        root = Path(__file__).resolve().parents[1]
        self.output_dir = Path(output_dir or root / "public/assets/models/enemies")
        self.blend_file = Path(blend_file or Path.home() / "Downloads/PACKETLOSS_Enemies_3D.blend")
        self.previous_scene = bpy.context.window.scene
        self.scene = bpy.data.scenes.new("PACKETLOSS Enemies 3D")
        self.scene["packetlossAuthoring"] = "five-enemies-v1"
        self.scene.render.fps = FPS
        self.scene.frame_start = 0
        self.scene.frame_end = LAST_FRAME
        self.scene.unit_settings.system = "NONE"
        bpy.context.window.scene = self.scene
        self.roots = {}
        self.kind = ""
        self.collection = None
        self.materials = {}

    def name(self, role):
        return "PACKETLOSS." + self.kind + "." + role

    def tag(self, obj, role, parent=None):
        obj.name = self.name(role)
        obj["assetRole"] = role
        obj.parent = parent
        if self.collection not in obj.users_collection:
            for collection in list(obj.users_collection):
                collection.objects.unlink(obj)
            self.collection.objects.link(obj)
        return obj

    def empty(self, role, parent=None, location=(0, 0, 0)):
        obj = bpy.data.objects.new(self.name(role), None)
        self.collection.objects.link(obj)
        obj.location = location
        return self.tag(obj, role, parent)

    def material(self, role, color, emission=0, roughness=0.55):
        material = bpy.data.materials.new(self.name(role))
        material["assetRole"] = role
        material.use_nodes = True
        material.diffuse_color = linear_color(color)
        shader = material.node_tree.nodes.get("Principled BSDF")
        shader.inputs["Base Color"].default_value = linear_color(color)
        shader.inputs["Roughness"].default_value = roughness
        shader.inputs["Metallic"].default_value = 0.06
        shader.inputs["Emission Color"].default_value = linear_color(color)
        shader.inputs["Emission Strength"].default_value = emission
        return material

    def activate(self, obj):
        for selected in tuple(bpy.context.selected_objects):
            selected.select_set(False)
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj

    def bevel(self, obj, width):
        if width <= 0:
            return
        self.activate(obj)
        modifier = obj.modifiers.new("Small authored bevel", "BEVEL")
        modifier.width = width
        modifier.segments = 1
        bpy.ops.object.modifier_apply(modifier=modifier.name)

    def box(self, role, dimensions, location, material, parent, bevel=0):
        bpy.ops.mesh.primitive_cube_add(size=1)
        obj = self.tag(bpy.context.object, role, parent)
        obj.dimensions = dimensions
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        obj.location = location
        obj.data.materials.append(material)
        self.bevel(obj, bevel)
        return obj

    def sphere(self, role, radius, material, parent):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=12, radius=radius)
        obj = self.tag(bpy.context.object, role, parent)
        obj.data.materials.append(material)
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
        return obj

    def rod(self, role, start, end, width, material, parent):
        start, end = Vector(start), Vector(end)
        obj = self.box(role, (width, width, (end - start).length), (start + end) / 2,
                       material, parent)
        obj.rotation_euler = (end - start).to_track_quat("Z", "Y").to_euler()
        return obj

    def join(self, objects, role, parent):
        self.activate(objects[0])
        for obj in objects:
            obj.select_set(True)
        bpy.ops.object.join()
        return self.tag(bpy.context.object, role, parent)

    def mesh(self, role, vertices, faces, material, parent):
        mesh = bpy.data.meshes.new(self.name(role))
        mesh.from_pydata(vertices, [], faces)
        mesh.update()
        obj = bpy.data.objects.new(self.name(role), mesh)
        self.collection.objects.link(obj)
        mesh.materials.append(material)
        return self.tag(obj, role, parent)

    def light_surfaces(self, obj, local_top=False):
        # Pale upper facets keep the colored sides readable, like the player's lit edges.
        material_index = len(obj.data.materials)
        obj.data.materials.append(self.materials["shell-light"])
        up = Vector((0, 0, 1))
        if not local_top:
            up = obj.rotation_euler.to_matrix().transposed() @ up
        for polygon in obj.data.polygons:
            if polygon.normal.dot(up) > 0.5:
                polygon.material_index = material_index

    def ring(self, role, radius, tube, parent, material=None, segments=48, sides=6):
        vertices, faces = [], []
        for segment in range(segments):
            angle = segment * math.tau / segments
            for side in range(sides):
                cross = side * math.tau / sides
                r = radius + math.cos(cross) * tube
                vertices.append((r * math.cos(angle), r * math.sin(angle), math.sin(cross) * tube))
        for segment in range(segments):
            if segment % 12 == 11:
                continue
            next_segment = (segment + 1) % segments
            for side in range(sides):
                next_side = (side + 1) % sides
                faces.append((segment * sides + side, next_segment * sides + side,
                              next_segment * sides + next_side, segment * sides + next_side))
        return self.mesh(role, vertices, faces, material or self.materials["accent-edge"], parent)

    def animate(self, obj, sampler, paths):
        for frame in range(0, LAST_FRAME + 1, 3):
            sampler(frame / LAST_FRAME)
            for path in paths:
                obj.keyframe_insert(data_path=path, frame=frame)
        obj.animation_data.action.name = self.name("idle-" + obj["assetRole"])
        sampler(0)

    def expression_mesh(self, role, resting, scared, depth, location, material, parent):
        count = len(resting)
        vertices = [(x, y, z) for z in (-depth / 2, depth / 2) for x, y in resting]
        faces = [tuple(reversed(range(count))), tuple(range(count, count * 2))]
        faces.extend((i, (i + 1) % count, (i + 1) % count + count, i + count)
                     for i in range(count))
        obj = self.mesh(role, vertices, faces, material, parent)
        obj.location = location
        obj.shape_key_add(name="Basis")
        expression = obj.shape_key_add(name="scared")
        for index, (x, y) in enumerate(scared):
            expression.data[index].co = (x, y, -depth / 2)
            expression.data[index + count].co = (x, y, depth / 2)
        return obj

    def eyes(self, parent, location, blink_offset=0):
        face = self.empty("eye-platform", parent, location)
        face.rotation_euler.x = math.radians(20)
        if self.kind not in ("virus", "lag"):
            self.box("face-panel", (4.25, 2.65, 0.18), (0, 0, -0.12),
                     self.materials["shell-dark"], face, 0.08)
        angry_eye = [(-0.45, -0.60), (0.34, -0.60), (0.50, -0.43), (0.50, 0.03),
                     (0.34, 0.20), (-0.35, 0.72), (-0.50, 0.63), (-0.50, -0.43)]
        neutral_eye = [(-0.28, -0.75), (0.28, -0.75), (0.46, -0.56), (0.46, 0.56),
                       (0.28, 0.75), (-0.28, 0.75), (-0.46, 0.56), (-0.46, -0.56)]
        tired_eye = [(-0.36, -0.58), (0.36, -0.58), (0.55, -0.37), (0.55, -0.10),
                     (0.43, 0.02), (-0.43, 0.02), (-0.55, -0.10), (-0.55, -0.37)]
        resting_eye = {"ping": neutral_eye, "lag": tired_eye}.get(self.kind, angry_eye)
        scared_eye = [(-0.32, -0.94), (0.32, -0.94), (0.55, -0.69), (0.55, 0.68),
                      (0.34, 1.02), (-0.29, 0.63), (-0.55, 0.40), (-0.55, -0.69)]
        for i, side in enumerate(("left", "right")):
            x = -0.98 if i == 0 else 0.98
            def mirrored(outline):
                return outline if i == 0 else [(-px, py) for px, py in reversed(outline)]
            resting_shape, scared_shape = mirrored(resting_eye), mirrored(scared_eye)
            if self.kind == "lag" and i == 1:
                resting_shape = [(px, py * 0.8 - 0.08) for px, py in resting_shape]
            self.expression_mesh("eye-socket-" + side,
                                 [(px * 1.35, py * 1.2) for px, py in resting_shape],
                                 [(px * 1.35, py * 1.2) for px, py in scared_shape],
                                 0.22, (x, 0, 0), self.materials["eye-socket"], face)
            eye = self.expression_mesh("eye-" + side, resting_shape, scared_shape,
                                       0.14, (x, 0, 0.17), self.materials["eye-core"], face)
            def blink(phase, target=eye):
                center = 0.42 + blink_offset
                distance = abs(phase - center)
                target.scale.y = 1 - 0.86 * max(0, 1 - distance / 0.025)
            self.animate(eye, blink, ("scale",))

    def firewall(self, motion):
        half = 4.15
        self.box("body-shell", (half * 2,) * 3, (0, 0, 0), self.materials["shell-dark"], motion, 0.16)
        bricks, edges = [], []
        # Broad masonry joints on all vertical sides and the upper face.
        for face in range(4):
            def point(horizontal, vertical, face=face):
                if face == 0:
                    return (horizontal, -half - 0.025, vertical)
                if face == 1:
                    return (half + 0.025, horizontal, vertical)
                if face == 2:
                    return (horizontal, half + 0.025, vertical)
                return (-half - 0.025, horizontal, vertical)
            for z in (-1.38, 1.38):
                bricks.append(self.rod("brick-joint", point(-half, z), point(half, z), 0.18,
                                       self.materials["identity-trim"], motion))
            for row, (bottom, top) in enumerate(((-half, -1.38), (-1.38, 1.38), (1.38, half))):
                for x in ((-2.08, 2.08) if row % 2 else (0,)):
                    bricks.append(self.rod("brick-joint", point(x, bottom), point(x, top), 0.18,
                                           self.materials["identity-trim"], motion))
        for y in (-1.38, 1.38):
            bricks.append(self.rod("brick-top-joint", (-half, y, half + 0.025), (half, y, half + 0.025),
                                   0.18, self.materials["identity-trim"], motion))
        for x, start, end in ((0, -half, -1.38), (-2.08, -1.38, 1.38),
                              (2.08, -1.38, 1.38), (0, 1.38, half)):
            bricks.append(self.rod("brick-top-joint", (x, start, half + 0.025), (x, end, half + 0.025),
                                   0.18, self.materials["identity-trim"], motion))
        self.join(bricks, "firewall-bricks", motion)
        for a in (-half, half):
            for b in (-half, half):
                for axis in range(3):
                    start, end = [a, b], [a, b]
                    start.insert(axis, -half)
                    end.insert(axis, half)
                    edges.append(self.rod("cube-edge", start, end, 0.34, self.materials["accent-edge"], motion))
        self.light_surfaces(self.join(edges, "firewall-edges", motion))
        self.eyes(motion, (0, -0.85, half + 0.46))

    def virus(self, motion):
        self.sphere("body-shell", 3.35, self.materials["shell-dark"], motion)
        spikes_motion = self.empty("spikes-motion", motion)
        directions = [Vector((math.cos(i * math.tau / 8), math.sin(i * math.tau / 8), 0)) for i in range(8)]
        for height in (-0.68, 0.68):
            for i in range(4):
                angle = i * math.tau / 4 + math.pi / 4
                directions.append(Vector((math.cos(angle) * 0.73, math.sin(angle) * 0.73, height)).normalized())
        spikes = []
        for i, direction in enumerate(directions):
            spikes.append(self.rod("spike-stem", direction * 3.1, direction * 4.62, 0.38,
                                   self.materials["identity-trim"], spikes_motion))
            tip = self.box("spike-tip", (0.68, 0.68, 0.5), direction * 4.7,
                           self.materials["accent-edge"], spikes_motion, 0.075)
            tip.rotation_euler = direction.to_track_quat("Z", "Y").to_euler()
            self.light_surfaces(tip, local_top=True)
            spikes.append(tip)
        self.join(spikes, "virus-spikes", spikes_motion)
        def animate_spikes(phase):
            spikes_motion.scale = (1 + 0.016 * math.sin(math.tau * phase),) * 3
            spikes_motion.rotation_euler.z = 0.06 * math.sin(math.tau * phase)
        self.animate(spikes_motion, animate_spikes, ("scale", "rotation_euler"))
        self.eyes(motion, (0, -1.0, 3.22), blink_offset=0.07)

    def ping(self, motion):
        self.sphere("body-shell", 3.65, self.materials["shell-dark"], motion)
        for i, (radius, tilt) in enumerate(((4.25, 0), (4.55, math.radians(58)))):
            ring = self.ring("ping-ring-%02d" % i, radius, 0.4, motion)
            self.light_surfaces(ring)
            def animate_ring(phase, target=ring, tilt=tilt, i=i):
                target.rotation_euler = (tilt, 0, math.tau * phase * (1 if i == 0 else -1))
            self.animate(ring, animate_ring, ("rotation_euler",))
        self.eyes(motion, (0, -0.85, 3.58), blink_offset=0.13)

    def spam(self, motion):
        outline = [(-3.8, -3.2), (-3.8, 1.8), (-3.0, 1.8), (-3.0, 2.65), (-2.1, 2.65),
                   (-2.1, 3.35), (2.1, 3.35), (2.1, 2.65), (3.0, 2.65), (3.0, 1.8),
                   (3.8, 1.8), (3.8, -3.2), (2.35, -3.2), (2.35, -2.45),
                   (1.2, -2.45), (1.2, -3.2), (-1.2, -3.2), (-1.2, -2.45),
                   (-2.35, -2.45), (-2.35, -3.2)]
        count = len(outline)
        vertices = [(x, y, z) for y in (-2.75, 2.75) for x, z in outline]
        faces = [tuple(reversed(range(count))), tuple(range(count, count * 2))]
        faces.extend((i, (i + 1) % count, (i + 1) % count + count, i + count) for i in range(count))
        shell = self.mesh("body-shell", vertices, faces, self.materials["shell-dark"], motion)
        self.bevel(shell, 0.1)
        edges = []
        for y in (-2.78, 2.78):
            for i, (x, z) in enumerate(outline):
                next_x, next_z = outline[(i + 1) % count]
                edges.append(self.rod("enemy-contour", (x, y, z), (next_x, y, next_z), 0.36,
                                       self.materials["accent-edge"], motion))
        for i in (0, 1, 5, 6, 10, 11):
            x, z = outline[i]
            edges.append(self.rod("enemy-depth-edge", (x, -2.75, z), (x, 2.75, z), 0.3,
                                   self.materials["identity-trim"], motion))
        self.light_surfaces(self.join(edges, "spam-outline", motion))
        self.eyes(motion, (0, -0.85, 3.79), blink_offset=0.19)

    def lag(self, motion):
        bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=2.65, depth=6.8)
        shell = self.tag(bpy.context.object, "body-shell", motion)
        shell.data.materials.append(self.materials["shell-dark"])
        self.bevel(shell, 0.14)
        for i, radius in enumerate((3.35, 4.3, 4.75, 4.05, 2.9)):
            ring = self.ring("lag-ring-%02d" % i, radius, 0.2, motion)
            height = (i - 2) * 1.7
            def animate_ring(phase, target=ring, height=height, i=i):
                target.location.z = height + 0.1 * math.sin(math.tau * phase + i * math.tau / 5)
                target.rotation_euler.z = math.tau * phase * (1 if i % 2 else -1) + i * 0.37
            self.animate(ring, animate_ring, ("location", "rotation_euler"))
        self.eyes(motion, (0, -0.8, 3.86), blink_offset=0.25)

    def build(self):
        bpy.context.window.scene = self.scene
        for i, kind in enumerate(KINDS):
            self.kind = kind
            self.collection = bpy.data.collections.new("PACKETLOSS " + kind.title())
            self.scene.collection.children.link(self.collection)
            self.materials = {
                "shell-dark": self.material("shell-dark", "090e19" if kind in ("virus", "lag") else "030b11"),
                "shell-light": self.material("shell-light", "e9fdff", emission=0.3, roughness=0.45),
                "eye-socket": self.material("eye-socket", "010308"),
                "eye-core": self.material("eye-core", "eaffff", emission=0.6),
                "identity-trim": self.material("identity-trim", COLORS[kind], roughness=0.48),
                "accent-edge": self.material("accent-edge", COLORS[kind], emission=0.38, roughness=0.42),
            }
            root = self.empty("enemy-root", location=((i - 2) * 18, 0, 0))
            root["enemyKind"] = kind
            root["bodyFootprint"] = 11
            motion = self.empty("body-motion", root)
            height = {"firewall": 4.6, "virus": 5.3, "ping": 4.8, "spam": 4.3, "lag": 4.65}[kind]
            amount = 0.08 if kind == "firewall" else 0.15
            def hover(phase, target=motion, height=height, amount=amount, kind=kind):
                target.location.z = height + amount * math.sin(math.tau * phase)
                target.scale.z = 1 + (0.022 if kind == "spam" else 0.008) * math.sin(math.tau * phase)
            self.animate(motion, hover, ("location", "scale"))
            getattr(self, kind)(motion)
            self.roots[kind] = root
        self.scene.frame_set(0)
        print("Authored Firewall, Virus, Ping, Spam and Lag in a new Blender scene.")

    def export(self):
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.blend_file.parent.mkdir(parents=True, exist_ok=True)
        bpy.context.window.scene = self.scene
        try:
            for kind, root in self.roots.items():
                location = root.location.copy()
                try:
                    root.location = (0, 0, 0)
                    self.scene.frame_set(0)
                    self.activate(root)
                    for child in root.children_recursive:
                        child.select_set(True)
                    output = self.output_dir / (kind + ".glb")
                    bpy.ops.export_scene.gltf(
                        filepath=str(output), export_format="GLB", use_selection=True,
                        use_active_scene=True, export_yup=True, export_extras=True,
                        export_animations=True, export_animation_mode="ACTIVE_ACTIONS",
                        export_morph=True,
                        export_nla_strips_merged_animation_name="idle", export_force_sampling=True,
                        export_frame_range=True, export_frame_step=1,
                        export_cameras=False, export_lights=False,
                    )
                    normalize_export_names(output)
                    print("Exported " + str(output))
                finally:
                    root.location = location
            self.scene.frame_set(0)
            bpy.ops.wm.save_as_mainfile(filepath=str(self.blend_file), copy=True, check_existing=False)
            print("Saved editable scene copy " + str(self.blend_file))
        finally:
            bpy.context.window.scene = self.previous_scene


def normalize_export_names(path):
    """Keep GLB role names stable even when Blender adds names for existing scene data."""
    data = path.read_bytes()
    json_length = struct.unpack_from("<I", data, 12)[0]
    document = json.loads(data[20:20 + json_length])
    for section in ("nodes", "materials"):
        for entry in document.get(section, []):
            role = entry.get("extras", {}).get("assetRole")
            if role:
                entry["name"] = role
    for animation in document.get("animations", []):
        animation["name"] = "idle"
    encoded = json.dumps(document, separators=(",", ":")).encode()
    encoded += b" " * (-len(encoded) % 4)
    binary = data[20 + json_length:]
    header = struct.pack("<4sII", b"glTF", 2, 20 + len(encoded) + len(binary))
    path.write_bytes(header + struct.pack("<I4s", len(encoded), b"JSON") + encoded + binary)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir")
    parser.add_argument("--blend-file")
    arguments = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    options = parser.parse_args(arguments)
    authoring = EnemyAuthoring(options.output_dir, options.blend_file)
    authoring.build()
    authoring.export()


if __name__ == "__main__":
    main()
