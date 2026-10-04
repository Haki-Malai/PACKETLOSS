// @vitest-environment jsdom
import {
  Box3, BufferGeometry, InstancedMesh, Material, Mesh, MeshBasicMaterial, Object3D, OrthographicCamera,
  Raycaster, Scene, Vector3,
} from 'three';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Camera3D } from '../engine/camera3d';
import { buildMazeWallFootprint } from '../game/domain/world/MazeFootprint';
import type { MultiplayerConnectionSnapshot } from '../game/infrastructure/adapters/MultiplayerSocketClient';
import { MazeScene } from '../game/infrastructure/three/MazeScene';
import {
  battleArenaBounds, battleArenaOuterBounds, createBattleArenaMap, createBattleArenaWorldMap,
} from '../game/simulation/BattleArenaMap';
import { MultiplayerSynchronization } from '../game/simulation/MultiplayerSynchronization';
import { DataRace } from '../game/simulation/DataRace';
import { RACE } from '../game/simulation/types';
import { MultiplayerPresentationSession } from '../game/ui/MultiplayerPresentation';
import { createCollisionTile, createMapFixture } from './fixtures/renderFixtures';

const renderer = vi.hoisted(() => ({
  width: 800, height: 600, pixelRatio: 1,
  resize: vi.fn(), recordFrame: vi.fn(), prepare: vi.fn(async () => {}), dispose: vi.fn(),
  render: vi.fn<(_scene: Scene, _camera: OrthographicCamera) => void>(),
}));
vi.mock('../game/infrastructure/adapters/ThreeRendererAdapter', () => ({
  ThreeRendererAdapter: vi.fn(function () { return renderer; }),
}));

const map = createBattleArenaMap(0x12345678);

/** Checks one exposed outline through its actual instanced strip geometry. */
function outlineAt(mesh: InstancedMesh, x: number, z: number): boolean {
  mesh.updateMatrixWorld(true);
  return new Raycaster(new Vector3(x, 30, z), new Vector3(0, -1, 0)).intersectObject(mesh).length > 0;
}

