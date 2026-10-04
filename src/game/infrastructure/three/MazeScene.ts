import {
  BoxGeometry, BufferGeometry, Color, EdgesGeometry, Float32BufferAttribute, Group, InstancedMesh,
  Material, MathUtils, Matrix4, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, Plane, PlaneGeometry, Vector3,
} from 'three';
import type { WorldMapData, WorldTile } from '../../domain/world/WorldState';
import type { QuarantineWall } from '../../domain/world/WorldState';
import { extendMazeWallFootprint } from '../../domain/world/MazeFootprint';
import {
  buildMazePenFootprint,
  buildMazeWallEdgeGeometry,
  buildMazeWallFootprint,
  buildMazeWallGeometryFromFootprint,
  splitMazeWallEdgesByOwnership,
  traceWallContours,
  WALL_HEIGHT,
} from './MazeGeometry';
import type { MazeFootprint } from './MazeGeometry';
import { buildPacketSignGeometry } from './PacketSignGeometry';
import { createMazeFloorMaterial } from './ScenePresentation';

const PEN_SHEET_HEIGHT = 0.2;
const PULSING_WALL_COLOR = '#b846ff';
const WALL_PULSE_RADIANS_PER_MS = 0.012;
const PERIMETER_CONTRACTION_MS = 800;
const CONTRACTION_SEAM_COLOR = new Color('#8cf6ff');

/** Inclusive tile bounds of a wall ring surrounding playable corridors. */
interface MazePerimeterBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/** Keeps surviving interiors static; retiring walls own their complete caps, including pixels reused by the next map. */
function retainedWallFootprint(
  map: WorldMapData, footprint: MazeFootprint, bounds: MazePerimeterBounds, nextMap?: WorldMapData,
): MazeFootprint {
  const minX = (bounds.minX + 1) * map.tileWidth + 2;
  const maxX = bounds.maxX * map.tileWidth - 2;
  const minY = (bounds.minY + 1) * map.tileHeight + 2;
  const maxY = bounds.maxY * map.tileHeight - 2;
  const next = nextMap ? buildMazeWallFootprint(nextMap) : undefined;
  const solid = footprint.solid.map((pixel, index) => {
    const x = index % footprint.width;
    const y = Math.floor(index / footprint.width);
    const retained = !next || next.solid[y * next.width + x];
    return retained && x >= minX && x < maxX && y >= minY && y < maxY ? pixel : 0;
  });
  /** Samples retiring rail pixels just outside a four-pixel junction cap. */
  const retires = (x: number, y: number): boolean => x >= 0 && x < footprint.width
    && y >= 0 && y < footprint.height
    && Boolean(footprint.solid[y * footprint.width + x] && !solid[y * footprint.width + x]);
  for (let y = 0; y <= footprint.height; y += map.tileHeight) {
    for (let x = 0; x <= footprint.width; x += map.tileWidth) {
      // Probe outside the cap so assigning one tip cannot spread ownership to another.
      if (![-2, -1, 0, 1].some((offset) => retires(x - 3, y + offset) || retires(x + 2, y + offset)
        || retires(x + offset, y - 3) || retires(x + offset, y + 2))) continue;
      for (let row = Math.max(0, y - 2); row < Math.min(footprint.height, y + 2); row += 1) {
        solid.fill(0, row * footprint.width + Math.max(0, x - 2), row * footprint.width + Math.min(footprint.width, x + 2));
      }
    }
  }
  return { ...footprint, solid };
}

export class MazeScene {
  readonly group = new Group();
  private readonly resources = new Set<BufferGeometry | Material | InstancedMesh>();
  private readonly map: WorldMapData;
  private readonly wallFootprint: MazeFootprint;
  private readonly penFootprint: MazeFootprint | undefined;
  private readonly walls: Mesh<BufferGeometry, MeshStandardMaterial>;
  private wallEdges: InstancedMesh<BoxGeometry, MeshBasicMaterial>;
  private pulsingEdges: InstancedMesh<BoxGeometry, MeshBasicMaterial>;
  private wallTopologyKey = '';
  private readonly clipPlanes?: [Plane, Plane];
  private contraction?: { group: Group; retiring: Group; arriving: Group; startedAtMs: number };

