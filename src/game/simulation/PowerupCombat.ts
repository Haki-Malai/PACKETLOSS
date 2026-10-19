import { DIRECTION_VECTORS, type Direction } from '../domain/valueObjects/Direction';
import { expandingCircleContact, firstPowerupWallHit, interpolatePowerupPoint, sweepPowerupBodies,
  type PowerupCollisionWorld } from '../domain/services/PowerupCollision';
import { missileCenterDistance, missileHeading, steerMissile } from '../domain/services/MissileNavigation';
import { POWERUP_RULES, sampleLaserLength, samplePowerupRadius, type PowerupCast,
  type PowerupCombatActor, type PowerupCombatState, type PowerupEffect, type PowerupHit,
  type PowerupKind, type PowerupPoint, type PowerupProjectile } from '../shared/offensivePowerups';

const MAX_COMBAT_STEP_MS = 1000 / 120;
const EPSILON = 1e-9;
interface IntervalActor extends PowerupCombatActor { endpoint?: PowerupPoint }
interface TimedHit extends PowerupHit { timeMs: number }
interface MissileMotion {
  duration: number; angle: number; targetId: string | null; turned: boolean;
  from: PowerupPoint; to: PowerupPoint; contact: number; victim?: PowerupCombatActor;
}

/** Creates serializable combat state owned by one run or authoritative match. */
export function createPowerupCombatState(): PowerupCombatState {
  return { clockMs: 0, nextId: 1, casts: [], projectiles: [], effects: [] };
}

/** Copies all mutable combat records for snapshots, restore, and presentation sampling. */
export function clonePowerupCombatState(state: PowerupCombatState): PowerupCombatState {
  return { ...state,
    casts: state.casts.map((cast) => ({ ...cast, origin: cast.origin ? { ...cast.origin } : null })),
    projectiles: state.projectiles.map((projectile) => ({ ...projectile,
      turns: projectile.turns.map((turn) => ({ ...turn })) })),
    effects: state.effects.map((effect) => ({ ...effect, ...(effect.source ? { source: { ...effect.source } } : {}) })),
  };
}

/** Starts one cast; the owning mode consumes its inventory only when this succeeds. */
export function activatePowerup(state: PowerupCombatState, ownerId: string, kind: PowerupKind,
  facing: Direction): boolean {
  if (state.casts.some((cast) => cast.ownerId === ownerId)) return false;
  const id = state.nextId++;
  state.casts.push({ id, ownerId, kind, facing, elapsedMs: 0, origin: null });
  if (kind !== 'missile') state.effects.push({ id, ownerId, kind, role: 'attack', x: 0, y: 0,
    angle: directionAngle(facing), elapsedMs: 0, durationMs: POWERUP_RULES[kind].durationMs,
    radius: 0, length: 0 });
  return true;
}

/** Cancels a dead owner's pending release while leaving already released attacks alive. */
export function cancelPowerupCast(state: PowerupCombatState, ownerId: string): void {
  const pending = new Set(state.casts.filter((cast) => cast.ownerId === ownerId && cast.origin === null).map((cast) => cast.id));
  state.casts = state.casts.filter((cast) => cast.ownerId !== ownerId);
  state.effects = state.effects.filter((effect) => !pending.has(effect.id));
}

/** Records a timed pickup absorption from its actual ground origin to the player's current location. */
export function addPowerupCollection(state: PowerupCombatState, ownerId: string, kind: PowerupKind,
  source: PowerupPoint, target: PowerupPoint): void {
  state.effects.push({ id: state.nextId++, ownerId, kind, role: 'collection', ...target,
    source: { ...source }, angle: 0, elapsedMs: 0, durationMs: 300, radius: 0, length: 0 });
}