/** Observes unique GPU resources so completion and interrupted animations cannot leak or dispose twice. */
function watchDisposal(group: Object3D) {
  const resources = new Set<{ dispose(): void }>();
  group.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const mesh = object as Mesh<BufferGeometry, Material | Material[]>;
    resources.add(mesh.geometry);
    (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((material) => resources.add(material));
    if (object instanceof InstancedMesh) resources.add(object);
  });
  return [...resources].map((resource) => vi.spyOn(resource, 'dispose'));
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('Battle Royale perimeter presentation', () => {
  it('keeps full boundary rails and open portals at all 21 sizes without retired floors or walls', () => {
    for (let stage = 0; stage <= RACE.maxShrinkStage; stage += 1) {
      const world = createBattleArenaWorldMap(map, stage);
      const footprint = buildMazeWallFootprint(world);
      const bounds = battleArenaBounds(stage);
      const outer = battleArenaOuterBounds(stage);
      for (let tile = bounds.minX; tile <= bounds.maxX; tile += 1) {
        const center = tile * 16 + 8;
        for (let offset = -2; offset < 2; offset += 1) {
          for (const seam of [bounds.minX * 16, (bounds.maxX + 1) * 16]) {
            expect(footprint.solid[center * footprint.width + seam + offset]).toBe(tile === 25 ? 0 : 1);
            expect(footprint.solid[(seam + offset) * footprint.width + center]).toBe(tile === 24 ? 0 : 1);
          }
        }
      }
      // Classic's three-pixel corner cap joins both rails without outward wall stubs.
      for (const [cornerX, inwardX] of [[outer.minX * 16, 1], [(outer.maxX + 1) * 16 - 1, -1]]) {
        for (const [cornerY, inwardY] of [[outer.minY * 16, 1], [(outer.maxY + 1) * 16 - 1, -1]]) {
          const occupied: string[] = [];
          for (let y = 0; y < 16; y += 1) {
            for (let x = 0; x < 16; x += 1) {
              if (footprint.solid[(cornerY + y * inwardY) * footprint.width + cornerX + x * inwardX]) {
                occupied.push(`${x},${y}`);
              }
            }
          }
          expect(occupied).toEqual(['15,14', '14,15', '15,15']);
        }
      }
      const maze = new MazeScene({
        map: world, pulsingPerimeter: outer,
        nextMap: stage < RACE.maxShrinkStage ? createBattleArenaWorldMap(map, stage + 1) : undefined,
      });
      const walls = maze.group.getObjectByName('walls') as Mesh;
      const floor = maze.group.getObjectByName('floor') as InstancedMesh;
      expect(floor.count).toBe((49 - stage * 2) ** 2);
      const extent = new Box3().setFromObject(maze.group);
      expect(extent.min.x).toBeGreaterThanOrEqual(stage * 16 - 0.2);
      expect(extent.min.z).toBeGreaterThanOrEqual(stage * 16 - 0.2);
      expect(extent.max.x).toBeLessThanOrEqual((49 - stage) * 16 + 0.2);
      expect(extent.max.z).toBeLessThanOrEqual((49 - stage) * 16 + 0.2);
      // Playable tile centers stay clear of wall bodies and warning strips.
      const ray = new Raycaster(new Vector3(bounds.minX * 16 + 8, 30, bounds.minY * 16 + 8), new Vector3(0, -1, 0));
      expect(ray.intersectObject(walls)).toHaveLength(0);
      const perimeter = maze.group.getObjectByName('perimeter-wall-edges') as InstancedMesh;
      expect(ray.intersectObject(perimeter)).toHaveLength(0);
      maze.dispose();
    }
  });

  it('pulses the perimeter and disappearing branches while surviving wall segments stay steady', () => {
    const { map: authored } = createMapFixture(Array.from({ length: 5 }, () =>
      Array.from({ length: 5 }, () => createCollisionTile())));
    authored.tiles.flat().forEach((tile) => { tile.localId = null; });
    // A left boundary at x=16, joined by a horizontal interior branch at z=48.
    for (const y of [1, 2, 3]) {
      Object.assign(authored.tiles[y][0], { localId: y === 3 ? 23 : 0, flipX: y !== 3 });
      authored.tiles[y][1].localId = y === 3 ? 14 : y === 2 ? 10 : 0;
      authored.tiles[y][1].rotation = y === 2 ? Math.PI / 2 : 0;
    }
    authored.tiles[3][1].rotation = Math.PI / 2;
    Object.assign(authored.tiles[2][2], { localId: 0, rotation: 3 * Math.PI / 2 });
    const nextMap = structuredClone(authored);
    // The next rail at x=32 removes the branch before x=30 and retains the branch beyond x=34.
    Object.assign(nextMap.tiles[2][1], { localId: 0, rotation: 0, flipX: true });
    Object.assign(nextMap.tiles[2][2], { localId: 10, rotation: Math.PI / 2 });
    const maze = new MazeScene({ map: authored, pulsingPerimeter: { minX: 0, maxX: 4, minY: 0, maxY: 4 }, nextMap });
    const perimeter = maze.group.getObjectByName('perimeter-wall-edges') as InstancedMesh;
    const interior = maze.group.getObjectByName('wall-edges') as InstancedMesh;
    for (const x of [14, 18]) expect(outlineAt(perimeter, x, 24)).toBe(true);
    expect(outlineAt(perimeter, 14, 48)).toBe(true);
    expect(outlineAt(perimeter, 24, 46)).toBe(true);
    expect(outlineAt(interior, 24, 46)).toBe(false);
    expect(outlineAt(interior, 40, 46)).toBe(true);
    expect(outlineAt(perimeter, 40, 46)).toBe(false);
    const body = maze.group.getObjectByName('walls') as Mesh;
    const geometries = [body.geometry, perimeter.geometry, interior.geometry];
    const material = perimeter.material as MeshBasicMaterial;
    maze.syncWallPulse(0);
    expect(material.opacity).toBeCloseTo(0.82);
    maze.syncWallPulse(Math.PI / 2 / 0.012);
    expect(material.opacity).toBeCloseTo(1);
    maze.syncWallPulse(3 * Math.PI / 2 / 0.012);
    expect(material.opacity).toBeCloseTo(0.64);
    expect((interior.material as Material).opacity).toBe(1);
    expect((body.material as Material).opacity).toBe(1);
    expect(body.scale.y).toBe(1);
    maze.syncWallPulse(300, true);
    expect(material.opacity).toBe(1);
    expect([body.geometry, perimeter.geometry, interior.geometry]).toEqual(geometries);
    maze.dispose();
  });

  it('accelerates the purple countdown pulse and restores the normal outline when it ends', () => {
    const maze = new MazeScene({ map: createBattleArenaWorldMap(map, 0), pulsingPerimeter: battleArenaOuterBounds(0) });
    const perimeter = maze.group.getObjectByName('perimeter-wall-edges') as InstancedMesh;
    const material = perimeter.material as MeshBasicMaterial;
    const interior = (maze.group.getObjectByName('wall-edges') as InstancedMesh).material as MeshBasicMaterial;
    const geometry = perimeter.geometry;
    expect(material.color.equals(interior.color)).toBe(true);
    const peaks: number[] = [];
    let previous = 0.82;
    let rising = false;
    for (let age = 0; age <= 10_000; age += 10) {
      maze.syncPerimeterWarning(age, 10_000);
      if (rising && material.opacity < previous) peaks.push(age);
      rising = material.opacity > previous;
      previous = material.opacity;
    }
    expect(peaks.filter((age) => age < 2000).length).toBeLessThanOrEqual(2);
    expect(peaks.filter((age) => age >= 8000).length).toBeGreaterThanOrEqual(4);
    expect(material.color.getHexString()).toBe('b846ff');
    maze.syncPerimeterWarning(5000, 10_000, true);
    expect(material.opacity).toBe(1);
    expect(material.color.getHexString()).toBe('b846ff');
    maze.syncPerimeterWarning(null, 10_000);
    expect(material.color.equals(interior.color)).toBe(true);
    expect(material.opacity).toBe(1);
    expect(perimeter.geometry).toBe(geometry);
    maze.dispose();
  });

  it('pulses complete wall tips even when their pixels become part of the next perimeter', () => {
    const { map: authored } = createMapFixture(Array.from({ length: 5 }, () =>
      Array.from({ length: 5 }, () => createCollisionTile())));
    authored.tiles.flat().forEach((tile) => { tile.localId = null; });
    // A horizontal wall ends in a stepped cap at x=32, z=48.
    Object.assign(authored.tiles[2][1], { localId: 0, rotation: 3 * Math.PI / 2 });
    Object.assign(authored.tiles[3][1], { localId: 0, rotation: Math.PI / 2 });
    authored.tiles[2][2].localId = 14;
    authored.tiles[3][2].localId = 14;
    const nextMap = structuredClone(authored);
    // A new vertical rail reuses the tip while the horizontal wall disappears.
    for (const y of [2, 3]) {
      Object.assign(nextMap.tiles[y][1], { localId: 0, rotation: 0, flipX: true });
      Object.assign(nextMap.tiles[y][2], { localId: 0, rotation: 0 });
    }
    const maze = new MazeScene({ map: authored, pulsingPerimeter: { minX: 0, maxX: 4, minY: 0, maxY: 4 }, nextMap });
    const warning = maze.group.getObjectByName('perimeter-wall-edges') as InstancedMesh;
    const steady = maze.group.getObjectByName('wall-edges') as InstancedMesh;
    // Both stepped shoulders and the end face belong to the retiring wall.
    for (const [x, z] of [[33, 46.5], [33.5, 47], [34, 48], [33.5, 49], [33, 49.5]]) {
      expect(outlineAt(warning, x, z)).toBe(true);
      expect(outlineAt(steady, x, z)).toBe(false);
    }
    maze.syncPerimeterWarning(5000, 10_000);
    expect((warning.material as MeshBasicMaterial).color.getHexString()).toBe('b846ff');
    maze.dispose();
  });

  it('contracts only changing walls, preserves portal openings, and releases the animation after settling', () => {
    const previous = new MazeScene({ map: createBattleArenaWorldMap(map, 0), pulsingPerimeter: battleArenaOuterBounds(0) });
    const maze = new MazeScene({ map: createBattleArenaWorldMap(map, 1), pulsingPerimeter: battleArenaOuterBounds(1) });
    const wall = maze.group.getObjectByName('walls') as Mesh;
    const finalGeometry = wall.geometry;
    maze.startPerimeterContraction(previous, 1000);
    previous.dispose();
    const transition = maze.group.getObjectByName('battle-arena-transition')!;
    const disposals = watchDisposal(transition);
    const steady = transition.getObjectByName('retained-walls')!;
    const incoming = transition.getObjectByName('arriving-walls')!;
    const outgoing = transition.getObjectByName('retiring-walls')!;
    const steadyBounds = new Box3().setFromObject(steady);
    const incomingBounds = new Box3().setFromObject(incoming);
    const outgoingBounds = new Box3().setFromObject(outgoing);
    expect(wall.visible).toBe(false);
    // The first display frame should accelerate gently instead of jumping into motion.
    maze.syncPerimeterContraction(1016);
    expect(outgoing.scale.y).toBeGreaterThan(0.995);
    maze.syncPerimeterContraction(1040);
    const riseStart = incoming.scale.y;
    maze.syncPerimeterContraction(1056);
    expect(incoming.scale.y - riseStart).toBeLessThan(0.001);
    maze.syncPerimeterContraction(1200);
    expect(new Box3().setFromObject(outgoing).max.y).toBeLessThan(outgoingBounds.max.y / 2);
    expect(new Box3().setFromObject(incoming).max.y).toBeGreaterThan(incomingBounds.max.y);
    expect(new Box3().setFromObject(steady)).toEqual(steadyBounds);
    // The new horizontal portal at row 25 must remain open throughout the rise.
    transition.updateMatrixWorld(true);
    const portal = new Raycaster(new Vector3(32, 30, 25 * 16 + 8), new Vector3(0, -1, 0));
    expect(portal.intersectObject(incoming, true)).toHaveLength(0);
    expect(portal.intersectObject(steady, true)).toHaveLength(0);
    // The retired seam reaches zero height before removal, without a visible strip popping away.
    maze.syncPerimeterContraction(1319);
    expect(outgoing.scale.y).toBeLessThan(0.0001);
    maze.syncPerimeterContraction(1550);
    expect(outgoing.visible).toBe(false);
    expect(incoming.scale.y).toBeGreaterThan(1);
    expect(incoming.scale.y).toBeLessThan(1.04);
    transition.traverse((object) => {
      if (object instanceof Mesh) expect((object.material as Material).opacity).toBe(1);
    });
    maze.syncPerimeterWarning(800, 10_000);
    maze.syncPerimeterContraction(1799);
    expect(incoming.scale.y).toBeCloseTo(1, 5);
    const incomingEdges = incoming.children[1] as InstancedMesh;
    const perimeter = maze.group.getObjectByName('perimeter-wall-edges') as InstancedMesh;
    expect((incomingEdges.material as Material).opacity).toBeCloseTo((perimeter.material as Material).opacity, 5);
    maze.syncPerimeterContraction(1800);
    expect(maze.group.getObjectByName('battle-arena-transition')).toBeUndefined();
    expect(wall.visible).toBe(true);
    expect(wall.geometry).toBe(finalGeometry);
    expect(wall.scale.y).toBe(1);
    maze.dispose();
    disposals.forEach((dispose) => expect(dispose).toHaveBeenCalledOnce());
  });

  it('animates authoritative shrinks, disposes interrupted stages, and preserves camera follow', async () => {
    let now = 0;
    let reducedMotion = false;
    let frame: FrameRequestCallback = () => undefined;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frame = callback; return 1; });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
      return { canvas: this, clearRect: vi.fn(), fillRect: vi.fn(), fillText: vi.fn(),
        measureText: () => ({ width: 100 }) } as unknown as CanvasRenderingContext2D;
    });
    const initial = new DataRace(map, 'arena-scene', [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], 7).snapshot();
    initial.phase = 'countdown';
    initial.players[0].movement = { cell: 23 * 49 + 23, to: null, progress: 0, direction: 'right', queued: 'right' };
    initial.players[0].connected = false;
    let connection: MultiplayerConnectionSnapshot = {
      phase: 'connected', stalled: false, recoverable: true, playerId: initial.players[0].id, room: null, map, race: initial,
      raceHistory: [initial], receivedAtMs: 0, serverTimeMs: null, latencyMs: 0,
      instanceRunId: 'run', processGeneration: 'generation', warning: null, message: '',
    };
    const snap = vi.spyOn(Camera3D.prototype, 'snapToFollowTarget');
    const bounds = vi.spyOn(Camera3D.prototype, 'setBounds');
    const onError = vi.fn();
    const finalDispose = vi.fn();
    const root = document.createElement('div');
    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect({ width: 800, height: 600 }));
    const synchronization = new MultiplayerSynchronization();
    let publication = 0;
    let accepted: typeof connection.race = null;
    const session = new MultiplayerPresentationSession({
      map, canvas: document.createElement('canvas'), root,
      synchronization,
      getConnectionSnapshot: () => {
        if (connection.race && connection.race !== accepted) {
          synchronization.acceptSnapshot(map, connection.race, connection.playerId, ++publication, now);
          accepted = connection.race;
        }
        return connection;
      }, isReducedMotion: () => reducedMotion, onError,
    });
    try {
      await session.ready;
      const [scene, camera] = renderer.render.mock.calls[renderer.render.mock.calls.length - 1];
      let maze = scene.getObjectByName('maze')!;
      expect(scene.getObjectByName('battle-arena-transition')).toBeUndefined();
      const initialMaterial = (maze.getObjectByName('perimeter-wall-edges') as InstancedMesh).material as MeshBasicMaterial;
      const normalColor = initialMaterial.color.clone();
      expect(initialMaterial.opacity).toBe(1);
      const started = structuredClone(initial);
      started.phase = 'playing';
      connection = { ...connection, race: started, raceHistory: [started], receivedAtMs: now += 16 };
      frame(now);
      expect(initialMaterial.color.getHexString()).toBe('b846ff');
      const originalPosition = camera.position.clone();
      const snapCount = snap.mock.calls.length;
      for (const stage of [1, 2, 20]) {
        const disposals = watchDisposal(maze);
        const race = structuredClone(connection.race!);
        race.tick = stage * RACE.shrinkEveryTicks;
        race.playTicks = race.tick;
        race.shrinkStage = stage;
        // Keep this surviving actor stationary to isolate stage-induced camera movement.
        race.players[0].movement = { ...initial.players[0].movement };
        connection = { ...connection, race, raceHistory: [race], receivedAtMs: now += 16 };
        frame(now);
        expect(onError).not.toHaveBeenCalled();
        expect(maze.parent).toBeNull();
        disposals.forEach((dispose) => expect(dispose).toHaveBeenCalledOnce());
        maze = scene.getObjectByName('maze')!;
        expect(scene.children.filter((child) => child.name === 'maze')).toHaveLength(1);
        const transition = scene.getObjectByName('battle-arena-transition')!;
        expect(transition).toBeDefined();
        expect(camera.position.distanceTo(originalPosition)).toBeLessThan(0.001);
        expect(snap).toHaveBeenCalledTimes(snapCount);
        expect(bounds).toHaveBeenCalledOnce();
        const perimeter = maze.getObjectByName('perimeter-wall-edges') as InstancedMesh;
        if (stage === 1) {
          const interior = maze.getObjectByName('wall-edges') as InstancedMesh;
          expect(outlineAt(perimeter, 40, 398)).toBe(true);
          expect(outlineAt(interior, 40, 398)).toBe(false);
          expect(outlineAt(interior, 56, 398)).toBe(true);
          expect(outlineAt(perimeter, 56, 398)).toBe(false);
        }
        const geometry = perimeter.geometry;
        const material = perimeter.material as MeshBasicMaterial;
        const opacity = material.opacity;
        frame(now += 16);
        expect(scene.getObjectByName('maze')).toBe(maze);
        expect(scene.getObjectByName('battle-arena-transition')).toBe(transition);
        expect(perimeter.geometry).toBe(geometry);
        if (stage < RACE.maxShrinkStage) {
          expect(material.opacity).not.toBe(opacity);
          expect(material.color.getHexString()).toBe('b846ff');
        } else {
          expect(material.opacity).toBe(1);
          expect(material.color.equals(normalColor)).toBe(true);
        }
      }
      const reducedDisposals = watchDisposal(scene.getObjectByName('battle-arena-transition')!);
      reducedMotion = true;
      frame(now += 16);
      expect(scene.getObjectByName('battle-arena-transition')).toBeUndefined();
      reducedDisposals.forEach((dispose) => expect(dispose).toHaveBeenCalledOnce());
      const finalPerimeter = maze.getObjectByName('perimeter-wall-edges') as InstancedMesh;
      expect((finalPerimeter.material as MeshBasicMaterial).opacity).toBe(1);
      finalPerimeter.geometry.addEventListener('dispose', finalDispose);
      const spectating = structuredClone(connection.race!);
      spectating.tick += 1;
      spectating.players[0].eliminatedAtTick = spectating.tick;
      spectating.players[0].deathMs = 0;
      spectating.players[1].movement = { cell: 26 * 49 + 26, to: null, progress: 0, direction: 'right', queued: 'right' };
      connection = { ...connection, race: spectating, raceHistory: [spectating], receivedAtMs: now += 16 };
      frame(now);
      const rendered = synchronization.sample(now)!.actors.get(spectating.players[1].id)!.point;
      const followed = new Vector3((rendered.x + 0.5) * 16, 0, (rendered.y + 0.5) * 16).project(camera);
      expect(followed.x).toBeCloseTo(0, 2);
      expect(followed.y).toBeCloseTo(0, 2);
      expect(snap).toHaveBeenCalledTimes(snapCount + 1);
    } finally {
      session.dispose();
      session.dispose();
    }
    expect(renderer.dispose).toHaveBeenCalledOnce();
    expect(finalDispose).toHaveBeenCalledOnce();
  });
});