  /** Builds joined walls and assigns the outer ring and disappearing segments to the shared warning pulse. */
  constructor(
    world: { map: WorldMapData; pulsingPerimeter?: MazePerimeterBounds; nextMap?: WorldMapData },
    clipBounds?: { minZ: number; maxZ: number },
  ) {
    this.group.name = 'maze';
    if (clipBounds) {
      this.clipPlanes = [new Plane(new Vector3(0, 0, 1), -clipBounds.minZ),
        new Plane(new Vector3(0, 0, -1), clipBounds.maxZ)];
    }
    const { map } = world;
    this.map = map;
    const floorGeometry = this.own(new PlaneGeometry(map.tileWidth, map.tileHeight));
    floorGeometry.rotateX(-Math.PI / 2);
    const floorMaterial = this.own(createMazeFloorMaterial());
    floorMaterial.clippingPlanes = this.clipPlanes ?? null;
    const tiles = map.tiles.flat().filter((tile) => tile.gid !== null);
    const floor = this.own(new InstancedMesh(floorGeometry, floorMaterial, tiles.length));
    floor.name = 'floor';
    const matrix = new Matrix4();
    tiles.forEach((tile, index) => {
      floor.setMatrixAt(index, matrix.makeTranslation(
        (tile.x + 0.5) * map.tileWidth, -0.04, (tile.y + 0.5) * map.tileHeight,
      ));
    });
    floor.computeBoundingSphere();
    this.group.add(floor);

    this.penFootprint = tiles.some((tile) => tile.localId === 16) ? buildMazePenFootprint(map) : undefined;
    this.wallFootprint = buildMazeWallFootprint(map);
    const contours = traceWallContours(this.wallFootprint);
    const wallGeometry = this.own(buildMazeWallGeometryFromFootprint(this.wallFootprint, contours));
    const wallMaterial = this.createWallMaterial('#1e0d20');
    this.walls = new Mesh(wallGeometry, wallMaterial);
    this.walls.name = 'walls';
    this.group.add(this.walls);
    const edges = buildMazeWallEdgeGeometry(this.wallFootprint, this.penFootprint, true, contours);
    const split = world.pulsingPerimeter
      ? splitMazeWallEdgesByOwnership(edges, retainedWallFootprint(map, this.wallFootprint, world.pulsingPerimeter, world.nextMap))
      : { authored: edges, temporary: new BufferGeometry().setAttribute('position', new Float32BufferAttribute([], 3)) };
    if (world.pulsingPerimeter) edges.dispose();
    this.wallEdges = this.createOutlineStrips(split.authored, new Color('#b579a1'));
    this.wallEdges.name = 'wall-edges';
    this.pulsingEdges = this.createOutlineStrips(split.temporary, new Color(PULSING_WALL_COLOR));
    this.pulsingEdges.name = world.pulsingPerimeter ? 'perimeter-wall-edges' : 'quarantine-wall-edges';
    this.pulsingEdges.material.transparent = true;
    if (world.pulsingPerimeter) this.pulsingEdges.material.color.copy(this.wallEdges.material.color);
    this.group.add(this.wallEdges, this.pulsingEdges);

    if (this.penFootprint) {
      this.addPen(this.penFootprint);
    }

    this.addSigns(map, tiles);
  }

