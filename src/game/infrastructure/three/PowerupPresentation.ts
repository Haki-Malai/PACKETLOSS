import { Group, Mesh } from 'three';
import type { Direction } from '../../domain/valueObjects/Direction';
import {
  POWERUP_RULES, sampleLaserLength,
  type PowerupCombatState, type PowerupPickup, type PowerupKind,
} from '../../shared/offensivePowerups';
import { PowerupAssets, type PowerupModel, type PowerupPose } from './PowerupAssets';
import { setPacketLaserImpact } from './HologramPacket';

export interface PowerupActorPresentation {
  group: Group;
  direction?: Direction;
  setPose(_pose: PowerupPose | null): void;
}

/** Presents simulation-owned pickups and effects without advancing combat or replaying events. */
export class PowerupPresentation {
  readonly group = new Group();
  private readonly models = new Map<string, PowerupModel>();
  private disposed = false;

  /** Borrows the asset library; the owning game releases templates after this scene's clones. */
  constructor(private readonly assets: PowerupAssets) {
    this.group.name = 'offensive-powerups';
  }

  /** Seeks confirmed impacts and portal spans; pauses, rewind, and late snapshots never replay a hit. */
  sync(
    combat: PowerupCombatState | null,
    pickups: readonly PowerupPickup[],
    actors: ReadonlyMap<string, PowerupActorPresentation>,
    timeMs = combat?.clockMs ?? 0,
  ): void {
    if (this.disposed) return;
    const used = new Set<string>();
    for (const actor of actors.values()) {
      actor.setPose(null);
      setPacketLaserImpact(actor.group, null);
    }
    for (const pickup of pickups) {
      const model = this.get(`pickup:${pickup.id}:${pickup.kind}`, pickup.kind, 'pickup', used);
      model.group.position.set(pickup.x, 0, pickup.y);
      model.sample(timeMs);
    }
    if (combat) {
      const lead = Math.max(0, timeMs - combat.clockMs);
      for (const cast of combat.casts) {
        const actor = actors.get(cast.ownerId);
        if (!actor) continue;
        const elapsed = cast.elapsedMs + lead;
        const rule = POWERUP_RULES[cast.kind];
        const attachedMissile = cast.kind === 'missile' && cast.origin === null;
        if (elapsed >= rule.durationMs && !attachedMissile) continue;
        const angle = facingAngle(attachedMissile ? actor.direction ?? cast.facing : cast.facing);
        const pose = this.get(`cast:${cast.id}`, cast.kind, 'packet-companion', used);
        pose.sample(elapsed);
        pose.group.position.copy(actor.group.position);
        pose.group.rotation.y = modelRotation(angle);
        // Only charge decorations are displayed; the existing procedural Packet receives the pose.
        pose.scene.traverse((object) => {
          if (object.name.startsWith('eye-expression')) object.visible = false;
          if (object instanceof Mesh && object.name.startsWith('packet-pose')) object.visible = false;
        });
        actor.setPose(pose.pose(angle));
        if (attachedMissile) {
          const missile = this.get(`projectile:${cast.id}`, 'missile', 'projectile', used);
          missile.group.position.copy(actor.group.position);
          missile.group.rotation.y = modelRotation(angle);
          missile.sample(0);
          // The assembly clip owns the shard until its identical flight model detaches.
          missile.group.visible = false;
          const launch = this.get(`launch:${cast.id}`, 'missile', 'launch', used);
          launch.group.position.copy(actor.group.position);
          launch.group.rotation.y = modelRotation(angle);
          launch.sample(Math.min(elapsed, rule.releaseMs));
        }
      }
      for (const projectile of combat.projectiles) {
        const elapsed = projectile.elapsedMs + lead;
        if (elapsed >= POWERUP_RULES.missile.lifetimeMs) continue;
        const model = this.get(`projectile:${projectile.id}`, 'missile', 'projectile', used);
        model.group.visible = true;
        model.group.position.set(projectile.x, 0, projectile.y);
        model.group.rotation.y = modelRotation(projectile.angle);
        model.sample(elapsed);
      }
      for (const effect of combat.effects) {
        const elapsed = effect.elapsedMs + lead;
        if (elapsed >= effect.durationMs) continue;
        if (effect.kind === 'laser' && effect.role === 'impact') {
          const target = effect.targetId ? actors.get(effect.targetId) : undefined;
          if (target) setPacketLaserImpact(target.group, { angle: effect.angle, elapsedMs: elapsed });
          // Reuse the authored contact burst on its own short clock, independent of the firing beam's age.
          if (elapsed < 550) {
            const rule = POWERUP_RULES.laser;
            const contactStart = rule.releaseMs + rule.laserGrowMs;
            const flash = this.get(`effect:${effect.id}`, 'laser', 'effect', used);
            flash.group.position.set(effect.x, 0, effect.y);
            flash.group.rotation.y = modelRotation(effect.angle);
            flash.sample(contactStart + elapsed / 550 * (rule.durationMs - contactStart));
            showLaserContact(flash.scene, 1.6);
          }
          continue;
        }
        const role = effect.role === 'attack' ? 'effect' : effect.role;
        const model = this.get(`effect:${effect.id}`, effect.kind, role, used);
        model.group.position.set(effect.x, 0, effect.y);
        model.group.rotation.y = modelRotation(effect.angle);
        model.sample(elapsed);
        if (effect.kind === 'laser' && effect.role === 'attack' && elapsed >= POWERUP_RULES.laser.releaseMs) {
          if (effect.laserSegments) {
            const rule = POWERUP_RULES.laser;
            const dx = Math.cos(effect.angle), dy = Math.sin(effect.angle);
            for (const [index, segment] of effect.laserSegments.entries()) {
              const length = sampleLaserLength(elapsed - segment.delayMs, segment.length);
              if (index > 0 && length <= 0) continue;
              const beam = index === 0 ? model : this.get(`beam:${effect.id}:${index}`, 'laser', 'effect', used);
              const x = segment.x - dx * rule.muzzle, y = segment.y - dy * rule.muzzle;
              beam.group.position.set(x, 0, y);
              beam.group.rotation.y = modelRotation(effect.angle);
              beam.sample(elapsed);
              beam.clipLaser(x, y, effect.angle, length, {
                impact: segment.end === 'wall' && elapsed >= rule.releaseMs + rule.laserGrowMs + segment.delayMs,
                continuation: index > 0,
              });
            }
            const [entry, exit] = effect.laserSegments;
            if (exit && elapsed >= rule.releaseMs + exit.delayMs) {
              for (const [index, point] of [
                { x: entry.x + dx * entry.length, y: entry.y + dy * entry.length }, exit,
              ].entries()) {
                const flash = this.get(`portal:${effect.id}:${index}`, 'laser', 'effect', used);
                flash.group.position.set(point.x, 0, point.y);
                flash.group.rotation.y = modelRotation(effect.angle + (index === 0 ? 0 : Math.PI));
                flash.sample(elapsed);
                showLaserContact(flash.scene, 1.4);
              }
            }
          } else {
            const growth = sampleLaserLength(effect.elapsedMs, 1);
            const length = growth > 0 ? sampleLaserLength(elapsed, effect.length / growth) : effect.length;
            model.clipLaser(effect.x, effect.y, effect.angle, length);
          }
        }
        if (effect.role === 'collection' && effect.source) {
          const actor = actors.get(effect.ownerId);
          const x = actor?.group.position.x ?? effect.x;
          const y = actor?.group.position.z ?? effect.y;
          model.group.position.set(x, 0, y);
          model.group.rotation.set(0, 0, 0);
          const progress = Math.min(1, elapsed / 180);
          const remaining = (1 - progress) ** 2;
          model.scene.traverse((object) => {
            if (!object.name.includes('collect-pickup-hover')) return;
            if (object instanceof Mesh) return;
            object.position.x += (effect.source!.x - x) * remaining;
            object.position.z += (effect.source!.y - y) * remaining;
          });
        }
      }
    }
    for (const [key, model] of this.models) {
      if (used.has(key)) continue;
      this.assets.release(model);
      this.models.delete(key);
    }
  }