/** Advances casts and swept hits, splitting missile center turns; kills are returned together for mode-owned outcomes. */
export function stepPowerupCombat(state: PowerupCombatState, deltaMs: number,
  actors: readonly PowerupCombatActor[], walls: PowerupCollisionWorld,
  playerSpeedWorldUnitsPerSecond: number): PowerupHit[] {
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) return [];
  const hits = new Map<string, TimedHit>();
  let elapsed = 0;
  while (elapsed < deltaMs - EPSILON) {
    let stepMs = Math.min(MAX_COMBAT_STEP_MS, deltaMs - elapsed);
    if (playerSpeedWorldUnitsPerSecond > 0) for (const projectile of state.projectiles) {
      stepMs = Math.min(stepMs, missileCenterDistance(projectile, projectile.angle, walls.tileSize)
        / (playerSpeedWorldUnitsPerSecond * POWERUP_RULES.missile.speedMultiplier) * 1000);
    }
    for (const actor of actors) {
      const boundary = actor.teleportMotion ? actor.teleportMotion.fraction * deltaMs : Infinity;
      if (boundary > elapsed + EPSILON) stepMs = Math.min(stepMs, boundary - elapsed);
    }
    for (const cast of state.casts) {
      const releaseInMs = POWERUP_RULES[cast.kind].releaseMs - cast.elapsedMs;
      if (!cast.origin && releaseInMs > EPSILON) stepMs = Math.min(stepMs, releaseInMs);
    }
    const samples = actors.map((actor) => {
      const end = (elapsed + stepMs) / deltaMs;
      const jump = actor.teleportMotion;
      return { ...actor, ...sampleActorMotion(actor, end, false),
        active: actor.active && !hits.has(actor.id),
        previous: sampleActorMotion(actor, elapsed / deltaMs, true),
        ...(jump && Math.abs(end - jump.fraction) < EPSILON ? { endpoint: jump.arrival } : {}) };
    });
    stepInterval(state, stepMs, samples, walls, playerSpeedWorldUnitsPerSecond, hits);
    elapsed += stepMs;
  }
  return [...hits.values()].map(({ targetId, position }) => ({ targetId, position }));
}

/** Runs one bounded interval, tethering active lasers to their casters and preserving earliest hit positions. */
function stepInterval(state: PowerupCombatState, deltaMs: number, actors: readonly IntervalActor[],
  walls: PowerupCollisionWorld, speed: number, hits: Map<string, TimedHit>): void {
  state.clockMs += deltaMs;
  for (const effect of state.effects) effect.elapsedMs += deltaMs;
  for (const effect of state.effects) {
    const cast = state.casts.find((candidate) => candidate.id === effect.id);
    if (effect.kind === 'laser' && cast?.origin) {
      const owner = actors.find((actor) => actor.id === effect.ownerId && actor.active);
      if (owner) { cast.origin = ownerPoint(owner); Object.assign(effect, cast.origin); }
    }
    if (effect.role === 'attack' && cast?.origin !== null) {
      updateAttack(effect, effect.elapsedMs - deltaMs, effect.elapsedMs, actors, walls, hits, state.clockMs - deltaMs);
    }
  }
  advanceMissiles(state, deltaMs, actors, walls, speed, hits);
  for (const cast of state.casts) {
    const owner = actors.find((actor) => actor.id === cast.ownerId);
    const rule = POWERUP_RULES[cast.kind];
    const previousAge = cast.elapsedMs;
    cast.elapsedMs += deltaMs;
    const effect = state.effects.find((candidate) => candidate.id === cast.id);
    const releaseAtMs = state.clockMs + rule.releaseMs - cast.elapsedMs;
    if ((!owner?.active || (hits.get(cast.ownerId)?.timeMs ?? Infinity) < releaseAtMs - EPSILON)
      && cast.origin === null) {
      cast.elapsedMs = rule.durationMs;
      if (effect) effect.elapsedMs = effect.durationMs;
      continue;
    }
    if (effect) {
      effect.elapsedMs = cast.elapsedMs;
      if (cast.origin === null && owner) Object.assign(effect, ownerPoint(owner));
    }
    if (cast.origin === null && owner && cast.elapsedMs >= rule.releaseMs - EPSILON) {
      const releaseFraction = Math.max(0, Math.min(1, (rule.releaseMs - previousAge) / deltaMs));
      cast.origin = sampleReleasePoint(owner, releaseFraction);
      if (effect) Object.assign(effect, cast.origin);
      if (cast.kind === 'reverse-blast') {
        for (const target of eligibleTargets(actors, cast.ownerId, hits)) {
          const point = sampleReleasePoint(target, releaseFraction);
          if (Math.hypot(point.x - cast.origin.x, point.y - cast.origin.y) <= rule.radius + target.radius) {
            recordHit(hits, { targetId: target.id, position: point, timeMs: releaseAtMs });
          }
        }
      } else if (cast.kind === 'missile') {
        const releaseActors = actors.map((actor) => ({ ...actor,
          ...(releaseFraction >= 1 - EPSILON && actor.endpoint ? actor.endpoint : {}),
          previous: sampleReleasePoint(actor, releaseFraction) }));
        launchMissile(state, cast, releaseActors, walls, hits, deltaMs * (1 - releaseFraction), speed);
      }
    }
    if (effect && cast.origin) {
      effect.radius = samplePowerupRadius(effect.kind, cast.elapsedMs);
      if (effect.kind === 'laser') effect.length = laserReach(effect, cast.elapsedMs, walls);
    }
  }
  state.casts = state.casts.filter((cast) => cast.elapsedMs < POWERUP_RULES[cast.kind].durationMs - EPSILON);
  state.projectiles = state.projectiles.filter((projectile) => projectile.elapsedMs < POWERUP_RULES.missile.lifetimeMs - EPSILON);
  state.effects = state.effects.filter((effect) => effect.elapsedMs < effect.durationMs - EPSILON);
}