  /** Rebuilds continuous wall contours only when passage closures change; pulse sampling is allocation-free. */
  syncQuarantineWalls(records: readonly QuarantineWall[]): void {
    const active = records.filter((record) => record.ageMs < record.durationMs);
    const key = active.map(({ tile, side }) => `${tile.x},${tile.y},${side}`).sort().join('|');
    if (key !== this.wallTopologyKey) {
      this.wallTopologyKey = key;
      const combined = extendMazeWallFootprint(this.map, this.wallFootprint, active);
      const contours = traceWallContours(combined);
      const geometry = this.own(buildMazeWallGeometryFromFootprint(combined, contours));
      this.resources.delete(this.walls.geometry);
      this.walls.geometry.dispose();
      this.walls.geometry = geometry;
      const edges = buildMazeWallEdgeGeometry(combined, this.penFootprint, true, contours);
      const split = splitMazeWallEdgesByOwnership(edges, this.wallFootprint);
      edges.dispose();
      this.wallEdges = this.replaceOutlineStrips(this.wallEdges, split.authored, new Color('#b579a1'));
      this.pulsingEdges = this.replaceOutlineStrips(this.pulsingEdges, split.temporary, new Color(PULSING_WALL_COLOR));
      this.pulsingEdges.material.transparent = true;
    }
    let youngestAge = Infinity;
    for (const record of active) youngestAge = Math.min(youngestAge, record.ageMs);
    this.syncWallPulse(active.length > 0 ? youngestAge : 0, active.length === 0);
  }

  /** Samples the shared Quarantine/perimeter outline pulse without changing geometry or wall bodies. */
  syncWallPulse(ageMs: number, reducedMotion = false): void {
    this.pulsingEdges.material.color.set(PULSING_WALL_COLOR);
    this.pulsingEdges.material.opacity = reducedMotion
      ? 1 : 0.82 + 0.18 * Math.sin(ageMs * WALL_PULSE_RADIANS_PER_MS);
  }

  /** Accelerates the countdown pulse from 0.5 to 2.5 Hz; null restores the normal steady wall outline. */
  syncPerimeterWarning(elapsedMs: number | null, durationMs: number, reducedMotion = false): void {
    if (elapsedMs === null) {
      this.pulsingEdges.material.color.copy(this.wallEdges.material.color);
      this.pulsingEdges.material.opacity = 1;
      return;
    }
    const seconds = Math.max(0, Math.min(durationMs, elapsedMs)) / 1000;
    // Integrating the changing frequency keeps phase continuous throughout the countdown.
    const phase = 2 * Math.PI * (0.5 * seconds + seconds ** 2 / (durationMs / 1000));
    this.syncWallPulse(phase / WALL_PULSE_RADIANS_PER_MS, reducedMotion);
  }

  /** Starts a wall-only contraction from the displayed stage; all temporary geometry belongs to this maze. */
  startPerimeterContraction(previous: MazeScene, nowMs: number): void {
    this.finishPerimeterContraction();
    const current = this.wallFootprint;
    const before = previous.wallFootprint;
    const retained = { ...current, solid: current.solid.map((pixel, index) => pixel && before.solid[index] ? 1 : 0) };
    const arriving = { ...current, solid: current.solid.map((pixel, index) => pixel && !before.solid[index] ? 1 : 0) };
    const retiring = { ...before, solid: before.solid.map((pixel, index) => pixel && !current.solid[index] ? 1 : 0) };
    const edges = buildMazeWallEdgeGeometry(current);
    const split = splitMazeWallEdgesByOwnership(edges, retained);
    edges.dispose();
    const oldEdges = buildMazeWallEdgeGeometry(before);
    const oldSplit = splitMazeWallEdgesByOwnership(oldEdges, retained);
    oldEdges.dispose();
    oldSplit.authored.dispose();
    const group = new Group();
    group.name = 'battle-arena-transition';
    const steady = this.createContractionWalls(retained, split.authored, this.wallEdges.material.color, 'retained-walls');
    const outgoing = this.createContractionWalls(retiring, oldSplit.temporary, new Color(PULSING_WALL_COLOR), 'retiring-walls');
    const incoming = this.createContractionWalls(arriving, split.temporary, new Color(PULSING_WALL_COLOR), 'arriving-walls');
    (incoming.children[1] as InstancedMesh<BoxGeometry, MeshBasicMaterial>).material.transparent = true;
    group.add(steady, outgoing, incoming);
    this.group.add(group);
    this.walls.visible = this.wallEdges.visible = this.pulsingEdges.visible = false;
    this.contraction = { group, retiring: outgoing, arriving: incoming, startedAtMs: nowMs };
    this.syncPerimeterContraction(nowMs);
  }