  /** Releases all animation/material instances once; shared template ownership stays with the game. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const model of this.models.values()) this.assets.release(model);
    this.models.clear();
    this.group.removeFromParent();
    this.group.clear();
  }

  /** Creates one private mixer per stable simulation identity and marks it active for this frame. */
  private get(key: string, kind: PowerupKind, role: Parameters<PowerupAssets['create']>[1], used: Set<string>): PowerupModel {
    used.add(key);
    let model = this.models.get(key);
    if (!model) {
      model = this.assets.create(kind, role);
      model.group.name = key;
      this.models.set(key, model);
      this.group.add(model.group);
    }
    return model;
  }
}

/** Places the authored flare at a portal or body contact through the stable scene API, above the passing beam. */
function showLaserContact(scene: Group, scale: number): void {
  const muzzle = scene.getObjectByName('muzzle-anchor');
  if (muzzle) muzzle.visible = false;
  const impact = scene.getObjectByName('laser-wall-impact');
  if (impact) {
    impact.position.set(0, 6.15, 0);
    impact.scale.multiplyScalar(scale);
    impact.traverse((object) => { if (object instanceof Mesh) object.renderOrder = 5; });
  }
}

/** Converts the game's planar heading to the authored GLB's negative-Z forward axis. */
function modelRotation(angle: number): number {
  return -angle - Math.PI / 2;
}

/** Returns the common planar angle for a cast's locked direction or a startup missile's live heading. */
function facingAngle(facing: string): number {
  return facing === 'up' ? -Math.PI / 2 : facing === 'down' ? Math.PI / 2 : facing === 'left' ? Math.PI : 0;
}
