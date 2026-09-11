import { describe, expect, it } from 'vitest';
import { createBlockedPortalGrid, createPortalPairGrid } from '../fixtures/collisionFixtures';
import { getScenarioOrThrow } from '../helpers/mechanicsSpec';
import { runMechanicsAssertion } from '../helpers/mechanicsTestUtils';
import { PortalService } from '../../game/domain/services/PortalService';

describe('mechanics scenarios: portals', () => {
  it('MEC-PORT-001 teleport requires outward half-tile progress', () => {
    const scenario = getScenarioOrThrow('MEC-PORT-001');

    runMechanicsAssertion(
      {
        scenarioId: scenario.id,
        seed: scenario.seed,
        tick: 10,
        inputTrace: ['try centered teleport', 'try pre-threshold teleport', 'try half-tile-threshold teleport'],
        snapshotWindow: [],
        assertion: 'portal teleport occurs only at outward half-tile threshold',
      },
      () => {
        const grid = createPortalPairGrid();
        const portals = new PortalService(grid);

        const entity = {
          tile: { x: 0, y: 1 },
          moved: { x: 0, y: 0 },
          direction: 'left' as const,
        };

        const movedWhileCentered = portals.tryTeleport(entity, grid, 10, 16);
        expect(movedWhileCentered).toBe(false);
        expect(entity.tile).toEqual({ x: 0, y: 1 });

        entity.moved = { x: -7, y: 0 };
        const movedBeforeThreshold = portals.tryTeleport(entity, grid, 10, 16);
        expect(movedBeforeThreshold).toBe(false);
        expect(entity.tile).toEqual({ x: 0, y: 1 });

        entity.moved = { x: -8, y: 0 };
        const movedAtThreshold = portals.tryTeleport(entity, grid, 10, 16);
        expect(movedAtThreshold).toBe(true);
        expect(entity.tile).toEqual({ x: 4, y: 1 });
      },
    );
  });

  it('MEC-PORT-002 same-tick bounce guard prevents immediate return teleport', () => {
    const scenario = getScenarioOrThrow('MEC-PORT-002');

    runMechanicsAssertion(
      {
        scenarioId: scenario.id,
        seed: scenario.seed,
        tick: 22,
        inputTrace: ['teleport once', 'attempt second teleport same tick'],
        snapshotWindow: [],
        assertion: 'same entity cannot teleport twice in the same tick',
      },
      () => {
        const grid = createPortalPairGrid();
        const portals = new PortalService(grid);
        const entity: { tile: { x: number; y: number }; moved: { x: number; y: number }; direction: 'left' | 'right' } = {
          tile: { x: 0, y: 1 },
          moved: { x: -8, y: 0 },
          direction: 'left',
        };

        const first = portals.tryTeleport(entity, grid, 22, 16);
        entity.direction = 'right';
        entity.moved = { x: 8, y: 0 };
        const second = portals.tryTeleport(entity, grid, 22);

        expect(first).toBe(true);
        expect(second).toBe(false);
        expect(entity.tile).toEqual({ x: 4, y: 1 });
      },
    );
  });

  it('MEC-PORT-003 blocked destination portal tile refuses teleport', () => {
    const scenario = getScenarioOrThrow('MEC-PORT-003');

    runMechanicsAssertion(
      {
        scenarioId: scenario.id,
        seed: scenario.seed,
        tick: 33,
        inputTrace: ['attempt teleport to fully blocking destination'],
        snapshotWindow: [],
        assertion: 'teleport should fail when destination portal tile is fully blocked',
      },
      () => {
        const grid = createBlockedPortalGrid();
        const portals = new PortalService(grid);
        const entity = {
          tile: { x: 0, y: 1 },
          moved: { x: -8, y: 0 },
          direction: 'left' as const,
        };

        const moved = portals.tryTeleport(entity, grid, 33);

        expect(moved).toBe(false);
        expect(entity.tile).toEqual({ x: 0, y: 1 });
      },
    );
  });
});
