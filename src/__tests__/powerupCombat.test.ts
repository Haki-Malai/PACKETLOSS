import { describe, expect, it } from 'vitest';
import { createPowerupCollisionWorld, firstPowerupWallHit, sweepPowerupBodies, type PowerupCollisionWorld } from '../game/domain/services/PowerupCollision';
import { steerMissile } from '../game/domain/services/MissileNavigation';
import type { WorldMapData } from '../game/domain/world/WorldState';
import { activatePowerup, cancelPowerupCast, clonePowerupCombatState, createPowerupCombatState,
  stepPowerupCombat } from '../game/simulation/PowerupCombat';
import { POWERUP_RULES, placePowerupPickups, type PowerupCombatActor } from '../game/shared/offensivePowerups';

/** Creates an independently authored empty room, optionally divided by a one-unit wall. */
function room(wallX?: number): PowerupCollisionWorld {
  const width = 256, height = 192, solid = new Uint8Array(width * height);
  if (wallX !== undefined) for (let y = 0; y < height; y += 1) solid[y * width + wallX] = 1;
  return { width, height, solid, tileSize: 16 };
}

/** Creates one circular actor at an explicit world center. */
function actor(id: string, x: number, y = 64): PowerupCombatActor {
  return { id, x, y, radius: 5, active: true };
}

/** Carves an authored winding corridor into a solid room, optionally opening a side junction. */
function missileCorridor(junction = false): PowerupCollisionWorld {
  const width = 144, height = 144, solid = new Uint8Array(width * height).fill(1);
  const cells = [[1, 1], [2, 1], [3, 1], [3, 2], [3, 3], [4, 3], [5, 3], [5, 4], [5, 5],
    [4, 5], [3, 5], [3, 6], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [7, 6],
    [7, 5], [7, 4], [7, 3], [7, 2], [7, 1], [6, 1], [5, 1]];
  if (junction) cells.push([2, 2], [2, 3]);
  for (const [x, y] of cells) for (let row = y * 16; row < (y + 1) * 16; row += 1) {
    solid.fill(0, row * width + x * 16, row * width + (x + 1) * 16);
  }
  return { width, height, solid, tileSize: 16 };
}

/** Builds terrain independently from collision geometry, with empty neighboring tiles. */
function terrain(localId: number | null): WorldMapData {
  const tiles = Array.from({ length: 3 }, (_, y) => Array.from({ length: 4 }, (_, x) => ({
    x, y, rawGid: x === 2 && y === 1 ? (localId ?? 0) + 1 : 0,
    gid: x === 2 && y === 1 ? (localId ?? 0) + 1 : null,
    localId: x === 2 && y === 1 ? localId : null, rotation: 0, flipX: false, flipY: false,
    collision: { collides: x === 2 && y === 1, penGate: false, portal: false,
      up: true, right: true, down: true, left: true },
  })));
  return { width: 4, height: 3, tileWidth: 16, tileHeight: 16, widthInPixels: 64, heightInPixels: 48,
    tiles, collisionByGid: new Map(), spawnObjects: [] };
}

