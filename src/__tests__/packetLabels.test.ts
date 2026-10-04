import { Group, Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, Quaternion, Vector3 } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { PacketLabels } from '../game/infrastructure/three/PacketLabels';

/** Supplies a narrow canvas boundary while testing real Three.js resources without a renderer. */
function canvasFactory() {
  const contexts: Array<{ fillText: ReturnType<typeof vi.fn>; fillStyle: string }> = [];
  const create = vi.fn(() => {
    const canvas = { width: 0, height: 0 } as HTMLCanvasElement;
    const context = {
      canvas, clearRect: vi.fn(), fillRect: vi.fn(), fillText: vi.fn(), fillStyle: '',
      measureText: vi.fn((text: string) => ({ width: Array.from(text).length * 24 })),
    };
    canvas.getContext = vi.fn(() => context) as unknown as HTMLCanvasElement['getContext'];
    contexts.push(context);
    return canvas;
  });
  return { create, contexts };
}

describe('PacketLabels', () => {
  it('preserves Unicode names and exact scores while redrawing only the changed label into reusable buffers', () => {
    const { create, contexts } = canvasFactory();
    const labels = new PacketLabels('#ff80a5', create);
    const meshes = labels.group.children as Mesh<PlaneGeometry, MeshBasicMaterial>[];
    const textures = meshes.map((mesh) => mesh.material.map!);
    const buffers = textures.map((texture) => texture.image as HTMLCanvasElement);
    labels.setIdentity('PLAYER', 12345);
    expect(contexts[0].fillText).toHaveBeenLastCalledWith('PLAYER', 256, 48, 480);
    expect(contexts[1].fillText).toHaveBeenLastCalledWith('12345', 256, 48, 480);
    expect(contexts[0].fillStyle).toBe('#ffffff');
    expect(contexts[1].fillStyle).toBe('#ff80a5');
    const versions = textures.map((texture) => texture.version);
    labels.setIdentity('PLAYER', 12345);
    expect(textures.map((texture) => texture.version)).toEqual(versions);
    labels.setIdentity('Χαρά 玩家 🎮', 12345);
    expect(contexts[0].fillText).toHaveBeenLastCalledWith('Χαρά 玩家 🎮', 256, 48, 480);
    expect(contexts[1].fillText).toHaveBeenCalledOnce();
    labels.setIdentity('Χαρά 玩家 🎮', 12346.9);
    expect(contexts[0].fillText).toHaveBeenCalledTimes(2);
    expect(contexts[1].fillText).toHaveBeenLastCalledWith('12346', 256, 48, 480);
    labels.setIdentity('Χαρά 玩家 🎮', -5);
    expect(contexts[1].fillText).toHaveBeenLastCalledWith('0', 256, 48, 480);
    expect(create).toHaveBeenCalledTimes(2);
    expect(textures.map((texture) => texture.image)).toEqual(buffers);
    expect(meshes.map((mesh) => mesh.material.map)).toEqual(textures);
    labels.dispose();
  });

  it('faces the camera through a rotated parent with the name above and score below the Packet center', () => {
    const labels = new PacketLabels('#ff80a5', canvasFactory().create);
    const parent = new Group();
    parent.position.set(30, 0, 12);
    parent.rotation.set(0.2, 0.8, -0.3);
    parent.add(labels.group);
    const originalRotation = parent.quaternion.clone();
    const originalPosition = labels.group.position.clone();
    const camera = new OrthographicCamera(-25, 25, 25, -25, 0.1, 200);
    camera.position.set(35, 35, 60);
    camera.lookAt(30, 0, 12);
    labels.setIdentity('PLAYER', 12345);
    labels.faceCamera(camera);
    const facing = new Vector3(0, 0, 1).applyQuaternion(labels.group.getWorldQuaternion(new Quaternion()));
    const towardViewer = new Vector3(0, 0, 1).applyQuaternion(camera.getWorldQuaternion(new Quaternion()));
    expect(facing.dot(towardViewer)).toBeCloseTo(1);
    const center = labels.group.getWorldPosition(new Vector3()).project(camera);
    const name = labels.group.children[0].getWorldPosition(new Vector3()).project(camera);
    const score = labels.group.children[1].getWorldPosition(new Vector3()).project(camera);
    expect(name.y).toBeGreaterThan(center.y);
    expect(score.y).toBeLessThan(center.y);
    expect(parent.quaternion.equals(originalRotation)).toBe(true);
    expect(labels.group.position.equals(originalPosition)).toBe(true);
    labels.dispose();
  });

  it('disposes its own geometry, textures, and materials once and leaves sibling visuals intact', () => {
    const { create, contexts } = canvasFactory();
    const labels = new PacketLabels('#ff80a5', create);
    const parent = new Group();
    const sibling = new Mesh(new PlaneGeometry(), new MeshBasicMaterial());
    parent.add(labels.group, sibling);
    labels.setIdentity('PLAYER', 12345);
    const meshes = labels.group.children as Mesh<PlaneGeometry, MeshBasicMaterial>[];
    const resources = new Set(meshes.flatMap((mesh) => [mesh.geometry, mesh.material, mesh.material.map!]));
    const dispose = [...resources].map((resource) => vi.spyOn(resource, 'dispose'));
    const siblingDispose = vi.spyOn(sibling.geometry, 'dispose');
    labels.dispose();
    labels.dispose();
    labels.setIdentity('Ignored', 99999);
    dispose.forEach((spy) => expect(spy).toHaveBeenCalledOnce());
    expect(siblingDispose).not.toHaveBeenCalled();
    expect(parent.children).toEqual([sibling]);
    expect(contexts[0].fillText).toHaveBeenCalledOnce();
    sibling.geometry.dispose();
    sibling.material.dispose();
  });
});