/** Resolves growing area and beam contact against actor movement during the active part of the interval. */
function updateAttack(effect: PowerupEffect, previousAge: number, age: number,
  actors: readonly PowerupCombatActor[], walls: PowerupCollisionWorld, hits: Map<string, TimedHit>, intervalStartMs: number): void {
  const rule = POWERUP_RULES[effect.kind];
  effect.radius = samplePowerupRadius(effect.kind, age);
  if (effect.kind === 'reverse-blast' || effect.kind === 'missile') return;
  const start = Math.max(previousAge, rule.releaseMs), end = Math.min(age, rule.activeUntilMs);
  if (effect.kind === 'laser') {
    effect.length = laserReach(effect, age, walls);
  }
  if (end <= start + EPSILON) return;
  const startFraction = (start - previousAge) / (age - previousAge);
  const endFraction = (end - previousAge) / (age - previousAge);
  for (const target of eligibleTargets(actors, effect.ownerId, hits, intervalStartMs)) {
    const from = interpolatePowerupPoint(target.previous ?? target, target, startFraction);
    const to = interpolatePowerupPoint(target.previous ?? target, target, endFraction);
    let contact: number | null;
    if (effect.kind === 'blast') {
      contact = expandingCircleContact({ x: from.x - effect.x, y: from.y - effect.y },
        { x: to.x - effect.x, y: to.y - effect.y },
        samplePowerupRadius('blast', start) + target.radius,
        samplePowerupRadius('blast', end) + target.radius);
    } else {
      const origin = muzzlePoint(effect, POWERUP_RULES.laser.muzzle);
      const fromLength = laserReach(effect, start, walls), toLength = laserReach(effect, end, walls);
      if (toLength <= EPSILON) continue;
      contact = movingBeamContact(from, to, target.radius, origin, effect.angle, fromLength, toLength, effect.radius);
    }
    if (contact !== null) recordHit(hits, { targetId: target.id, position: interpolatePowerupPoint(from, to, contact),
      timeMs: intervalStartMs + start - previousAge + (end - start) * contact });
  }
}

