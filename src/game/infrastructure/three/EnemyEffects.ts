import { BufferGeometry, Group, Mesh, MeshBasicMaterial, PlaneGeometry, RingGeometry } from 'three';
import type { EnemyEffect, LagZone } from '../../domain/world/WorldState';

interface PulseVisual {
  ring: Mesh<RingGeometry, MeshBasicMaterial>;
  target: Mesh<RingGeometry, MeshBasicMaterial>;
}

interface ZoneVisual {
  fill: Mesh<PlaneGeometry, MeshBasicMaterial>;
  edge: Mesh<RingGeometry, MeshBasicMaterial>;
}

/** Presentation only: immutable simulation records and preview fixtures share this sampler. */
export class EnemyEffects {
  readonly group = new Group();
  private readonly ringGeometry = new RingGeometry(0.985, 1, 64).rotateX(-Math.PI / 2);
  private readonly targetGeometry = new RingGeometry(0.72, 1, 4).rotateX(-Math.PI / 2);
  private readonly fillGeometry = new PlaneGeometry(2, 2).rotateX(-Math.PI / 2);
  private readonly zoneGeometry = new RingGeometry(0.94, 1, 4, 1, Math.PI / 4)
    .scale(Math.SQRT2, Math.SQRT2, 1).rotateX(-Math.PI / 2);
  private readonly pulses: PulseVisual[] = [];
  private readonly zones: ZoneVisual[] = [];
  private disposed = false;

  constructor() {
    this.group.name = 'enemy-effects';
  }

  sync(effects: readonly EnemyEffect[], zones: readonly LagZone[]): void {
    if (this.disposed) return;
    // Records are replaced as they age; reuse slots instead of keying allocation by object identity.
    while (this.pulses.length < effects.length) {
      this.pulses.push({
        ring: this.createMesh(this.ringGeometry, 'enemy-pulse'),
        target: this.createMesh(this.targetGeometry, 'ping-target'),
      });
    }
    while (this.zones.length < zones.length) {
      this.zones.push({
        fill: this.createMesh(this.fillGeometry, 'lag-zone-fill'),
        edge: this.createMesh(this.zoneGeometry, 'lag-zone-edge'),
      });
    }
    this.pulses.forEach(({ ring, target }, index) => {
      const effect = effects[index];
      const progress = effect ? Math.min(1, Math.max(0, effect.ageMs / effect.durationMs)) : 1;
      ring.visible = !!effect && progress < 1;
      target.visible = ring.visible && effect?.kind === 'ping' && !!effect.target;
      if (!effect) return;
      ring.name = `${effect.kind}-pulse`;
      ring.position.set(effect.x, 0.12, effect.y);
      const radius = effect.radius * (0.04 + progress * 0.96);
      ring.scale.set(radius, 1, radius);
      ring.material.color.setHex(effect.kind === 'ping' ? 0x68ff72 : 0xb87cff);
      ring.material.opacity = (1 - progress) * 0.8;
      if (effect.target) {
        target.position.set(effect.target.x, 0.14, effect.target.y);
        target.scale.set(7.5, 1, 7.5);
        target.material.color.setHex(0x68ff72);
        target.material.opacity = 1 - progress;
      }
    });
    this.zones.forEach(({ fill, edge }, index) => {
      const zone = zones[index];
      const progress = zone ? Math.min(1, Math.max(0, zone.ageMs / zone.durationMs)) : 1;
      fill.visible = edge.visible = !!zone && progress < 1;
      if (!zone) return;
      const fade = Math.min(1, (1 - progress) * 4);
      for (const mesh of [fill, edge]) {
        mesh.position.set(zone.x, mesh === fill ? 0.075 : 0.09, zone.y);
        mesh.scale.set(zone.radius, 1, zone.radius);
        mesh.material.color.setHex(0xffe24d);
      }
      fill.material.opacity = fade * 0.12;
      edge.material.opacity = fade * (0.5 + 0.1 * Math.sin(zone.ageMs / 180));
    });
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const { ring, target } of this.pulses) {
      ring.material.dispose();
      target.material.dispose();
    }
    for (const { fill, edge } of this.zones) {
      fill.material.dispose();
      edge.material.dispose();
    }
    this.ringGeometry.dispose();
    this.targetGeometry.dispose();
    this.fillGeometry.dispose();
    this.zoneGeometry.dispose();
    this.group.clear();
  }

  private createMesh<T extends BufferGeometry>(geometry: T, name: string): Mesh<T, MeshBasicMaterial> {
    const mesh = new Mesh(geometry, new MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false }));
    mesh.name = name;
    mesh.visible = false;
    this.group.add(mesh);
    return mesh;
  }
}
