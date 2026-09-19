import { BoxGeometry, Group, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { ENEMY_CONFIG } from '../../../config/constants';
import type { QuarantineWall } from '../../domain/world/WorldState';
import { WALL_HEIGHT } from './MazeGeometry';

interface WallVisual {
  group: Group;
  beam: Mesh<BoxGeometry, MeshBasicMaterial>;
}

/** Bounded source beams for the maze scene's continuous purple wall extensions. */
export class QuarantineWalls {
  readonly group = new Group();
  private readonly cube = new BoxGeometry(1, 1, 1);
  private readonly walls: WallVisual[] = [];
  private readonly start = new Vector3();
  private readonly end = new Vector3();
  private readonly direction = new Vector3();
  private readonly up = new Vector3(0, 1, 0);
  private disposed = false;

  /** Allocates one reusable beam and material per possible active extension. */
  constructor(private readonly tileSize: number) {
    this.group.name = 'quarantine-walls';
    for (let slot = 0; slot < ENEMY_CONFIG.quarantine.maxWalls; slot += 1) {
      const group = new Group();
      group.name = 'quarantine-wall';
      group.visible = false;
      const beam = new Mesh(this.cube, new MeshBasicMaterial({
        color: 0xb846ff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false,
      }));
      beam.name = 'quarantine-construction-beam';
      group.add(beam);
      this.group.add(group);
      this.walls.push({ group, beam });
    }
  }

  /** Samples the brief construction beam without allocating presentation resources. */
  sync(records: readonly QuarantineWall[]): void {
    if (this.disposed) return;
    this.walls.forEach(({ group, beam }, index) => {
      const record = records[index];
      group.visible = !!record && record.ageMs < record.durationMs;
      beam.visible = !!record && group.visible && record.ageMs < 650;
      if (!record || !group.visible) return;
      const x = (record.tile.x + (record.side === 'right' ? 1 : 0.5)) * this.tileSize;
      const z = (record.tile.y + (record.side === 'down' ? 1 : 0.5)) * this.tileSize;
      group.position.set(x, 0, z);
      if (!beam.visible) return;
      this.start.set(record.source.x - x, 4, record.source.y - z);
      this.end.set(0, WALL_HEIGHT, 0);
      this.direction.subVectors(this.end, this.start);
      beam.position.copy(this.start).add(this.end).multiplyScalar(0.5);
      beam.scale.set(0.22, this.direction.length(), 0.22);
      beam.quaternion.setFromUnitVectors(this.up, this.direction.normalize());
      beam.material.opacity = 0.75 * (1 - record.ageMs / 650);
    });
  }

  /** Releases shared geometry and each beam material once. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.cube.dispose();
    this.walls.forEach(({ beam }) => beam.material.dispose());
    this.group.clear();
  }
}