/** Grows the flat beam tip to its first wall surface, checking its width, muzzle offset, and arena boundary. */
function laserReach(effect: PowerupEffect, age: number, walls: PowerupCollisionWorld): number {
  const rule = POWERUP_RULES.laser;
  const origin = muzzlePoint(effect, rule.muzzle);
  if (firstPowerupWallHit(walls, effect, origin, rule.radius, 'beam')) return 0;
  const length = Math.hypot(walls.width, walls.height);
  const destination = { x: origin.x + Math.cos(effect.angle) * length, y: origin.y + Math.sin(effect.angle) * length };
  const wall = firstPowerupWallHit(walls, origin, destination, rule.radius, 'beam');
  return sampleLaserLength(age, wall ? length * wall.time : length);
}

/** Detaches the startup missile from the caster's current corridor position, preserving its presentation identity. */
function launchMissile(state: PowerupCombatState, cast: PowerupCast, actors: readonly PowerupCombatActor[],
  walls: PowerupCollisionWorld, hits: Map<string, TimedHit>, remainingMs: number, speed: number): void {
  const origin = cast.origin!;
  const rule = POWERUP_RULES.missile;
  const angle = directionAngle(actors.find((actor) => actor.id === cast.ownerId)?.direction ?? cast.facing);
  const target = eligibleTargets(actors, cast.ownerId, hits).map((actor) => ({ actor,
    distance: Math.hypot((actor.previous ?? actor).x - origin.x, (actor.previous ?? actor).y - origin.y) }))
    .filter((candidate) => candidate.distance <= rule.targetRange)
    .sort((a, b) => a.distance - b.distance || a.actor.id.localeCompare(b.actor.id))[0]?.actor;
  const projectile: PowerupProjectile = { id: cast.id, ownerId: cast.ownerId,
    targetId: target?.id ?? null, ...origin, angle, elapsedMs: 0, turns: [] };
  state.projectiles.push(projectile);
  moveMissile(state, projectile, remainingMs, actors, walls, speed, hits);
}

/** Resolves existing missiles by earliest contact, reconsidering remaining paths after each casualty. */
function advanceMissiles(state: PowerupCombatState, deltaMs: number, actors: readonly PowerupCombatActor[],
  walls: PowerupCollisionWorld, speed: number, hits: Map<string, TimedHit>): void {
  const pending = state.projectiles.filter((projectile) => projectile.elapsedMs < POWERUP_RULES.missile.lifetimeMs);
  while (pending.length) {
    const next = pending.map((projectile) => ({ projectile,
      motion: previewMissile(state, projectile, deltaMs, actors, walls, speed, hits) }))
      .sort((first, second) => first.motion.duration * first.motion.contact
        - second.motion.duration * second.motion.contact || first.projectile.id - second.projectile.id)[0];
    moveMissile(state, next.projectile, deltaMs, actors, walls, speed, hits, next.motion);
    pending.splice(pending.indexOf(next.projectile), 1);
  }
}

/** Samples cardinal corridor travel and center steering, self-destructing at dead ends without crossing walls. */
function previewMissile(state: PowerupCombatState, projectile: PowerupProjectile, deltaMs: number,
  actors: readonly PowerupCombatActor[], walls: PowerupCollisionWorld, speed: number,
  hits: ReadonlyMap<string, TimedHit>): MissileMotion {
  const rule = POWERUP_RULES.missile;
  const duration = Math.min(deltaMs, rule.lifetimeMs - projectile.elapsedMs);
  const intervalStartMs = state.clockMs - deltaMs;
  const steering = steerMissile(walls, projectile, eligibleTargets(actors, projectile.ownerId, hits, intervalStartMs));
  const direction = steering.direction ?? missileHeading(projectile.angle);
  const angle = directionAngle(direction);
  const from = { x: projectile.x, y: projectile.y };
  const turned = angle !== projectile.angle;
  const distance = steering.direction === null ? 0 : speed * rule.speedMultiplier * duration / 1000;
  const vector = DIRECTION_VECTORS[direction];
  const to = { x: from.x + vector.dx * distance, y: from.y + vector.dy * distance };
  const wall = firstPowerupWallHit(walls, from, to, rule.radius);
  let contact = steering.direction === null ? 0 : wall?.time ?? Infinity;
  let victim: PowerupCombatActor | undefined;
  for (const actor of actors.filter((actor) => actor.active && actor.id !== projectile.ownerId)) {
    const endpoint = deltaMs > EPSILON ? interpolatePowerupPoint(actor.previous ?? actor, actor, duration / deltaMs) : actor;
    const time = sweepPowerupBodies(from, to, rule.radius, actor.previous ?? actor, endpoint, actor.radius);
    if (time === null || (hits.get(actor.id)?.timeMs ?? Infinity) < intervalStartMs + duration * time - EPSILON) continue;
    if (time < contact - EPSILON) { contact = time; victim = actor; }
  }
  return { duration, angle, targetId: steering.targetId, turned, from, to, contact, victim };
}

