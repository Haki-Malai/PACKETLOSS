import {
  Box3, BoxGeometry, BufferGeometry, Group, Material, Mesh, MeshBasicMaterial,
  OrthographicCamera, Quaternion, Texture, Vector3,
} from 'three';
import { describe, expect, it, vi } from 'vitest';
import { HologramPacket, type PacketAppearance } from '../game/infrastructure/three/HologramPacket';
import { resolvePacketScoreTier } from '../game/infrastructure/three/PacketScoreEffects';
import { Camera3D } from '../engine/camera3d';

const appearances: Array<PacketAppearance | undefined> = [undefined,
  ...(['antenna', 'goggles', 'crest', 'headphones'] as const).map((character) => ({ color: '#f065b9', character })),
];

function binary(packet: HologramPacket, index: number): Mesh<BufferGeometry, MeshBasicMaterial> {
  return packet.group.getObjectByName(`binary-${String(index).padStart(3, '0')}`) as Mesh<BufferGeometry, MeshBasicMaterial>;
}

describe('HologramPacket', () => {
  it.each([
    [-10, 'quiet'], [NaN, 'quiet'], [249, 'quiet'], [250, 'trace'],
    [499, 'trace'], [500, 'spark'], [999, 'spark'], [1_000, 'signal'],
    [1_999, 'signal'], [2_000, 'stream'], [3_499, 'stream'], [3_500, 'charge'],
    [4_999, 'charge'], [5_000, 'surge'], [6_499, 'surge'], [6_500, 'radiant'],
    [7_999, 'radiant'], [8_000, 'critical'], [9_999, 'critical'], [10_000, 'overload'],
  ])('selects score cosmetics at the authored threshold (%s)', (score, id) => {
    expect(resolvePacketScoreTier(score).id).toBe(id);
  });

  it('makes every score step visibly stronger without losing earlier binary details', () => {
    const packet = new HologramPacket();
    const glow = packet.group.getObjectByName('score-glow') as Mesh<BufferGeometry, MeshBasicMaterial>;
    const trail = packet.group.getObjectByName('glitch-000') as Mesh<BufferGeometry, MeshBasicMaterial>;
    packet.setMotion(1, 0, 1);
    let previousGlow = -1;
    let previousTrail = -1;
    let previousDigits = new Set<string>();
    for (const score of [0, 250, 500, 1000, 2000, 3500, 5000, 6500, 8000, 10000]) {
      packet.setScore(score);
      packet.sample(1.25);
      const visibleDigits = new Set<string>();
      packet.model.traverse((object) => {
        if (/^(binary-\d|surface-binary-\d)/.test(object.name) && object.visible) visibleDigits.add(object.name);
      });
      if (score < 500) expect(visibleDigits.size).toBe(0);
      for (const name of previousDigits) expect(visibleDigits.has(name)).toBe(true);
      expect(glow.material.opacity).toBeGreaterThan(previousGlow);
      expect(trail.material.opacity).toBeGreaterThan(previousTrail);
      previousGlow = glow.material.opacity;
      previousTrail = trail.material.opacity;
      previousDigits = visibleDigits;
    }
    packet.dispose();
  });

  it('adds score effects progressively and clears them on reset without changing other Packets', () => {
    const packet = new HologramPacket({ color: '#f065b9', character: 'antenna' });
    const solo = new HologramPacket();
    const glow = packet.group.getObjectByName('score-glow') as Mesh<BufferGeometry, MeshBasicMaterial>;
    const trail = packet.group.getObjectByName('glitch-000') as Mesh<BufferGeometry, MeshBasicMaterial>;
    const pixel = packet.group.getObjectByName('surface-pixel-0') as Mesh<BufferGeometry, MeshBasicMaterial>;
    const surface = packet.group.getObjectByName('surface-binary-0') as Mesh<BufferGeometry, MeshBasicMaterial>;
    const eye = packet.group.getObjectByName('eye-left') as Mesh;
    packet.setMotion(1, 0, 1);
    packet.setScore(0);
    packet.sample(1.25);
    for (let index = 0; index < 10; index += 1) expect(binary(packet, index).visible).toBe(false);
    expect(surface.visible).toBe(false);
    expect(pixel.visible).toBe(false);
    expect(glow.visible).toBe(false);
    const quietTrail = trail.material.opacity;

    packet.setScore(1_000);
    packet.sample(1.25);
    expect(binary(packet, 0).visible).toBe(true);
    expect(binary(packet, 4).visible).toBe(false);
    expect(surface.visible).toBe(false);
    expect(glow.visible).toBe(true);
    expect(trail.material.opacity).toBeGreaterThan(quietTrail);
    const signalGlow = glow.material.opacity;
    const signalPixel = pixel.material.opacity;

    packet.setScore(5_000);
    packet.sample(1.25);
    expect(binary(packet, 4).visible).toBe(true);
    expect(binary(packet, 8).visible).toBe(false);
    expect(surface.visible).toBe(true);
    expect(packet.group.getObjectByName('surface-binary-2')!.visible).toBe(false);

    packet.setScore(10_000);
    packet.setPower(true, false, 1);
    packet.sample(1.25);
    expect(binary(packet, 9).visible).toBe(true);
    expect(packet.group.getObjectByName('surface-binary-3')!.visible).toBe(true);
    expect(glow.material.opacity).toBeGreaterThan(signalGlow);
    expect(pixel.material.opacity).toBeGreaterThan(signalPixel);
    expect(glow.material.color.getHexString()).toBe('f065b9');
    expect(eye.morphTargetInfluences![0]).toBe(1);

    packet.setScore(0);
    packet.sample(1.25);
    expect(binary(packet, 0).visible).toBe(false);
    expect(surface.visible).toBe(false);
    expect(pixel.visible).toBe(false);
    expect(glow.visible).toBe(false);
    expect(eye.morphTargetInfluences![0]).toBe(1);
    for (const echo of packet.group.getObjectByName('death-effect')!.children) {
      if (echo instanceof Group) expect(echo.getObjectByName('surface-binary-0')!.visible).toBe(false);
    }

    packet.setScore(null);
    packet.sample(1.25);
    solo.sample(1.25);
    expect(binary(packet, 9).visible).toBe(true);
    expect(surface.visible).toBe(true);
    expect(pixel.visible).toBe(true);
    expect(glow.visible).toBe(false);
    expect(binary(solo, 9).visible).toBe(true);
    expect(solo.group.getObjectByName('score-glow')!.visible).toBe(false);
    packet.dispose();
    solo.dispose();
  });

  it('restores its own color after hunting without tinting solo play', () => {
    const solo = new HologramPacket();
    const custom = new HologramPacket({ color: '#f065b9', character: 'antenna' });
    const rim = custom.group.getObjectByName('rim-horizontal-1-1') as Mesh<BufferGeometry, MeshBasicMaterial>;
    const soloRim = solo.group.getObjectByName('rim-horizontal-1-1') as Mesh<BufferGeometry, MeshBasicMaterial>;
    const originalSoloColor = soloRim.material.color.clone();
    expect(rim.material.color.getHexString()).toBe('f065b9');
    custom.setPower(true, false, 1);
    custom.sample(2);
    expect(rim.material.color.getHexString()).not.toBe('f065b9');
    custom.setPower(false, false, 0);
    custom.sample(3);
    expect(rim.material.color.getHexString()).toBe('f065b9');
    solo.sample(3);
    expect(soloRim.material.color.equals(originalSoloColor)).toBe(true);
    custom.dispose();
    solo.dispose();
  });

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

  it.each(appearances)('disposes owned resources once without disposing borrowed root children (%j)', (appearance) => {
    const packet = new HologramPacket(appearance);
    packet.setScore(12_345);
    packet.setPower(true);
    packet.sample(0);
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

  it('eases the hunter form in and out without a pose jump when power reverses or the clock pauses', () => {
    const packet = new HologramPacket();
    const eye = packet.group.getObjectByName('eye-left') as Mesh<BufferGeometry, MeshBasicMaterial>;
    const rim = packet.group.getObjectByName('rim-horizontal-1-1') as Mesh<BufferGeometry, MeshBasicMaterial>;
    const normalEye = eye.geometry;
    const normalRim = rim.material.color.clone();
    packet.setPower(true);
    packet.sample(1);
    expect(eye.morphTargetInfluences![0]).toBe(0);
    expect(rim.material.color.equals(normalRim)).toBe(true);

    packet.sample(1.16);
    expect(eye.geometry).toBe(normalEye);
    expect(eye.morphTargetInfluences![0]).toBeCloseTo(0.5);
    const halfColor = rim.material.color.clone();
    const halfMorph = eye.morphTargetInfluences![0];
    packet.setPower(true);
    packet.sample(1.16);
    expect(rim.material.color.equals(halfColor)).toBe(true);
    expect(eye.morphTargetInfluences![0]).toBe(halfMorph);

    packet.setPower(false);
    packet.sample(1.16);
    expect(eye.morphTargetInfluences![0]).toBe(halfMorph);
    packet.sample(1.32);
    expect(eye.morphTargetInfluences![0]).toBeGreaterThan(0);
    expect(eye.morphTargetInfluences![0]).toBeLessThan(0.5);
    packet.sample(1.5);
    expect(eye.morphTargetInfluences![0]).toBe(0);
    expect(rim.material.color.equals(normalRim)).toBe(true);

    packet.setPower(true);
    packet.sample(2);
    packet.sample(2.34);
    expect(eye.morphTargetInfluences![0]).toBe(1);
    expect(rim.material.color.getHex()).toBe(0xffc34d);
    packet.dispose();
  });

  it('keeps the mouthless hunter form through absorption without moving the body and clears it on death', () => {
    const packet = new HologramPacket();
    expect(packet.group.getObjectByName('enemy-intake')).toBeUndefined();
    const eye = packet.group.getObjectByName('eye-left') as Mesh<BufferGeometry, MeshBasicMaterial>;
    const rim = packet.group.getObjectByName('rim-horizontal-1-1') as Mesh<BufferGeometry, MeshBasicMaterial>;
    const gaze = packet.group.getObjectByName('eye-gaze')!;
    packet.sample(1);
    const normalEye = eye.geometry;
    const normalRim = rim.material.color.clone();
    const normalGaze = gaze.position.clone();
    const normalBody = packet.model.position.clone();
    const normalScale = packet.model.scale.clone();
    expect(eye.morphTargetInfluences![0]).toBe(0);

    packet.setPower(true, false, 1);
    packet.sample(1);
    expect(eye.geometry).toBe(normalEye);
    expect(eye.morphTargetInfluences![0]).toBe(1);
    expect(rim.material.color.equals(normalRim)).toBe(false);
    packet.setEnemyEatProgress(0.4);
    packet.sample(1);
    expect(packet.model.position.equals(normalBody)).toBe(true);
    expect(packet.model.scale.equals(normalScale)).toBe(true);
    packet.setEnemyEatProgress(1);
    packet.sample(1);
    expect(eye.morphTargetInfluences![0]).toBe(1);
    packet.setPower(false);
    packet.setEnemyEatProgress(0.4);
    packet.sample(1);
    expect(eye.morphTargetInfluences![0]).toBe(1);

    packet.setDeathProgress(0.5);
    packet.sample(1);
    expect(eye.morphTargetInfluences![0]).toBe(0);
    packet.setDeathProgress(null);
    packet.setEnemyEatProgress(null);
    packet.sample(1);
    expect(eye.geometry).toBe(normalEye);
    expect(eye.morphTargetInfluences![0]).toBe(0);
    expect(rim.material.color.equals(normalRim)).toBe(true);
    expect(gaze.position.equals(normalGaze)).toBe(true);
    packet.dispose();
  });

  it('keeps the original eye placement and size through the angry morph without adding antennas', () => {
    const packet = new HologramPacket();
    const face = ['left', 'right'].flatMap((side) => ['eye', 'eye-edge', 'eye-socket', 'glow-eye']
      .map((part) => packet.group.getObjectByName(`${part}-${side}`)!));
    const eye = packet.group.getObjectByName('eye-left') as Mesh;
    for (const [x, z] of [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]]) {
      packet.setMotion(x, z, 1);
      packet.setPower(false, false, 0);
      packet.sample(2);
      const normal = face.map((part) => ({ position: part.getWorldPosition(new Vector3()), scale: part.scale.clone() }));
      for (const amount of [0.5, 1]) {
        packet.setPower(true, false, amount);
        packet.sample(2);
        face.forEach((part, index) => {
          expect(part.getWorldPosition(new Vector3()).distanceTo(normal[index].position)).toBeLessThan(0.000001);
          expect(part.scale.equals(normal[index].scale)).toBe(true);
        });
        expect(eye.morphTargetInfluences![0]).toBe(amount);
      }
    }
    expect(packet.group.getObjectByName('hunter-rig')).toBeUndefined();
    for (const side of [-1, 1]) expect(packet.group.getObjectByName(`hunter-prong-${side}`)).toBeUndefined();
    packet.dispose();
  });
});
