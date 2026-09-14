import { Group, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';
import type { TilePosition } from '../../domain/valueObjects/TilePosition';

/** A floor outline leaves the lesson's pellet or enemy unobscured. */
export class TutorialMarker {
  readonly group = new Group();
  private readonly geometry: PlaneGeometry;
  private readonly material = new MeshBasicMaterial({ color: '#419da9', toneMapped: false });
  private disposed = false;

  constructor(private readonly tileSize: number) {
    this.group.name = 'tutorial-marker';
    this.group.visible = false;
    const edge = tileSize * 0.43;
    const length = tileSize * 0.28;
    this.geometry = new PlaneGeometry(length, tileSize * 0.035).rotateX(-Math.PI / 2);
    for (const x of [-1, 1]) {
      for (const z of [-1, 1]) {
        const horizontal = new Mesh(this.geometry, this.material);
        horizontal.position.set(x * (edge - length / 2), 0, z * edge);
        const vertical = new Mesh(this.geometry, this.material);
        vertical.rotation.y = Math.PI / 2;
        vertical.position.set(x * edge, 0, z * (edge - length / 2));
        this.group.add(horizontal, vertical);
      }
    }
  }

  sync(tile: Readonly<TilePosition> | null): void {
    if (this.disposed) return;
    this.group.visible = tile !== null;
    if (tile) this.group.position.set((tile.x + 0.5) * this.tileSize, 0.16, (tile.y + 0.5) * this.tileSize);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.geometry.dispose();
    this.material.dispose();
    this.group.clear();
  }
}