/** Records cardinal turns and applies travel until impact, a dead end, or harmless lifetime self-destruction. */
function moveMissile(state: PowerupCombatState, projectile: PowerupProjectile, deltaMs: number,
  actors: readonly PowerupCombatActor[], walls: PowerupCollisionWorld, speed: number,
  hits: Map<string, TimedHit>, sampled?: MissileMotion): void {
  const rule = POWERUP_RULES.missile;
  if (projectile.elapsedMs >= rule.lifetimeMs) return;
  const motion = sampled ?? previewMissile(state, projectile, deltaMs, actors, walls, speed, hits);
  const { duration, angle, targetId, turned, from, to, contact, victim } = motion;
  if (turned) projectile.turns.push({ ...from, angle, elapsedMs: projectile.elapsedMs });
  projectile.angle = angle;
  projectile.targetId = targetId;
  if (contact !== Infinity) {
    const point = interpolatePowerupPoint(from, to, contact);
    Object.assign(projectile, point);
    if (victim && !victim.protected) recordHit(hits, { targetId: victim.id,
      position: interpolatePowerupPoint(victim.previous ?? victim, victim, deltaMs > EPSILON ? duration / deltaMs * contact : 1),
      timeMs: state.clockMs - deltaMs + duration * contact });
    missileImpact(state, projectile.ownerId, point, projectile.angle, Math.max(0, duration * (1 - contact)));
    projectile.elapsedMs = rule.lifetimeMs;
  } else {
    Object.assign(projectile, to);
    projectile.elapsedMs += duration;
    if (projectile.elapsedMs >= rule.lifetimeMs - EPSILON) {
      missileImpact(state, projectile.ownerId, to, projectile.angle, Math.max(0, deltaMs - duration));
    }
  }
}

/** Retains the earliest physical hit even when a later contact was discovered first. */
function recordHit(hits: Map<string, TimedHit>, hit: TimedHit): void {
  if ((hits.get(hit.targetId)?.timeMs ?? Infinity) > hit.timeMs + EPSILON) hits.set(hit.targetId, hit);
}

/** Creates a non-damaging impact at the confirmed ground position. */
function missileImpact(state: PowerupCombatState, ownerId: string, point: PowerupPoint,
  angle: number, elapsedMs: number): void {
  state.effects.push({ id: state.nextId++, ownerId, kind: 'missile', role: 'impact', ...point,
    angle, elapsedMs, durationMs: POWERUP_RULES.missile.impactDurationMs, radius: 0, length: 0 });
}

/** Excludes owner, harmless actors, protected targets, and casualties before the selected time. */
function eligibleTargets(actors: readonly PowerupCombatActor[], ownerId: string,
  hits: ReadonlyMap<string, TimedHit>, aliveAtMs = Infinity): PowerupCombatActor[] {
  return actors.filter((actor) => actor.id !== ownerId && actor.active && !actor.protected
    && (hits.get(actor.id)?.timeMs ?? Infinity) >= aliveAtMs - EPSILON);
}

