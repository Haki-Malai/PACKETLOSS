import { describe, expect, it } from 'vitest';
import {
  battleArenaWarningPulse,
  BattleArenaPresentation,
} from '../game/infrastructure/three/BattleArenaPresentation';

describe('BattleArenaPresentation', () => {
  it('reconstructs warning and closure layers from authoritative ticks', () => {
    const presentation = new BattleArenaPresentation();
    const [warning, retiring, forming] = presentation.group.children;

    presentation.sync(0, 0, false);
    expect(warning.visible).toBe(true);
    expect(retiring.visible).toBe(false);
    expect(forming.visible).toBe(true);
    expect(forming.children).toHaveLength(8);

    presentation.sync(1, 600, false);
    expect(retiring.visible).toBe(true);
    expect(forming.visible).toBe(true);
    expect(retiring.position.y).toBeCloseTo(0);

    presentation.sync(1, 630, false);
    expect(retiring.position.y).toBeCloseTo(-6);
    expect(forming.scale.y).toBeCloseTo(0.5);

    presentation.sync(1, 660, false);
    expect(retiring.visible).toBe(false);
    expect(forming.visible).toBe(true);
    expect(forming.scale.y).toBe(1);

    presentation.sync(2, 1_200, true);
    expect(warning.visible).toBe(true);
    expect(retiring.visible).toBe(false);
    expect(forming.visible).toBe(true);

    presentation.dispose();
    expect(presentation.group.children).toHaveLength(0);
  });

  it('removes the warning after the final contraction', () => {
    const presentation = new BattleArenaPresentation();
    presentation.sync(20, 12_000, false);
    expect(presentation.group.children[0].visible).toBe(false);
    presentation.dispose();
  });

  it('reconstructs the same bounded pulse from stage-relative warning time', () => {
    const samples = Array.from({ length: 601 }, (_, tick) => battleArenaWarningPulse(tick, 0));
    expect(Math.min(...samples)).toBeGreaterThanOrEqual(0.55);
    expect(Math.max(...samples)).toBeLessThanOrEqual(1);
    expect(battleArenaWarningPulse(300, 0)).toBeCloseTo(battleArenaWarningPulse(900, 1));
    expect(battleArenaWarningPulse(599, 0)).toBeCloseTo(battleArenaWarningPulse(1_199, 1));
  });
});
