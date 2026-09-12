import { Box3, BufferGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { ArcadeAssets } from '../game/infrastructure/three/ArcadeAssets';
import type { Direction } from '../game/domain/valueObjects/Direction';

function body(group: Group): Mesh<BufferGeometry, MeshStandardMaterial> {
  return group.getObjectByName('body') as Mesh<BufferGeometry, MeshStandardMaterial>;
}

describe('ArcadeAssets', () => {
  it('keeps Packet within its 10-unit footprint and shares four closed-to-open mouth poses', () => {
    const assets = new ArcadeAssets();
    const packet = assets.createPacket();
    const other = assets.createPacket();
    const frames = new Set<BufferGeometry>();
    for (let frame = 0; frame < 4; frame += 1) {
      assets.setPacketFrame(packet, frame);
      assets.setPacketFrame(other, frame);
      expect(body(packet).geometry).toBe(body(other).geometry);
      frames.add(body(packet).geometry);
      const bounds = new Box3().setFromObject(packet);
      expect(bounds.min.x).toBeGreaterThanOrEqual(-5.00001);
      expect(bounds.max.x).toBeLessThanOrEqual(5.00001);
      expect(bounds.min.z).toBeGreaterThanOrEqual(-5.00001);
      expect(bounds.max.z).toBeLessThanOrEqual(5.00001);
      expect(bounds.min.y).toBeCloseTo(0);
      expect(bounds.max.y).toBeCloseTo(10);
    }
    expect(frames.size).toBe(4);
    assets.setPacketFrame(packet, 3);
    expect(new Box3().setFromObject(body(packet)).max.x).toBeLessThan(4);
    assets.setPacketFrame(packet, 0);
    expect(new Box3().setFromObject(body(packet)).getSize(new Vector3()).x).toBeCloseTo(10);
    assets.dispose();
  });

  it('keeps all ghost poses and eyes within the 11-unit footprint', () => {
    const assets = new ArcadeAssets();
    const ghost = assets.createGhost('blinky');
    const directions: Direction[] = ['up', 'down', 'left', 'right'];
    for (let frame = 0; frame < 2; frame += 1) {
      for (const direction of directions) {
        assets.setGhostAppearance(ghost, 'blinky', frame, direction);
        const bounds = new Box3().setFromObject(ghost);
        expect(bounds.min.x).toBeGreaterThanOrEqual(-5.50001);
        expect(bounds.max.x).toBeLessThanOrEqual(5.50001);
        expect(bounds.min.z).toBeGreaterThanOrEqual(-5.50001);
        expect(bounds.max.z).toBeLessThanOrEqual(5.50001);
        expect(bounds.min.y).toBeCloseTo(0);
        expect(bounds.max.y).toBeLessThanOrEqual(10);
      }
    }
    assets.dispose();
  });

  it('switches scared colors and hem poses from state while retaining shared base materials', () => {
    const assets = new ArcadeAssets();
    const ghost = assets.createGhost('blinky');
    const originalMaterial = body(ghost).material;
    const originalGeometry = body(ghost).geometry;
    assets.setGhostAppearance(ghost, 'scared', 1, 'up');
    expect(body(ghost).material).not.toBe(originalMaterial);
    expect(body(ghost).geometry).not.toBe(originalGeometry);
    const pupil = ghost.getObjectByName('pupil--1');
    expect(pupil?.position.y).toBeGreaterThan(0);
    assets.setGhostAppearance(ghost, 'blinky', 2, 'left');
    expect(body(ghost).material).toBe(originalMaterial);
    expect(body(ghost).geometry).toBe(originalGeometry);
    expect(pupil?.position.x).toBeLessThan(0);
    expect(pupil?.position.y).toBe(0);
    assets.dispose();
  });
});
