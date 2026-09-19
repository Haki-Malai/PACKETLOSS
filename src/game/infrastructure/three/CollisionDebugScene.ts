import {
  BufferAttribute, BufferGeometry, Color, Group, InstancedMesh, LineBasicMaterial,
  LineSegments, Matrix4, MeshBasicMaterial, PlaneGeometry,
} from 'three';
import { TilePosition } from '../../domain/valueObjects/TilePosition';
import { WorldState } from '../../domain/world/WorldState';

export class CollisionDebugScene {
  readonly group = new Group();
  private readonly edges = new BufferGeometry();
  private readonly markers = new BufferGeometry();
  private readonly temporaryEdges = new BufferGeometry();
  private temporaryEdgeKey = '';
  private readonly linesMaterial = new LineBasicMaterial({ vertexColors: true, depthTest: false, depthWrite: false });
  private readonly fillGeometry = new PlaneGeometry(1, 1);
  private readonly fillMaterial = new MeshBasicMaterial({
    color: '#ff3355', transparent: true, opacity: 0.06, depthTest: false, depthWrite: false,
  });
  private readonly fills: InstancedMesh;

  constructor(private readonly world: WorldState) {
    this.group.name = 'collision-debug';
    this.group.visible = false;
    const positions: number[] = [];
    const colors: number[] = [];
    const filled: TilePosition[] = [];
    const size = world.tileSize;
    for (let y = 0; y < world.map.height; y += 1) {
      for (let x = 0; x < world.map.width; x += 1) {
        const tile = world.collisionGrid.getTileAt(x, y);
        const color = new Color(tile.penGate ? '#00ffff' : '#ff3355');
        const line = (x1: number, z1: number, x2: number, z2: number): void => {
          positions.push(x1 * size, 0.1, z1 * size, x2 * size, 0.1, z2 * size);
          colors.push(color.r, color.g, color.b, color.r, color.g, color.b);
        };
        if (tile.up) line(x, y, x + 1, y);
        if (tile.down) line(x, y + 1, x + 1, y + 1);
        if (tile.left) line(x, y, x, y + 1);
        if (tile.right) line(x + 1, y, x + 1, y + 1);
        if (tile.up && tile.down && tile.left && tile.right) filled.push({ x, y });
      }
    }
    this.edges.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    this.edges.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
    const edges = new LineSegments(this.edges, this.linesMaterial);
    edges.renderOrder = 101;
    this.group.add(edges);
    this.temporaryEdges.setAttribute('position', new BufferAttribute(new Float32Array(24), 3));
    const purple = new Color('#b846ff');
    const temporaryColors = new Float32Array(24);
    for (let index = 0; index < 8; index += 1) temporaryColors.set([purple.r, purple.g, purple.b], index * 3);
    this.temporaryEdges.setAttribute('color', new BufferAttribute(temporaryColors, 3));
    this.temporaryEdges.setDrawRange(0, 0);
    const temporary = new LineSegments(this.temporaryEdges, this.linesMaterial);
    temporary.renderOrder = 101;
    this.group.add(temporary);

    this.fillGeometry.rotateX(-Math.PI / 2);
    this.fills = new InstancedMesh(this.fillGeometry, this.fillMaterial, filled.length);
    this.fills.renderOrder = 100;
    const matrix = new Matrix4();
    filled.forEach((tile, index) => {
      matrix.makeScale(size, 1, size);
      matrix.setPosition((tile.x + 0.5) * size, 0.05, (tile.y + 0.5) * size);
      this.fills.setMatrixAt(index, matrix);
    });
    this.fills.computeBoundingSphere();
    this.group.add(this.fills);

    const capacity = (world.enemies.length + 2) * 24;
    this.markers.setAttribute('position', new BufferAttribute(new Float32Array(capacity), 3));
    this.markers.setAttribute('color', new BufferAttribute(new Float32Array(capacity), 3));
    const markers = new LineSegments(this.markers, this.linesMaterial);
    markers.name = 'debug-markers';
    markers.frustumCulled = false;
    markers.renderOrder = 102;
    this.group.add(markers);
  }

  sync(): void {
    this.group.visible = this.world.collisionDebugEnabled;
    if (!this.group.visible) return;
    this.syncTemporaryEdges();
    const position = this.markers.getAttribute('position') as BufferAttribute;
    const colors = this.markers.getAttribute('color') as BufferAttribute;
    let index = 0;
    const mark = (tile: TilePosition, colorHex: string): void => {
      const color = new Color(colorHex);
      const left = tile.x * this.world.tileSize + 1;
      const top = tile.y * this.world.tileSize + 1;
      const right = left + this.world.tileSize - 2;
      const bottom = top + this.world.tileSize - 2;
      for (const [x, z] of [[left, top], [right, top], [right, top], [right, bottom],
        [right, bottom], [left, bottom], [left, bottom], [left, top]]) {
        position.setXYZ(index, x, 0.12, z);
        colors.setXYZ(index, color.r, color.g, color.b);
        index += 1;
      }
    };
    mark(this.world.packet.tile, '#ffdd00');
    this.world.enemies.forEach((enemy) => {
      if (enemy.active) mark(enemy.tile, '#00ff66');
    });
    if (this.world.hoveredDebugTile) mark(this.world.hoveredDebugTile, '#33ccff');
    position.needsUpdate = true;
    colors.needsUpdate = true;
    this.markers.setDrawRange(0, index);
  }

  /** Refreshes the purple collision overlay only when closed passage topology changes. */
  private syncTemporaryEdges(): void {
    const key = this.world.quarantineWalls.map(({ tile, side }) => `${tile.x},${tile.y},${side}`).sort().join('|');
    if (key === this.temporaryEdgeKey) return;
    this.temporaryEdgeKey = key;
    const position = this.temporaryEdges.getAttribute('position') as BufferAttribute;
    const size = this.world.tileSize;
    this.world.quarantineWalls.forEach(({ tile, side }, index) => {
      const x = (tile.x + (side === 'right' ? 1 : 0)) * size;
      const z = (tile.y + (side === 'down' ? 1 : 0)) * size;
      position.setXYZ(index * 2, x, 0.12, z);
      position.setXYZ(index * 2 + 1, x + (side === 'down' ? size : 0), 0.12, z + (side === 'right' ? size : 0));
    });
    position.needsUpdate = true;
    this.temporaryEdges.setDrawRange(0, this.world.quarantineWalls.length * 2);
  }

  dispose(): void {
    this.edges.dispose();
    this.temporaryEdges.dispose();
    this.markers.dispose();
    this.linesMaterial.dispose();
    this.fillGeometry.dispose();
    this.fillMaterial.dispose();
    this.fills.dispose();
    this.group.clear();
  }
}