/** Reads only a ground point rather than retaining an actor's mutable state. */
function ownerPoint(actor: IntervalActor): PowerupPoint { return actor.endpoint ?? { x: actor.x, y: actor.y }; }

/** Samples only physical travel on the selected side of a portal, never its teleport gap. */
function sampleActorMotion(actor: PowerupCombatActor, fraction: number, afterBoundary: boolean): PowerupPoint {
  const jump = actor.teleportMotion;
  if (!jump) return interpolatePowerupPoint(actor.teleported ? actor : actor.previous ?? actor, actor, fraction);
  const before = fraction < jump.fraction - EPSILON
    || !afterBoundary && Math.abs(fraction - jump.fraction) < EPSILON;
  if (before) return interpolatePowerupPoint(actor.previous ?? jump.departure, jump.departure,
    jump.fraction > EPSILON ? Math.min(1, fraction / jump.fraction) : 1);
  return interpolatePowerupPoint(jump.arrival, actor,
    jump.fraction < 1 - EPSILON ? Math.max(0, (fraction - jump.fraction) / (1 - jump.fraction)) : 0);
}

/** Uses the arrival position for a release exactly on a completed portal transition. */
function sampleReleasePoint(actor: IntervalActor, fraction: number): PowerupPoint {
  return fraction >= 1 - EPSILON && actor.endpoint ? actor.endpoint
    : interpolatePowerupPoint(actor.previous ?? actor, actor, fraction);
}

/** Converts grid facing to a standard ground-plane angle in radians. */
function directionAngle(direction: Direction): number {
  const vector = DIRECTION_VECTORS[direction];
  return Math.atan2(vector.dy, vector.dx);
}

/** Offsets a world origin along a locked attack direction. */
function muzzlePoint(origin: PowerupPoint & { angle: number }, offset: number): PowerupPoint {
  return { x: origin.x + Math.cos(origin.angle) * offset, y: origin.y + Math.sin(origin.angle) * offset };
}

/** Sweeps a circular target to the visible beam tip, retaining exact tangency within numeric tolerance. */
function movingBeamContact(from: PowerupPoint, to: PowerupPoint, radius: number, origin: PowerupPoint,
  angle: number, fromLength: number, toLength: number, beamRadius: number): number | null {
  const cosine = Math.cos(angle), sine = Math.sin(angle), combined = radius + beamRadius;
  const local = (point: PowerupPoint): PowerupPoint => ({ x: (point.x - origin.x) * cosine + (point.y - origin.y) * sine,
    y: -(point.x - origin.x) * sine + (point.y - origin.y) * cosine });
  const start = local(from), end = local(to), dx = end.x - start.x, dy = end.y - start.y;
  const contacts: Array<number | null> = [];
  for (const [alongMargin, acrossMargin] of [[0, combined], [radius, beamRadius]]) {
    let enter = 0, leave = 1;
    for (const [value, slope] of [[start.x + alongMargin, dx],
      [fromLength + alongMargin - start.x, toLength - fromLength - dx],
      [acrossMargin - start.y, -dy], [acrossMargin + start.y, dy]]) {
      if (Math.abs(slope) < EPSILON) { if (value < -EPSILON) { enter = Infinity; break; } continue; }
      if (slope > 0) enter = Math.max(enter, -value / slope);
      else leave = Math.min(leave, -value / slope);
    }
    contacts.push(enter <= leave && enter <= 1 && leave >= 0 ? Math.max(0, enter) : null);
  }
  for (const y of [-beamRadius, beamRadius]) {
    contacts.push(sweepPowerupBodies(start, end, radius, { x: 0, y }, { x: 0, y }, 0),
      sweepPowerupBodies(start, end, radius, { x: fromLength, y }, { x: toLength, y }, 0));
  }
  const candidates = contacts.filter((time): time is number => time !== null);
  return candidates.length ? Math.min(...candidates) : null;
}
