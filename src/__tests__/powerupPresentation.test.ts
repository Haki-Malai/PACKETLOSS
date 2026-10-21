import { readFile } from 'node:fs/promises';
import { Box3, BufferGeometry, Camera, Group, Material, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PowerupAssets, OFFENSIVE_POWERUP_ASSETS, type PowerupAssetRole } from '../game/infrastructure/three/PowerupAssets';
import { PowerupPresentation, type PowerupActorPresentation } from '../game/infrastructure/three/PowerupPresentation';
import { HologramPacket } from '../game/infrastructure/three/HologramPacket';
import { createPowerupCombatState } from '../game/simulation/PowerupCombat';
import { isPowerupKind, samplePowerupRadius, type PowerupEffect } from '../game/shared/offensivePowerups';

/** Reads actual authored assets without a browser, dev server, or renderer. */
async function fetchModel(url: string): Promise<Response> {
  const file = await readFile(new URL(`../../public${url}`, import.meta.url));
  return new Response(new Uint8Array(file));
}

/** Builds an authored attack timeline independently of simulation internals. */
function attack(kind: PowerupEffect['kind'], elapsedMs: number): PowerupEffect {
  return { id: 1, ownerId: 'packet', kind, role: 'attack', x: 20, y: 40, angle: 0,
    elapsedMs, durationMs: 1800, radius: kind === 'blast' || kind === 'reverse-blast' ? 64 : 32, length: 12 };
}