  /** Eases wall compression and rise from rest, settles a small overshoot, and blends back into the live countdown. */
  syncPerimeterContraction(nowMs: number, reducedMotion = false): void {
    const transition = this.contraction;
    if (!transition) return;
    const elapsed = Math.max(0, nowMs - transition.startedAtMs);
    if (reducedMotion || elapsed >= PERIMETER_CONTRACTION_MS) {
      this.finishPerimeterContraction();
      return;
    }
    const collapse = MathUtils.smootherstep(elapsed, 0, 320);
    transition.retiring.scale.y = 1 - collapse;
    transition.retiring.visible = collapse < 1;
    const rise = MathUtils.smootherstep(elapsed, 40, 760);
    const offset = rise - 1;
    transition.arriving.scale.y = 0.02 + 0.98 * (1 + 1.9 * offset ** 3 + 0.9 * offset ** 2);
    const retiringEdges = transition.retiring.children[1] as InstancedMesh<BoxGeometry, MeshBasicMaterial>;
    retiringEdges.material.color.set(PULSING_WALL_COLOR).lerp(CONTRACTION_SEAM_COLOR, collapse);
    const arrivingEdges = transition.arriving.children[1] as InstancedMesh<BoxGeometry, MeshBasicMaterial>;
    arrivingEdges.material.color.copy(CONTRACTION_SEAM_COLOR).lerp(this.pulsingEdges.material.color, rise);
    arrivingEdges.material.opacity = MathUtils.lerp(1, this.pulsingEdges.material.opacity,
      MathUtils.smootherstep(elapsed, 600, PERIMETER_CONTRACTION_MS));
  }

  /** Builds an independent transient wall batch while preserving the actual exposed edges and portal openings. */
  private createContractionWalls(footprint: MazeFootprint, edges: BufferGeometry, color: Color, name: string): Group {
    const group = new Group();
    group.name = name;
    group.add(new Mesh(this.own(buildMazeWallGeometryFromFootprint(footprint)), this.createWallMaterial('#1e0d20')),
      this.createOutlineStrips(edges, color));
    return group;
  }

