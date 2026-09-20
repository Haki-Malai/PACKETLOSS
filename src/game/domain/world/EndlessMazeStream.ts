import { SeededRandom } from '../../shared/random/SeededRandom';
import type { PortalPair, WorldMapData, WorldTile } from './WorldState';
import {
  ENDLESS_RESIDENT_SECTIONS,
  ENDLESS_SECTION_HEIGHT,
  ENDLESS_WIDTH,
  generateEndlessSection,
  type EndlessSection,
} from './EndlessMazeGenerator';

export interface StreamShift {
  readonly rows: number;
  readonly evictedIndex: number;
  readonly addedIndex: number;
}

export interface ResidentEndlessSection extends EndlessSection {
  readonly pickupSeed: number;
}

/** Owns five generated sections and discards geography outside the rolling window. */
export class EndlessMazeStream {
  readonly map: WorldMapData;
  private readonly sections = new Map<number, ResidentEndlessSection>();
  private readonly generationRng: SeededRandom;
  private readonly pickupRng: SeededRandom;
  readonly initialPickupSeed: number;
  private firstIndex = -Math.floor(ENDLESS_RESIDENT_SECTIONS / 2);
  private revision = 0;

  constructor(private readonly runSeed: number) {
    this.generationRng = new SeededRandom(runSeed ^ 0x76a02e1b);
    this.pickupRng = new SeededRandom(runSeed ^ 0x658be273);
    this.initialPickupSeed = this.pickupRng.int(0x100000000);
    this.addSection(0);
    for (let distance = 1; distance <= Math.floor(ENDLESS_RESIDENT_SECTIONS / 2); distance += 1) {
      this.addSection(-distance);
      this.addSection(distance);
    }
    this.map = {
      width: ENDLESS_WIDTH,
      height: ENDLESS_SECTION_HEIGHT * ENDLESS_RESIDENT_SECTIONS,
      tileWidth: 16,
      tileHeight: 16,
      widthInPixels: ENDLESS_WIDTH * 16,
      heightInPixels: ENDLESS_SECTION_HEIGHT * ENDLESS_RESIDENT_SECTIONS * 16,
      tiles: this.collectTiles(),
      collisionByGid: new Map(),
      portalPairs: this.collectPortalPairs(),
      spawnObjects: [],
      collectibleObjects: [],
      topologyRevision: 0,
    };
  }

  /** Returns the global section index at the top of the resident window. */
  getFirstIndex(): number {
    return this.firstIndex;
  }

  /** Returns resident sections in top-to-bottom order. */
  getSections(): readonly ResidentEndlessSection[] {
    return Array.from({ length: ENDLESS_RESIDENT_SECTIONS }, (_, i) => this.sections.get(this.firstIndex + i)!);
  }

  /** Moves the window one section and returns the local coordinate translation. */
  shift(direction: 'up' | 'down'): StreamShift {
    const evictedIndex = direction === 'up'
      ? this.firstIndex + ENDLESS_RESIDENT_SECTIONS - 1 : this.firstIndex;
    this.sections.delete(evictedIndex);
    this.firstIndex += direction === 'up' ? -1 : 1;
    const addedIndex = direction === 'up'
      ? this.firstIndex : this.firstIndex + ENDLESS_RESIDENT_SECTIONS - 1;
    this.addSection(addedIndex);
    this.revision += 1;
    this.map.tiles = this.collectTiles();
    this.map.portalPairs = this.collectPortalPairs();
    this.map.topologyRevision = this.revision;
    return { rows: direction === 'up' ? ENDLESS_SECTION_HEIGHT : -ENDLESS_SECTION_HEIGHT,
      evictedIndex, addedIndex };
  }

  /** Converts a resident section's tile to the current rolling-map coordinate. */
  localRow(sectionIndex: number, row: number): number {
    return (sectionIndex - this.firstIndex) * ENDLESS_SECTION_HEIGHT + row;
  }

  /** Generates a fresh section, considering resident wordmarks for spacing. */
  private addSection(index: number): void {
    const neighborLogos = [...this.sections.values()].flatMap((section) =>
      section.logoRow === null ? [] : [section.index * ENDLESS_SECTION_HEIGHT + section.logoRow]);
    const section = {
      ...generateEndlessSection(this.runSeed, index,
        this.generationRng.int(0x100000000), neighborLogos),
      pickupSeed: this.pickupRng.int(0x100000000),
    };
    this.sections.set(index, section);
  }

  /** Rebases resident section tiles into one rectangular runtime map. */
  private collectTiles(): WorldTile[][] {
    return this.getSections().flatMap((section, slot) => section.map.tiles.map((row, y) =>
      row.map((tile) => ({ ...tile, y: slot * ENDLESS_SECTION_HEIGHT + y,
        collision: { ...tile.collision } }))));
  }

  /** Rebases each resident logo's portal pair into the rolling map window. */
  private collectPortalPairs(): PortalPair[] {
    return this.getSections().flatMap((section, slot) => (section.map.portalPairs ?? []).map((pair) => ({
      from: { ...pair.from, y: pair.from.y + slot * ENDLESS_SECTION_HEIGHT },
      to: { ...pair.to, y: pair.to.y + slot * ENDLESS_SECTION_HEIGHT },
    })));
  }
}
