import {
  BoxGeometry, EdgesGeometry, Group, MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  RingGeometry, Vector3,
} from 'three';
import { ENEMY_CONFIG } from '../../../config/constants';
import type { QuarantineWall } from '../../domain/world/WorldState';
import { WALL_HEIGHT } from './MazeGeometry';

interface WallVisual {
  group: Group;
  beam: Mesh<BoxGeometry, MeshBasicMaterial>;
}

/** Bounded solid walls with purple silhouette rails, a hexagonal seal, and a short source beam. */
export class QuarantineWalls {
  readonly group = new Group();
  private readonly cube = new BoxGeometry(1, 1, 1);
  private readonly seal = new RingGeometry(0.7, 1, 6).rotateX(-Math.PI / 2);
  private readonly body = new MeshStandardMaterial({ color: 0x160c28, roughness: 0.3, metalness: 0.12 });
  private readonly trim = new MeshBasicMaterial({ color: 0xb846ff, toneMapped: false });
  private readonly walls: WallVisual[] = [];
  private readonly start = new Vector3();
  private readonly end = new Vector3();
  private readonly direction = new Vector3();
  private readonly up = new Vector3(0, 1, 0);
  private disposed = false;

  /** Allocates one shared set of geometry and materials for the maximum active wall count. */
  constructor(private readonly tileSize: number) {
    this.group.name = 'quarantine-walls';
    const shape = new BoxGeometry(tileSize, WALL_HEIGHT, tileSize);
    const edges = new EdgesGeometry(shape);
    const positions = edges.getAttribute('position');
    for (let slot = 0; slot < ENEMY_CONFIG.quarantine.maxWalls; slot += 1) {
      const group = new Group();
      group.name = 'quarantine-wall';
      group.visible = false;
      const body = new Mesh(this.cube, this.body);
      body.position.y = WALL_HEIGHT / 2;
      body.scale.set(tileSize, WALL_HEIGHT, tileSize);
      group.add(body);
      for (let index = 0; index < positions.count; index += 2) {
        this.start.fromBufferAttribute(positions, index);
        this.end.fromBufferAttribute(positions, index + 1);
        this.direction.subVectors(this.end, this.start);
        const edge = new Mesh(this.cube, this.trim);
        edge.position.copy(this.start).add(this.end).multiplyScalar(0.5);
        edge.position.y += WALL_HEIGHT / 2;
        edge.scale.set(0.35, this.direction.length() + 0.35, 0.35);
        edge.quaternion.setFromUnitVectors(this.up, this.direction.normalize());
        group.add(edge);
      }
      const seal = new Mesh(this.seal, this.trim);
      seal.position.y = WALL_HEIGHT + 0.04;
      seal.scale.setScalar(tileSize * 0.21);
      group.add(seal);
      const beam = new Mesh(this.cube, new MeshBasicMaterial({
        color: 0xb846ff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false,
      }));
      beam.name = 'quarantine-construction-beam';
      beam.visible = false;
      this.group.add(group, beam);
      this.walls.push({ group, beam });
    }
    shape.dispose();
    edges.dispose();
  }

  /** Samples appearance and expiry from simulation records; seeking or pausing allocates nothing. */
  sync(records: readonly QuarantineWall[]): void {
    if (this.disposed) return;
    this.walls.forEach(({ group, beam }, index) => {
      const record = records[index];
      group.visible = !!record && record.ageMs < record.durationMs;
      beam.visible = !!record && group.visible && record.ageMs < 650;
      if (!record || !group.visible) return;
      const x = (record.tile.x + 0.5) * this.tileSize;
      const z = (record.tile.y + 0.5) * this.tileSize;
      group.position.set(x, 0, z);
      const grow = 0.15 + 0.85 * MathUtils.smoothstep(record.ageMs, 0, 300);
      const fade = MathUtils.smoothstep(record.durationMs - record.ageMs, 0, 300);
      group.scale.y = Math.max(0.02, grow * fade);
      if (beam.visible) {
        this.start.set(record.source.x, 4, record.source.y);
        this.end.set(x, WALL_HEIGHT * group.scale.y, z);
        this.direction.subVectors(this.end, this.start);
        beam.position.copy(this.start).add(this.end).multiplyScalar(0.5);
        beam.scale.set(0.22, this.direction.length(), 0.22);
        beam.quaternion.setFromUnitVectors(this.up, this.direction.normalize());
        beam.material.opacity = 0.75 * (1 - record.ageMs / 650);
      }
    });
  }

  /** Releases only resources owned by this wall pool, once. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.cube.dispose();
    this.seal.dispose();
    this.body.dispose();
    this.trim.dispose();
    this.walls.forEach(({ beam }) => beam.material.dispose());
    this.group.clear();
  }
}