  /** Releases transient batches on completion, replacement, reduced motion, or scene disposal. */
  private finishPerimeterContraction(): void {
    if (!this.contraction) return;
    this.contraction.group.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const mesh = object as Mesh<BufferGeometry, Material>;
      const resources: Array<BufferGeometry | Material | InstancedMesh> = [mesh.geometry, mesh.material];
      if (object instanceof InstancedMesh) resources.push(object);
      resources.forEach((resource) => { this.resources.delete(resource); resource.dispose(); });
    });
    this.group.remove(this.contraction.group);
    this.contraction.group.clear();
    this.contraction = undefined;
    this.walls.visible = this.wallEdges.visible = this.pulsingEdges.visible = true;
  }

  /** Releases permanent and in-flight wall geometry exactly once. */
  dispose(): void {
    this.finishPerimeterContraction();
    this.resources.forEach((resource) => resource.dispose());
    this.resources.clear();
    this.group.clear();
  }

  /** Moves the two world-space clipping boundaries with a retained stream section. */
  setClipBounds(minZ: number, maxZ: number): void {
    if (!this.clipPlanes) return;
    this.clipPlanes[0].constant = -minZ;
    this.clipPlanes[1].constant = maxZ;
  }

  private own<T extends BufferGeometry | Material | InstancedMesh>(resource: T): T {
    this.resources.add(resource);
    return resource;
  }

  private createWallMaterial(color: string): MeshStandardMaterial {
    return this.own(new MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.12,
      ...(this.clipPlanes ? { clippingPlanes: this.clipPlanes } : {}) }));
  }

  private createOutlineStrips(source: BufferGeometry, color: Color): InstancedMesh<BoxGeometry, MeshBasicMaterial> {
    const positions = source.getAttribute('position');
    const geometry = this.own(new BoxGeometry(1, 1, 1));
    const material = this.own(new MeshBasicMaterial({ color, toneMapped: false,
      ...(this.clipPlanes ? { clippingPlanes: this.clipPlanes } : {}) }));
    const lines = this.own(new InstancedMesh(geometry, material, positions.count / 2));
    const transform = new Object3D();
    const start = new Vector3();
    const end = new Vector3();
    const direction = new Vector3();
    const up = new Vector3(0, 1, 0);
    const thickness = 0.35;
    for (let i = 0; i < positions.count; i += 2) {
      start.fromBufferAttribute(positions, i);
      end.fromBufferAttribute(positions, i + 1);
      direction.subVectors(end, start);
      transform.position.copy(start).add(end).multiplyScalar(0.5);
      transform.scale.set(thickness, direction.length() + thickness, thickness);
      transform.quaternion.setFromUnitVectors(up, direction.normalize());
      transform.updateMatrix();
      lines.setMatrixAt(i / 2, transform.matrix);
    }
    lines.computeBoundingSphere();
    source.dispose();
    // Solid strips share normal depth testing and MSAA with the walls.
    return lines;
  }

  /** Replaces an outline batch and disposes its former mesh, geometry, and material immediately. */
  private replaceOutlineStrips(
    previous: InstancedMesh<BoxGeometry, MeshBasicMaterial>, source: BufferGeometry, color: Color,
  ): InstancedMesh<BoxGeometry, MeshBasicMaterial> {
    const name = previous.name;
    this.group.remove(previous);
    this.resources.delete(previous);
    this.resources.delete(previous.geometry);
    this.resources.delete(previous.material);
    previous.dispose();
    previous.geometry.dispose();
    previous.material.dispose();
    const next = this.createOutlineStrips(source, color);
    next.name = name;
    this.group.add(next);
    return next;
  }

  private addSigns(map: WorldMapData, tiles: WorldTile[]): void {
    const signTiles = tiles.filter((tile) => tile.localId !== null && tile.localId >= 17 && tile.localId <= 21)
      .sort((a, b) => a.y - b.y || a.x - b.x);
    if (signTiles.length === 0) return;
    const runs: WorldTile[][] = [];
    for (const tile of signTiles) {
      const run = runs[runs.length - 1];
      const last = run?.[run.length - 1];
      if (last && last.y === tile.y && last.x + 1 === tile.x) run.push(tile);
      else runs.push([tile]);
    }
    const material = this.createWallMaterial('#241b0b');
    for (const run of runs) {
      const width = run.length * map.tileWidth;
      const height = map.tileHeight;
      const geometry = this.own(buildPacketSignGeometry(width - 2, height - 2));
      const lettering = new Mesh(geometry, material);
      lettering.name = 'sign-lettering';
      const edges = this.createOutlineStrips(new EdgesGeometry(geometry), new Color('#b9a36b'));
      edges.name = 'sign-edges';
      const placement = new Group();
      placement.name = 'sign-artwork';
      placement.position.set((run[0].x + run.length / 2) * map.tileWidth, 0, (run[0].y + 0.5) * height);
      placement.add(lettering, edges);
      this.group.add(placement);
    }
  }

  /** Keeps the prison's original top face at wall elevation while flattening its vertical body. */
  private addPen(footprint: MazeFootprint): void {
    const pen = new Group();
    pen.name = 'enemy-pen';
    pen.scale.y = PEN_SHEET_HEIGHT / WALL_HEIGHT;
    pen.position.y = WALL_HEIGHT - PEN_SHEET_HEIGHT;
    const bars = new Mesh(this.own(buildMazeWallGeometryFromFootprint(footprint)), this.createWallMaterial('#061428'));
    bars.name = 'pen-bars';
    const edges = this.createOutlineStrips(
      buildMazeWallEdgeGeometry(footprint, undefined, false),
      new Color('#419da9'),
    );
    edges.name = 'pen-edges';
    pen.add(bars, edges);
    this.group.add(pen);
  }
}
