import {
  BoxGeometry, BufferGeometry, Color, Float32BufferAttribute, Group, InstancedMesh,
  Material, Matrix4, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, PlaneGeometry, Vector3,
} from 'three';
import { WorldState, WorldTile } from '../../domain/world/WorldState';
import { AssetCatalog } from '../assets/AssetCatalog';
import { buildMazeWallEdgeGeometry, buildMazeWallGeometryFromMask, buildMazeWallMask } from './MazeGeometry';
import { buildPacmanSignGeometry } from './PacmanSignGeometry';

export type MazeAssets = Pick<AssetCatalog, 'getTileMask'>;

export class MazeScene {
  readonly group = new Group();
  private readonly resources = new Set<BufferGeometry | Material | InstancedMesh>();

  constructor(world: WorldState, assets: MazeAssets) {
    this.group.name = 'maze';
    const { map } = world;
    const floorGeometry = this.own(new PlaneGeometry(map.tileWidth, map.tileHeight));
    floorGeometry.rotateX(-Math.PI / 2);
    const floorMaterial = this.own(new MeshStandardMaterial({ color: '#050912', roughness: 0.86 }));
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

    const hasPen = tiles.some((tile) => tile.localId === 16);
    const wallMask = buildMazeWallMask(map, (path) => assets.getTileMask(path), hasPen ? world.ghostJailBounds : undefined);
    const wallGeometry = this.own(buildMazeWallGeometryFromMask(wallMask));
    const wallMaterial = this.own(new MeshStandardMaterial({
      color: '#061428', roughness: 0.3, metalness: 0.12,
    }));
    const walls = new Mesh(wallGeometry, wallMaterial);
    walls.name = 'walls';
    this.group.add(walls);
    const edges = this.createOutlineStrips(buildMazeWallEdgeGeometry(wallMask), new Color('#419da9'));
    edges.name = 'wall-edges';
    this.group.add(edges);

    if (hasPen) {
      this.addPen(world);
    }

    this.addSigns(world, tiles);
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

  private addSigns(world: WorldState, tiles: WorldTile[]): void {
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
    const plaqueMaterial = this.own(new MeshStandardMaterial({ color: '#100d20', roughness: 0.6 }));
    const faceMaterial = this.own(new MeshStandardMaterial({
      color: '#ff2fa8', emissive: '#ff79d1', emissiveIntensity: 1.1, roughness: 0.6,
    }));
    const sideMaterial = this.own(new MeshStandardMaterial({
      color: '#290b3d', emissive: '#7f197b', emissiveIntensity: 0.1, roughness: 0.6,
    }));
    for (const run of runs) {
      const width = run.length * world.map.tileWidth;
      const height = world.map.tileHeight;
      const plaque = new Mesh(this.own(new BoxGeometry(width, 0.5, height)), plaqueMaterial);
      plaque.name = 'sign-plaque';
      plaque.position.set((run[0].x + run.length / 2) * world.map.tileWidth, 0.25, (run[0].y + 0.5) * height);
      this.group.add(plaque);
      const lettering = new Mesh(this.own(buildPacmanSignGeometry(width - 2, height - 2)), [faceMaterial, sideMaterial]);
      lettering.name = 'sign-lettering';
      const placement = new Group();
      placement.name = 'sign-artwork';
      placement.position.set(plaque.position.x, 0.51, plaque.position.z);
      placement.add(lettering);
      this.group.add(placement);
    }
  }

  private addPen(world: WorldState): void {
    const { minX, maxX, y } = world.ghostJailBounds;
    const size = world.tileSize;
    const left = minX * size;
    const right = (maxX + 1) * size;
    const north = y * size;
    const south = (y + 1) * size;
    const pen = new Group();
    pen.name = 'ghost-pen';
    const material = this.own(new MeshStandardMaterial({ color: '#140b1d', metalness: 0.25, roughness: 0.35 }));
    const railGeometry = this.own(new BoxGeometry(1, 2, 1));
    const addRail = (x: number, z: number, width: number, depth: number): void => {
      const rail = new Mesh(railGeometry, material);
      rail.name = 'pen-rail';
      rail.position.set(x, 1, z);
      rail.scale.set(width, 1, depth);
      pen.add(rail);
    };
    addRail(left + 0.5, (north + south) / 2, 1, size);
    addRail(right - 0.5, (north + south) / 2, 1, size);
    addRail((left + right) / 2, south - 0.5, right - left, 1);
    const outline = [[left, north], [left, south], [right, south], [right, north],
      [right - 1, north], [right - 1, south - 1], [left + 1, south - 1], [left + 1, north]];
    const positions: number[] = [];
    outline.forEach(([x, z], index) => {
      const [nextX, nextZ] = outline[(index + 1) % outline.length];
      positions.push(x, 2.01, z, nextX, 2.01, nextZ);
      positions.push(x, 0.08, z, nextX, 0.08, nextZ);
      positions.push(x, 0.08, z, x, 2.01, z);
    });
    const outlineGeometry = new BufferGeometry().setAttribute('position', new Float32BufferAttribute(positions, 3));
    const penEdges = this.createOutlineStrips(outlineGeometry, new Color('#b579a1'));
    penEdges.name = 'pen-edges';
    pen.add(penEdges);

    const floor = new Mesh(
      this.own(new PlaneGeometry(right - left, size)),
      this.own(new MeshStandardMaterial({ color: '#141026', roughness: 0.8 })),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set((left + right) / 2, 0, (north + south) / 2);
    pen.add(floor);
    const thresholdDepth = world.map.tileHeight / 8;
    const entrance = new Mesh(
      this.own(new PlaneGeometry(right - left - 2, thresholdDepth + 0.4)),
      this.own(new MeshBasicMaterial({ color: '#321338' })),
    );
    entrance.name = 'pen-entrance';
    entrance.rotation.x = -Math.PI / 2;
    entrance.position.set((left + right) / 2, 0.02, north - thresholdDepth / 2 + 0.2);
    pen.add(entrance);
    this.group.add(pen);
  }
}