describe('offensive collision geometry', () => {
  it('hits a thin wall at the first finite-body contact even across a large movement', () => {
    const hit = firstPowerupWallHit(room(80), { x: 40, y: 64 }, { x: 140, y: 64 }, 2);
    expect(hit?.time).toBeCloseTo(0.38);
    expect(hit?.position).toEqual({ x: 78, y: 64 });
  });

  it('uses rounded wall corners without false square-corner hits', () => {
    const walls = room();
    walls.solid[100 * walls.width + 100] = 1;
    const outside = { x: 98.5, y: 98.5 };
    expect(firstPowerupWallHit(walls, outside, outside, 2)).toBeNull();
    const inside = { x: 98.6, y: 98.6 };
    expect(firstPowerupWallHit(walls, inside, inside, 2)?.time).toBe(0);
  });

  it('stops a flat beam at the first surface across its width without leaving a rounded-front gap', () => {
    const walls = room(120);
    walls.solid[67 * walls.width + 90] = 1;
    expect(firstPowerupWallHit(walls, { x: 40, y: 64 }, { x: 140, y: 64 }, 3.4, 'beam')?.position)
      .toEqual({ x: 90, y: 64 });
    walls.solid[67 * walls.width + 90] = 0;
    walls.solid[68 * walls.width + 90] = 1;
    expect(firstPowerupWallHit(walls, { x: 40, y: 64 }, { x: 140, y: 64 }, 3.4, 'beam')?.position)
      .toEqual({ x: 120, y: 64 });
  });

  it('includes exact tangency on the lower side of a swept bounding box', () => {
    const walls = room();
    walls.solid[5 * walls.width] = 1;
    expect(firstPowerupWallHit(walls, { x: 3, y: 5.5 }, { x: 3, y: 6 }, 2)?.time).toBe(0);
    expect(firstPowerupWallHit(walls, { x: 3.001, y: 5.5 }, { x: 3.001, y: 6 }, 2)).toBeNull();
  });

  it('detects moving-body crossings and rejects a parallel near miss', () => {
    expect(sweepPowerupBodies({ x: 50, y: 64 }, { x: 100, y: 64 }, 2,
      { x: 75, y: 20 }, { x: 75, y: 108 }, 5)).not.toBeNull();
    expect(sweepPowerupBodies({ x: 50, y: 64 }, { x: 100, y: 64 }, 2,
      { x: 75, y: 72 }, { x: 75, y: 72 }, 5)).toBeNull();
  });

  it('preserves the authored open portal mouth even with blocking perimeter metadata', () => {
    const walls = createPowerupCollisionWorld(terrain(23));
    expect(firstPowerupWallHit(walls, { x: 24, y: 24 }, { x: 54, y: 24 }, 2)).toBeNull();
    expect(walls.solid[16 * walls.width + 47]).toBe(1);
  });

  it('blocks full terrain and prison rails while adding and removing temporary Quarantine seams', () => {
    for (const localId of [null, 17]) {
      const walls = createPowerupCollisionWorld(terrain(localId));
      expect(firstPowerupWallHit(walls, { x: 24, y: 24 }, { x: 54, y: 24 }, 2)?.position.x).toBe(30);
    }
    const prison = createPowerupCollisionWorld(terrain(16));
    expect(firstPowerupWallHit(prison, { x: 40, y: 19.1 }, { x: 40, y: 28 }, 1)?.position.y).toBe(21);
    const map = terrain(23), from = { x: 24, y: 24 }, to = { x: 40, y: 24 };
    const quarantine = createPowerupCollisionWorld(map, [{ tile: { x: 1, y: 1 }, side: 'right' }]);
    expect(firstPowerupWallHit(quarantine, from, to, 2)?.position.x).toBe(28);
    expect(firstPowerupWallHit(createPowerupCollisionWorld(map), from, to, 2)).toBeNull();
  });
});

