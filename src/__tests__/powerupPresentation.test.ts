import { readFile } from 'node:fs/promises';
import { Box3, BufferGeometry, Camera, Group, Material, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PowerupAssets, OFFENSIVE_POWERUP_ASSETS, type PowerupAssetRole } from '../game/infrastructure/three/PowerupAssets';
import { PowerupPresentation, type PowerupActorPresentation } from '../game/infrastructure/three/PowerupPresentation';
import { HologramPacket } from '../game/infrastructure/three/HologramPacket';
import { EnemyEffects } from '../game/infrastructure/three/EnemyEffects';
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
    elapsedMs, durationMs: 1800, radius: kind === 'blast' ? 64 : 32, length: 12 };
}

describe('Offensive powerup presentation', () => {
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

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
    blast.setBlastRadius(radius);
    blast.group.updateMatrixWorld(true);
    const ring = blast.scene.getObjectByName('blast-pulse-front')!;
    const ringBounds = new Box3().setFromObject(ring);
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

  it('reuses Ping for blast without recoloring it, freezes and rewinds impact accents, and releases only owned resources', async () => {
    vi.stubGlobal('fetch', fetchModel);
    const assets = await PowerupAssets.load();
    const presentation = new PowerupPresentation(assets);
    const ping = new EnemyEffects();
    ping.sync([{ kind: 'ping', x: 8, y: 8, radius: 128, ageMs: 300, durationMs: 600 }], []);
    const pingRing = ping.group.getObjectByName('ping-pulse') as Mesh<BufferGeometry, MeshBasicMaterial>;
    const pingDisposals = [pingRing.geometry, pingRing.material].map((resource) => vi.spyOn(resource, 'dispose'));
    const combat = createPowerupCombatState();
    combat.clockMs = 1000;
    combat.effects.push({ ...attack('blast', 449), durationMs: 1600 });
    presentation.sync(combat, [], new Map());
    const pulse = presentation.group.getObjectByName('blast-ping-pulse')!;
    expect(pulse.visible).toBe(false);
    presentation.sync(combat, [], new Map(), 1376);
    expect(pulse.visible).toBe(true);
    const front = pulse.getObjectByName('blast-pulse-front') as Mesh<BufferGeometry, MeshBasicMaterial>;
    const authored = presentation.group.getObjectByName('expanding-shock-front') as Mesh<BufferGeometry, MeshBasicMaterial>;
    expect(front.material.color.equals(authored.material.color)).toBe(true);
    expect(front.material).not.toBe(pingRing.material);
    presentation.group.updateMatrixWorld(true);
    expect(new Box3().setFromObject(front).max.x).toBeCloseTo(76);
    const paused = new Box3().setFromObject(pulse);
    presentation.sync(combat, [], new Map(), 1376);
    expect(new Box3().setFromObject(pulse).equals(paused)).toBe(true);
    presentation.sync(combat, [], new Map(), 1476);
    expect(new Box3().setFromObject(pulse).equals(paused)).toBe(false);
    presentation.sync(combat, [], new Map(), 1376);
    expect(new Box3().setFromObject(pulse).equals(paused)).toBe(true);
    expect(combat.effects[0].elapsedMs).toBe(449);
    const resources = new Set<BufferGeometry | Material>();
    pulse.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const mesh = object as Mesh<BufferGeometry, MeshBasicMaterial>;
      resources.add(mesh.geometry); resources.add(mesh.material);
    });
    const disposals = [...resources].map((resource) => vi.spyOn(resource, 'dispose'));
    const sharedDisposal = vi.spyOn(authored.geometry, 'dispose');
    presentation.sync(combat, [], new Map(), 2151);
    expect(presentation.group.children).toHaveLength(0);
    for (const dispose of disposals) expect(dispose).toHaveBeenCalledOnce();
    expect(sharedDisposal).not.toHaveBeenCalled();
    expect(pingRing.material.color.getHex()).toBe(0x68ff72);
    expect(pingRing.material.opacity).toBeCloseTo(0.4);
    expect(pingRing.scale.x).toBeCloseTo(66.56);
    for (const dispose of pingDisposals) expect(dispose).not.toHaveBeenCalled();
    presentation.dispose(); assets.dispose(); assets.dispose(); ping.dispose();
    for (const dispose of [...disposals, ...pingDisposals]) expect(dispose).toHaveBeenCalledOnce();
    expect(sharedDisposal).toHaveBeenCalledOnce();
  });

  it('animates wall contact at the full beam endpoint after growth, rewinds paused samples, and releases private resources', async () => {
    vi.stubGlobal('fetch', fetchModel);
    const assets = await PowerupAssets.load();
    const presentation = new PowerupPresentation(assets);
    const combat = createPowerupCombatState();
    combat.clockMs = 1000;
    combat.effects.push({ ...attack('laser', 565), length: 90 });
    presentation.sync(combat, [], new Map(), 1084);
    const impact = presentation.group.getObjectByName('laser-wall-impact')!;
    expect(impact.visible).toBe(false);
    presentation.sync(combat, [], new Map(), 1085);
    expect(impact.visible).toBe(true);
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
    const disposals = [...geometries, ...materials].map((resource) => vi.spyOn(resource, 'dispose'));
    const core = presentation.group.getObjectByName('beam-white-core') as Mesh<BufferGeometry>;
    const sharedDisposal = vi.spyOn(core.geometry, 'dispose');
    combat.effects.length = 0;
    presentation.sync(combat, [], new Map(), 1085);
    for (const dispose of disposals) expect(dispose).toHaveBeenCalledOnce();
    expect(sharedDisposal).not.toHaveBeenCalled();
    presentation.dispose(); presentation.dispose(); assets.dispose(); assets.dispose();
    for (const dispose of disposals) expect(dispose).toHaveBeenCalledOnce();
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
