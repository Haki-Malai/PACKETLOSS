import { Group } from 'three';
import { ENDLESS_SECTION_HEIGHT } from '../../domain/world/EndlessMazeGenerator';
import type { EndlessMazeStream } from '../../domain/world/EndlessMazeStream';
import type { QuarantineWall, WorldMapData, WorldTile } from '../../domain/world/WorldState';
import { MazeScene } from './MazeScene';

/** Renders section interiors independently with one neighbor row of contour context. */
export class EndlessMazePresentation {
  readonly group = new Group();
  private readonly scenes = new Map<number, MazeScene>();

  constructor(private readonly stream: EndlessMazeStream) {
    this.group.name = 'endless-maze';
    this.stream.getSections().forEach((section, slot) => this.install(section.index, slot));
  }

  /** Reuses four scenes and replaces the incoming section and its changed seam neighbor. */
  onShift(): void {
    const sections = this.stream.getSections();
    const active = new Set(sections.map((section) => section.index));
    for (const [index, scene] of this.scenes) {
      if (active.has(index)) continue;
      this.group.remove(scene.group);
      scene.dispose();
      this.scenes.delete(index);
    }
    const addedAtTop = !this.scenes.has(sections[0].index);
    sections.forEach((section, slot) => {
      const current = this.scenes.get(section.index);
      if (!current) this.install(section.index, slot);
      else {
        current.group.position.z = (slot * ENDLESS_SECTION_HEIGHT - 1) * 16;
        current.setClipBounds(slot * ENDLESS_SECTION_HEIGHT * 16,
          (slot + 1) * ENDLESS_SECTION_HEIGHT * 16);
      }
    });
    // The former outermost scene lacked the new neighbor in its one-row halo.
    const neighborSlot = addedAtTop ? 1 : sections.length - 2;
    this.replace(sections[neighborSlot].index, neighborSlot);
  }

  /** Sends each temporary rail to the one section that owns its upper tile. */
  syncQuarantineWalls(records: readonly QuarantineWall[]): void {
    this.stream.getSections().forEach((section, slot) => {
      const origin = slot * ENDLESS_SECTION_HEIGHT - 1;
      const local = records.filter((record) => record.tile.y >= slot * ENDLESS_SECTION_HEIGHT
        && record.tile.y < (slot + 1) * ENDLESS_SECTION_HEIGHT)
        .map((record) => ({ ...record, tile: { ...record.tile, y: record.tile.y - origin },
          source: { ...record.source, y: record.source.y - origin * 16 } }));
      this.scenes.get(section.index)?.syncQuarantineWalls(local);
    });
  }

  /** Releases every owned section scene and its GPU resources. */
  dispose(): void {
    this.scenes.forEach((scene) => scene.dispose());
    this.scenes.clear();
    this.group.clear();
  }

  /** Rebuilds one retained scene after its outer contour context changes. */
  private replace(index: number, slot: number): void {
    const old = this.scenes.get(index);
    if (old) {
      this.group.remove(old.group);
      old.dispose();
    }
    this.install(index, slot);
  }

  /** Creates a clipped section scene with neighboring contour rows. */
  private install(index: number, slot: number): void {
    const map = this.haloMap(slot);
    const scene = new MazeScene({ map }, {
      minZ: slot * ENDLESS_SECTION_HEIGHT * 16,
      maxZ: (slot + 1) * ENDLESS_SECTION_HEIGHT * 16,
    });
    scene.group.position.z = (slot * ENDLESS_SECTION_HEIGHT - 1) * 16;
    this.scenes.set(index, scene);
    this.group.add(scene.group);
  }

  /** Includes one adjacent row on each side so contours cross section seams cleanly. */
  private haloMap(slot: number): WorldMapData {
    const sections = this.stream.getSections();
    const center = sections[slot].map;
    const above = sections[slot - 1]?.map.tiles[ENDLESS_SECTION_HEIGHT - 1] ?? center.tiles[0];
    const below = sections[slot + 1]?.map.tiles[0] ?? center.tiles[ENDLESS_SECTION_HEIGHT - 1];
    const rows = [above, ...center.tiles, below];
    const tiles: WorldTile[][] = rows.map((row, y) => row.map((tile) => ({
      ...tile, y, collision: { ...tile.collision },
    })));
    return { ...center, height: tiles.length, heightInPixels: tiles.length * center.tileHeight, tiles };
  }
}