describe('shared offensive combat', () => {
  it('expands blast through walls without hitting its owner or distant targets', () => {
    const state = createPowerupCombatState();
    const actors = [actor('owner', 64), actor('inner', 92), actor('outer', 114), actor('far', 134)];
    activatePowerup(state, 'owner', 'blast', 'right');
    expect(stepPowerupCombat(state, 450, actors, room(80), 60)).toEqual([]);
    expect(stepPowerupCombat(state, 300, actors, room(80), 60).map((hit) => hit.targetId)).toEqual(['inner', 'outer']);
    expect(state.effects[0].radius).toBeCloseTo(50.176);
  });

  it.each([1200, 1599])('includes full blast edge contact at %i ms and excludes a near miss', (age) => {
    const state = createPowerupCombatState();
    activatePowerup(state, 'owner', 'blast', 'right');
    stepPowerupCombat(state, age, [actor('owner', 64)], room(), 60);
    expect(stepPowerupCombat(state, 16, [actor('owner', 64), actor('edge', 133), actor('miss', 133.001)], room(), 60))
      .toEqual([{ targetId: 'edge', position: { x: 133, y: 64 } }]);
  });

  it.each([1000 / 60, 1000 / 120, 1000 / 144])('sweeps a fast crossing during blast fade with a %f ms step', (deltaMs) => {
    const state = createPowerupCombatState();
    activatePowerup(state, 'owner', 'blast', 'right');
    stepPowerupCombat(state, 1300, [actor('owner', 64)], room(), 60);
    const hits = stepPowerupCombat(state, deltaMs, [actor('owner', 64),
      { ...actor('crossing', -12), previous: { x: 140, y: 64 } }], room(), 60);
    expect(hits).toHaveLength(1);
    expect(hits[0].targetId).toBe('crossing');
    expect(hits[0].position.x).toBeCloseTo(133, 8);
  });

  it('respects protection and inactive actors, then kills when protection expires during blast fade', () => {
    const state = createPowerupCombatState();
    activatePowerup(state, 'owner', 'blast', 'right');
    const target = actor('target', 114);
    expect(stepPowerupCombat(state, 1300, [actor('owner', 64), { ...target, protected: true }], room(), 60))
      .toEqual([]);
    expect(stepPowerupCombat(state, 16, [actor('owner', 64), target,
      { ...actor('inactive', 114), active: false }], room(), 60))
      .toEqual([{ targetId: 'target', position: { x: 114, y: 64 } }]);
  });

  it('stops blast damage when its visible effect expires', () => {
    const state = createPowerupCombatState();
    activatePowerup(state, 'owner', 'blast', 'right');
    stepPowerupCombat(state, 1600, [actor('owner', 64)], room(), 60);
    expect(state.effects).toEqual([]);
    expect(stepPowerupCombat(state, 16, [actor('owner', 64), actor('late', 92)], room(), 60)).toEqual([]);
  });

  it('pulses reverse blast only once, honoring protection', () => {
    const state = createPowerupCombatState();
    activatePowerup(state, 'owner', 'reverse-blast', 'right');
    const protectedActor = { ...actor('protected', 82), protected: true };
    const actors = [actor('owner', 64), actor('near', 92), protectedActor, actor('later', 120)];
    const hits = stepPowerupCombat(state, 350, actors, room(80), 60);
    expect(hits.map((hit) => hit.targetId)).toEqual(['near']);
    expect(stepPowerupCombat(state, 500, [actors[0], actor('later', 70)], room(), 60)).toEqual([]);
  });

  it('grows laser reach and hits all aligned targets before the wall', () => {
    const state = createPowerupCombatState();
    activatePowerup(state, 'owner', 'laser', 'right');
    const actors = [actor('owner', 40), actor('one', 62), actor('two', 76), actor('blocked', 105), actor('miss', 62, 74)];
    expect(stepPowerupCombat(state, 480, actors, room(90), 60)).toEqual([]);
    expect(stepPowerupCombat(state, 170, actors, room(90), 60).map((hit) => hit.targetId)).toEqual(['one', 'two']);
    expect(state.effects[0].length).toBeCloseTo(47);
    stepPowerupCombat(state, 851, [actors[0]], room(), 60);
    expect(stepPowerupCombat(state, 100, [actors[0], actor('late', 62)], room(), 60)).toEqual([]);
  });

  it('ends laser damage at the visible tip, including finite-width corner near misses', () => {
    const state = createPowerupCombatState();
    activatePowerup(state, 'owner', 'laser', 'right');
    stepPowerupCombat(state, 700, [actor('owner', 40)], room(110), 60);
    expect(stepPowerupCombat(state, 20, [actor('owner', 40), actor('touching-tip', 115),
      actor('past-tip', 115.001), actor('outside-tip-corner', 115, 70)], room(110), 60)
      .map((hit) => hit.targetId)).toEqual(['touching-tip']);
  });

  it('grows beyond the old laser range to the first wall and hits distant opponents before it', () => {
    const state = createPowerupCombatState();
    activatePowerup(state, 'owner', 'laser', 'right');
    const actors = [actor('owner', 40), actor('distant', 200), actor('behind-wall', 245)];
    expect(stepPowerupCombat(state, 565, actors, room(230), 60)).toEqual([]);
    expect(state.effects[0].length).toBeCloseTo(93.5);
    expect(stepPowerupCombat(state, 85, actors, room(230), 60).map((hit) => hit.targetId)).toEqual(['distant']);
    expect(state.effects[0].length).toBeCloseTo(187);
  });

  it.each([
    { facing: 'right' as const, x: 40, y: 64, reach: 213 },
    { facing: 'left' as const, x: 220, y: 64, reach: 217 },
    { facing: 'down' as const, x: 128, y: 40, reach: 149 },
    { facing: 'up' as const, x: 128, y: 160, reach: 157 },
  ])('ends an uncapped $facing laser at the current world boundary', ({ facing, x, y, reach }) => {
    const state = createPowerupCombatState();
    activatePowerup(state, 'owner', 'laser', facing);
    stepPowerupCombat(state, 650, [actor('owner', x, y)], room(), 60);
    expect(state.effects[0].length).toBeCloseTo(reach);
  });

  it('cannot release a laser through an obstruction inside its muzzle offset', () => {
    const state = createPowerupCombatState();
    activatePowerup(state, 'owner', 'laser', 'right');
    expect(stepPowerupCombat(state, 700, [actor('owner', 40), actor('blocked', 100)], room(42), 60)).toEqual([]);
    expect(state.effects[0].length).toBe(0);
  });

  it('keeps a released laser mechanically tethered when its caster is rebased or relocated', () => {
    const state = createPowerupCombatState();
    activatePowerup(state, 'owner', 'laser', 'right');
    stepPowerupCombat(state, 700, [actor('owner', 40)], room(), 60);
    stepPowerupCombat(state, 20, [actor('owner', 80)], room(), 60);
    expect(state.effects[0]).toMatchObject({ x: 80, y: 64, angle: 0 });
    expect(state.casts[0].origin).toEqual({ x: 80, y: 64 });
    expect(state.effects[0].length).toBeCloseTo(173);
  });

  it('selects a wall before a homing target and records the exact impact', () => {
    const state = createPowerupCombatState();
    activatePowerup(state, 'owner', 'missile', 'right');
    const actors = [actor('owner', 32), actor('target', 96)];
    expect(stepPowerupCombat(state, POWERUP_RULES.missile.releaseMs + 640, actors, room(80), 60)).toEqual([]);
    expect(state.projectiles).toEqual([]);
    expect(state.effects.find((effect) => effect.role === 'impact')).toMatchObject({ x: 78, y: 64 });
  });

  it('locks the nearest eligible target, stays straight between centers, and continues after losing it', () => {
    const state = createPowerupCombatState();
    activatePowerup(state, 'owner', 'missile', 'right');
    const actors = [actor('owner', 64), { ...actor('protected', 64, 52), protected: true },
      actor('near', 64, 44), actor('far', 100)];
    stepPowerupCombat(state, POWERUP_RULES.missile.releaseMs, actors, room(), 60);
    expect(state.projectiles[0].targetId).toBe('near');
    stepPowerupCombat(state, 100, actors, room(), 60);
    const angle = state.projectiles[0].angle;
    expect(angle).toBe(0);
    stepPowerupCombat(state, 20, actors.filter((target) => target.id !== 'near'), room(), 60);
    expect(state.projectiles[0]).toMatchObject({ targetId: null, angle });
    const outside = createPowerupCombatState();
    activatePowerup(outside, 'owner', 'missile', 'right');
    stepPowerupCombat(outside, POWERUP_RULES.missile.releaseMs, [actor('owner', 64), actor('beyond-eight-tiles', 193)], room(), 60);
    expect(outside.projectiles[0].targetId).toBeNull();
  });

  it('pursues through legal right-angle corners, replays turn state, and hits its target after the third turn', () => {
    const state = createPowerupCombatState(), walls = missileCorridor();
    const actors = [actor('owner', 24, 24), actor('target', 88, 88)];
    activatePowerup(state, 'owner', 'missile', 'right');
    stepPowerupCombat(state, POWERUP_RULES.missile.releaseMs, actors, walls, 60);
    stepPowerupCombat(state, 200, actors, walls, 60);
    expect(state.projectiles[0].x).toBeCloseTo(48);
    expect(state.projectiles[0]).toMatchObject({ y: 24, angle: 0, turns: [], targetId: 'target' });
    stepPowerupCombat(state, 100, actors, walls, 60);
    expect(state.projectiles[0].x).toBeCloseTo(56);
    expect(state.projectiles[0].y).toBeCloseTo(28);
    expect(state.projectiles[0].angle).toBe(Math.PI / 2);
    expect(state.projectiles[0].turns).toEqual([expect.objectContaining({ y: 24, angle: Math.PI / 2 })]);
    expect(state.projectiles[0].turns[0].x).toBeCloseTo(56);
    expect(state.projectiles[0].turns[0].elapsedMs).toBeCloseTo(800 / 3);
    stepPowerupCombat(state, 250, actors, walls, 60);
    expect(state.projectiles[0].x).toBeCloseTo(58);
    expect(state.projectiles[0].y).toBeCloseTo(56);
    expect(state.projectiles[0].turns).toHaveLength(2);
    const checkpoint = clonePowerupCombatState(state);
    expect(stepPowerupCombat(state, 300, actors, walls, 60)).toEqual([]);
    expect(state.projectiles[0].x).toBeCloseTo(88);
    expect(state.projectiles[0].y).toBeCloseTo(62);
    expect(state.projectiles[0].turns).toHaveLength(3);
    stepPowerupCombat(checkpoint, 300, actors, walls, 60);
    expect(checkpoint).toEqual(state);
    expect(stepPowerupCombat(state, 200, actors, walls, 60))
      .toEqual([{ targetId: 'target', position: { x: 88, y: 88 } }]);
    expect(state.projectiles).toEqual([]);
    const impact = state.effects.find((effect) => effect.role === 'impact')!;
    expect(impact.x).toBeCloseTo(88);
    expect(impact.y).toBeCloseTo(81);
  });

  it('continues straight at an untargeted junction and takes forced bends', () => {
    const state = createPowerupCombatState(), walls = missileCorridor(true);
    activatePowerup(state, 'owner', 'missile', 'right');
    const actors = [actor('owner', 24, 24)];
    stepPowerupCombat(state, POWERUP_RULES.missile.releaseMs, actors, walls, 60);
    stepPowerupCombat(state, 200, actors, walls, 60);
    expect(state.projectiles[0].x).toBeCloseTo(48);
    expect(state.projectiles[0]).toMatchObject({ y: 24, angle: 0, turns: [], targetId: null });
    stepPowerupCombat(state, 500, actors, walls, 60);
    expect(state.projectiles[0].x).toBeCloseTo(76);
    expect(state.projectiles[0].y).toBeCloseTo(56);
    expect(state.projectiles[0].turns).toHaveLength(2);
  });

  it.each([54, 56])('launches at x=%i without skipping the forced corner or striking its wall', (x) => {
    const state = createPowerupCombatState(), walls = missileCorridor();
    const actors = [actor('owner', x, 24)];
    activatePowerup(state, 'owner', 'missile', 'right');
    stepPowerupCombat(state, POWERUP_RULES.missile.releaseMs + 100, actors, walls, 60);
    expect(state.projectiles).toHaveLength(1);
    expect(state.projectiles[0]).toMatchObject({ x: 56, angle: Math.PI / 2 });
    expect(state.projectiles[0].y).toBeCloseTo(x - 20);
    expect(state.effects.some((effect) => effect.role === 'impact')).toBe(false);
  });

  it('launches along the current corridor when the caster turns during the windup', () => {
    const state = createPowerupCombatState(), walls = missileCorridor();
    activatePowerup(state, 'owner', 'missile', 'right');
    stepPowerupCombat(state, POWERUP_RULES.missile.releaseMs + 100, [{ ...actor('owner', 56, 36), direction: 'down' }], walls, 60);
    expect(state.projectiles).toHaveLength(1);
    expect(state.projectiles[0]).toMatchObject({ x: 56, angle: Math.PI / 2 });
    expect(state.projectiles[0].y).toBeCloseTo(48);
  });

  it('self-destructs at a dead-end center instead of reversing or flying into its wall', () => {
    const state = createPowerupCombatState(), walls = missileCorridor();
    activatePowerup(state, 'owner', 'missile', 'left');
    stepPowerupCombat(state, POWERUP_RULES.missile.releaseMs + 200, [actor('owner', 40, 24)], walls, 60);
    expect(state.projectiles).toEqual([]);
    expect(state.effects.find((effect) => effect.role === 'impact')).toMatchObject({ x: 24, y: 24, radius: 0 });
  });

  it.each([{ y: 71, hit: true }, { y: 71.001, hit: false }])('uses its own two-unit collision radius at target y=$y', ({ y, hit }) => {
    const state = createPowerupCombatState();
    activatePowerup(state, 'owner', 'missile', 'right');
    expect(stepPowerupCombat(state, POWERUP_RULES.missile.releaseMs + 440, [actor('owner', 32), actor('target', 80, y)], room(), 60))
      .toEqual(hit ? [{ targetId: 'target', position: { x: 80, y } }] : []);
  });

  it('travels through a passage that clears the missile body but not the Packet body', () => {
    const state = createPowerupCombatState(), walls = missileCorridor();
    for (let y = 16; y < 32; y += 1) {
      if (y < 20 || y >= 28) walls.solid.fill(1, y * walls.width + 32, y * walls.width + 48);
    }
    activatePowerup(state, 'owner', 'missile', 'right');
    stepPowerupCombat(state, POWERUP_RULES.missile.releaseMs + 100, [actor('owner', 24, 24)], walls, 60);
    expect(state.projectiles).toHaveLength(1);
    expect(state.projectiles[0].x).toBeCloseTo(36);
    expect(state.projectiles[0]).toMatchObject({ y: 24, angle: 0 });
    expect(state.effects).toEqual([]);
  });

  it('self-destructs harmlessly when every corridor is blocked', () => {
    const state = createPowerupCombatState(), walls = missileCorridor();
    walls.solid.fill(1);
    for (let y = 16; y < 32; y += 1) walls.solid.fill(0, y * walls.width + 48, y * walls.width + 64);
    const actors = [actor('owner', 56, 24), actor('outside', 72, 24)];
    activatePowerup(state, 'owner', 'missile', 'right');
    expect(stepPowerupCombat(state, POWERUP_RULES.missile.releaseMs, actors, walls, 60)).toEqual([]);
    expect(state.projectiles).toEqual([]);
    expect(state.effects.find((effect) => effect.role === 'impact')).toMatchObject({ x: 56, y: 24, radius: 0 });
  });

  it('acquires a newly located target at a junction and kills it after a straight corner turn', () => {
    const state = createPowerupCombatState(), walls = missileCorridor(true);
    activatePowerup(state, 'owner', 'missile', 'right');
    stepPowerupCombat(state, POWERUP_RULES.missile.releaseMs, [actor('owner', 24, 24)], walls, 60);
    const hits = stepPowerupCombat(state, 400, [actor('owner', 24, 24), actor('target', 40, 48)], walls, 60);
    expect(hits).toEqual([{ targetId: 'target', position: { x: 40, y: 48 } }]);
    expect(state.projectiles).toEqual([]);
    expect(state.effects.find((effect) => effect.role === 'impact')?.x).toBeCloseTo(40);
  });

  it('routes around a newly blocked passage and ignores unreachable targets without reversing', () => {
    const walls = missileCorridor(true);
    const missile = { id: 1, ownerId: 'owner', targetId: 'target', x: 40, y: 24,
      angle: 0, elapsedMs: 0, turns: [] };
    const target = actor('target', 40, 48);
    expect(steerMissile(walls, missile, [target])).toEqual({ direction: 'down', targetId: 'target' });
    const closed = { ...walls, solid: walls.solid.slice() };
    closed.solid.fill(1, 32 * closed.width + 32, 32 * closed.width + 48);
    expect(steerMissile(closed, missile, [target])).toEqual({ direction: 'right', targetId: 'target' });
    expect(steerMissile(closed, missile, [actor('unreachable', 120, 8)]))
      .toEqual({ direction: 'right', targetId: null });
    expect(steerMissile(closed, missile, [actor('behind', 24, 24)]))
      .toEqual({ direction: 'right', targetId: null });
  });

  it.each([1000 / 60, 1000 / 120, 1000 / 144])('allows repeated turns until three-second expiry at %f ms frame steps', (deltaMs) => {
    const state = createPowerupCombatState(), walls = missileCorridor();
    const actors = [actor('owner', 24, 24)];
    activatePowerup(state, 'owner', 'missile', 'right');
    stepPowerupCombat(state, POWERUP_RULES.missile.releaseMs, actors, walls, 60);
    for (let elapsed = 0; elapsed < 2999; elapsed += deltaMs) {
      stepPowerupCombat(state, Math.min(deltaMs, 2999 - elapsed), actors, walls, 60);
    }
    expect(state.projectiles[0].x).toBeCloseTo(112.12);
    expect(state.projectiles[0].y).toBeCloseTo(24);
    expect(state.projectiles[0].angle).toBe(Math.PI);
    expect(state.projectiles[0].elapsedMs).toBeCloseTo(2999);
    expect(state.projectiles[0].turns).toHaveLength(8);
    expect(stepPowerupCombat(state, 1, actors, walls, 60)).toEqual([]);
    expect(state.projectiles).toEqual([]);
    expect(state.effects.find((effect) => effect.role === 'impact')).toMatchObject({ radius: 0 });
    stepPowerupCombat(state, 700, actors, walls, 60);
    expect(state.effects).toEqual([]);
  });

  it('self-destructs if new geometry already overlaps the launch body', () => {
    const state = createPowerupCombatState();
    activatePowerup(state, 'owner', 'missile', 'right');
    expect(stepPowerupCombat(state, POWERUP_RULES.missile.releaseMs, [actor('owner', 78), actor('target', 100)], room(80), 60)).toEqual([]);
    expect(state.projectiles).toEqual([]);
    expect(state.effects.find((effect) => effect.role === 'impact')).toMatchObject({ x: 78, y: 64 });
  });

  it('hits an opponent before a farther wall and consumes on a protected opponent', () => {
    const run = (protectedTarget: boolean) => {
      const state = createPowerupCombatState();
      activatePowerup(state, 'owner', 'missile', 'right');
      const hits = stepPowerupCombat(state, POWERUP_RULES.missile.releaseMs + 640,
        [actor('owner', 32), { ...actor('target', 70), protected: protectedTarget }], room(100), 60);
      return { state, hits };
    };
    expect(run(false).hits.map((hit) => hit.targetId)).toEqual(['target']);
    const protectedRun = run(true);
    expect(protectedRun.hits).toEqual([]);
    expect(protectedRun.state.projectiles).toEqual([]);
  });

  it('resolves concurrent missiles by earliest contact instead of projectile array order', () => {
    const state = createPowerupCombatState();
    state.projectiles.push({ id: state.nextId++, ownerId: 'later', targetId: null,
      x: 72.5, y: 64, angle: 0, elapsedMs: 0, turns: [] });
    state.projectiles.push({ id: state.nextId++, ownerId: 'earlier', targetId: null,
      x: 72.9, y: 64, angle: 0, elapsedMs: 0, turns: [] });
    const hits = stepPowerupCombat(state, 1000 / 120, [actor('later', 20), actor('earlier', 30),
      { ...actor('target', 80.5), previous: { x: 80, y: 64 } }], room(), 60);
    expect(hits).toHaveLength(1);
    expect(hits[0].position.x).toBeCloseTo(80.1, 8);
    expect(state.projectiles).toEqual([expect.objectContaining({ ownerId: 'later', x: 73.5 })]);
    expect(state.effects.filter((effect) => effect.role === 'impact'))
      .toEqual([expect.objectContaining({ ownerId: 'earlier' })]);
  });

  it('allows an earlier missile to replace a later growing laser contact within the same interval', () => {
    const state = createPowerupCombatState();
    state.effects.push({ id: state.nextId++, ownerId: 'area', kind: 'laser', role: 'attack',
      x: 30, y: 64, angle: 0, elapsedMs: 510, durationMs: 1800, radius: 3.4, length: 0 });
    state.projectiles.push({ id: state.nextId++, ownerId: 'missile', targetId: null,
      x: 72.9, y: 64, angle: 0, elapsedMs: 0, turns: [] });
    const hits = stepPowerupCombat(state, 1000 / 120, [actor('area', 20, 20), actor('missile', 20, 100),
      { ...actor('target', 80.5), previous: { x: 80, y: 64 } }], room(), 60);
    expect(hits).toHaveLength(1);
    expect(hits[0].position.x).toBeCloseTo(80.1, 8);
    expect(state.projectiles).toEqual([]);
    expect(state.effects.some((effect) => effect.role === 'impact')).toBe(true);
  });

  it('detects a crossing target while excluding the teleport gap', () => {
    const run = (teleported: boolean) => {
      const state = createPowerupCombatState();
      state.projectiles.push({ id: state.nextId++, ownerId: 'owner', targetId: null, x: 64, y: 64, angle: 0, elapsedMs: 0, turns: [] });
      return stepPowerupCombat(state, 16, [actor('owner', 32),
        { ...actor('crossing', 76, 128), previous: { x: 76, y: 0 }, teleported }], room(), 1200);
    };
    expect(run(false).map((hit) => hit.targetId)).toEqual(['crossing']);
    expect(run(true)).toEqual([]);
  });

  it('uses the exact release position while moving, falling back to cast facing without an actor heading', () => {
    const state = createPowerupCombatState();
    expect(activatePowerup(state, 'owner', 'missile', 'right')).toBe(true);
    expect(activatePowerup(state, 'owner', 'laser', 'left')).toBe(false);
    stepPowerupCombat(state, 1300, [{ ...actor('owner', 118), previous: { x: 40, y: 64 } }], room(), 60);
    expect(state.casts).toEqual([]);
    expect(state.projectiles[0].angle).toBe(0);
    expect(state.projectiles[0].x).toBeCloseTo(136);
  });

  it('waits for the complete startup before releasing from the moving Packet and starting its flight clock', () => {
    const state = createPowerupCombatState(), walls = room();
    activatePowerup(state, 'owner', 'missile', 'right');
    stepPowerupCombat(state, 999, [{ ...actor('owner', 100), previous: { x: 40, y: 64 }, direction: 'right' }], walls, 60);
    expect(state.projectiles).toEqual([]);
    expect(state.casts).toHaveLength(1);
    expect(state.casts[0].origin).toBeNull();
    const id = state.casts[0].id;
    stepPowerupCombat(state, 1, [{ ...actor('owner', 100.06), previous: { x: 100, y: 64 }, direction: 'right' }], walls, 60);
    expect(state.casts).toEqual([]);
    expect(state.projectiles).toEqual([{ id, ownerId: 'owner', targetId: null,
      x: 100.06, y: 64, angle: 0, elapsedMs: 0, turns: [] }]);
    expect(state.effects).toEqual([]);
    stepPowerupCombat(state, 100, [{ ...actor('owner', 94.06), direction: 'left' }], walls, 60);
    expect(state.projectiles[0].x).toBeCloseTo(112.06);
    expect(state.projectiles[0].elapsedMs).toBeCloseTo(100);
  });

  it('sweeps both sides of a portal while excluding the jump between them', () => {
    const crossing = { ...actor('traveler', 192, 100), previous: { x: 64, y: 100 },
      teleported: true, teleportMotion: {
        departure: { x: 64, y: 50 }, arrival: { x: 192, y: 50 }, fraction: 0.5,
      } };
    const run = (x: number) => {
      const state = createPowerupCombatState();
      state.projectiles.push({ id: state.nextId++, ownerId: 'owner', targetId: null,
        x, y: 64, angle: 0, elapsedMs: 0, turns: [] });
      return stepPowerupCombat(state, 20, [actor('owner', 20), crossing], room(), 0);
    };
    expect(run(64)[0]).toMatchObject({ targetId: 'traveler' });
    expect(run(64)[0].position.x).toBe(64);
    expect(run(192)[0]).toMatchObject({ targetId: 'traveler' });
    expect(run(192)[0].position.x).toBe(192);
    expect(run(128)).toEqual([]);
  });

  it('releases at the arrival point when casting completes exactly at a portal boundary', () => {
    const state = createPowerupCombatState();
    activatePowerup(state, 'owner', 'reverse-blast', 'right');
    const owner = { ...actor('owner', 192), previous: { x: 40, y: 64 }, teleportMotion: {
      departure: { x: 48, y: 64 }, arrival: { x: 192, y: 64 }, fraction: 1,
    } };
    expect(stepPowerupCombat(state, 350, [owner, actor('source', 64), actor('arrival', 208)], room(), 60)
      .map((hit) => hit.targetId)).toEqual(['arrival']);
    expect(state.casts[0].origin).toEqual({ x: 192, y: 64 });
  });

  it('cancels pending releases but keeps released attacks, and snapshots are detached', () => {
    const state = createPowerupCombatState();
    activatePowerup(state, 'owner', 'blast', 'right');
    cancelPowerupCast(state, 'owner');
    expect(state.casts).toEqual([]);
    expect(state.effects).toEqual([]);
    activatePowerup(state, 'owner', 'blast', 'right');
    stepPowerupCombat(state, 500, [actor('owner', 64)], room(), 60);
    cancelPowerupCast(state, 'owner');
    expect(state.effects).toHaveLength(1);
    expect(stepPowerupCombat(state, 400, [{ ...actor('owner', 64), active: false }, actor('target', 92)], room(), 60)
      .map((hit) => hit.targetId)).toEqual(['target']);
    const clone = clonePowerupCombatState(state);
    clone.effects[0].x = 900;
    expect(state.effects[0].x).toBe(64);
  });

  it('cancels an unreleased cast when its owner dies earlier in the same simulation advance', () => {
    const state = createPowerupCombatState();
    activatePowerup(state, 'victim', 'missile', 'right');
    state.projectiles.push({ id: state.nextId++, ownerId: 'attacker', targetId: null,
      x: 48, y: 64, angle: 0, elapsedMs: 0, turns: [] });
    expect(stepPowerupCombat(state, 400, [actor('victim', 64), actor('attacker', 32)], room(), 60)
      .map((hit) => hit.targetId)).toEqual(['victim']);
    expect(state.casts).toEqual([]);
    expect(state.effects.some((effect) => effect.ownerId === 'victim')).toBe(false);
  });

  it('cancels a release just after a missile hit in the same short interval', () => {
    const state = createPowerupCombatState();
    activatePowerup(state, 'victim', 'reverse-blast', 'right');
    state.casts[0].elapsedMs = state.effects[0].elapsedMs = 346;
    state.projectiles.push({ id: state.nextId++, ownerId: 'attacker', targetId: null,
      x: 60, y: 64, angle: 0, elapsedMs: 0, turns: [] });
    expect(stepPowerupCombat(state, 8, [actor('victim', 64), actor('attacker', 32), actor('bystander', 90)], room(), 60)
      .map((hit) => hit.targetId)).toEqual(['victim']);
    expect(state.casts).toEqual([]);
  });

  it('preserves a release simultaneous with its caster being hit', () => {
    const state = createPowerupCombatState();
    activatePowerup(state, 'victim', 'reverse-blast', 'right');
    state.casts[0].elapsedMs = state.effects[0].elapsedMs = 346;
    state.projectiles.push({ id: state.nextId++, ownerId: 'attacker', targetId: null,
      x: 56.52, y: 64, angle: 0, elapsedMs: 0, turns: [] });
    expect(stepPowerupCombat(state, 4, [actor('victim', 64), actor('attacker', 20), actor('bystander', 90)], room(), 60)
      .map((hit) => hit.targetId).sort()).toEqual(['bystander', 'victim']);
  });

  it('clips a released beam when the topology gains a wall, with damage and reach changing together', () => {
    const state = createPowerupCombatState();
    activatePowerup(state, 'owner', 'laser', 'right');
    stepPowerupCombat(state, 700, [actor('owner', 40)], room(), 60);
    expect(state.effects[0].length).toBeCloseTo(213);
    expect(stepPowerupCombat(state, 20, [actor('owner', 40), actor('blocked', 100)], room(80), 60)).toEqual([]);
    expect(state.effects[0].length).toBeCloseTo(37);
  });

  it('expires straight missiles without acquiring a replacement target', () => {
    const state = createPowerupCombatState();
    state.projectiles.push({ id: state.nextId++, ownerId: 'owner', targetId: 'gone', x: 32, y: 64, angle: 0, elapsedMs: 2990, turns: [] });
    stepPowerupCombat(state, 20, [actor('owner', 16), actor('other', 100, 100)], room(), 60);
    expect(state.projectiles).toEqual([]);
  });

  it('does not sweep target movement beyond the missile expiration instant', () => {
    const state = createPowerupCombatState();
    state.projectiles.push({ id: state.nextId++, ownerId: 'owner', targetId: null,
      x: 50, y: 64, angle: 0, elapsedMs: 2999, turns: [] });
    expect(stepPowerupCombat(state, 8, [actor('owner', 20), { ...actor('crossing', 40), radius: 1,
      previous: { x: 60, y: 64 } }], room(), 0)).toEqual([]);
    expect(state.projectiles).toEqual([]);
  });

  it('includes the exact reverse pulse radius boundary and excludes a near miss without splash damage', () => {
    const state = createPowerupCombatState();
    activatePowerup(state, 'owner', 'reverse-blast', 'right');
    expect(stepPowerupCombat(state, 350, [actor('owner', 64), actor('edge', 101), actor('miss', 101.001)], room(), 60)
      .map((hit) => hit.targetId)).toEqual(['edge']);
  });

  it('places distinct mirrored pairs without mutating candidate positions', () => {
    const candidates = Array.from({ length: 12 }, (_, index) => ({ x: 8 + index * 16, y: 40 }));
    const pickups = placePowerupPickups(candidates, 5, 2, 192);
    expect(pickups).toHaveLength(8);
    expect(new Set(pickups.map((pickup) => pickup.x)).size).toBe(8);
    for (const kind of ['blast', 'reverse-blast', 'laser', 'missile']) {
      const pair = pickups.filter((pickup) => pickup.kind === kind);
      expect(pair).toHaveLength(2);
      expect(pair[0].x + pair[1].x).toBe(192);
    }
    expect(candidates[0]).toEqual({ x: 8, y: 40 });
  });
});
