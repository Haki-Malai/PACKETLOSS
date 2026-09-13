import {
  Box3, BoxGeometry, BufferGeometry, Group, Material, Mesh, MeshBasicMaterial,
  OrthographicCamera, Quaternion, Texture, Vector3,
} from 'three';
import { describe, expect, it, vi } from 'vitest';
import { HologramPacket } from '../game/infrastructure/three/HologramPacket';
import { Camera3D } from '../engine/camera3d';

function binary(packet: HologramPacket, index: number): Mesh<BufferGeometry, MeshBasicMaterial> {
  return packet.group.getObjectByName(`binary-${String(index).padStart(3, '0')}`) as Mesh<BufferGeometry, MeshBasicMaterial>;
}

describe('HologramPacket', () => {
  it('faces the camera through rotated parents while preserving the gameplay heading and position', () => {
    const packet = new HologramPacket();
    const parent = new Group();
    parent.rotation.set(0.2, 0.8, -0.3);
    parent.position.set(30, 0, 12);
    parent.add(packet.group);
    packet.group.position.set(8, 0, 24);
    packet.group.rotation.y = Math.PI / 2;
    const heading = packet.group.quaternion.clone();
    const camera = new OrthographicCamera();
    camera.position.set(20, 35, 50);
    camera.lookAt(0, 0, 0);

    packet.faceCamera(camera);
    const facing = new Vector3(0, 0, 1).applyQuaternion(packet.model.getWorldQuaternion(new Quaternion()));
    const towardViewer = new Vector3(0, 0, 1).applyQuaternion(camera.getWorldQuaternion(new Quaternion()));
    expect(facing.dot(towardViewer)).toBeCloseTo(1);
    expect(packet.group.quaternion.equals(heading)).toBe(true);
    expect(packet.group.position.toArray()).toEqual([8, 0, 24]);
    packet.dispose();
  });

  it('drifts and fades binary digits independently and can resample a paused pose', () => {
    const packet = new HologramPacket();
    const other = new HologramPacket();
    const digit = binary(packet, 0);
    const opacities: number[] = [];
    const positions: number[] = [];
    for (let step = 0; step <= 24; step += 1) {
      packet.sample(step / 4);
      opacities.push(digit.material.opacity);
      positions.push(digit.position.y);
    }
    expect(Math.min(...opacities)).toBeLessThan(0.05);
    expect(Math.max(...opacities)).toBeGreaterThan(0.7);
    expect(Math.max(...positions) - Math.min(...positions)).toBeGreaterThan(0.4);
    expect(digit.material).not.toBe(binary(packet, 1).material);
    expect(digit.material).not.toBe(binary(other, 0).material);

    packet.sample(1.25);
    const pose = { position: digit.position.toArray(), opacity: digit.material.opacity };
    packet.sample(4);
    packet.sample(1.25);
    expect({ position: digit.position.toArray(), opacity: digit.material.opacity }).toEqual(pose);
    expect(binary(other, 0).position.toArray()).not.toEqual(digit.position.toArray());
    packet.dispose();
    other.dispose();
  });

  it('blinks its eyes and keeps the animated core above the ground inside the player footprint', () => {
    const packet = new HologramPacket();
    const eye = packet.group.getObjectByName('eye-left')!;
    packet.sample(0);
    const openHeight = eye.scale.y;
    packet.sample(5.43);
    expect(eye.scale.y).toBeLessThan(openHeight / 2);
    packet.sample(5.7);
    expect(eye.scale.y).toBe(openHeight);
    for (let step = 0; step <= 16; step += 1) {
      packet.sample(step / 2);
      packet.group.updateMatrixWorld(true);
      const bounds = new Box3();
      bounds.setFromObject(packet.model.getObjectByName('core')!, true);
      expect(bounds.isEmpty()).toBe(false);
      expect(bounds.min.y).toBeGreaterThan(0);
      expect(bounds.min.x).toBeGreaterThanOrEqual(-5);
      expect(bounds.max.x).toBeLessThanOrEqual(5);
      expect(bounds.min.z).toBeGreaterThanOrEqual(-5);
      expect(bounds.max.z).toBeLessThanOrEqual(5);
      expect(packet.group.position.toArray()).toEqual([0, 0, 0]);
    }
    packet.dispose();
  });

  it('keeps the short trail behind screen-space movement in every direction and decorations inside one tile', () => {
    const packet = new HologramPacket();
    const camera = new Camera3D();
    camera.setBounds(1024, 1024);
    camera.setViewport(240, 240);
    camera.setZoom(5);
    camera.startFollow({ x: 512, y: 512 }, 1, 1);
    camera.snapToFollowTarget();
    camera.present();
    packet.group.position.set(512, 0, 512);
    const trail = packet.group.getObjectByName('motion-trail')!;
    expect(trail.visible).toBe(false);
    for (const [x, y] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      packet.setMotion(x, y, 1);
      packet.group.rotation.y += Math.PI / 2;
      for (const time of [0.2, 1.7, 3.2, 4.9]) {
        packet.sample(time);
        packet.faceCamera(camera.camera);
        expect(trail.visible).toBe(true);
        packet.group.updateMatrixWorld(true);
        const center = packet.model.getWorldPosition(new Vector3());
        const screenCenter = center.clone().project(camera.camera);
        const screenMotion = center.clone().add(new Vector3(x, 0, y)).project(camera.camera).sub(screenCenter);
        for (const piece of trail.children) {
          const behind = piece.getWorldPosition(new Vector3()).project(camera.camera).sub(screenCenter);
          expect(behind.x * screenMotion.x + behind.y * screenMotion.y).toBeLessThan(0);
        }
        const bounds = new Box3().setFromObject(packet.group, true);
        expect(bounds.min.x).toBeGreaterThan(504);
        expect(bounds.max.x).toBeLessThan(520);
        expect(bounds.min.z).toBeGreaterThan(504);
        expect(bounds.max.z).toBeLessThan(520);
      }
    }
    packet.setMotion(0, 0, 0);
    packet.sample(5);
    expect(trail.visible).toBe(false);
    packet.dispose();
  });

  it('disposes owned geometry, materials and shared glow textures once without disposing borrowed root children', () => {
    const packet = new HologramPacket();
    const resources = new Set<BufferGeometry | Material | Texture>();
    packet.group.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const mesh = object as Mesh<BufferGeometry, Material | Material[]>;
      resources.add(mesh.geometry);
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
        resources.add(material);
        for (const value of Object.values(material)) if (value instanceof Texture) resources.add(value as Texture);
      }
    });
    const disposals = [...resources].map((resource) => vi.spyOn(resource, 'dispose'));
    const borrowed = new Mesh(new BoxGeometry(), new MeshBasicMaterial());
    const disposeBorrowed = vi.spyOn(borrowed.geometry, 'dispose');
    packet.group.add(borrowed);
    packet.dispose();
    packet.dispose();
    for (const dispose of disposals) expect(dispose).toHaveBeenCalledOnce();
    expect(disposeBorrowed).not.toHaveBeenCalled();
    borrowed.geometry.dispose();
    borrowed.material.dispose();
  });
});