describe('Offensive powerup presentation', () => {
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it.each([0, Math.PI / 2, Math.PI, -Math.PI / 2])('seeks a directional body impact at angle %f without moving the gameplay root', async (angle) => {
    vi.stubGlobal('fetch', fetchModel);
    const assets = await PowerupAssets.load(), presentation = new PowerupPresentation(assets);
    const packet = new HologramPacket();
    packet.group.position.set(120, 0, 72);
    packet.group.rotation.y = -angle;
    const actors = new Map<string, PowerupActorPresentation>([['packet', { group: packet.group,
      setPose: (pose) => packet.setCastPose(pose) }]]);
    const camera = new Camera();
    camera.position.set(0, 300, 200); camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
    packet.sample(1); packet.faceCamera(camera);
    const neutral = packet.model.getWorldPosition(new Vector3());
    const combat = createPowerupCombatState();
    const impact: PowerupEffect = { ...attack('laser', 95), role: 'impact', targetId: 'packet',
      angle, x: 120 - Math.cos(angle) * 5, y: 72 - Math.sin(angle) * 5, durationMs: 900, radius: 5 };
    combat.effects.push(impact);
    packet.setDeathProgress(95 / 900);
    presentation.sync(combat, [], actors);
    packet.sample(1); packet.faceCamera(camera);
    const recoil = packet.model.getWorldPosition(new Vector3()).sub(neutral);
    expect(recoil.x).toBeCloseTo(Math.cos(angle) * 3);
    expect(recoil.z).toBeCloseTo(Math.sin(angle) * 3);
    expect(packet.group.position.toArray()).toEqual([120, 0, 72]);
    const flash = presentation.group.getObjectByName('effect:1')!;
    const contact = flash.getObjectByName('laser-wall-impact')!;
    expect(contact.getWorldPosition(new Vector3()).x).toBeCloseTo(impact.x);
    expect(contact.getWorldPosition(new Vector3()).z).toBeCloseTo(impact.y);
    expect(flash.getObjectByName('muzzle-anchor')!.visible).toBe(false);
    const core = contact.getObjectByName('laser-impact-core') as Mesh<BufferGeometry, Material>;
    expect(core.renderOrder).toBeGreaterThan(4);
    expect(contact.scale.x).toBeGreaterThan(0);
    const materialDispose = vi.spyOn(core.material, 'dispose'), geometryDispose = vi.spyOn(core.geometry, 'dispose');
    const frozen = packet.model.getWorldPosition(new Vector3());
    presentation.sync(combat, [], actors); packet.sample(1); packet.faceCamera(camera); packet.faceCamera(camera);
    expect(packet.model.getWorldPosition(new Vector3()).distanceTo(frozen)).toBeLessThan(1e-8);
    const body = packet.group.getObjectByName('hologram-body')!;
    const slice = packet.group.getObjectByName('death-slice-0')!;
    impact.elapsedMs = 350;
    presentation.sync(combat, [], actors); packet.sample(1); packet.faceCamera(camera);
    expect(body.visible).toBe(false);
    expect(slice.visible).toBe(true);
    const drift = slice.getWorldPosition(new Vector3()).sub(packet.model.getWorldPosition(new Vector3()));
    expect(drift.x * Math.cos(angle) + drift.z * Math.sin(angle)).toBeGreaterThan(0);
    impact.elapsedMs = 750;
    presentation.sync(combat, [], actors); packet.sample(1);
    expect(slice.visible).toBe(false);
    expect(presentation.group.children).toHaveLength(0);
    expect(materialDispose).toHaveBeenCalledOnce();
    expect(geometryDispose).not.toHaveBeenCalled();
    impact.elapsedMs = 95;
    presentation.sync(combat, [], actors); packet.sample(1); packet.faceCamera(camera);
    expect(body.visible).toBe(true);
    expect(packet.model.getWorldPosition(new Vector3()).distanceTo(frozen)).toBeLessThan(1e-8);
    combat.effects = [];
    packet.setDeathProgress(null);
    presentation.sync(combat, [], actors); packet.sample(1); packet.faceCamera(camera);
    expect(packet.model.getWorldPosition(new Vector3()).distanceTo(neutral)).toBeLessThan(1e-8);
    presentation.dispose(); assets.dispose(); packet.dispose();
    expect(geometryDispose).toHaveBeenCalledOnce();
  });

  it('presents and rewinds portal returns with retained models that lack the new portal method', async () => {
    vi.stubGlobal('fetch', fetchModel);
    const assets = await PowerupAssets.load();
    const create = assets.create.bind(assets);
    // Reproduce a retained asset factory whose model instances predate the portal presentation method.
    vi.spyOn(assets, 'create').mockImplementation((kind, role) => {
      const model = create(kind, role);
      Object.defineProperty(model, 'showLaserPortal', { value: undefined });
      return model;
    });
    const presentation = new PowerupPresentation(assets);
    const combat = createPowerupCombatState();
    combat.effects.push({ ...attack('laser', 649), laserSegments: [
      { x: 23, y: 40, length: 105, delayMs: 0, end: 'portal' },
      { x: 0, y: 40, length: 128, delayMs: 170, end: 'portal' },
    ] });
    presentation.sync(combat, [], new Map());
    expect(presentation.group.getObjectByName('beam:1:1')).toBeUndefined();
    expect(presentation.group.getObjectByName('portal:1:0')).toBeUndefined();
    expect(presentation.group.getObjectByName('laser-wall-impact')!.visible).toBe(false);
    combat.effects[0].elapsedMs = 735;
    presentation.sync(combat, [], new Map());
    presentation.group.updateMatrixWorld(true);
    const beam = presentation.group.getObjectByName('beam:1:1')!;
    expect(beam.getObjectByName('charge-white-core')!.visible).toBe(false);
    const core = beam.getObjectByName('beam-white-core') as Mesh<BufferGeometry, Material>;
    expect(new Box3().setFromObject(core, true).max.x).toBeCloseTo(64, 1);
    for (const [index, x] of [[0, 128], [1, 0]]) {
      const flash = presentation.group.getObjectByName(`portal:1:${index}`)!;
      expect(flash.getObjectByName('muzzle-anchor')!.visible).toBe(false);
      const contact = flash.getObjectByName('laser-wall-impact')!;
      expect(contact.getWorldPosition(new Vector3()).x).toBeCloseTo(x);
      expect(contact.scale.x).toBeGreaterThan(0);
    }
    const frozen = new Box3().setFromObject(core, true);
    presentation.sync(combat, [], new Map());
    presentation.group.updateMatrixWorld(true);
    expect(new Box3().setFromObject(core, true).equals(frozen)).toBe(true);
    const materialDispose = vi.spyOn(core.material, 'dispose');
    const geometryDispose = vi.spyOn(core.geometry, 'dispose');
    combat.effects[0].elapsedMs = 649;
    presentation.sync(combat, [], new Map());
    expect(presentation.group.getObjectByName('beam:1:1')).toBeUndefined();
    expect(presentation.group.getObjectByName('portal:1:0')).toBeUndefined();
    expect(materialDispose).toHaveBeenCalledOnce();
    expect(geometryDispose).not.toHaveBeenCalled();
    presentation.dispose(); assets.dispose();
    expect(geometryDispose).toHaveBeenCalledOnce();
  });

  it('loads the offensive manifest clips, loops pickups, and independently rewinds a clamped effect', async () => {
    const fetch = vi.fn(fetchModel);
    vi.stubGlobal('fetch', fetch);
    const assets = await PowerupAssets.load();
    expect(fetch).toHaveBeenCalledTimes(OFFENSIVE_POWERUP_ASSETS.length);
    expect(fetch.mock.calls.every(([url]) => !url.includes('magnet'))).toBe(true);
    for (const entry of OFFENSIVE_POWERUP_ASSETS) {
      if (!isPowerupKind(entry.kind)) throw new Error('Unexpected non-offensive asset');
      const model = assets.create(entry.kind, entry.role as PowerupAssetRole);
      model.sample(entry.durationSeconds * 500);
      if (entry.role === 'packet-companion') expect(model.pose(0).eyes).toHaveLength(2);
      assets.release(model);
    }
    const beam = assets.create('laser', 'effect');
    beam.sample(730);
    const core = beam.scene.getObjectByName('beam-white-core')!;
    const visible = core.scale.clone();
    beam.sample(1800);
    expect(core.scale.x).toBeLessThan(0.01);
    beam.sample(730);
    expect(core.scale.equals(visible)).toBe(true);
    const pickup = assets.create('blast', 'pickup');
    pickup.sample(550);
    const first = new Box3().setFromObject(pickup.scene);
    pickup.sample(6550);
    expect(new Box3().setFromObject(pickup.scene).min.distanceTo(first.min)).toBeLessThan(0.001);
    assets.dispose();
  });

  it('keeps the blast upright and centered through charge, outward release, and recovery', async () => {
    vi.stubGlobal('fetch', fetchModel);
    const assets = await PowerupAssets.load();
    const model = assets.create('blast', 'packet-companion');
    model.sample(0);
    const neutral = model.pose(0);
    for (const time of [350, 450, 900, 1600]) {
      model.sample(time);
      const pose = model.pose(0);
      expect(pose.position.distanceTo(neutral.position)).toBeLessThan(0.0001);
      expect(pose.rotation.angleTo(neutral.rotation)).toBeLessThan(0.0001);
      expect(pose.scale.x).toBeCloseTo(pose.scale.y);
      expect(pose.scale.z).toBeCloseTo(pose.scale.y);
      if (time === 350) expect(pose.scale.x).toBeLessThan(1);
      else if (time === 450) expect(pose.scale.x).toBeGreaterThan(1);
      else expect(pose.scale.distanceTo(neutral.scale)).toBeLessThan(0.0001);
    }
    assets.dispose();
  });

  it('retargets authored body and eye curves while preserving player color, roots, and death priority', async () => {
    vi.stubGlobal('fetch', fetchModel);
    const assets = await PowerupAssets.load();
    const presentation = new PowerupPresentation(assets);
    const packet = new HologramPacket({ color: '#ff6699', character: 'crest' });
    packet.group.position.set(20, 0, 40);
    const actors = new Map<string, PowerupActorPresentation>([['packet', {
      group: packet.group, setPose: (pose) => packet.setCastPose(pose),
    }]]);
    const combat = createPowerupCombatState();
    combat.casts.push({ id: 1, kind: 'laser', ownerId: 'packet', elapsedMs: 500, facing: 'right', origin: { x: 20, y: 40 } });
    combat.effects.push(attack('laser', 500));
    const eye = packet.group.getObjectByName('eye-left') as Mesh;
    const rim = packet.group.getObjectByName('rim-horizontal-1-1') as Mesh<never, MeshBasicMaterial>;
    const color = rim.material.color.clone();
    packet.sample(0.5);
    const neutralEye = eye.scale.y;
    presentation.sync(combat, [], actors);
    packet.sample(0.5);
    packet.faceCamera(new Camera());
    expect(eye.scale.y).toBeLessThan(neutralEye);
    expect(rim.material.color.equals(color)).toBe(true);
    expect(packet.group.position.toArray()).toEqual([20, 0, 40]);
    const posed = packet.model.position.clone();
    packet.faceCamera(new Camera());
    expect(packet.model.position.equals(posed)).toBe(true);
    const duplicateBodies: Mesh[] = [];
    presentation.group.traverse((object) => {
      if (object instanceof Mesh && object.name.startsWith('packet-pose') && object.visible) duplicateBodies.push(object as Mesh);
    });
    expect(duplicateBodies).toEqual([]);
    packet.setDeathProgress(0.2);
    packet.sample(0.5);
    expect(packet.group.getObjectByName('hologram-body')!.scale.toArray()).toEqual([1.2, 1, 1]);
    combat.casts.length = combat.effects.length = 0;
    presentation.sync(combat, [], actors);
    packet.setDeathProgress(null);
    packet.sample(0.5);
    expect(eye.scale.y).toBe(neutralEye);
    presentation.dispose(); assets.dispose(); packet.dispose();
  });

  it('matches the blast front and complete laser DNA geometry to authoritative radius and muzzle reach', async () => {
    vi.stubGlobal('fetch', fetchModel);
    const assets = await PowerupAssets.load();
    const blast = assets.create('blast', 'effect');
    blast.sample(700);
    const radius = samplePowerupRadius('blast', 700);
    blast.group.updateMatrixWorld(true);
    const ring = blast.scene.getObjectByName('blast-pulse-front')!;
    const ringBounds = new Box3().setFromObject(ring, true);
    expect(ringBounds.max.x).toBeCloseTo(radius);
    expect(ringBounds.min.z).toBeCloseTo(-radius);
    const beam = assets.create('laser', 'effect');
    beam.sample(500);
    beam.group.position.set(20, 0, 40);
    beam.group.rotation.y = -Math.PI / 2;
    beam.clipLaser(20, 40, 0, 12);
    beam.group.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(beam.scene.getObjectByName('beam-white-core')!);
    expect(bounds.min.x).toBeCloseTo(23);
    expect(bounds.max.x).toBeCloseTo(35);
    beam.clipLaser(20, 40, 0, 180);
    beam.group.updateMatrixWorld(true);
    const extended = new Box3().setFromObject(beam.scene.getObjectByName('beam-white-core')!);
    expect(extended.min.x).toBeCloseTo(23);
    expect(extended.max.x).toBeCloseTo(203);
    const filaments: Mesh[] = [];
    beam.scene.traverse((object) => {
      if (object instanceof Mesh && object.name.startsWith('helical-beam-filament')) filaments.push(object as Mesh);
    });
    expect(filaments).toHaveLength(2);
    for (const filament of filaments) {
      const dna = new Box3().setFromObject(filament);
      expect(dna.min.x).toBeCloseTo(23, 0);
      expect(dna.max.x).toBeCloseTo(203, 0);
    }
    const materials = new Set<Material>();
    beam.scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const mesh = object as Mesh<BufferGeometry, Material | Material[]>;
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
    });
    for (const material of materials) {
      beam.clipLaser(20, 40, 0, 12);
      const shader = { uniforms: {}, vertexShader: '#include <project_vertex>', fragmentShader: 'void main() {' } as unknown as Parameters<Material['onBeforeCompile']>[0];
      material.onBeforeCompile(shader, {} as Parameters<Material['onBeforeCompile']>[1]);
      expect(shader.fragmentShader).toContain('> powerupLength) discard');
      expect(shader.uniforms.powerupOrigin.value).toEqual(new Vector3(23, 0, 40));
      expect(shader.uniforms.powerupLength.value).toBe(12);
      beam.clipLaser(20, 40, 0, 8);
      expect(shader.uniforms.powerupLength.value).toBe(8);
    }
    assets.dispose();
  });

  it('plays the dark reverse well inward, recovers its cast, and releases only instance materials', async () => {
    vi.stubGlobal('fetch', fetchModel);
    const assets = await PowerupAssets.load();
    const presentation = new PowerupPresentation(assets);
    const cast = assets.create('reverse-blast', 'packet-companion');
    cast.sample(0);
    const neutral = cast.pose(0);
    const combat = createPowerupCombatState();
    combat.effects.push({ ...attack('reverse-blast', 350), durationMs: 1100 });
    presentation.sync(combat, [], new Map());
    const well = presentation.group.getObjectByName('reverse-blast-dark-well') as Mesh<BufferGeometry, MeshBasicMaterial>;
    presentation.group.updateMatrixWorld(true);
    expect(new Box3().setFromObject(well, true).max.x).toBeCloseTo(84);
    const start = well.scale.x;
    combat.effects[0].elapsedMs = 720;
    presentation.sync(combat, [], new Map());
    expect(well.scale.x).toBeLessThan(start);
    const paused = well.scale.clone();
    presentation.sync(combat, [], new Map());
    expect(well.scale.equals(paused)).toBe(true);
    combat.effects[0].elapsedMs = 350;
    presentation.sync(combat, [], new Map());
    expect(well.scale.x).toBeCloseTo(start);
    cast.sample(1100);
    const recovered = cast.pose(0);
    expect(recovered.position.distanceTo(neutral.position)).toBeLessThan(0.0001);
    expect(recovered.rotation.angleTo(neutral.rotation)).toBeLessThan(0.0001);
    expect(recovered.scale.distanceTo(neutral.scale)).toBeLessThan(0.0001);
    const materialDisposal = vi.spyOn(well.material, 'dispose');
    const geometryDisposal = vi.spyOn(well.geometry, 'dispose');
    combat.effects[0].elapsedMs = 1100;
    presentation.sync(combat, [], new Map());
    expect(presentation.group.children).toHaveLength(0);
    expect(materialDisposal).toHaveBeenCalledOnce();
    expect(geometryDisposal).not.toHaveBeenCalled();
    presentation.dispose(); assets.dispose(); assets.dispose();
    expect(materialDisposal).toHaveBeenCalledOnce();
    expect(geometryDisposal).toHaveBeenCalledOnce();
  });

  it('positions the GLB wall contact at full beam reach, rewinds its clip, and preserves shared geometry', async () => {
    vi.stubGlobal('fetch', fetchModel);
    const assets = await PowerupAssets.load();
    const presentation = new PowerupPresentation(assets);
    const combat = createPowerupCombatState();
    combat.clockMs = 1000;
    combat.effects.push({ ...attack('laser', 565), length: 90 });
    presentation.sync(combat, [], new Map(), 1084);
    const impact = presentation.group.getObjectByName('laser-wall-impact')!;
    expect(impact.scale.length()).toBe(0);
    presentation.sync(combat, [], new Map(), 1085);
    expect(impact.scale.x).toBeCloseTo(1);
    const point = impact.getWorldPosition(new Vector3());
    expect(point.x).toBeCloseTo(203, 1);
    expect(point.y).toBeCloseTo(6.15);
    expect(point.z).toBeCloseTo(40);
    const contact = new Box3().setFromObject(impact);
    presentation.sync(combat, [], new Map(), 1085);
    expect(new Box3().setFromObject(impact).equals(contact)).toBe(true);
    presentation.sync(combat, [], new Map(), 1185);
    expect(new Box3().setFromObject(impact).equals(contact)).toBe(false);
    presentation.sync(combat, [], new Map(), 1085);
    expect(new Box3().setFromObject(impact).equals(contact)).toBe(true);
    expect(combat.effects[0]).toMatchObject({ elapsedMs: 565, length: 90 });
    combat.effects[0].length = 30;
    presentation.sync(combat, [], new Map(), 1085);
    expect(impact.getWorldPosition(new Vector3()).x).toBeCloseTo(83, 1);
    combat.effects[0].length = 0;
    presentation.sync(combat, [], new Map(), 1085);
    expect(impact.visible).toBe(false);
    const geometries = new Set<BufferGeometry>();
    const materials = new Set<Material>();
    impact.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const mesh = object as Mesh<BufferGeometry, MeshBasicMaterial>;
      geometries.add(mesh.geometry);
      materials.add(mesh.material);
    });
    const disposals = [...materials].map((resource) => vi.spyOn(resource, 'dispose'));
    const geometryDisposals = [...geometries].map((resource) => vi.spyOn(resource, 'dispose'));
    const core = presentation.group.getObjectByName('beam-white-core') as Mesh<BufferGeometry>;
    const sharedDisposal = vi.spyOn(core.geometry, 'dispose');
    combat.effects.length = 0;
    presentation.sync(combat, [], new Map(), 1085);
    for (const dispose of disposals) expect(dispose).toHaveBeenCalledOnce();
    for (const dispose of geometryDisposals) expect(dispose).not.toHaveBeenCalled();
    expect(sharedDisposal).not.toHaveBeenCalled();
    presentation.dispose(); presentation.dispose(); assets.dispose(); assets.dispose();
    for (const dispose of [...disposals, ...geometryDisposals]) expect(dispose).toHaveBeenCalledOnce();
    expect(sharedDisposal).toHaveBeenCalledOnce();
  });

  it('seeks late snapshots once, freezes at unchanged clocks, and absorbs from the actual pickup location', async () => {
    vi.stubGlobal('fetch', fetchModel);
    const assets = await PowerupAssets.load();
    const presentation = new PowerupPresentation(assets);
    const combat = createPowerupCombatState();
    combat.clockMs = 1000;
    combat.effects.push({ ...attack('blast', 150), role: 'collection', source: { x: 4, y: 10 }, durationMs: 300 });
    const packet = new Group(); packet.position.set(20, 0, 40);
    const actors = new Map<string, PowerupActorPresentation>([['packet', { group: packet, setPose: () => undefined }]]);
    presentation.sync(combat, [{ id: 7, kind: 'missile', x: 16, y: 16 }], actors);
    const collection = presentation.group.getObjectByName('effect:1')!;
    const bounds = new Box3().setFromObject(collection);
    presentation.sync(combat, [{ id: 7, kind: 'missile', x: 16, y: 16 }], actors);
    expect(presentation.group.getObjectByName('effect:1')).toBe(collection);
    expect(new Box3().setFromObject(collection).equals(bounds)).toBe(true);
    expect(presentation.group.children).toHaveLength(2);
    combat.effects[0].elapsedMs = 301;
    presentation.sync(combat, [], actors);
    expect(presentation.group.children).toHaveLength(0);
    presentation.dispose(); assets.dispose();
  });

  it('keeps released attacks anchored and visible after their owner disappears', async () => {
    vi.stubGlobal('fetch', fetchModel);
    const assets = await PowerupAssets.load();
    const presentation = new PowerupPresentation(assets);
    const combat = createPowerupCombatState();
    combat.effects.push({ ...attack('blast', 700), durationMs: 1600 });
    const packet = new Group(); packet.position.set(100, 0, 200);
    presentation.sync(combat, [], new Map([['packet', { group: packet, setPose: () => undefined }]]));
    const effect = presentation.group.getObjectByName('effect:1')!;
    expect(effect.position.toArray()).toEqual([20, 0, 40]);
    presentation.sync(combat, [], new Map());
    expect(presentation.group.getObjectByName('effect:1')).toBe(effect);
    combat.effects[0].elapsedMs = 1601;
    presentation.sync(combat, [], new Map());
    expect(presentation.group.children).toHaveLength(0);
    presentation.dispose(); assets.dispose();
  });

  it('removes a missile at its known lifetime without waiting for another authoritative snapshot', async () => {
    vi.stubGlobal('fetch', fetchModel);
    const assets = await PowerupAssets.load();
    const presentation = new PowerupPresentation(assets);
    const combat = createPowerupCombatState();
    combat.clockMs = 1000;
    combat.projectiles.push({ id: 8, ownerId: 'packet', targetId: null, x: 16, y: 32, angle: 0, elapsedMs: 2950, turns: [] });
    presentation.sync(combat, [], new Map(), 1049);
    const missile = presentation.group.getObjectByName('projectile:8')!;
    expect(missile).toBeDefined();
    const materials = new Set<Material>();
    missile.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const mesh = object as Mesh<BufferGeometry, Material | Material[]>;
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
    });
    const disposals = [...materials].map((material) => vi.spyOn(material, 'dispose'));
    presentation.sync(combat, [], new Map(), 1050);
    expect(presentation.group.children).toHaveLength(0);
    expect(combat.projectiles).toHaveLength(1);
    expect(combat.effects).toHaveLength(0);
    for (const dispose of disposals) expect(dispose).toHaveBeenCalledOnce();
    presentation.sync(combat, [], new Map(), 1060);
    presentation.dispose(); assets.dispose();
    for (const dispose of disposals) expect(dispose).toHaveBeenCalledOnce();
  });

  it('attaches Trace assembly to the moving Packet and reveals its retained flight model only on release', async () => {
    vi.stubGlobal('fetch', fetchModel);
    const assets = await PowerupAssets.load(), presentation = new PowerupPresentation(assets);
    const packet = new Group(); packet.position.set(24, 0, 24);
    const owner: PowerupActorPresentation = { group: packet, direction: 'right', setPose: () => undefined };
    const actors = new Map([['packet', owner]]), combat = createPowerupCombatState();
    combat.casts.push({ id: 7, ownerId: 'packet', kind: 'missile', facing: 'right', elapsedMs: 100, origin: null });
    presentation.sync(combat, [], actors);
    const missile = presentation.group.getObjectByName('projectile:7')!;
    const launch = presentation.group.getObjectByName('launch:7')!;
    expect(missile.visible).toBe(false);
    expect(launch.visible).toBe(true);
    expect(missile.position.toArray()).toEqual([24, 0, 24]);
    expect(launch.position.toArray()).toEqual([24, 0, 24]);
    packet.position.set(56, 0, 48); owner.direction = 'down';
    combat.casts[0].elapsedMs = 999;
    presentation.sync(combat, [], actors);
    expect(missile.position.toArray()).toEqual([56, 0, 48]);
    expect(launch.position.toArray()).toEqual([56, 0, 48]);
    expect(missile.rotation.y).toBe(-Math.PI);
    expect(launch.rotation.y).toBe(-Math.PI);
    presentation.sync(combat, [], actors, 10);
    expect(presentation.group.getObjectByName('projectile:7')).toBe(missile);
    expect(missile.visible).toBe(false);
    expect(missile.position.toArray()).toEqual([56, 0, 48]);
    combat.casts.length = 0;
    combat.projectiles.push({ id: 7, ownerId: 'packet', targetId: null, x: 56, y: 48,
      angle: Math.PI / 2, elapsedMs: 0, turns: [] });
    presentation.sync(combat, [], actors);
    expect(presentation.group.getObjectByName('projectile:7')).toBe(missile);
    expect(presentation.group.getObjectByName('launch:7')).toBeUndefined();
    expect(missile.visible).toBe(true);
    packet.position.set(72, 0, 48); owner.direction = 'right';
    combat.projectiles[0].y = 60; combat.projectiles[0].elapsedMs = 100;
    presentation.sync(combat, [], actors);
    expect(missile.position.toArray()).toEqual([56, 0, 60]);
    expect(missile.rotation.y).toBe(-Math.PI);
    combat.projectiles.length = 0;
    presentation.sync(combat, [], actors);
    expect(presentation.group.children).toHaveLength(0);
    presentation.dispose(); assets.dispose();
  });

  it('releases instance materials at expiry and template resources only when their owner is disposed', async () => {
    vi.stubGlobal('fetch', fetchModel);
    const assets = await PowerupAssets.load();
    const presentation = new PowerupPresentation(assets);
    presentation.sync(createPowerupCombatState(), [{ id: 1, kind: 'missile', x: 16, y: 16 }], new Map());
    const meshes: Mesh[] = [];
    presentation.group.traverse((object) => { if (object instanceof Mesh) meshes.push(object as Mesh); });
    const geometrySpies = [...new Set(meshes.map((mesh) => mesh.geometry))].map((geometry) => vi.spyOn(geometry, 'dispose'));
    const materials = new Set(meshes.flatMap((mesh) => Array.isArray(mesh.material) ? mesh.material : [mesh.material]));
    const materialSpies = [...materials].map((material) => vi.spyOn(material, 'dispose'));
    presentation.sync(createPowerupCombatState(), [], new Map());
    for (const dispose of materialSpies) expect(dispose).toHaveBeenCalledOnce();
    for (const dispose of geometrySpies) expect(dispose).not.toHaveBeenCalled();
    presentation.dispose(); presentation.dispose(); assets.dispose(); assets.dispose();
    for (const dispose of materialSpies) expect(dispose).toHaveBeenCalledOnce();
    for (const dispose of geometrySpies) expect(dispose).toHaveBeenCalledOnce();
  });
});
