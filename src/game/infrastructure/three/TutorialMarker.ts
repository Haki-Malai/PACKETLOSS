import { Group, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';
import type { TilePosition } from '../../domain/valueObjects/TilePosition';

/** Cyan floor outlines render over maze walls without obscuring lesson targets. */
export class TutorialMarker {
  readonly group = new Group();
  private readonly geometry: PlaneGeometry;
  private readonly material = new MeshBasicMaterial({
    color: '#419da9', toneMapped: false, depthTest: false, depthWrite: false,
  });
  private readonly markers: Group[] = [];
  private disposed = false;

  constructor(private readonly tileSize: number) {
    this.group.name = 'tutorial-marker';
    this.group.visible = false;
    const edge = tileSize * 0.43;
    const length = tileSize * 0.28;
    this.geometry = new PlaneGeometry(length, tileSize * 0.035).rotateX(-Math.PI / 2);
    this.edge = edge;
    this.length = length;
  }

  private readonly edge: number;
  private readonly length: number;

  /** Synchronizes one shared marker shape for every current tutorial target. */
  sync(tiles: readonly Readonly<TilePosition>[]): void {
    if (this.disposed) return;
    this.group.visible = tiles.length > 0;
    while (this.markers.length < tiles.length) {
      const marker = this.createMarker();
      this.markers.push(marker);
      this.group.add(marker);
    }
    while (this.markers.length > tiles.length) {
      const marker = this.markers.pop()!;
      this.group.remove(marker);
      marker.clear();
    }
    tiles.forEach((tile, index) => {
      this.markers[index].position.set((tile.x + 0.5) * this.tileSize, 0.16, (tile.y + 0.5) * this.tileSize);
    });
  }

  /** Creates one outlined tile marker using the shared geometry and material. */
  private createMarker(): Group {
    const marker = new Group();
    for (const x of [-1, 1]) {
      for (const z of [-1, 1]) {
        const horizontal = new Mesh(this.geometry, this.material);
        horizontal.renderOrder = 1000;
        horizontal.position.set(x * (this.edge - this.length / 2), 0, z * this.edge);
        const vertical = new Mesh(this.geometry, this.material);
        vertical.renderOrder = 1000;
        vertical.rotation.y = Math.PI / 2;
        vertical.position.set(x * this.edge, 0, z * (this.edge - this.length / 2));
        marker.add(horizontal, vertical);
      }
    }
    return marker;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.geometry.dispose();
    this.material.dispose();
    this.markers.length = 0;
    this.group.clear();
  }
}
