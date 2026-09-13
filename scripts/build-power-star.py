"""Build the solid silver power star without changing other Blender scenes.

Run: blender --background --python scripts/build-power-star.py
Exports a GLB and matching Three.js BufferGeometry with flat normals and linear colors.
"""

import itertools
import json
import math
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]


def linear_color(hex_color):
    rgb = [int(hex_color[index:index + 2], 16) / 255 for index in (0, 2, 4)]
    return tuple(channel / 12.92 if channel <= 0.04045 else ((channel + 0.055) / 1.055) ** 2.4
                 for channel in rgb) + (1,)


def create_star():
    # A cuboctahedron's six square faces and eight triangular faces become spikes.
    # Every base edge is shared by exactly two pyramids, with no internal faces.
    extent = 0.43 / math.sqrt(2)
    coordinates = []
    for zero_axis in range(3):
        for signs in itertools.product((-1, 1), repeat=2):
            value = list(signs)
            value.insert(zero_axis, 0)
            coordinates.append(tuple(component * extent for component in value))
    vertices = [Vector(point) for point in coordinates]
    faces, colors = [], []

    def spike(base, tip, palette):
        apex = len(vertices)
        vertices.append(Vector(tip))
        normal = Vector(tip).normalized()
        center = sum((vertices[index] for index in base), Vector()) / len(base)
        horizontal = (vertices[base[0]] - center).normalized()
        vertical = normal.cross(horizontal)
        ordered = sorted(base, key=lambda index: math.atan2((vertices[index] - center).dot(vertical),
                                                          (vertices[index] - center).dot(horizontal)))
        for index, start in enumerate(ordered):
            face = [start, ordered[(index + 1) % len(ordered)], apex]
            a, b, c = (vertices[vertex] for vertex in face)
            if (b - a).cross(c - a).dot((a + b + c) / 3) < 0:
                face.reverse()
            faces.append(face)
            colors.append(linear_color(palette[index % len(palette)]))

    for axis in range(3):
        for sign in (-1, 1):
            base = [index for index, point in enumerate(coordinates) if point[axis] == sign * extent]
            tip = [0, 0, 0]
            tip[axis] = sign
            spike(base, tip, ("d8dde3", "c0c7cf", "edf0f4", "7c858f"))
    for signs in itertools.product((-1, 1), repeat=3):
        base = [index for index, point in enumerate(coordinates)
                if all(component == 0 or component * sign > 0 for component, sign in zip(point, signs))]
        spike(base, Vector(signs).normalized() * 0.74, ("afb8c3", "e2e7ee", "78838f"))

    mesh = bpy.data.meshes.new("power-star")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    color_attribute = mesh.color_attributes.new(name="Color", type="FLOAT_COLOR", domain="CORNER")
    for polygon, color in zip(mesh.polygons, colors):
        polygon.use_smooth = False
        for loop in polygon.loop_indices:
            color_attribute.data[loop].color = color
    topology = bmesh.new()
    topology.from_mesh(mesh)
    assert all(edge.is_manifold for edge in topology.edges), "Power star must be a closed two-manifold"
    assert topology.calc_volume(signed=True) > 0, "Power star normals must face outward"
    assert len(topology.verts) - len(topology.edges) + len(topology.faces) == 2
    topology.free()
    assert math.isclose(max(vertex.co.length for vertex in mesh.vertices), 1)
    return mesh


def export_geometry(mesh, path):
    positions, normals, colors = [], [], []
    color_attribute = mesh.color_attributes["Color"]
    for polygon in mesh.polygons:
        for loop_index in polygon.loop_indices:
            vertex = mesh.vertices[mesh.loops[loop_index].vertex_index].co
            normal = mesh.corner_normals[loop_index].vector
            # Match glTF's default conversion from Blender Z-up to Three.js Y-up.
            positions.extend((vertex.x, vertex.z, -vertex.y))
            normals.extend((normal.x, normal.z, -normal.y))
            colors.extend(color_attribute.data[loop_index].color[:3])
    attributes = {name: {"itemSize": 3, "type": "Float32Array", "array": [round(value, 8) for value in values]}
                  for name, values in (("position", positions), ("normal", normals), ("color", colors))}
    data = {
        "metadata": {"version": 4.6, "type": "BufferGeometry", "generator": "scripts/build-power-star.py"},
        "name": "power-star", "type": "BufferGeometry",
        "userData": {"source": "public/assets/models/power-point.glb", "spikes": 14},
        "data": {"attributes": attributes},
    }
    path.write_text(json.dumps(data, separators=(",", ":")) + "\n")


def main():
    previous_scene = bpy.context.window.scene
    scene = bpy.data.scenes.new("PACKETLOSS Power Star")
    bpy.context.window.scene = scene
    try:
        mesh = create_star()
        obj = bpy.data.objects.new("power-star", mesh)
        scene.collection.objects.link(obj)
        material = bpy.data.materials.new("silver-star-facets")
        material.use_nodes = True
        material.use_backface_culling = True
        shader = material.node_tree.nodes.get("Principled BSDF")
        shader.inputs["Roughness"].default_value = 0.45
        shader.inputs["Metallic"].default_value = 0.2
        vertex_color = material.node_tree.nodes.new("ShaderNodeVertexColor")
        vertex_color.layer_name = "Color"
        material.node_tree.links.new(vertex_color.outputs["Color"], shader.inputs["Base Color"])
        mesh.materials.append(material)
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        glb_path = ROOT / "public/assets/models/power-point.glb"
        bpy.ops.export_scene.gltf(filepath=str(glb_path), export_format="GLB", use_selection=True, use_active_scene=True,
                                 export_animations=False, export_yup=True, export_normals=True)
        export_geometry(mesh, ROOT / "src/game/infrastructure/three/power-star.json")
        print(f"Exported power star: {len(mesh.vertices)} vertices, {len(mesh.polygons)} triangles, 14 spikes; {glb_path.stat().st_size} GLB bytes")
    finally:
        bpy.context.window.scene = previous_scene


if __name__ == "__main__":
    main()
