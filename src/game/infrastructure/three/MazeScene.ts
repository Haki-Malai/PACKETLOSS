import {
  BoxGeometry, BufferGeometry, Color, EdgesGeometry, Float32BufferAttribute, Group, InstancedMesh,
  Material, Matrix4, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, PlaneGeometry, Vector3,
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
  WALL_HEIGHT,
} from './MazeGeometry';
import type { MazeFootprint } from './MazeGeometry';
import { buildPacketSignGeometry } from './PacketSignGeometry';
import { createMazeFloorMaterial } from './ScenePresentation';

const PEN_SHEET_HEIGHT = 0.2;

export class MazeScene {
  readonly group = new Group();
  private readonly resources = new Set<BufferGeometry | Material | InstancedMesh>();
  private readonly map: WorldMapData;
  private readonly wallFootprint: MazeFootprint;
  private readonly penFootprint: MazeFootprint | undefined;
  private readonly walls: Mesh<BufferGeometry, MeshStandardMaterial>;
  private wallEdges: InstancedMesh<BoxGeometry, MeshBasicMaterial>;
  private quarantineEdges: InstancedMesh<BoxGeometry, MeshBasicMaterial>;
  private wallTopologyKey = '';

  constructor(world: { map: WorldMapData }) {
    this.group.name = 'maze';
    const { map } = world;
    this.map = map;
    const floorGeometry = this.own(new PlaneGeometry(map.tileWidth, map.tileHeight));
    floorGeometry.rotateX(-Math.PI / 2);
    const floorMaterial = this.own(createMazeFloorMaterial());
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
    const wallGeometry = this.own(buildMazeWallGeometryFromFootprint(this.wallFootprint));
    const wallMaterial = this.createWallMaterial('#1e0d20');
    this.walls = new Mesh(wallGeometry, wallMaterial);
    this.walls.name = 'walls';
    this.group.add(this.walls);
    this.wallEdges = this.createOutlineStrips(
      buildMazeWallEdgeGeometry(this.wallFootprint, this.penFootprint),
      new Color('#b579a1'),
    );
    this.wallEdges.name = 'wall-edges';
    this.quarantineEdges = this.createOutlineStrips(
      new BufferGeometry().setAttribute('position', new Float32BufferAttribute([], 3)), new Color('#b846ff'),
    );
    this.quarantineEdges.name = 'quarantine-wall-edges';
    this.quarantineEdges.material.transparent = true;
    this.group.add(this.wallEdges, this.quarantineEdges);

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
      const geometry = this.own(buildMazeWallGeometryFromFootprint(combined));
      this.resources.delete(this.walls.geometry);
      this.walls.geometry.dispose();
      this.walls.geometry = geometry;
      const contours = buildMazeWallEdgeGeometry(combined, this.penFootprint);
      const split = splitMazeWallEdgesByOwnership(contours, this.wallFootprint);
      contours.dispose();
      this.wallEdges = this.replaceOutlineStrips(this.wallEdges, split.authored, new Color('#b579a1'));
      this.quarantineEdges = this.replaceOutlineStrips(this.quarantineEdges, split.temporary, new Color('#b846ff'));
      this.quarantineEdges.material.transparent = true;
    }
    let youngestAge = Infinity;
    for (const record of active) youngestAge = Math.min(youngestAge, record.ageMs);
    this.quarantineEdges.material.opacity = active.length > 0
      ? 0.82 + 0.18 * Math.sin(youngestAge * 0.012) : 1;
  }

  dispose(): void {
    this.resources.forEach((resource) => resource.dispose());
    this.resources.clear();
    this.group.clear();
  }

  private own<T extends BufferGeometry | Material | InstancedMesh>(resource: T): T {
    this.resources.add(resource);
    return resource;
  }

  private createWallMaterial(color: string): MeshStandardMaterial {
    return this.own(new MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.12 }));
  }

  private createOutlineStrips(source: BufferGeometry, color: Color): InstancedMesh<BoxGeometry, MeshBasicMaterial> {
    const positions = source.getAttribute('position');
    const geometry = this.own(new BoxGeometry(1, 1, 1));
    const material = this.own(new MeshBasicMaterial({ color, toneMapped: false }));
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
